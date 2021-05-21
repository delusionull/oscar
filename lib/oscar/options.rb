require 'optimist'

module Oscar
  class Options
    attr_reader :console, :outfile, :nocsv

    def initialize()
      opts = Optimist::options do
        banner "Usage:"
        banner "#{File.basename($0)} [-c] [-o <outfile> | -n]"
        banner "\nOptions:"

        opt :console, "Output to console."
        opt :outfile, "Output file name. Default: 'oscar.csv'",
          :type => :string,
          :default => 'oscar.csv'
        opt :nocsv, "Do not create a CSV file; output only"
        conflicts :outfile, :nocsv
      end
      @console = opts[:console]
      @outfile = opts[:outfile]
      @nocsv = opts[:nocsv]
    end
  end
end

