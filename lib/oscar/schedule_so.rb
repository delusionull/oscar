module Oscar
  class ScheduleSO 
    def initialize(so)
      @so = so
      @so_num = @so.so_num.to_s
    end

    def flag_all_lines_scheduled
      flag = 'c' unless lines_and_qty.empty?
      lines_and_qty.each do |lin_and_qty|
        qty_in_schedule = qty_sched(@so_num, lin_and_qty[0])
        flag = '' if qty_in_schedule.to_i < lin_and_qty[1].to_i
      end
      flag
    end

    def flag_all_lines_complete
      flag = 'f' unless wos_and_qty.empty?
      wos_and_qty.each do |wo_and_qty|
        qty_done = qty_accepted(wo_and_qty[0][1])
        flag = '' if qty_done.to_i < wo_and_qty[1].to_i
      end
      flag
    end

    def flag_all_lines_printed
      flag = 'g' unless wos_and_qty.empty?
      wos_and_qty.each do |wo_and_qty|
        flag = '' unless printed?(wo_and_qty[0][1])
      end
      flag
    end

    def flag_notinschedule
      exists?(@so_num) ? "" : "8"
    end

    def lines_with_scheduled_and_total
      the_lines = []
      lines_and_qty.each do |lin_and_qty|
        presses = presses(@so_num, lin_and_qty[0])
        qty_in_schedule = qty_sched(@so_num, lin_and_qty[0])
        the_lines << "#{lin_and_qty[0]}_#{qty_in_schedule}/#{lin_and_qty[1]}#{presses}"
      end
      the_lines
    end

    def lines_with_done_and_total
      the_lines = []
      wos_and_qty.each do |wo_and_qty|
        line_num = find_line(wo_and_qty[0][1])
        qty_done = qty_accepted(wo_and_qty[0][1])
        prt = "#{printed?(wo_and_qty[0][1]) ? '_p' : ''}"
        the_lines << "#{line_num}_#{wo_and_qty[0][0]}_#{wo_and_qty[0][1]}_#{qty_done}/#{wo_and_qty[1]}#{prt}"
      end
      the_lines.sort
    end

    def packaging_weight
    end

    private

    def exists?(so_num)
      $layup_lines.any?{|x| x[:JobSalesOrderNo] == so_num}
    end

    def lines_and_qty
      laq = {}
      $layup_lines.select{|x| x[:JobSalesOrderNo] == @so_num}.each do |x|
        laq.merge!( {"#{x[:LayupStagerNote][0..3]}" => x[:LayupQnty]} ) {
          |k, a_value, b_value| a_value + b_value
        }
      end
      laq
    end

    def wos_and_qty
      waq = {}
      $layup_lines.select{|x| x[:JobSalesOrderNo] == @so_num}.each do |x|
        waq.merge!( {["#{x[:WtNumber]}", "#{x[:WoNumber]}"] => x[:LayupQnty]} ) {
          |k, a_value, b_value| a_value + b_value
        }
      end
      waq
    end

    def find_line(wo)
      $layup_lines.find{|x| x[:WoNumber] == wo.to_i}[:LayupStagerNote][0..3]
    end

    def qty_sched(so, line)
      $layup_items_in_press.where(LayupID: layup_ids(so, line)).sum(:LayupItemXPressQnty).to_i
    end

    def qty_accepted(wo)
      wo_layup_ids = $layup_lines.collect{|x| x[:LayupID] if x[:WoNumber] == wo.to_i}.compact
      $layup_lines.collect{|x| x[:LayupQnty].to_i if
                               wo_layup_ids.include?(x[:LayupID]) && x[:Done] == true
      }.compact.sum
    end

    def printed?(wo)
      $layup_lines.find{|x| x[:WoNumber] == wo.to_i}[:Printed]
    end

    def presses(so, line)
      pd = []
      layup_ids(so, line).each do |id|
        presses_and_dates = $layup_items_press_and_date
          .select(:PressNumber, :PressDate, :PressSizesID)
          .where(LayupID: id).all
        presses_and_dates.each{ |x|
          press = "P#{x[:PressNumber].to_s}_"
          date = "#{x[:PressDate].strftime("%-m/%-d")}"
          pd << "#{press}#{date}"
        } unless presses_and_dates.empty?
      end
      "#{pd.compact.empty? ? '' : '(' + pd.compact.uniq*';'.to_s + ')'}"
    end

    def layup_ids(so, line)
      $layup_lines.collect{|x| x[:LayupID] if
        x[:JobSalesOrderNo] == so && x[:LayupStagerNote].start_with?(line)
      }.compact
    end
  end
end

