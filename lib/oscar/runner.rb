require_relative 'options'
require_relative 'dbs'
#require_relative 'utils'
require_relative 'constants'
require_relative 'queries'
#require_relative 'pos'
require_relative 'sales_order'
require_relative 'schedule_so'

class NilClass
  def method_missing(*a)
    nil
  end
end

module Oscar
  class Runner
    def initialize()
      @opts = Options.new()
      $sos = get_all_sos
    end

    def run
      sos = get_so_nums
      #p sos
      #str_sos = sos.map(&:to_s)
      #layup_items = Oscar::DBs::DB_SCHED[:tblLayupItems].join(:tblJobs, :JobID => :JobID)
      #layup_lines =
      #  layup_items.select(:LayupID, :LayupQnty, :LayupStagerNote, :WoNumber, :Done, :Printed)
      #    .where(
      #      (Sequel[{LayupExclude: false}]) |
      #      (
      #        Sequel[{LayupExclude: true}] &
      #        Sequel.like(:LayupInstructions, '%SEND%')
      #      )
      #    )
      #schedule_blob = layup_lines.where(JobSalesOrderNo: str_sos).all
      #p schedule_blob
      #abort


      sos.each do |so_num|
        so = SalesOrder.new(so_num)
        schedule_so = ScheduleSO.new(so)
        so_info = ''
        so_info << "#{so.so_num},"
        so_info << "#{so.so_suffix},"
        so_info << "#{so.requested_ship_date},"
        so_info << "," # so type
        so_info << "#{flags(schedule_so, so)}," # flag
        so_info << "," # margin 
        so_info << "#{(so.customer_num.to_s +
                      (' ' + ' ' * (26 - so.customer_num.to_s.length)) +
                       so.ship_to_name.to_s +
        ' ' * 25 + so.customer_po_num.to_s).strip},"
        so_info << "," # apd date, apd code
        so_info << "," * 9
        so_info << "#{schedule_so.lines_with_scheduled_and_total*(' '*25)}," # lines with scheduled and total
        so_info << "#{schedule_so.lines_with_done_and_total*(' '*25)}," # work orders with done and total
        so_info << "," # material with num
        # so_info << "$#{line[:Dollars].to_f < 1 ? -(line[:Cost].to_s.to_f) : line[:Dollars].to_f}," # if "line[:Dollars]" < $1 then display neg (-)"line[:Cost]"
        so_info << "#{so.netprice}," # cost
        so_info << "#{so.weight}," # weight
        so_info << "," # shipvia
        so_info << "#{so.city}," # city
        so_info << "#{so.state}," # state
        so_info << "," # salesperson
        so_info << ",,"
        puts so_info
        #next schedule_so.warn_exists if schedule_so.exists?
        #schedule_so.print_to_console
        #schedule_so.push unless @opts.test
      end
    end

    private

    def get_all_sos
      Oscar::DBs::DB_INFOR.fetch(Oscar::Queries::ALL_SOS).all
    end

    def get_so_nums
      $sos.map { |x| x[:sales_order] }.uniq
    end

    def flags(schedule_so, so)
      flg =
      schedule_so.flag_notinschedule.to_s +
      schedule_so.flag_all_lines_scheduled.to_s +
      schedule_so.flag_all_lines_complete.to_s +
      schedule_so.flag_all_lines_printed.to_s
      flg = flg + '_' unless flg.empty?
    end
  end
end

