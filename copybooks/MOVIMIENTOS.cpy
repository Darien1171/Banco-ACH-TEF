      *================================================================
      * MOVIMIENTOS.cpy - Estructura de registro MOVIMIENTOS_CUENTAS
      *================================================================

       01 REG-MOVIMIENTO.
          05 MC-NUM-MOVIMIENTO  PIC X(20).
          05 MC-COD-CUENTA      PIC X(20).
          05 MC-FEC-MOVIMIENTO  PIC X(10).
             *> YYYY-MM-DD
          05 MC-HOA-MOVIMIENTO  PIC X(8).
             *> HH:MM:SS
          05 MC-TIP-MOVIMIENTO  PIC X(22).
          05 MC-MTO-MOVIMIENTO  PIC S9(13)V99.
             *> Negativo=salida, Positivo=entrada
          05 MC-SAL-ANTERIOR    PIC S9(13)V99.
          05 MC-SAL-POSTERIOR   PIC S9(13)V99.
          05 MC-DES-DETALLE     PIC X(100).
          05 MC-NUM-ORDEN       PIC X(20).
          05 FILLER             PIC X(6).
