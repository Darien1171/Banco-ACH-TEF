      *================================================================
      * CONSTANTES.cpy - Constantes y códigos del sistema ACH/TEF
      *================================================================

      * --- ESTADOS DE ORDEN ---
       01 ESTADOS-ORDEN.
          05 EST-PENDIENTE      PIC X(22) VALUE 'PENDIENTE_CONFIRMACION'.
          05 EST-ENVIADA        PIC X(22) VALUE 'ENVIADA               '.
          05 EST-CONFIRMADA     PIC X(22) VALUE 'CONFIRMADA            '.
          05 EST-RECHAZADA      PIC X(22) VALUE 'RECHAZADA             '.
          05 EST-TIMEOUT        PIC X(22) VALUE 'TIMEOUT               '.
          05 EST-REVISION       PIC X(22) VALUE 'PENDIENTE_REVISION    '.

      * --- ESTADOS DE BLOQUEO ---
       01 ESTADOS-BLOQUEO.
          05 BLQ-ACTIVO         PIC X(10) VALUE 'ACTIVO    '.
          05 BLQ-LIBERADO       PIC X(10) VALUE 'LIBERADO  '.
          05 BLQ-EJECUTADO      PIC X(10) VALUE 'EJECUTADO '.

      * --- TIPOS DE MOVIMIENTO ---
       01 TIPOS-MOVIMIENTO.
          05 MOV-SALIDA         PIC X(22) VALUE 'TRANSFERENCIA_SALIDA  '.
          05 MOV-DEPOSITO       PIC X(22) VALUE 'DEPOSITO              '.
          05 MOV-COMISION       PIC X(22) VALUE 'COMISION              '.
          05 MOV-REVERSO        PIC X(22) VALUE 'REVERSO               '.

      * --- CÓDIGOS DE RESULTADO ---
       01 CODIGOS-RESULTADO.
          05 COD-OK             PIC 9(2)  VALUE 00.
          05 COD-CTA-ORIGEN     PIC 9(2)  VALUE 01.
          05 COD-CTA-DESTINO    PIC 9(2)  VALUE 02.
          05 COD-MONTO-INV      PIC 9(2)  VALUE 03.
          05 COD-FONDOS-INS     PIC 9(2)  VALUE 04.
          05 COD-LIMITE-DIA     PIC 9(2)  VALUE 05.
          05 COD-FRAUDE         PIC 9(2)  VALUE 06.
          05 COD-BCO-RECHAZA    PIC 9(2)  VALUE 07.
          05 COD-TIMEOUT-BCO    PIC 9(2)  VALUE 08.
          05 COD-ERROR-SIS      PIC 9(2)  VALUE 99.

      * --- LIMITES DEL SISTEMA ---
       01 LIMITES-SISTEMA.
          05 LIM-MONTO-MAX      PIC 9(15) VALUE 999999999.
          05 LIM-MONTO-MIN      PIC 9(15) VALUE 1.
          05 LIM-INTENTOS-MAX   PIC 9(2)  VALUE 10.
          05 LIM-HORA-NOCT-INI  PIC X(8)  VALUE '23:00:00'.
          05 LIM-HORA-NOCT-FIN  PIC X(8)  VALUE '06:00:00'.

      * --- BANCO PROPIO ---
       01 DATOS-BANCO-PROPIO.
          05 COD-BANCO-PROPIO   PIC X(3)  VALUE '001'.
          05 NOM-BANCO-PROPIO   PIC X(30) VALUE 'BANCO A'.

      * --- MONEDAS ---
       01 TIPOS-MONEDA.
          05 MON-COP            PIC X(3)  VALUE 'COP'.
          05 MON-USD            PIC X(3)  VALUE 'USD'.
          05 MON-EUR            PIC X(3)  VALUE 'EUR'.

      * --- FLAGS GENERALES ---
       01 FLAGS-SISTEMA.
          05 FLAG-SI            PIC X     VALUE 'S'.
          05 FLAG-NO            PIC X     VALUE 'N'.
