module Oscar
  class Queries
    ALL_SOS = <<~EOS
    SELECT
      CAST(pro2dw.oeel.orderno AS INT)    AS sales_order,
      CAST(pro2dw.oeel.ordersuf AS INT)   AS suffix,
      CAST(pro2dw.oeel.lineno_ AS INT)    AS ord_line_num,
           pro2dw.oeeh.custpo             AS customer_po_num,
      CAST(pro2dw.kpet.wono AS INT)       AS wo_num,
      CAST(pro2dw.kpet.wosuf AS INT)      AS wo_suffix,
      CAST(pro2dw.kpet.cono AS INT)       AS company_num,
           0                              AS wt_num,
           0                              AS wt_suffix,
      CAST(pro2dw.kpet.stagecd AS INT)    AS wo_stage_code,
           pro2dw.kpet.whse               AS warehouse,
           pro2dw.kpet.shipprod           AS part_num,
      UPPER(pro2dw.oeelk.shipprod)        AS com_part_num,
      CAST(pro2dw.oeelk.qtyneeded AS INT) AS component_qty,
           pro2dw.oeelk.prodcat           AS product_category,
      CAST(pro2dw.oeelk.seqno AS INT)     AS sequence_num,
           pro2dw.kpet.enterdt            AS order_date,
           pro2dw.oeeh.reqshipdt          AS requested_ship_date,
      CAST(pro2dw.oeeh.stagecd AS INT)    AS so_stage_code,
      CAST(pro2dw.kpet.qtyord AS INT)     AS wo_line_qty,
      CAST(pro2dw.kpet.qtyship AS INT)    AS wo_line_qty_shipped,
           pro2dw.kpet.ordertype          AS wo_type,
      CAST(pro2dw.oeel.price AS FLOAT)    AS line_item_price,
      CAST(pro2dw.oeel.netord AS FLOAT)   AS net_price,
           pro2dw.oeel.whse               AS selling_warehouse,
           pro2dw.oeeh.custno             AS customer_num,
           pro2dw.oeeh.shiptonm           AS ship_to_name,
           pro2dw.oeeh.shiptoaddr##1      AS address1,
           pro2dw.oeeh.shiptoaddr##2      AS address2,
           pro2dw.oeeh.shiptocity         AS city,
           pro2dw.oeeh.shiptost           AS state,
           pro2dw.oeeh.shiptozip          AS zip,
           pro2dw.com.noteln##1           AS ord_line_comment,
      NVL(TRIM(pro2dw.icsw.binloc1),'--') AS prod_bin,
           pro2dw.icsw.binloc2            AS prod_detail,
      CAST(pro2dw.icsw.qtyonhand AS INT)  AS prod_qty_on_hand,
           pro2dw.icsp.weight             AS prod_weight,
           pro2dw.icsp.descrip##1         AS prod_desc1,
           pro2dw.icsp.descrip##2         AS prod_desc2,
           (SELECT pro2dw.icsp.weight
            FROM pro2dw.icsp
            WHERE UPPER(pro2dw.icsp.prod) = UPPER(pro2dw.kpet.shipprod))
                                          AS fg_weight,
           (SELECT pro2dw.icsp.descrip##1
            FROM pro2dw.icsp
            WHERE UPPER(pro2dw.icsp.prod) = UPPER(pro2dw.kpet.shipprod))
                                          AS fg_desc1,
           (SELECT pro2dw.icsp.descrip##2
            FROM pro2dw.icsp
            WHERE UPPER(pro2dw.icsp.prod) = UPPER(pro2dw.kpet.shipprod))
                                          AS fg_desc2
    FROM
      pro2dw.kpet
      INNER JOIN pro2dw.oeel  ON pro2dw.kpet.orderaltno = pro2dw.oeel.orderno
                             AND pro2dw.kpet.orderaltsuf = pro2dw.oeel.ordersuf
                             AND pro2dw.kpet.linealtno = pro2dw.oeel.lineno_
                             AND pro2dw.kpet.cono = pro2dw.oeel.cono
      INNER JOIN pro2dw.oeeh  ON pro2dw.oeel.cono = pro2dw.oeeh.cono
                             AND pro2dw.oeel.orderno = pro2dw.oeeh.orderno
                             AND pro2dw.oeel.ordersuf = pro2dw.oeeh.ordersuf
      INNER JOIN pro2dw.oeeh  ON pro2dw.kpet.orderaltno = pro2dw.oeeh.orderno
                             AND pro2dw.kpet.orderaltsuf = pro2dw.oeeh.ordersuf
                             AND pro2dw.kpet.cono = pro2dw.oeeh.cono
      INNER JOIN pro2dw.oeelk ON pro2dw.kpet.cono = pro2dw.oeelk.cono
                             AND pro2dw.kpet.wono = pro2dw.oeelk.orderno
      LEFT JOIN pro2dw.com   ON pro2dw.oeel.orderno = pro2dw.com.orderno
                             AND pro2dw.oeel.ordersuf = pro2dw.com.ordersuf
                             AND pro2dw.oeel.lineno_ = pro2dw.com.lineno_
      INNER JOIN pro2dw.icsp  ON UPPER(pro2dw.oeelk.shipprod) = UPPER(pro2dw.icsp.prod)
      INNER JOIN pro2dw.icsw  ON pro2dw.icsp.cono = pro2dw.icsw.cono
                             AND UPPER(pro2dw.icsp.prod) = UPPER(pro2dw.icsw.prod)
    WHERE
     ( pro2dw.oeeh.stagecd in (1, 2)
       AND pro2dw.kpet.whse LIKE 'DAL'
       AND UPPER(pro2dw.kpet.ordertype) LIKE 'O'
       AND pro2dw.icsw.whse = 'DAL' )
    UNION
    (SELECT
      CAST(pro2dw.oeel.orderno AS INT)    AS sales_order,
      CAST(pro2dw.oeel.ordersuf AS INT)   AS suffix,
      CAST(pro2dw.oeel.lineno_ AS INT)    AS ord_line_num,
           pro2dw.oeeh.custpo             AS customer_po_num,
      CAST(pro2dw.kpet.wono AS INT)       AS wo_num,
      CAST(pro2dw.kpet.wosuf AS INT)      AS wo_suffix,
      CAST(pro2dw.kpet.cono AS INT)       AS company_num,
      CAST(pro2dw.wtel.wtno AS INT)       AS wt_num,
      CAST(pro2dw.wtel.wtsuf AS INT)      AS wt_suffix,
      CAST(pro2dw.kpet.stagecd AS INT)    AS wo_stage_code,
           pro2dw.kpet.whse               AS warehouse,
           pro2dw.kpet.shipprod           AS part_num,
      UPPER(pro2dw.oeelk.shipprod)        AS com_part_num,
      CAST(pro2dw.oeelk.qtyneeded AS INT) AS component_qty,
           pro2dw.oeelk.prodcat           AS product_category,
      CAST(pro2dw.oeelk.seqno AS INT)     AS sequence_num,
           pro2dw.kpet.enterdt            AS order_date,
           pro2dw.oeeh.reqshipdt          AS requested_ship_date,
      CAST(pro2dw.oeeh.stagecd AS INT)    AS so_stage_code,
      CAST(pro2dw.kpet.qtyord AS INT)     AS wo_line_qty,
      CAST(pro2dw.kpet.qtyship AS INT)    AS wo_line_qty_shipped,
           pro2dw.kpet.ordertype          AS wo_type,
      CAST(pro2dw.oeel.price AS FLOAT)    AS line_item_price,
      CAST(pro2dw.oeel.netord AS FLOAT)   AS net_price,
           pro2dw.oeel.whse               AS selling_warehouse,
           pro2dw.oeeh.custno             AS customer_num,
           pro2dw.oeeh.shiptonm           AS ship_to_name,
           pro2dw.oeeh.shiptoaddr##1      AS address1,
           pro2dw.oeeh.shiptoaddr##2      AS address2,
           pro2dw.oeeh.shiptocity         AS city,
           pro2dw.oeeh.shiptost           AS state,
           pro2dw.oeeh.shiptozip          AS zip,
           pro2dw.com.noteln##1           AS ord_line_comment,
      NVL(TRIM(pro2dw.icsw.binloc1),'--') AS prod_bin,
           pro2dw.icsw.binloc2            AS prod_detail,
      CAST(pro2dw.icsw.qtyonhand AS INT)  AS prod_qty_on_hand,
           pro2dw.icsp.weight             AS prod_weight,
           pro2dw.icsp.descrip##1         AS prod_desc1,
           pro2dw.icsp.descrip##2         AS prod_desc2,
           (SELECT pro2dw.icsp.weight
            FROM pro2dw.icsp
            WHERE UPPER(pro2dw.icsp.prod) = UPPER(pro2dw.kpet.shipprod))
                                          AS fg_weight,
           (SELECT pro2dw.icsp.descrip##1
            FROM pro2dw.icsp
            WHERE UPPER(pro2dw.icsp.prod) = UPPER(pro2dw.kpet.shipprod))
                                          AS fg_desc1,
           (SELECT pro2dw.icsp.descrip##2
            FROM pro2dw.icsp
            WHERE UPPER(pro2dw.icsp.prod) = UPPER(pro2dw.kpet.shipprod))
                                          AS fg_desc2
    FROM
      pro2dw.kpet
      INNER JOIN pro2dw.wtel  ON pro2dw.kpet.cono = pro2dw.wtel.cono
                             AND pro2dw.kpet.orderaltno = pro2dw.wtel.wtno
                             AND pro2dw.kpet.orderaltsuf = pro2dw.wtel.wtsuf
                             AND pro2dw.kpet.linealtno = pro2dw.wtel.lineno_
      INNER JOIN pro2dw.wtelo ON pro2dw.wtel.wtno = pro2dw.wtelo.wtno
                             AND pro2dw.wtel.lineno_ = pro2dw.wtelo.lineno_
                             AND pro2dw.wtel.cono = pro2dw.wtelo.cono
      INNER JOIN pro2dw.oeel  ON pro2dw.wtelo.orderaltno = pro2dw.oeel.orderno
                             AND pro2dw.wtelo.orderaltsuf = pro2dw.oeel.ordersuf
                             AND pro2dw.wtelo.linealtno = pro2dw.oeel.lineno_
                             AND pro2dw.wtelo.cono = pro2dw.oeel.cono
      INNER JOIN pro2dw.oeeh  ON pro2dw.oeel.cono = pro2dw.oeeh.cono
                             AND pro2dw.oeel.orderno = pro2dw.oeeh.orderno
                             AND pro2dw.oeel.ordersuf = pro2dw.oeeh.ordersuf
      INNER JOIN pro2dw.oeelk ON pro2dw.kpet.cono = pro2dw.oeelk.cono
                             AND pro2dw.kpet.wono = pro2dw.oeelk.orderno
      LEFT JOIN pro2dw.com   ON pro2dw.oeel.orderno = pro2dw.com.orderno
                             AND pro2dw.oeel.ordersuf = pro2dw.com.ordersuf
                             AND pro2dw.oeel.lineno_ = pro2dw.com.lineno_
      INNER JOIN pro2dw.icsp  ON UPPER(pro2dw.oeelk.shipprod) = UPPER(pro2dw.icsp.prod)
      INNER JOIN pro2dw.icsw  ON pro2dw.icsp.cono = pro2dw.icsw.cono
                             AND UPPER(pro2dw.icsp.prod) = UPPER(pro2dw.icsw.prod)
    WHERE
     ( pro2dw.oeeh.stagecd in (1, 2)
       AND pro2dw.kpet.whse LIKE 'DAL'
       AND UPPER(pro2dw.kpet.ordertype) LIKE 'T'
       AND pro2dw.icsw.whse = 'DAL' ) )
    EOS

    POS_QRY_STR = <<~EOS
      SELECT
        po.pono        AS po_num,
        po.posuf       AS po_suffix,
        po.lineno_     AS po_line_num,
        po.shipprod    AS prod_code,
        po.stkqtyord   AS qty_ordered,
        po.price       AS price,
        po.prodline    AS product_line,
        po.vendno      AS vendor,
        po.netamt      AS netamt,
        po.invcost     AS cost,
        po.expshipdt   AS exp_date,
        wo.wono        AS wo_num,
        wo.shipprod    AS fg_part_num,
        wo.statustype  AS wo_status,
        wo.qtyord      AS wo_qty,
        wo.orderaltno  AS so_num,
        wo.orderaltsuf AS so_suffix,
        wo.linealtno   AS so_line_num
      FROM pro2dw.poelo  pl,
           pro2dw.kpet   wo,
           pro2dw.poel   po
      WHERE wo.cono        = 1
      AND   wo.whse        = 'DAL'
      AND   wo.stagecd     = 1
      AND   pl.orderaltno  = wo.wono
      AND   pl.pono        = po.pono
      AND   pl.lineno_     = po.lineno_
    EOS

    PO_QRY_STR = <<~EOS
      SELECT
        po.pono        AS po_num,
        po.posuf       AS po_suffix,
        po.lineno_     AS po_line_num,
        po.shipprod    AS prod_code,
        po.stkqtyord   AS qty_ordered,
        po.price       AS price,
        po.prodline    AS product_line,
        po.vendno      AS vendor,
        po.netamt      AS netamt,
        po.invcost     AS cost,
        po.expshipdt   AS exp_date,
        wo.wono        AS wo_num,
        wo.shipprod    AS fg_part_num,
        wo.statustype  AS wo_status,
        wo.qtyord      AS wo_qty,
        wo.orderaltno  AS so_num,
        wo.orderaltsuf AS so_suffix,
        wo.linealtno   AS so_line_num
      FROM pro2dw.poelo  pl,
           pro2dw.kpet   wo,
           pro2dw.poel   po
      WHERE wo.cono        = 1
      AND   wo.whse        = 'DAL'
      AND   wo.stagecd     = 1
      AND   pl.orderaltno  = wo.wono
      AND   pl.pono        = po.pono
      AND   pl.lineno_     = po.lineno_
      AND   wo.wono        = ?
      AND   po.shipprod    = ?
    EOS

    SHAZ_SO_EXISTS = <<~EOS
      SELECT tblJobs.JobSalesOrderNo
      FROM tblJobs
      WHERE tblJobs.JobSalesOrderNo = ?
    EOS
  end
end


