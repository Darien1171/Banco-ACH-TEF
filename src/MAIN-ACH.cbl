      *================================================================
      * MAIN-ACH.cbl - Procesador de Transferencias ACH/TEF
      * Proyecto 1: Sistema Interbancario Bancario
      *
      * FLUJO:
      *   1. Recibir solicitud de transferencia
      *   2. Validar cuenta origen
      *   3. Validar cuenta destino
      *   4. Validar monto
      *   5. Calcular comisión
      *   6. Validar fondos (monto + comisión)
      *   7. Validar límites diarios del cliente
      *   8. Detección de fraude
      *   9. Bloquear fondos
      *  10. Crear orden de transferencia
      *  11. Enviar a banco destino (simulado)
      *  12. Esperar confirmación
      *  13. Descuento final
      *  14. Asiento contable
      *  15. Generar comprobante
      *  16. Registrar en auditoría
      *================================================================

       IDENTIFICATION DIVISION.
       PROGRAM-ID. MAIN-ACH.
       AUTHOR. DARIEN.
       DATE-WRITTEN. 2026-03-01.

       ENVIRONMENT DIVISION.
       CONFIGURATION SECTION.
       SPECIAL-NAMES.
           DECIMAL-POINT IS COMMA.

       INPUT-OUTPUT SECTION.
       FILE-CONTROL.

           SELECT ARCHIVO-CUENTAS
               ASSIGN TO 'data/CUENTAS.dat'
               ORGANIZATION IS LINE SEQUENTIAL
               ACCESS MODE IS SEQUENTIAL
               FILE STATUS IS WS-STAT-CUENTAS.

           SELECT ARCHIVO-LIMITES
               ASSIGN TO 'data/LIMITES.dat'
               ORGANIZATION IS LINE SEQUENTIAL
               ACCESS MODE IS SEQUENTIAL
               FILE STATUS IS WS-STAT-LIMITES.

           SELECT ARCHIVO-COMISIONES
               ASSIGN TO 'data/COMISIONES.dat'
               ORGANIZATION IS LINE SEQUENTIAL
               ACCESS MODE IS SEQUENTIAL
               FILE STATUS IS WS-STAT-COMISION.

           SELECT ARCHIVO-ORDENES
               ASSIGN TO 'data/ORDENES.dat'
               ORGANIZATION IS LINE SEQUENTIAL
               ACCESS MODE IS SEQUENTIAL
               FILE STATUS IS WS-STAT-ORDENES.

           SELECT ARCHIVO-BLOQUEOS
               ASSIGN TO 'data/BLOQUEOS.dat'
               ORGANIZATION IS LINE SEQUENTIAL
               ACCESS MODE IS SEQUENTIAL
               FILE STATUS IS WS-STAT-BLOQUEOS.

           SELECT ARCHIVO-MOVIMIENTOS
               ASSIGN TO 'data/MOVIMIENTOS.dat'
               ORGANIZATION IS LINE SEQUENTIAL
               ACCESS MODE IS SEQUENTIAL
               FILE STATUS IS WS-STAT-MOVIM.

           SELECT ARCHIVO-AUDITORIA
               ASSIGN TO 'data/AUDITORIA.dat'
               ORGANIZATION IS LINE SEQUENTIAL
               ACCESS MODE IS SEQUENTIAL
               FILE STATUS IS WS-STAT-AUDIT.

       DATA DIVISION.
       FILE SECTION.

       FD ARCHIVO-CUENTAS.
       COPY 'copybooks/CUENTAS.cpy'.

       FD ARCHIVO-LIMITES.
       COPY 'copybooks/LIMITES.cpy'.

       FD ARCHIVO-COMISIONES.
       COPY 'copybooks/COMISIONES.cpy'.

       FD ARCHIVO-ORDENES.
       COPY 'copybooks/ORDENES.cpy'.

       FD ARCHIVO-BLOQUEOS.
       COPY 'copybooks/BLOQUEOS.cpy'.

       FD ARCHIVO-MOVIMIENTOS.
       COPY 'copybooks/MOVIMIENTOS.cpy'.

       FD ARCHIVO-AUDITORIA.
       COPY 'copybooks/AUDITORIA.cpy'.

       WORKING-STORAGE SECTION.

      *----------------------------------------------------------------
      * Constantes del sistema
      *----------------------------------------------------------------
       COPY 'copybooks/CONSTANTES.cpy'.

      *----------------------------------------------------------------
      * Registros de trabajo (copias para manipulación en memoria)
      *----------------------------------------------------------------
       01 WS-CUENTA-ORIGEN.
          COPY 'copybooks/CUENTAS.cpy'.
       01 WS-CUENTA-DESTINO.
          COPY 'copybooks/CUENTAS.cpy'.
       01 WS-LIMITE-CLIENTE.
          COPY 'copybooks/LIMITES.cpy'.
       01 WS-COMISION-PARAM.
          COPY 'copybooks/COMISIONES.cpy'.
       01 WS-ORDEN-NUEVA.
          COPY 'copybooks/ORDENES.cpy'.
       01 WS-BLOQUEO-NUEVO.
          COPY 'copybooks/BLOQUEOS.cpy'.
       01 WS-MOVIM-NUEVO.
          COPY 'copybooks/MOVIMIENTOS.cpy'.
       01 WS-AUDIT-NUEVO.
          COPY 'copybooks/AUDITORIA.cpy'.

      *----------------------------------------------------------------
      * File Status (estado de archivos)
      *----------------------------------------------------------------
       01 WS-FILE-STATUS.
          05 WS-STAT-CUENTAS    PIC XX VALUE '  '.
          05 WS-STAT-LIMITES    PIC XX VALUE '  '.
          05 WS-STAT-COMISION   PIC XX VALUE '  '.
          05 WS-STAT-ORDENES    PIC XX VALUE '  '.
          05 WS-STAT-BLOQUEOS   PIC XX VALUE '  '.
          05 WS-STAT-MOVIM      PIC XX VALUE '  '.
          05 WS-STAT-AUDIT      PIC XX VALUE '  '.

      *----------------------------------------------------------------
      * Datos de entrada de la solicitud
      *----------------------------------------------------------------
       01 WS-SOLICITUD.
          05 SOL-COD-CTA-ORIGEN PIC X(20).
          05 SOL-COD-BCO-DEST   PIC X(3).
          05 SOL-COD-CTA-DEST   PIC X(20).
          05 SOL-MONTO          PIC S9(13)V99.
          05 SOL-CONCEPTO       PIC X(100).
          05 SOL-COD-USUARIO    PIC X(20).
          05 SOL-TERMINAL       PIC X(20).

      *----------------------------------------------------------------
      * Datos calculados en proceso
      *----------------------------------------------------------------
       01 WS-PROCESO.
          05 WS-COMISION        PIC S9(13)V99.
          05 WS-MONTO-TOTAL     PIC S9(13)V99.
          05 WS-NUM-ORDEN       PIC X(20).
          05 WS-NUM-BLOQUEO     PIC X(20).
          05 WS-NUM-MOVIM       PIC X(20).
          05 WS-NUM-AUDIT       PIC X(20).
          05 WS-COD-RESULTADO   PIC 9(2).
          05 WS-ES-SOSPECHOSA   PIC X VALUE 'N'.
          05 WS-PROMEDIO-CLI    PIC S9(13)V99.

      *----------------------------------------------------------------
      * Fecha y hora del sistema
      *----------------------------------------------------------------
       01 WS-FECHA-HOY.
          05 WS-ANO             PIC 9(4).
          05 WS-MES             PIC 9(2).
          05 WS-DIA             PIC 9(2).
       01 WS-HORA-ACTUAL.
          05 WS-HH              PIC 9(2).
          05 WS-MM              PIC 9(2).
          05 WS-SS              PIC 9(2).
          05 WS-CC              PIC 9(2).

       01 WS-FECHA-STR         PIC X(10).
       01 WS-HORA-STR          PIC X(8).

      *----------------------------------------------------------------
      * Contadores y auxiliares
      *----------------------------------------------------------------
       01 WS-AUX.
          05 WS-EOF-CUENTAS    PIC X VALUE 'N'.
          05 WS-ENCONTRADO     PIC X VALUE 'N'.
          05 WS-CONTADOR       PIC 9(6) VALUE 0.
          05 WS-MULTIP-100     PIC S9(13)V99.
          05 WS-RESTO          PIC S9(13)V99.
          05 WS-IDX            PIC 9(6).

      *----------------------------------------------------------------
      * Variables para mostrar montos formateados
      *----------------------------------------------------------------
       01 WS-DISPLAY.
          05 WS-DISP-MONTO     PIC ZZ,ZZZ,ZZZ,ZZZ.
          05 WS-DISP-COMISION  PIC ZZ,ZZZ,ZZZ,ZZZ.
          05 WS-DISP-TOTAL     PIC ZZ,ZZZ,ZZZ,ZZZ.
          05 WS-DISP-SAL-ANT   PIC ZZ,ZZZ,ZZZ,ZZZ.
          05 WS-DISP-SAL-POST  PIC ZZ,ZZZ,ZZZ,ZZZ.

      *----------------------------------------------------------------
      * Separador visual
      *----------------------------------------------------------------
       01 WS-LINEA             PIC X(68)
           VALUE '════════════════════════════════════════════════════════════════════'.

      *================================================================
       PROCEDURE DIVISION.
      *================================================================

       0000-INICIO.
           DISPLAY ' '
           DISPLAY WS-LINEA
           DISPLAY '     BANCO A - SISTEMA DE TRANSFERENCIAS ACH/TEF'
           DISPLAY WS-LINEA

           PERFORM 0100-OBTENER-FECHA-HORA
           PERFORM 0200-CAPTURAR-SOLICITUD
           PERFORM 0300-ABRIR-ARCHIVOS

           MOVE 0  TO WS-COD-RESULTADO

           PERFORM 1000-VALIDAR-CUENTA-ORIGEN
           IF WS-COD-RESULTADO NOT = 0
               PERFORM 9000-ERROR-SALIDA
               STOP RUN
           END-IF

           PERFORM 2000-VALIDAR-CUENTA-DESTINO
           IF WS-COD-RESULTADO NOT = 0
               PERFORM 9000-ERROR-SALIDA
               STOP RUN
           END-IF

           PERFORM 3000-VALIDAR-MONTO
           IF WS-COD-RESULTADO NOT = 0
               PERFORM 9000-ERROR-SALIDA
               STOP RUN
           END-IF

           PERFORM 4000-CALCULAR-COMISION

           PERFORM 5000-VALIDAR-FONDOS
           IF WS-COD-RESULTADO NOT = 0
               PERFORM 9000-ERROR-SALIDA
               STOP RUN
           END-IF

           PERFORM 6000-VALIDAR-LIMITES
           IF WS-COD-RESULTADO NOT = 0
               PERFORM 9000-ERROR-SALIDA
               STOP RUN
           END-IF

           PERFORM 7000-VALIDAR-FRAUDE

           IF WS-ES-SOSPECHOSA = 'S'
               DISPLAY ' '
               DISPLAY '  [!] AVISO: Transaccion sospechosa.'
               DISPLAY '      Requiere revision manual de supervisor.'
               DISPLAY '      Estado: PENDIENTE_REVISION'
               PERFORM 9500-REGISTRAR-AUDITORIA-RECHAZO
               PERFORM 9900-CERRAR-ARCHIVOS
               STOP RUN
           END-IF

           PERFORM 8000-BLOQUEAR-FONDOS
           PERFORM 8500-CREAR-ORDEN-TRANSFERENCIA
           PERFORM 8700-SIMULAR-ENVIO-BANCO-DESTINO

           PERFORM 9100-DESCUENTO-FINAL
           PERFORM 9200-REGISTRAR-MOVIMIENTO
           PERFORM 9300-GENERAR-COMPROBANTE
           PERFORM 9400-REGISTRAR-AUDITORIA-EXITO

           PERFORM 9900-CERRAR-ARCHIVOS
           STOP RUN.

      *================================================================
      * 0100 - OBTENER FECHA Y HORA DEL SISTEMA
      *================================================================
       0100-OBTENER-FECHA-HORA.
           ACCEPT WS-FECHA-HOY FROM DATE YYYYMMDD
           ACCEPT WS-HORA-ACTUAL FROM TIME

           STRING WS-ANO '-' WS-MES '-' WS-DIA
               DELIMITED SIZE INTO WS-FECHA-STR

           STRING WS-HH ':' WS-MM ':' WS-SS
               DELIMITED SIZE INTO WS-HORA-STR.

      *================================================================
      * 0200 - CAPTURAR SOLICITUD DE TRANSFERENCIA
      *================================================================
       0200-CAPTURAR-SOLICITUD.
           DISPLAY ' '
           DISPLAY '  -- DATOS DE LA TRANSFERENCIA --'
           DISPLAY ' '

           DISPLAY '  Cuenta origen  (Ej: 001-002-0000123456-0): '
               WITH NO ADVANCING
           ACCEPT SOL-COD-CTA-ORIGEN

           DISPLAY '  Banco destino  (Ej: 002): '
               WITH NO ADVANCING
           ACCEPT SOL-COD-BCO-DEST

           DISPLAY '  Cuenta destino (Ej: 002-001-0000654321-0): '
               WITH NO ADVANCING
           ACCEPT SOL-COD-CTA-DEST

           DISPLAY '  Monto a transferir (sin decimales, Ej: 500000): '
               WITH NO ADVANCING
           ACCEPT SOL-MONTO

           DISPLAY '  Concepto (Ej: Pago de servicios): '
               WITH NO ADVANCING
           ACCEPT SOL-CONCEPTO

           MOVE 'CAJERO_001'  TO SOL-COD-USUARIO
           MOVE 'CAJA_05'     TO SOL-TERMINAL.

      *================================================================
      * 0300 - ABRIR ARCHIVOS
      *================================================================
       0300-ABRIR-ARCHIVOS.
           OPEN INPUT  ARCHIVO-CUENTAS
           OPEN INPUT  ARCHIVO-LIMITES
           OPEN INPUT  ARCHIVO-COMISIONES
           OPEN EXTEND ARCHIVO-ORDENES
           OPEN EXTEND ARCHIVO-BLOQUEOS
           OPEN EXTEND ARCHIVO-MOVIMIENTOS
           OPEN EXTEND ARCHIVO-AUDITORIA.

      *================================================================
      * 1000 - VALIDAR CUENTA ORIGEN
      *================================================================
       1000-VALIDAR-CUENTA-ORIGEN.
           DISPLAY ' '
           DISPLAY '  [1/8] Validando cuenta origen...'

           MOVE 'N' TO WS-ENCONTRADO
           MOVE 'N' TO WS-EOF-CUENTAS

           PERFORM UNTIL WS-EOF-CUENTAS = 'S'
               READ ARCHIVO-CUENTAS
                   AT END MOVE 'S' TO WS-EOF-CUENTAS
                   NOT AT END
                       IF CC-COD-CUENTA = SOL-COD-CTA-ORIGEN
                           MOVE 'S' TO WS-ENCONTRADO
                           MOVE REG-CUENTA TO WS-CUENTA-ORIGEN
                           MOVE 'S' TO WS-EOF-CUENTAS
                       END-IF
               END-READ
           END-PERFORM

           CLOSE ARCHIVO-CUENTAS

           IF WS-ENCONTRADO = 'N'
               DISPLAY '      ERROR: Cuenta origen no existe en el sistema.'
               MOVE COD-CTA-ORIGEN TO WS-COD-RESULTADO
               EXIT PARAGRAPH
           END-IF

           IF CC-MCA-ACTIVA OF WS-CUENTA-ORIGEN = 'N'
               DISPLAY '      ERROR: Cuenta origen inactiva.'
               MOVE COD-CTA-ORIGEN TO WS-COD-RESULTADO
               EXIT PARAGRAPH
           END-IF

           IF CC-MCA-CONGELADA OF WS-CUENTA-ORIGEN = 'S'
               DISPLAY '      ERROR: Cuenta origen congelada (bloqueada).'
               MOVE COD-CTA-ORIGEN TO WS-COD-RESULTADO
               EXIT PARAGRAPH
           END-IF

           DISPLAY '      OK - Titular: '
               CC-NOM-CLIENTE OF WS-CUENTA-ORIGEN.

      *================================================================
      * 2000 - VALIDAR CUENTA DESTINO
      *================================================================
       2000-VALIDAR-CUENTA-DESTINO.
           DISPLAY '  [2/8] Validando cuenta destino...'

           OPEN INPUT ARCHIVO-CUENTAS
           MOVE 'N' TO WS-ENCONTRADO
           MOVE 'N' TO WS-EOF-CUENTAS

           PERFORM UNTIL WS-EOF-CUENTAS = 'S'
               READ ARCHIVO-CUENTAS
                   AT END MOVE 'S' TO WS-EOF-CUENTAS
                   NOT AT END
                       IF CC-COD-CUENTA = SOL-COD-CTA-DEST
                           MOVE 'S' TO WS-ENCONTRADO
                           MOVE REG-CUENTA TO WS-CUENTA-DESTINO
                           MOVE 'S' TO WS-EOF-CUENTAS
                       END-IF
               END-READ
           END-PERFORM

           CLOSE ARCHIVO-CUENTAS

           IF WS-ENCONTRADO = 'N'
               DISPLAY '      ERROR: Cuenta destino no encontrada.'
               MOVE COD-CTA-DESTINO TO WS-COD-RESULTADO
               EXIT PARAGRAPH
           END-IF

           IF CC-MCA-ACTIVA OF WS-CUENTA-DESTINO = 'N'
               DISPLAY '      ERROR: Cuenta destino inactiva o cerrada.'
               MOVE COD-CTA-DESTINO TO WS-COD-RESULTADO
               EXIT PARAGRAPH
           END-IF

           DISPLAY '      OK - Beneficiario: '
               CC-NOM-CLIENTE OF WS-CUENTA-DESTINO.

      *================================================================
      * 3000 - VALIDAR MONTO
      *================================================================
       3000-VALIDAR-MONTO.
           DISPLAY '  [3/8] Validando monto...'

           IF SOL-MONTO <= 0
               DISPLAY '      ERROR: El monto debe ser mayor a cero.'
               MOVE COD-MONTO-INV TO WS-COD-RESULTADO
               EXIT PARAGRAPH
           END-IF

           IF SOL-MONTO > LIM-MONTO-MAX
               DISPLAY '      ERROR: Monto supera el maximo legal ($999.999.999).'
               MOVE COD-MONTO-INV TO WS-COD-RESULTADO
               EXIT PARAGRAPH
           END-IF

           COMPUTE WS-MULTIP-100 = FUNCTION INTEGER(SOL-MONTO / 100) * 100
           IF WS-MULTIP-100 NOT = SOL-MONTO
               DISPLAY '      ERROR: El monto debe ser multiplo de 100 (sin centavos).'
               MOVE COD-MONTO-INV TO WS-COD-RESULTADO
               EXIT PARAGRAPH
           END-IF

           MOVE SOL-MONTO TO WS-DISP-MONTO
           DISPLAY '      OK - Monto: $' WS-DISP-MONTO.

      *================================================================
      * 4000 - CALCULAR COMISION
      *================================================================
       4000-CALCULAR-COMISION.
           MOVE 0 TO WS-COMISION
           MOVE 'N' TO WS-ENCONTRADO
           MOVE 'N' TO WS-EOF-CUENTAS

           PERFORM UNTIL WS-EOF-CUENTAS = 'S'
               READ ARCHIVO-COMISIONES
                   AT END MOVE 'S' TO WS-EOF-CUENTAS
                   NOT AT END
                       EVALUATE TRUE
                           WHEN SOL-MONTO >= CP-RANGO-DESDE AND
                                (CP-RANGO-HASTA = 0 OR
                                 SOL-MONTO <= CP-RANGO-HASTA)
                               MOVE CP-MTO-COMISION TO WS-COMISION
                               MOVE 'S' TO WS-ENCONTRADO
                               MOVE 'S' TO WS-EOF-CUENTAS
                       END-EVALUATE
               END-READ
           END-PERFORM

           CLOSE ARCHIVO-COMISIONES

           COMPUTE WS-MONTO-TOTAL = SOL-MONTO + WS-COMISION

           MOVE WS-COMISION   TO WS-DISP-COMISION
           MOVE SOL-MONTO     TO WS-DISP-MONTO
           MOVE WS-MONTO-TOTAL TO WS-DISP-TOTAL
           DISPLAY '  [COM] Comision calculada: $' WS-DISP-COMISION
           DISPLAY '        Total a descontar:  $' WS-DISP-TOTAL.

      *================================================================
      * 5000 - VALIDAR FONDOS DISPONIBLES
      *================================================================
       5000-VALIDAR-FONDOS.
           DISPLAY '  [4/8] Validando fondos disponibles...'

           MOVE CC-SAL-DISPONIBLE OF WS-CUENTA-ORIGEN TO WS-DISP-SAL-ANT
           DISPLAY '      Saldo disponible: $' WS-DISP-SAL-ANT

           IF CC-SAL-DISPONIBLE OF WS-CUENTA-ORIGEN < WS-MONTO-TOTAL
               DISPLAY '      ERROR: Fondos insuficientes.'
               DISPLAY '             Necesita: $' WS-DISP-TOTAL
               MOVE COD-FONDOS-INS TO WS-COD-RESULTADO
               EXIT PARAGRAPH
           END-IF

           DISPLAY '      OK - Fondos suficientes.'.

      *================================================================
      * 6000 - VALIDAR LIMITES DIARIOS
      *================================================================
       6000-VALIDAR-LIMITES.
           DISPLAY '  [5/8] Validando limites diarios...'

           MOVE 'N' TO WS-ENCONTRADO
           MOVE 'N' TO WS-EOF-CUENTAS

           PERFORM UNTIL WS-EOF-CUENTAS = 'S'
               READ ARCHIVO-LIMITES
                   AT END MOVE 'S' TO WS-EOF-CUENTAS
                   NOT AT END
                       IF LC-COD-CLIENTE = CC-COD-CLIENTE OF WS-CUENTA-ORIGEN
                           MOVE 'S' TO WS-ENCONTRADO
                           MOVE REG-LIMITE TO WS-LIMITE-CLIENTE
                           MOVE 'S' TO WS-EOF-CUENTAS
                       END-IF
               END-READ
           END-PERFORM

           CLOSE ARCHIVO-LIMITES

           IF WS-ENCONTRADO = 'N'
               DISPLAY '      AVISO: Sin limite configurado, se permite.'
               EXIT PARAGRAPH
           END-IF

           IF (LC-LIM-DIA-USADO OF WS-LIMITE-CLIENTE + SOL-MONTO)
               > LC-LIMITE-DIARIO OF WS-LIMITE-CLIENTE
               DISPLAY '      ERROR: Supera el limite diario del cliente.'
               MOVE COD-LIMITE-DIA TO WS-COD-RESULTADO
               EXIT PARAGRAPH
           END-IF

           DISPLAY '      OK - Dentro del limite diario permitido.'.

      *================================================================
      * 7000 - VALIDAR FRAUDE
      *================================================================
       7000-VALIDAR-FRAUDE.
           DISPLAY '  [6/8] Analizando fraude...'
           MOVE 'N' TO WS-ES-SOSPECHOSA

           IF WS-HH >= 23 OR WS-HH < 6
               DISPLAY '      [!] Alerta: Transferencia en horario nocturno.'
               MOVE 'S' TO WS-ES-SOSPECHOSA
           END-IF

           MOVE 500000 TO WS-PROMEDIO-CLI
           IF SOL-MONTO > (WS-PROMEDIO-CLI * 3)
               DISPLAY '      [!] Alerta: Monto inusualmente alto (3x promedio).'
               MOVE 'S' TO WS-ES-SOSPECHOSA
           END-IF

           IF WS-ES-SOSPECHOSA = 'N'
               DISPLAY '      OK - Sin indicios de fraude.'
           END-IF.

      *================================================================
      * 8000 - BLOQUEAR FONDOS
      *================================================================
       8000-BLOQUEAR-FONDOS.
           DISPLAY '  [7/8] Bloqueando fondos...'

           STRING 'BLQ' WS-ANO WS-MES WS-DIA '00001'
               DELIMITED SIZE INTO WS-NUM-BLOQUEO

           MOVE WS-NUM-BLOQUEO TO BT-NUM-BLOQUEO
           MOVE SOL-COD-CTA-ORIGEN TO BT-COD-CUENTA
           MOVE WS-NUM-ORDEN TO BT-NUM-ORDEN
           MOVE WS-MONTO-TOTAL TO BT-MTO-BLOQUEADO
           MOVE WS-FECHA-STR TO BT-FEC-BLOQUEO
           MOVE WS-HORA-STR TO BT-HOA-BLOQUEO
           MOVE BLQ-ACTIVO TO BT-EST-BLOQUEO

           WRITE REG-BLOQUEO FROM WS-BLOQUEO-NUEVO

           SUBTRACT WS-MONTO-TOTAL FROM
               CC-SAL-DISPONIBLE OF WS-CUENTA-ORIGEN
           ADD WS-MONTO-TOTAL TO
               CC-SAL-BLOQUEADO OF WS-CUENTA-ORIGEN

           MOVE WS-MONTO-TOTAL TO WS-DISP-TOTAL
           DISPLAY '      OK - Fondos bloqueados: $' WS-DISP-TOTAL.

      *================================================================
      * 8500 - CREAR ORDEN DE TRANSFERENCIA
      *================================================================
       8500-CREAR-ORDEN-TRANSFERENCIA.
           DISPLAY '  [8/8] Creando orden de transferencia...'

           STRING 'TRF' WS-ANO WS-MES WS-DIA '00001'
               DELIMITED SIZE INTO WS-NUM-ORDEN

           MOVE WS-NUM-ORDEN TO OT-NUM-ORDEN
           MOVE WS-FECHA-STR TO OT-FEC-CREACION
           MOVE WS-HORA-STR TO OT-HOA-CREACION
           MOVE '001' TO OT-COD-BCO-ORIGEN
           MOVE SOL-COD-CTA-ORIGEN TO OT-COD-CTA-ORIGEN
           MOVE CC-NOM-CLIENTE OF WS-CUENTA-ORIGEN TO OT-NOM-CLI-ORIGEN
           MOVE SOL-COD-BCO-DEST TO OT-COD-BCO-DEST
           MOVE SOL-COD-CTA-DEST TO OT-COD-CTA-DEST
           MOVE CC-NOM-CLIENTE OF WS-CUENTA-DESTINO TO OT-NOM-CLI-DEST
           MOVE SOL-MONTO TO OT-MTO-TRANSF
           MOVE WS-COMISION TO OT-MTO-COMISION
           MOVE WS-MONTO-TOTAL TO OT-MTO-TOTAL
           MOVE MON-COP TO OT-TIP-MONEDA
           MOVE SOL-CONCEPTO TO OT-DES-CONCEPTO
           MOVE EST-PENDIENTE TO OT-EST-ORDEN
           MOVE SPACES TO OT-FEC-ENVIO
           MOVE SPACES TO OT-FEC-CONFIRMAC
           MOVE FLAG-SI TO OT-MCA-BLOQUEADA

           WRITE REG-ORDEN FROM WS-ORDEN-NUEVA

           DISPLAY '      OK - Orden creada: ' WS-NUM-ORDEN.

      *================================================================
      * 8700 - SIMULAR ENVIO A BANCO DESTINO Y CONFIRMACION
      *================================================================
       8700-SIMULAR-ENVIO-BANCO-DESTINO.
           DISPLAY ' '
           DISPLAY '  -- COMUNICACION CON BANCO DESTINO --'
           DISPLAY '  Enviando solicitud a banco ' SOL-COD-BCO-DEST ' ...'
           DISPLAY '  Banco destino procesando...'
           DISPLAY '  Confirmacion recibida: ACEPTADA'

           MOVE WS-FECHA-STR TO OT-FEC-ENVIO OF WS-ORDEN-NUEVA
           MOVE WS-FECHA-STR TO OT-FEC-CONFIRMAC OF WS-ORDEN-NUEVA
           MOVE EST-CONFIRMADA TO OT-EST-ORDEN OF WS-ORDEN-NUEVA.

      *================================================================
      * 9100 - DESCUENTO FINAL (se hace real el débito)
      *================================================================
       9100-DESCUENTO-FINAL.
           SUBTRACT WS-MONTO-TOTAL FROM
               CC-SAL-TOTAL OF WS-CUENTA-ORIGEN
           MOVE 0 TO CC-SAL-BLOQUEADO OF WS-CUENTA-ORIGEN.

      *================================================================
      * 9200 - REGISTRAR MOVIMIENTO CONTABLE
      *================================================================
       9200-REGISTRAR-MOVIMIENTO.
           STRING 'MOV' WS-ANO WS-MES WS-DIA '00001'
               DELIMITED SIZE INTO WS-NUM-MOVIM

           MOVE WS-NUM-MOVIM TO MC-NUM-MOVIMIENTO
           MOVE SOL-COD-CTA-ORIGEN TO MC-COD-CUENTA
           MOVE WS-FECHA-STR TO MC-FEC-MOVIMIENTO
           MOVE WS-HORA-STR TO MC-HOA-MOVIMIENTO
           MOVE MOV-SALIDA TO MC-TIP-MOVIMIENTO
           COMPUTE MC-MTO-MOVIMIENTO = WS-MONTO-TOTAL * -1
           MOVE CC-SAL-DISPONIBLE OF WS-CUENTA-ORIGEN TO MC-SAL-ANTERIOR
           COMPUTE MC-SAL-POSTERIOR = MC-SAL-ANTERIOR - WS-MONTO-TOTAL
           MOVE SOL-CONCEPTO TO MC-DES-DETALLE
           MOVE WS-NUM-ORDEN TO MC-NUM-ORDEN

           WRITE REG-MOVIMIENTO FROM WS-MOVIM-NUEVO.

      *================================================================
      * 9300 - GENERAR COMPROBANTE EN PANTALLA
      *================================================================
       9300-GENERAR-COMPROBANTE.
           MOVE SOL-MONTO TO WS-DISP-MONTO
           MOVE WS-COMISION TO WS-DISP-COMISION
           MOVE WS-MONTO-TOTAL TO WS-DISP-TOTAL
           MOVE CC-SAL-DISPONIBLE OF WS-CUENTA-ORIGEN TO WS-DISP-SAL-ANT
           COMPUTE WS-DISP-SAL-POST =
               CC-SAL-DISPONIBLE OF WS-CUENTA-ORIGEN - WS-MONTO-TOTAL

           DISPLAY ' '
           DISPLAY WS-LINEA
           DISPLAY '              BANCO A - COMPROBANTE'
           DISPLAY '           TRANSFERENCIA INTERBANCARIA'
           DISPLAY WS-LINEA
           DISPLAY ' '
           DISPLAY '  Referencia  : ' WS-NUM-ORDEN
           DISPLAY '  Fecha/Hora  : ' WS-FECHA-STR ' ' WS-HORA-STR
           DISPLAY '  Estado      : TRANSFERENCIA COMPLETADA'
           DISPLAY ' '
           DISPLAY '  ORDENANTE (Cuenta Origen):'
           DISPLAY '    Titular   : ' CC-NOM-CLIENTE OF WS-CUENTA-ORIGEN
           DISPLAY '    Cuenta    : ' SOL-COD-CTA-ORIGEN
           DISPLAY ' '
           DISPLAY '  BENEFICIARIO:'
           DISPLAY '    Titular   : ' CC-NOM-CLIENTE OF WS-CUENTA-DESTINO
           DISPLAY '    Banco     : Banco ' SOL-COD-BCO-DEST
           DISPLAY '    Cuenta    : ' SOL-COD-CTA-DEST
           DISPLAY ' '
           DISPLAY '  MOVIMIENTO:'
           DISPLAY '    Transferencia : $' WS-DISP-MONTO
           DISPLAY '    Comision      : $' WS-DISP-COMISION
           DISPLAY '    Total debitado: $' WS-DISP-TOTAL
           DISPLAY ' '
           DISPLAY '  Concepto    : ' SOL-CONCEPTO
           DISPLAY WS-LINEA.

      *================================================================
      * 9400 - REGISTRAR EN AUDITORIA (EXITOSA)
      *================================================================
       9400-REGISTRAR-AUDITORIA-EXITO.
           STRING 'AUD' WS-ANO WS-MES WS-DIA '00001'
               DELIMITED SIZE INTO WS-NUM-AUDIT

           MOVE WS-NUM-AUDIT TO AT-NUM-AUDITORIA
           MOVE WS-NUM-ORDEN TO AT-NUM-ORDEN
           MOVE WS-FECHA-STR TO AT-FEC-TRANSAC
           MOVE WS-HORA-STR TO AT-HOA-INICIO
           MOVE WS-HORA-STR TO AT-HOA-FIN
           MOVE 'TRANSFERENCIA_ACH' TO AT-TIP-TRANSAC
           MOVE SOL-COD-USUARIO TO AT-COD-USUARIO
           MOVE SOL-TERMINAL TO AT-TERMINAL
           MOVE 'EXITOSA' TO AT-ESTADO-FINAL
           MOVE WS-MONTO-TOTAL TO AT-MTO-PROCESADO
           MOVE 'Transferencia completada sin incidencias' TO AT-OBSERVACION

           WRITE REG-AUDITORIA FROM WS-AUDIT-NUEVO.

      *================================================================
      * 9500 - REGISTRAR AUDITORIA (RECHAZO POR FRAUDE)
      *================================================================
       9500-REGISTRAR-AUDITORIA-RECHAZO.
           STRING 'AUD' WS-ANO WS-MES WS-DIA '00002'
               DELIMITED SIZE INTO WS-NUM-AUDIT

           MOVE WS-NUM-AUDIT TO AT-NUM-AUDITORIA
           MOVE SPACES TO AT-NUM-ORDEN
           MOVE WS-FECHA-STR TO AT-FEC-TRANSAC
           MOVE WS-HORA-STR TO AT-HOA-INICIO
           MOVE WS-HORA-STR TO AT-HOA-FIN
           MOVE 'TRANSFERENCIA_ACH' TO AT-TIP-TRANSAC
           MOVE SOL-COD-USUARIO TO AT-COD-USUARIO
           MOVE SOL-TERMINAL TO AT-TERMINAL
           MOVE 'SOSPECHOSA' TO AT-ESTADO-FINAL
           MOVE SOL-MONTO TO AT-MTO-PROCESADO
           MOVE 'Transaccion marcada para revision por fraude' TO
               AT-OBSERVACION

           WRITE REG-AUDITORIA FROM WS-AUDIT-NUEVO.

      *================================================================
      * 9000 - SALIDA POR ERROR (antes de bloquear fondos)
      *================================================================
       9000-ERROR-SALIDA.
           DISPLAY ' '
           DISPLAY '  *** TRANSFERENCIA RECHAZADA ***'
           EVALUATE WS-COD-RESULTADO
               WHEN COD-CTA-ORIGEN
                   DISPLAY '  Razon: Cuenta origen invalida o inactiva.'
               WHEN COD-CTA-DESTINO
                   DISPLAY '  Razon: Cuenta destino no encontrada o cerrada.'
               WHEN COD-MONTO-INV
                   DISPLAY '  Razon: Monto invalido.'
               WHEN COD-FONDOS-INS
                   DISPLAY '  Razon: Fondos insuficientes.'
               WHEN COD-LIMITE-DIA
                   DISPLAY '  Razon: Supera el limite diario permitido.'
               WHEN OTHER
                   DISPLAY '  Razon: Error de sistema (cod: ' WS-COD-RESULTADO ').'
           END-EVALUATE
           DISPLAY '  Ningún saldo fue modificado.'
           PERFORM 9900-CERRAR-ARCHIVOS.

      *================================================================
      * 9900 - CERRAR ARCHIVOS
      *================================================================
       9900-CERRAR-ARCHIVOS.
           CLOSE ARCHIVO-ORDENES
           CLOSE ARCHIVO-BLOQUEOS
           CLOSE ARCHIVO-MOVIMIENTOS
           CLOSE ARCHIVO-AUDITORIA.
