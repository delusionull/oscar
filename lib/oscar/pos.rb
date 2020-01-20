module Sscd
  class Pos
    def initialize
      @pos = pos
    end

    def pos
      Sscd::DBs::DB_INFOR.fetch(Sscd::Constants::POS_QRY_STR).all
    end
  end
end

