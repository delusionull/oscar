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
require 'ruby-progressbar'
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
      puts ''
      pm = "\e[0;33m\u{15E7}"
      blinky, pinky, inky, clyde = "\e[0;31m\u{15E9} ", "\e[0;35m\u{15E9} ", "\e[0;34m\u{15E9} ", "\e[0;33m\u{15E9} "
      eyes = "\e[0m\u{221E} "
      dot = "\e[0m\u{FF65}"
      progressbar = ProgressBar.create(:format => "%a %b" + pm + dot * 6 + pinky + "\e[0m%i %p%% %t",
                                       :progress_mark => ' ',
                                       :remainder_mark => "\u{FF65}",
                                       :title => "done",
                                       :total => sos.length) unless $opts.console || $opts.nocsv
      sos.each do |so_num|
        so = SalesOrder.new(so_num)
        schedule_so = ScheduleSO.new(so)
        flgs = flags(schedule_so, so)
        Screenprinter.print(so, schedule_so, flgs) if $opts.console || $opts.nocsv
        CSVWriter.addline(so, schedule_so, flgs) unless $opts.nocsv
        unless $opts.console || $opts.nocsv
          dotbuff = ((progressbar.total.to_f - progressbar.progress)*10/progressbar.total).to_i - 2
          progressbar.format =
            "%a %b" +
            (dotbuff == 0 ? eyes : '') +
            (dotbuff == -1 ? eyes + ' ' : '') +
            pm + dot * (dotbuff < 0 ? 0 : dotbuff) +
            (dotbuff < 1 ? '' : (progressbar.progress.even? ? dot : '') + pinky) +
            "\e[0m%i %p%% %t"
          progressbar.increment
        end
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

