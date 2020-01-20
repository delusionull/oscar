require 'optimist'

module Oscar
  class Options
    attr_reader :test, :outfile

    def initialize()
      opts = Optimist::options do
        banner "Usage:"
        banner "#{File.basename($0)} [-t] [-o <outfile>]"
        banner "\nOptions:"

        opt :test, "Test run only; don't write data file."
        opt :outfile, "Output file name. Default: 'sscd.csv'",
          :type => :string,
          :default => 'sscd.csv'
      end

      @test = opts[:test]
      @outfile = opts[:outfile]
    end
  end
end

