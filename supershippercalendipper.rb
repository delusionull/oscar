#!/usr/bin/env ruby

require 'date'
require 'sequel'
require 'csv'

 require_relative 'lib/db_connections'
 require_relative 'lib/utils'
 $stdout.sync = true

layup_items = DB_SCHED[:tblLayupItems].join(:tblJobs, :JobID => :JobID)

so_shipping_qry =
'SELECT FORMAT(eh.ShipExpireDate, "YYYY-MM-DD")                           AS ShipDate,
         Rtrim(eh.ShipViaRate)                                            AS ShipVia,
         Switch (SO_03SOHistoryHeader.WTClass = "PRE", "pre",
                 SO_03SOHistoryHeader.WTClass = "COM", "com",
                 SO_03SOHistoryHeader.WTClass = "ELE", "ele",
                 SO_03SOHistoryHeader.WTClass = "TP", "tp")               AS SOType,
         eh.SalesOrderNumber                                              AS SalesOrder,
         eh.orderstatus                                                   AS Status,
         eh.TaxExemptNumber                                               AS APDMove,
         cm.CustomerType                                                  AS Flag,
         cm.SalesPersonCode                                               AS SalesPerson,
         eh.NonTaxableAmount                                              AS Dollars,
         Rtrim(eh.CustomerNumber)                                         AS Customer,
         Rtrim(eh.CustomerPONumber)                                       AS CustomerPO,
         Rtrim(eh.BillToName)                                             AS CustomerFullName,
         Rtrim(eh.ShipToCity)                                             AS City,
         Rtrim(eh.ShipToState)                                            AS State,
         Sum( so_04sohistorydetail.revisedorderquantity * Iif(
                        (im1_inventorymasterfile.itemnumber Like "PRE%" OR
                         so_04sohistorydetail.CancelledLine = "Y"),
                        0, im1_inventorymasterfile.lastcost ) )           AS Cost,
         Sum( so_04sohistorydetail.revisedorderquantity * Iif(
                        im1_inventorymasterfile.weight > "0",
                        Cint(im1_inventorymasterfile.weight), 0) )        AS Weight

   FROM   (((so1_soentryheader eh
           INNER JOIN (im1_inventorymasterfile
                       RIGHT JOIN so_04sohistorydetail
                               ON im1_inventorymasterfile.itemnumber = so_04sohistorydetail.itemnumber)
                   ON eh.salesordernumber = so_04sohistorydetail.salesordernumber)
           INNER JOIN so_03sohistoryheader
                   ON ( eh.salesordernumber = so_03sohistoryheader.salesordernumber )
                  AND ( so_04sohistorydetail.salesordernumber = so_03sohistoryheader.salesordernumber ))
           INNER JOIN ar1_customermaster cm
                   ON ( eh.customernumber = cm.customernumber ))

   WHERE  eh.orderstatus in ("o", "h")
          AND eh.salesordertype in ("s", "b")

   GROUP  BY eh.salesordernumber,
             eh.customernumber,
             cm.CustomerType,
             cm.SalesPersonCode,
             eh.NonTaxableAmount,
             eh.orderstatus,
             eh.shipviarate,
             so_03sohistoryheader.wtclass,
             shipexpiredate,
             eh.BillToName,
             eh.ShipToCity,
             eh.ShipToState,
             eh.TaxExemptNumber,
             eh.CustomerPONumber

   ORDER  BY eh.shipexpiredate,
             eh.shipviarate,
             so_03sohistoryheader.wtclass,
             eh.customernumber,
             eh.salesordernumber'

open_sales_orders = DB_MAS90.fetch(so_shipping_qry)

elev_ary = []
load_elev_ary = Proc.new { |line| elev_ary << line[:SalesOrder] if line[:SOType] == "ele" }

open_sales_orders.each(&load_elev_ary)

