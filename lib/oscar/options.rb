require 'optimist'

module Oscar
  class Options
    attr_reader :console, :quiet, :outfile, :nocsv

    def initialize()
      opts = Optimist::options do
        banner "Usage:"
        banner "#{File.basename($0)} [-q] [-c] [-o <outfile> | -n]"
        banner "\nOptions:"

        opt :console, "Output to console."
        opt :quiet, "No console output, no progress bar"
        opt :outfile, "Output file name. Default: 'oscar.csv'",
          :type => :string,
          :default => 'oscar.csv'
        opt :nocsv, "Do not create a CSV file; output only"
        conflicts :outfile, :nocsv
      end
      @console = opts[:console]
      @quiet = opts[:quiet]
      @outfile = opts[:outfile]
      @nocsv = opts[:nocsv]
    end
  end
end

