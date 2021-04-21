require_relative 'layup_lines'

module Oscar
  class SalesOrder
    attr_reader :so_num
    @@iteration = 0

    def initialize(so_num)
      @so_qry_lines = $sos.select { |line| line[:sales_order] == so_num }
      @so_num = so_num
      @@iteration += 1
    end

    def self.iteration
      @@iteration
    end

    def so_suffix
      @so_qry_lines.first[:suffix]
    end

    def customer_po_num
      (@so_qry_lines.first[:customer_po_num].strip).gsub(/[^\w ]/, '')
    end

    def ship_to_name
      (@so_qry_lines.first[:ship_to_name]).gsub(/[^&\w]+/, ' ').strip
    end

    def customer_num
      @so_qry_lines.first[:customer_num]
    end

    def address1
      (@so_qry_lines.first[:address1]).gsub(/[^\w]+/, ' ').strip
    end

    def address2
      (@so_qry_lines.first[:address2]).gsub(/[^\w]+/, ' ').strip
    end

    def city
      (@so_qry_lines.first[:city]).gsub(/[^\w]+/, ' ').strip
    end

    def state
      @so_qry_lines.first[:state]
    end

    def zipcode
      @so_qry_lines.first[:zip]
    end

    def wt_warehouse
      @so_qry_lines.first[:wt_warehouse]
    end

    def netprice
      @so_qry_lines.inject(0){|sum, ln| sum += ln[:net_price] if ln[:sequence_num] == 1; sum}
    end

    def requested_ship_date
      @so_qry_lines.first[:requested_ship_date].strftime('%F')
    end

    def layup_lines
      LayupLines.new(@so_qry_lines)
    end

    def weight
      layup_lines.lines.inject(0){|sum, ln| sum += ln.weight; sum}
      # add something here to include packaging weight
    end
  end
end

