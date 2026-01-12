#!/bin/bash

# Script para encontrar todas las referencias a tablas en el código
# y compararlas con las tablas reales en la base de datos

echo "=== Buscando referencias a tablas en el código ==="
echo ""

# Buscar todas las referencias FROM en archivos TypeScript
grep -rn "FROM \`\?[a-zA-Z_][a-zA-Z0-9_]*\`\?" server/*.ts | \
  grep -v "node_modules" | \
  sed 's/.*FROM \`\?\([a-zA-Z_][a-zA-Z0-9_]*\)\`\?.*/\1/' | \
  sort -u > /tmp/tables_in_code.txt

# Buscar también en INSERT INTO, UPDATE, DELETE FROM
grep -rn "INSERT INTO \`\?[a-zA-Z_][a-zA-Z0-9_]*\`\?" server/*.ts | \
  sed 's/.*INSERT INTO \`\?\([a-zA-Z_][a-zA-Z0-9_]*\)\`\?.*/\1/' >> /tmp/tables_in_code.txt

grep -rn "UPDATE \`\?[a-zA-Z_][a-zA-Z0-9_]*\`\?" server/*.ts | \
  sed 's/.*UPDATE \`\?\([a-zA-Z_][a-zA-Z0-9_]*\)\`\?.*/\1/' >> /tmp/tables_in_code.txt

# Ordenar y eliminar duplicados
sort -u /tmp/tables_in_code.txt > /tmp/tables_in_code_unique.txt

echo "Tablas encontradas en el código:"
cat /tmp/tables_in_code_unique.txt
echo ""
echo "Total: $(wc -l < /tmp/tables_in_code_unique.txt) tablas"
