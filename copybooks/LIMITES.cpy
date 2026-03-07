      *================================================================
      * LIMITES.cpy - Estructura de registro LIMITES_CLIENTES
      *================================================================

       01 REG-LIMITE.
          05 LC-NUM-LIMITE      PIC X(20).
          05 LC-COD-CLIENTE     PIC X(10).
          05 LC-LIMITE-DIARIO   PIC S9(13)V99.
          05 LC-LIMITE-MENSUAL  PIC S9(13)V99.
          05 LC-LIM-DIA-USADO   PIC S9(13)V99.
          05 LC-LIM-MES-USADO   PIC S9(13)V99.
          05 LC-FEC-ACTUALIZAC  PIC X(10).
             *> YYYY-MM-DD
          05 FILLER             PIC X(6).
