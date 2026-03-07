      *================================================================
      * ORDENES.cpy - Estructura de registro ORDENES_TRANSFERENCIA
      *================================================================

       01 REG-ORDEN.
          05 OT-NUM-ORDEN       PIC X(20).
          05 OT-FEC-CREACION    PIC X(10).
             *> YYYY-MM-DD
          05 OT-HOA-CREACION    PIC X(8).
             *> HH:MM:SS
          05 OT-COD-BCO-ORIGEN  PIC X(3).
          05 OT-COD-CTA-ORIGEN  PIC X(20).
          05 OT-NOM-CLI-ORIGEN  PIC X(50).
          05 OT-COD-BCO-DEST    PIC X(3).
          05 OT-COD-CTA-DEST    PIC X(20).
          05 OT-NOM-CLI-DEST    PIC X(50).
          05 OT-MTO-TRANSF      PIC S9(13)V99.
          05 OT-MTO-COMISION    PIC S9(13)V99.
          05 OT-MTO-TOTAL       PIC S9(13)V99.
          05 OT-TIP-MONEDA      PIC X(3).
          05 OT-DES-CONCEPTO    PIC X(100).
          05 OT-EST-ORDEN       PIC X(22).
          05 OT-FEC-ENVIO       PIC X(10).
          05 OT-FEC-CONFIRMAC   PIC X(10).
          05 OT-MCA-BLOQUEADA   PIC X(1).
          05 FILLER             PIC X(9).
