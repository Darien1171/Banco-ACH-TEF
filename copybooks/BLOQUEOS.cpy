      *================================================================
      * BLOQUEOS.cpy - Estructura de registro BLOQUEOS_TEMPORALES
      *================================================================

       01 REG-BLOQUEO.
          05 BT-NUM-BLOQUEO     PIC X(20).
          05 BT-COD-CUENTA      PIC X(20).
          05 BT-NUM-ORDEN       PIC X(20).
          05 BT-MTO-BLOQUEADO   PIC S9(13)V99.
          05 BT-FEC-BLOQUEO     PIC X(10).
             *> YYYY-MM-DD
          05 BT-HOA-BLOQUEO     PIC X(8).
             *> HH:MM:SS
          05 BT-EST-BLOQUEO     PIC X(10).
             *> ACTIVO, LIBERADO, EJECUTADO
          05 FILLER             PIC X(2).
