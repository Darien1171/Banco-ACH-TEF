      *================================================================
      * CUENTAS.cpy - Estructura de registro CUENTAS_CLIENTES
      * Longitud fija del registro: 220 bytes
      *================================================================

       01 REG-CUENTA.
          05 CC-COD-CUENTA      PIC X(20).
          05 CC-COD-CLIENTE     PIC X(10).
          05 CC-NOM-CLIENTE     PIC X(50).
          05 CC-NOM-CUENTA      PIC X(50).
          05 CC-TIP-CUENTA      PIC X(1).
             *> A=Ahorros C=Corriente
          05 CC-SAL-DISPONIBLE  PIC S9(13)V99.
          05 CC-SAL-BLOQUEADO   PIC S9(13)V99.
          05 CC-SAL-TOTAL       PIC S9(13)V99.
          05 CC-MCA-ACTIVA      PIC X(1).
             *> S=Activa N=Inactiva
          05 CC-MCA-CONGELADA   PIC X(1).
             *> S=Congelada N=Normal
          05 CC-FEC-APERTURA    PIC X(10).
             *> YYYY-MM-DD
          05 CC-FEC-ULT-TRANS   PIC X(10).
             *> YYYY-MM-DD
          05 CC-COD-BANCO       PIC X(3).
             *> 001=Banco A, 002=Banco B, etc.
          05 FILLER             PIC X(7).
