module Oscar
  module Utils
    def self.prompt(*args)
      print(*args)
      STDIN.gets.chomp
    end
    
    def self.shift_business_day(date, incr)
      date = Date.parse(date.to_s)
      incr.abs.times do
        date += (incr < 0 ? -1 : 1)
        while date.saturday? || date.sunday? do
          date += (incr < 0 ? -1 : 1)
        end
      end
      date
    end
    
    def self.date_in_sql_format()
      #get a date and return a string with #hashmarks# surrounding it e.g. - #2015-05-08#
    end
    
    def self.to_short_date(date)
      Date.parse(date).strftime("%-m/%-e")
    end
    
    def self.size_of(material)
      material[-3..-1]
    end
  end
end