psa_qry = "SELECT SalesOrderNumber
           FROM SO_04SOHistoryDetail
           WHERE SalesOrderNumber in ( #{elev_ary.to_s[/[^\[\]]+/]} )
             AND ItemDescription like 'PSA%'"

unless elev_ary.empty?
  psa_ha = DB_MAS90.fetch(psa_qry) 
  psa_ary = []
  psa_ha.each do |psa_line|
    psa_ary << psa_line[:SalesOrderNumber]
  end
end

purchase_orders = DB_MAS90[:PO1_PurchaseOrderEntryHeader].select(:PurchaseOrderNumber, :Comment, :RequiredExpireDate)
po_material_items = DB_MAS90[:PO2_PurchaseOrderEntryLine].select(:ItemNumber, :QtyOrdered, :UnitCost)
so_line_material = DB_MAS90[:SO_04SOHistoryDetail].select(:SalesOrderNumber, :ItemNumber, :RevisedOrderQuantity)

column_headers = "SalesOrder,Changes,ShipDate,SOType,Hld,Customer,APDMove,Status1,Status2,Status3,MTG Notes,Job Notes,OPS Notes,CSR Notes,Shipping Notes,Purchasing Notes,Material POs,Material,Dollars,Weight,ShipVia,City,State,Sales"
# puts column_headers

fsc_orders = DB_MAS90[:SO_04SOHistoryDetail].select(:SalesOrderNumber).where(Sequel.like(:ItemNumber, "%PREFSC%"))
def fsc_so?(so, fsc_orders)
  fsc_orders.where(:SalesOrderNumber => "#{so}").first
end

layup_items = DB_SCHED[:tblLayupItems].join(:tblJobs, :JobID => :JobID)
def so_layup_lines_exist_in_schedule?(so, layup_items)
  layup_items.where(:JobSalesOrderNo => "#{so}").first
end

def add_csv_row(row)
  CSV.open("shipcal.csv", "a") do |csv_row|
    csv_row << row
  end
end

def get_flags(so)
end

def gross_margin(revenue, cost)
  gm = revenue.nonzero? ? (cost ? 100 * (revenue - cost) / revenue : 0) : 0
  return (gm).round(2)
  #return (gm).round
end

open_sales_orders.each do |line|
  flg = ''
  flag_overdue_po = ''
  flag_waiting_for_material = ''
  flag_materialcost = ''
  flag_hold = ''
  flag_notinschedule = ''
  flag_fsc = ''

  pos       = purchase_orders
               .where(Sequel.like(:Comment, "%#{line[:SalesOrder]}%"))
               .select_map([:PurchaseOrderNumber])

  pos_with_num_and_date = []
  materials_with_num = [] 

  pos.each_with_index do |po, index|
    po_date = purchase_orders
               .where(:PurchaseOrderNumber => po)
               .select_map(:RequiredExpireDate)
    
    #flag_po_after_ship_date = "b" if po_date[0].strftime("%F") > line[:ShipDate]

    pos_with_num_and_date << po_date[0].strftime("#{index+1};#{po[0]};%F")

    material  = po_material_items
               .where(:PurchaseOrderNumber => po)
               .select_order_map([:ItemNumber, :QtyOrdered, :QtyReceived, :UnitCost])
               .compact
               #.select_map([Sequel.trim(:ItemNumber), :QtyOrdered])

    material.each do |mat, qty_ord, qty_rec, cost|
      material_is_on_so = so_line_material
                        .where(:SalesOrderNumber => "#{line[:SalesOrder]}")
                        .where(:ItemNumber => mat)
                        .select_map(:ItemNumber)[0]
      materials_with_num << "#{index+1};#{mat.strip};\(#{qty_rec}/#{qty_ord}#{material_is_on_so ? '@$' + cost + 'ea' : '[not on SO]'})"
      #materials_with_num << "#{index+1};#{mat.strip};\(#{qty_rec}/#{qty_ord}\)"
      flag_waiting_for_material = "9" if qty_rec < qty_ord
      flag_materialcost = "6" if cost.to_i > 150
        #puts "#{line[:SalesOrder].to_s.strip}  #{index+1};#{mat.strip};\(#{qty_rec}/#{qty_ord}@$#{material_cost}ea\)"
      flag_overdue_po = "a" if (po_date[0].strftime("%F") < Time.now.strftime("%F") && qty_rec < qty_ord)
    end
  end
#line[:SalesOrder].to_s.strip.match(/^[DK]\d{6}$/)
  flag_hold = line[:Flag].to_s.strip.match(/^[1234]$/)
  flag_notinschedule = "8" unless ( line[:SalesOrder][0] == "E" or so_layup_lines_exist_in_schedule?(line[:SalesOrder], layup_items) )
  flag_fsc = "5" if fsc_so?(line[:SalesOrder], fsc_orders)

  flg = flag_hold.to_s +
        flag_fsc +
        flag_materialcost +
        flag_notinschedule +
        flag_waiting_for_material +
        flag_overdue_po
  flg = flg + '_' unless flg.empty?

  #flg = get_flags(line[:SalesOrder], line[:Hold].to_s.strip.match(/^[123]$/)})

  # sales_order_last_material_eta = layup_items.select(:LayupID, :LayupBin)
               #                               .where(:JobSalesOrderNo => "#{line[:SalesOrder]}").all
  # sales_order_last_material_eta = layup_items.select(:LayupID,
               #                                       :LayupBin,
               #                                       :LayupGlueOverride,
               #                                       :LayupPORxOverride)
               #                               .where(:JobSalesOrderNo => "D025790").all
  # p sales_order_last_material_eta
  # abort
  customer = "#{line[:Customer].to_s.tr_s(' ,', ' ').strip}"
  customer_po = "#{line[:CustomerPO].to_s.strip.match(/[-A-Za-z0-9_]+/)}"
  weight = "#{line[:SalesOrder].to_s.strip.match(/^[DK]\d{6}$/) ? line[:Weight] : 0}"
  apdmove = /(?<date>\d{2}\/\d{2}\/\d{2})(-(?<code>\w+))?/.match("#{line[:APDMove].to_s.strip}")
  if apdmove
    apd_date = apdmove[:date].to_s
    apd_code = apdmove[:code].to_s
  else
    apd_date = "FIX"
    apd_code = "FORMAT"
  end
  margin = gross_margin(line[:Dollars], line[:Cost])

  so_info =  ""
  so_info << "#{line[:SalesOrder]},"
  so_info << ","
  so_info << "#{line[:ShipDate]},"
  so_info << "#{psa_ary.include?(line[:SalesOrder]) ? 'psa' : line[:SOType]},"
  so_info << "#{flg},"
  so_info << "#{margin}%,"
  so_info << "#{(customer + (' ' + ' ' * (16 - customer.length)) + customer_po).strip},"
  so_info << "#{apd_date}_#{apd_code},"
  so_info << "," * 9
  so_info << "#{pos_with_num_and_date*' '},"
  so_info << "#{materials_with_num*' '},"
  so_info << "$#{line[:Dollars] < 1 ? -(line[:Cost]) : line[:Dollars]}," # if "line[:Dollars]" < $1 then display neg (-)"line[:Cost]"
  so_info << "#{weight},"
  so_info << "#{line[:ShipVia].to_s.tr_s(' ,', ' ').strip},"
  so_info << "#{line[:City].to_s.tr_s(' ,', ' ').strip},"
  so_info << "#{line[:State].to_s.tr_s(' ,', ' ').strip},"
  so_info << "#{line[:SalesPerson].to_s.tr_s(' ,', ' ').strip},"
  so_info << ",,"
  so_info << "#{line[:SalesOrder][/\w\w(\d{5})/,1]}"
  puts so_info
end
