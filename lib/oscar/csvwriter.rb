module Oscar
  module CSVWriter
    def self.addline(so, schedule_so, flags)
      so_num    = so.so_num
      so_suf    = so.so_suffix
      ship      = so.requested_ship_date
      cust      = "#{(so.customer_num.to_s +
                (' ' + ' ' * (26 - so.customer_num.to_s.length)) +
                so.ship_to_name.to_s +
                ' ' * 25 + so.customer_po_num.to_s).strip}"
      edit_cols = nil, nil, nil, nil, nil, nil, nil
      sched     = "#{schedule_so.lines_with_scheduled_and_total*(' '*25)}"
      done      = "#{schedule_so.lines_with_done_and_total*(' '*25)}"
      material  = nil
      price     = so.netprice
      weight    = so.weight
      city      = so.city
      state     = so.state
      wt        = so.wt_warehouse.upcase
      last_col  = nil
      
      csv_line  = [so_num, so_suf, ship, flags, cust, edit_cols, sched, done,
                  material, price, weight, city, state, wt, last_col].flatten

      $csv_file << csv_line
    end
  end
end

