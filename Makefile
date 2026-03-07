# ================================================================
# Makefile - Proyecto 1: Sistema ACH/TEF en COBOL
# Compilador: GnuCOBOL (cobc)
# ================================================================

COBC        = cobc
COBFLAGS    = -x -free
COBCOPY     = -I copybooks
SRC         = src/MAIN-ACH.cbl
EXEC        = output/MAIN-ACH

.PHONY: all clean run help reset-data

# ── Target por defecto ───────────────────────────────────────────
all: $(EXEC)
	@echo ""
	@echo "  Compilacion exitosa -> $(EXEC)"
	@echo "  Ejecuta con: make run"
	@echo ""

# ── Compilar ─────────────────────────────────────────────────────
$(EXEC): $(SRC) copybooks/*.cpy
	@echo "  Compilando MAIN-ACH.cbl ..."
	$(COBC) $(COBFLAGS) $(COBCOPY) $(SRC) -o $(EXEC)

# ── Ejecutar ─────────────────────────────────────────────────────
run: $(EXEC)
	@echo ""
	@echo "  Iniciando sistema ACH/TEF..."
	@echo ""
	./$(EXEC)

# ── Limpiar binarios ─────────────────────────────────────────────
clean:
	@echo "  Limpiando archivos compilados..."
	rm -f $(EXEC)
	@echo "  Listo."

# ── Resetear datos de transacciones (NO toca datos maestros) ─────
reset-data:
	@echo "  Reseteando archivos de transacciones..."
	> data/ORDENES.dat
	> data/BLOQUEOS.dat
	> data/MOVIMIENTOS.dat
	> data/AUDITORIA.dat
	@echo "  Listo. Los datos maestros (CUENTAS, LIMITES, COMISIONES) no se tocaron."

# ── Ayuda ────────────────────────────────────────────────────────
help:
	@echo ""
	@echo "  Proyecto 1 ACH/TEF - Comandos disponibles:"
	@echo ""
	@echo "  make          -> Compilar el programa"
	@echo "  make run      -> Compilar y ejecutar"
	@echo "  make clean    -> Eliminar binario compilado"
	@echo "  make reset-data -> Limpiar transacciones generadas"
	@echo "  make help     -> Mostrar esta ayuda"
	@echo ""
	@echo "  Requisito: GnuCOBOL instalado (cobc en PATH)"
	@echo "  Verificar con: cobc --version"
	@echo ""
