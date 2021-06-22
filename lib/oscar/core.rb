module Oscar
  class Core
    def initialize(lines, panel_config)
      @lines = lines
      @panel_config = panel_config
    end

    def codes
      return ['CUSTOMER CORE'] if @panel_config.customer_core
      c = get_codes(@lines, @panel_config)
      c.empty? ? ["No core. Check core codes."] : c
    end

    def weight
      codes.sum{|code| wt(code)}
    end

    private

    def get_codes(lns, pconf)
      1.upto(pconf.core_last_line).collect do |line_num|
        lns.find { |h| h[:sequence_num] == line_num }[:com_part_num]
      end
    end

    def wt(code)
      Oscar::Constants::CORE_WEIGHTS[code] ||
      @lines.find { |h| h[:com_part_num] == code }[:prod_weight].to_i
    end
  end
end

