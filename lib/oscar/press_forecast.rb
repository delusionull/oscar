module Oscar
  module PressForecast
    extend self

    def write_file
      future_dates.each do |date|
        $pf_file << presses_on_date(date)
      end
    end

    private

    def future_dates
      $layup_lines.map{|x| x[:LayupGlueOverride]}.uniq.sort.reject {|x| x <= Time.now}
    end

    def presses_on_date(date)
      datelines = $layup_lines.select{|x| x[:LayupGlueOverride] == date}
      ["#{date.month}/#{date.day}", num_presses(datelines)]
    end

    def num_presses(dl)
      dl.map{|x| x[:LayupSizeID]}.uniq.sort.collect do |sz|
        ( tot_height(dl, sz) / max_height(sz) ).ceil
      end.sum
    end

    def tot_height(dl, sz)
      dl.collect do |ln|
        (ln[:LayupCoreThk] * ln[:LayupQnty]) if ln[:LayupSizeID] == sz
      end.compact.sum
    end

    def max_height(sz)
      Oscar::Constants::SIZE.select{|key, hash| hash[:shazam] == sz}.flatten[1][:press_ht]
    end
  end
end

