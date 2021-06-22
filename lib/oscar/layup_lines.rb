require_relative 'layup_line'

module Oscar
  class LayupLines
    attr_reader :lines

    def initialize(so_qry_lines)
      @lines = collect_lines(so_qry_lines)
    end

    private

    def collect_lines(lns)
      1.upto(lines_count(lns)).collect do |line_num|
        LayupLine.new(lns.find_all { |h| h[:ord_line_num] == line_num })
      end
    end

    def lines_count(lns)
      lns.max_by{|h| h[:ord_line_num] }[:ord_line_num].to_i
    end
  end
end

