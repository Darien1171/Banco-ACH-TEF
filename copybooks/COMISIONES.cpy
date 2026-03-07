      *================================================================
      * COMISIONES.cpy - Estructura de registro PARAMETROS_COMISIONES
      *================================================================

       01 REG-COMISION-PARAM.
          05 CP-NUM-PARAMETRO   PIC X(20).
          05 CP-RANGO-DESDE     PIC S9(13)V99.
          05 CP-RANGO-HASTA     PIC S9(13)V99.
             *> 0 en HASTA = sin límite superior
          05 CP-MTO-COMISION    PIC S9(13)V99.
             *> Monto fijo de comisión
          05 CP-POR-COMISION    PIC 9(3)V99.
             *> Porcentaje (si aplica, 0 si es monto fijo)
          05 CP-VIGENTE-DESDE   PIC X(10).
             *> YYYY-MM-DD
          05 CP-VIGENTE-HASTA   PIC X(10).
             *> YYYY-MM-DD (9999-12-31 = sin vencimiento)
          05 FILLER             PIC X(10).
