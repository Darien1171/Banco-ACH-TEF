      *================================================================
      * AUDITORIA.cpy - Estructura de registro AUDITORIA_TRANSACCIONES
      *================================================================

       01 REG-AUDITORIA.
          05 AT-NUM-AUDITORIA   PIC X(20).
          05 AT-NUM-ORDEN       PIC X(20).
          05 AT-FEC-TRANSAC     PIC X(10).
             *> YYYY-MM-DD
          05 AT-HOA-INICIO      PIC X(8).
             *> HH:MM:SS
          05 AT-HOA-FIN         PIC X(8).
             *> HH:MM:SS
          05 AT-TIP-TRANSAC     PIC X(22).
          05 AT-COD-USUARIO     PIC X(20).
          05 AT-TERMINAL        PIC X(20).
          05 AT-ESTADO-FINAL    PIC X(20).
          05 AT-MTO-PROCESADO   PIC S9(13)V99.
          05 AT-OBSERVACION     PIC X(200).
          05 FILLER             PIC X(7).
