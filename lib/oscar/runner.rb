require_relative 'options'
require_relative 'dbs'
#require_relative 'utils'
require_relative 'constants'
require_relative 'queries'
#require_relative 'pos'
require_relative 'sales_order'
require_relative 'schedule_so'
require_relative 'screenprinter'
require_relative 'csvwriter'
require 'csv'

class NilClass
  def method_missing(*a)
    nil
  end
end

module Oscar
  class Runner
    def initialize()
      $opts = Options.new()
      $sos = get_all_sos
      $csv_file = CSV.open("./#{$opts.outfile}", "wb") unless $opts.nocsv
    end

    def run
      sos = get_so_nums
      sos.each do |so_num|
        so = SalesOrder.new(so_num)
        schedule_so = ScheduleSO.new(so)
        flgs = flags(schedule_so, so)
        Screenprinter.print(so, schedule_so, flgs) if $opts.console || $opts.nocsv
        CSVWriter.addline(so, schedule_so, flgs) unless $opts.nocsv
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

