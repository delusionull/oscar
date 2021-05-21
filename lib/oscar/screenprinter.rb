module Oscar
  module Screenprinter
    def self.print(so, schedule_so, flags)
      so_info = ''
      so_info << "#{so.so_num},"
      so_info << "#{so.so_suffix},"
      so_info << "#{so.requested_ship_date},"
      so_info << "#{flags}," # flag
      so_info << "#{(so.customer_num.to_s +
                    (' ' + ' ' * (26 - so.customer_num.to_s.length)) +
                      so.ship_to_name.to_s +
                      ' ' * 25 + so.customer_po_num.to_s).strip},"
      so_info << "," * 7
      so_info << "#{schedule_so.lines_with_scheduled_and_total*(' '*25)}," # lines with scheduled and total
      so_info << "#{schedule_so.lines_with_done_and_total*(' '*25)}," # work orders with done and total
      so_info << "," # material with num
      so_info << "#{so.netprice}," # cost
      so_info << "#{so.weight}," # weight
      so_info << "#{so.city}," # city
      so_info << "#{so.state}," # state
      so_info << "#{so.wt_warehouse.upcase}," # warehouse
      so_info << ","
      puts so_info
    end
  end
end

