module Oscar
  class Constants
    VEND = {
      "W" => {:brand => "Wilsonart"},
      "F" => {:brand => "Formica"},
      "P" => {:brand => "Pionite"},
      "N" => {:brand => "Nevamar"},
      "L" => {:brand => "Laminart"},
      "D" => {:brand => "Labdesign"},
      "C" => {:brand => "Chemetal"},
      "T" => {:brand => "Treefrog"},
      "A" => {:brand => "Arborite"},
      "R" => {:brand => "Arpa"},
      "B" => {:brand => "Abet"},
      "O" => {:brand => "Formaline"},
      "H" => {:brand => "Achieva"}
    }

    CORE_CODES = %w(
      PB PF PM PS PN MD MF MG MM MS MN ML XN XS YA VM
      YB Y1 YC YR YX YS YN YG YL DO CC VP CS CUST ZZ
    )

    FACE_CODES = %w( BK LW LP LB LA LG RE RA CS
                     THYS THYSWFR THYSFFR THYSPFR THYSNFR FORBO LOFT 
                     B4 B6 BA BB BC BD BE BF BG BH BI BJ BL BM
                     BN BO BP BQ BR BS BT BU BV BW BX BY BZ )

    BACK_CODES = FACE_CODES << 'G2'

    SIZE = {
      "B1" => {:inches => "3096",  :shazam => 50},
      "B2" => {:inches => "30120", :shazam => 49},
      "B3" => {:inches => "30144", :shazam => 46},
      "38" => {:inches => "3697",  :shazam => 43},
      "31" => {:inches => "36120", :shazam => 52},
      "32" => {:inches => "36144", :shazam => 53},
      "M4" => {:inches => "4878",  :shazam => 61},
      "M8" => {:inches => "3896",  :shazam => 62},
      "48" => {:inches => "4896",  :shazam =>  1},
      "41" => {:inches => "48120", :shazam =>  2},
      "42" => {:inches => "48144", :shazam =>  3},
      "AA" => {:inches => "51120", :shazam => 47},
      "56" => {:inches => "6072",  :shazam => 42},
      "58" => {:inches => "6096",  :shazam =>  4},
      "51" => {:inches => "60120", :shazam =>  5},
      "52" => {:inches => "60144", :shazam =>  6},
      "TA" => {:inches => "4896",  :shazam =>  1},
      "TB" => {:inches => "4896",  :shazam =>  1},
      "TC" => {:inches => "4896",  :shazam =>  1},
    }

    AFI_INFOR_SIZE = {
      "38" => "38",
      "83" => "38",
      "48" => "48",
      "41" => "41",
      "14" => "41",
      "42" => "42",
      "58" => "58",
      "51" => "51",
      "52" => "52",
    }

    THICK = {
      "00" => {:decimal => 0.0,     :fraction => "0"},
      "02" => {:decimal => 0.0625,  :fraction => "1/16"},
      "03" => {:decimal => 0.125,   :fraction => "1/8"},
      "05" => {:decimal => 0.1875,  :fraction => "3/16"},
      "06" => {:decimal => 0.25,    :fraction => "1/4"},
      "08" => {:decimal => 0.3125,  :fraction => "5/16"},
      "10" => {:decimal => 0.375,   :fraction => "3/8"},
      "11" => {:decimal => 0.4375,  :fraction => "7/16"},
      "13" => {:decimal => 0.5,     :fraction => "1/2"},
      "14" => {:decimal => 0.5625,  :fraction => "9/16"},
      "16" => {:decimal => 0.625,   :fraction => "5/8"},
      "17" => {:decimal => 0.6875,  :fraction => "11/16"},
      "18" => {:decimal => 0.71875, :fraction => "23/32"},
      "19" => {:decimal => 0.75,    :fraction => "3/4"},
      "21" => {:decimal => 0.8125,  :fraction => "13/16"},
      "22" => {:decimal => 0.875,   :fraction => "7/8"},
      "24" => {:decimal => 0.9375,  :fraction => "15/16"},
      "25" => {:decimal => 1.0,     :fraction => "1"},
      "27" => {:decimal => 1.0625,  :fraction => "1-1/16"},
      "28" => {:decimal => 1.0625,  :fraction => "1-1/16"},
      "29" => {:decimal => 1.125,   :fraction => "1-1/8"},
      "30" => {:decimal => 1.1875,  :fraction => "1-3/16"},
      "32" => {:decimal => 1.25,    :fraction => "1-1/4"},
      "33" => {:decimal => 1.3125,  :fraction => "1-5/16"},
      "35" => {:decimal => 1.375,   :fraction => "1-3/8"},
      "37" => {:decimal => 1.4375,  :fraction => "1-7/16"},
      "38" => {:decimal => 1.5,     :fraction => "1-1/2"},
      "40" => {:decimal => 1.5625,  :fraction => "1-9/16"},
      "41" => {:decimal => 1.625,   :fraction => "1-5/8"},
      "43" => {:decimal => 1.6875,  :fraction => "1-11/16"},
      "44" => {:decimal => 1.75,    :fraction => "1-3/4"},
      "46" => {:decimal => 1.8125,  :fraction => "1-13/16"},
      "48" => {:decimal => 1.875,   :fraction => "1-7/8"},
      "49" => {:decimal => 1.9375,  :fraction => "1-15/16"},
      "50" => {:decimal => 2.0,     :fraction => "2"},
      "51" => {:decimal => 2.0,     :fraction => "2"},
    }
  end
end

