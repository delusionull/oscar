require_relative 'core'
require_relative 'laminate'
require_relative 'panel_config'

module Oscar
  class LayupLine
    def initialize(lines)
      @lines = lines
      @part_num = part_num
      @pn_info = pn_info
      @panel_config = panel_config
    end

    def part_num
      @lines[0][:part_num]
    end

    def wo_num
      (@lines[0][:wo_num].to_s + @lines[0][:wo_suffix].to_s.rjust(2, "0")).to_i
    end

    def wt_num
      (@lines[0][:wt_num].to_s + @lines[0][:wt_suffix].to_s.rjust(2, "0")).to_i
    end

    def qty
      @lines[0][:wo_line_qty].to_i
    end

    def line_num
      @lines[0][:ord_line_num]
    end

    def thick
      Oscar::Constants::THICK[@pn_info[:thick]][:decimal]
    end

    def size
      size = @pn_info[:size]
      #raise "No panel size info found. Check FG part number." unless size
      return size
    end

    def core
      Core.new(@lines, @panel_config)
    end

    def face
      Face.new(@lines, @panel_config)
    end

    def back
      Back.new(@lines, @panel_config)
    end

    def weight
      @lines[0][:fg_weight].to_i * qty
    end

    def desc1
      @lines[0][:fg_desc1].gsub(/[^\w ]/, '')
    end

    def desc2
      @lines[0][:fg_desc2].gsub(/[^\w ]/, '')
    end

    def customer_pn
      /\!~(.+?)( |$)/.match(@lines[0][:ord_line_comment]).to_a[1].to_s
    end

    private

    def panel_config
      PanelConfig.new(@lines, @pn_info)
    end

    def pn_info
      return afi_pn_info if @part_num[0..1] == '0-'
      return cust_pn_info if /CUST/.match(@part_num)
      /
      (?<vend>(#{Oscar::Constants::VEND.keys*'|'})?)        # the laminate vendor indicator
      (?<face>(#{Oscar::Constants::FACE_CODES*'|'}|.{3}.*)) # the face code
      (?<core>#{Oscar::Constants::CORE_CODES*'|'})          # the two digit core code
      (?<thick>[0-5]\d)                                        # the panel thickness
      (?<back>(#{Oscar::Constants::BACK_CODES*'|'}|.{4}.*)) # the two digit back code
      (?<size>#{Oscar::Constants::SIZE.keys*'|'})           # the two digit size code
      (?<orientation>[UD]?)                                    # the panel orientation
      /x.match(@part_num)
    end

    def afi_pn_info
      thick = /0-.*-.*-([0-5]\d)/.match(@part_num)[1]
      afi_size = /0-.*-.*-[0-5]\d(#{Oscar::Constants::AFI_INFOR_SIZE.keys*'|'})/.match(@part_num)[1]
      size = Oscar::Constants::AFI_INFOR_SIZE[afi_size]
      back = /SAME/.match(@part_num) ? 'G2' : ''
      return {:thick => thick, :size => size, :back => back, :face => '', :core => '' }
    end

    def cust_pn_info
      info =
      /
      (?<vend>(#{Oscar::Constants::VEND.keys*'|'})?)        # the laminate vendor indicator
      (?<face>(#{Oscar::Constants::FACE_CODES*'|'}|.{3}.*)) # the face code
      (?<core>#{Oscar::Constants::CORE_CODES*'|'})          # the two digit core code
      (?<thick>([0-5]\d)?)                                     # the panel thickness
      (?<back>(#{Oscar::Constants::BACK_CODES*'|'}|.{4}.*)) # the two digit back code
      (?<size>#{Oscar::Constants::SIZE.keys*'|'})           # the two digit size code
      (?<orientation>[UD]?)                                    # the panel orientation
      /x.match(@part_num)
      thick = info[:thick] || '00'
      return {:thick => thick,
              :size => info[:size],
              :back => info[:back],
              :face => info[:face],
              :core => info[:core],
              :orientation => info[:orientation] }
    end
  end
end

