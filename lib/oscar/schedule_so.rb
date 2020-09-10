module Oscar
  class ScheduleSO 
    def initialize(so)
      @so = so
      @so_num = @so.so_num.to_s
    end

    def flag_all_lines_scheduled
      flag = 'c' unless lines_and_qty.empty?
      lines_and_qty.each do |lin_and_qty|
        qty_in_schedule = qty_sched(@so_num, lin_and_qty[0], layup_lines, layup_items_in_press)
        flag = '' if qty_in_schedule.to_i < lin_and_qty[1].to_i
      end
      flag
    end

    def flag_all_lines_complete
      flag = 'f' unless wos_and_qty.empty?
      wos_and_qty.each do |wo_and_qty|
        qty_done = qty_accepted(wo_and_qty[0][1], layup_lines)
        flag = '' if qty_done.to_i < wo_and_qty[1].to_i
      end
      flag
    end

    def flag_all_lines_printed
      flag = 'g' unless wos_and_qty.empty?
      wos_and_qty.each do |wo_and_qty|
        flag = '' unless printed?(wo_and_qty[0][1], layup_lines)
      end
      flag
    end

    def flag_notinschedule
      exists?(@so_num) ? "" : "8"
    end

    def lines_with_scheduled_and_total
      the_lines = []
      lines_and_qty.each do |lin_and_qty|
        weights(@so_num, lin_and_qty[0], layup_lines, layup_items_press_and_date)
        presses = presses(@so_num, lin_and_qty[0], layup_lines, layup_items_press_and_date)
        qty_in_schedule = qty_sched(@so_num, lin_and_qty[0], layup_lines, layup_items_in_press)
        the_lines << "#{lin_and_qty[0]}_#{qty_in_schedule}/#{lin_and_qty[1]}#{presses}"
      end
      the_lines
    end

    def lines_with_done_and_total
      the_lines = []
      wos_and_qty.each do |wo_and_qty|
        line_num = find_line(wo_and_qty[0][1])
        qty_done = qty_accepted(wo_and_qty[0][1], layup_lines)
        prt = "#{printed?(wo_and_qty[0][1], layup_lines) ? '_p' : ''}"
        the_lines << "#{line_num}_#{wo_and_qty[0][0]}_#{wo_and_qty[0][1]}_#{qty_done}/#{wo_and_qty[1]}#{prt}"
      end
      the_lines.sort
    end

    def packaging_weight
    end

    private

    def exists?(so_num)
      Oscar::DBs::DB_SCHED.fetch(Oscar::Queries::SHAZ_SO_EXISTS, so_num).count >= 1
    end

    def layup_items
      Oscar::DBs::DB_SCHED[:tblLayupItems].join(:tblJobs, :JobID => :JobID)
    end

    def layup_items_in_press
      Oscar::DBs::DB_SCHED[:tblLayupItemXPress]
    end

    def layup_items_press_and_date
      layup_items_in_press.join(:tblLayupPress, :PressID => :PressID)
    end

    def layup_lines
      layup_items.select(:LayupID, :LayupQnty, :LayupStagerNote, :WoNumber, :WtNumber, :Done, :Printed)
        .where(
          (Sequel[{LayupExclude: false}]) |
          (
            Sequel[{LayupExclude: true}] &
            Sequel.like(:LayupInstructions, '%SEND%')
          )
        )
    end

    def layup_ids
      layup_lines.where(JobSalesOrderNo: @so_num).select_map(:LayupID)
    end

    #This is the new one.
    def presses_and_sizes
      pas = {}
      layup_lines.where(JobSalesOrderNo: @so_num).each do |x|
        laq.merge!( {"#{x[:LayupStagerNote][0..3]}" => x[:LayupQnty]} ) {
          |k, a_value, b_value| a_value + b_value
        }
      end
      pas
    end

    def lines_and_qty
      laq = {}
      layup_lines.where(JobSalesOrderNo: @so_num).each do |x|
        laq.merge!( {"#{x[:LayupStagerNote][0..3]}" => x[:LayupQnty]} ) {
          |k, a_value, b_value| a_value + b_value
        }
      end
      laq
    end

    def wos_and_qty
      waq = {}
      layup_lines.where(JobSalesOrderNo: @so_num).each do |x|
        waq.merge!( {["#{x[:WtNumber]}", "#{x[:WoNumber]}"] => x[:LayupQnty]} ) {
        #waq.merge!( {"#{x[:WoNumber]}" => x[:LayupQnty]} ) {
          |k, a_value, b_value| a_value + b_value
        }
      end
      #ap waq
      waq
    end

    def find_line(wo)
      layup_items.select(:LayupStagerNote).where(WoNumber: wo.to_i).first[:LayupStagerNote][0..3]
    end

    def qty_sched(so, line, layup_lines, layup_items_in_press)
      layup_ids = layup_lines
        .where(JobSalesOrderNo: so)
        .where(Sequel.like(:LayupStagerNote, "#{line}%"))
        .select_map(:LayupID)
      layup_items_in_press.where(LayupID: layup_ids).sum(:LayupItemXPressQnty).to_i
    end

    def qty_accepted(wo, layup_lines)
      layup_ids = layup_lines
        .where(WoNumber: wo.to_i)
        .select_map(:LayupID)
      layup_lines.where(LayupID: layup_ids).where(Done: true).sum(:LayupQnty).to_i
    end

    def printed?(wo, layup_lines)
      layup_lines.select(:Printed).where(WoNumber: wo.to_i).first[:Printed]
    end

    def weights(so, line, layup_lines, layup_items_in_press_and_date)
      #ap layup_lines.all
      #abort
      layup_ids = layup_lines
        .where(JobSalesOrderNo: so)
        .where(Sequel.like(:LayupStagerNote, "#{line}%"))
        .select_map(:LayupID)
      wt = []
      layup_ids.each do |id|
        sizes = layup_items_in_press_and_date
          .select(:PressSizesID)
          .where(LayupID: id).all
        #ap sizes
        unless sizes.empty?
          sizes.each do |x|
            wt << "#{x[:PressSizesID]}"
          end
        end
      end
      #ap "#{so}   #{wt.compact.empty? ? '' : '(' + wt.compact.uniq*';'.to_s + ')'}"
    end

    def presses(so, line, layup_lines, layup_items_in_press_and_date)
      layup_ids = layup_lines
        .where(JobSalesOrderNo: so)
        .where(Sequel.like(:LayupStagerNote, "#{line}%"))
        .select_map(:LayupID)
      pd = []
      layup_ids.each do |id|
        presses_and_dates = layup_items_in_press_and_date
          .select(:PressNumber, :PressDate, :PressSizesID)
          .where(LayupID: id).all
        #ap presses_and_dates
        unless presses_and_dates.empty?
          presses_and_dates.each do |x|
            press = "P#{x[:PressNumber].to_s}_"
            date = "#{x[:PressDate].strftime("%-m/%-d")}"
            pd << "#{press}#{date}"
          end
        end
      end
      "#{pd.compact.empty? ? '' : '(' + pd.compact.uniq*';'.to_s + ')'}"
    end
  end
end

