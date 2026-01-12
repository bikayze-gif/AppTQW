#!/usr/bin/env python3
"""
Export Database Definitions Script
Extracts definitions for unmigrated objects from source database
"""

import pymysql
import sys

# Source Database Configuration
SOURCE_CONFIG = {
    'host': '170.239.85.233',
    'port': 3306,
    'user': 'ncornejo',
    'password': 'N1c0l7as17',
    'database': 'operaciones_tqw',
    'charset': 'utf8mb4'
}

# Large tables that were skipped (>50K rows)
SKIPPED_TABLES = [
    'tb_conexiones_log',
    'ventas',
    'ventas_no_particionada',
    'tb_inventario_base_david',
    'tb_kpi_gerencia_calidad_tecnico',
    'tb_paso_pyndc',
    'tb_toa_30dias_cloud',
    'tb_turnos',
    'tb_gestiona',
    'tb_logis_movimientos',
    'tb_logis_movimientos_hist',
    'tb_logis_movimientosiii',
    'view_turnos',
    'tb_calidad_plan_proactivo',
    'tb_py_flujo_calidad',
    'tqw_produccion',
    'tb_cpe_analyzed',
    'tb_inventario_resultado_final',
    'tb_logis_cierre_inventario2',
    'tb_vtr_px_diaria',
    'tb_vtr_px_diaria_lv2'
]

def connect_to_source():
    """Connect to source database"""
    try:
        conn = pymysql.connect(**SOURCE_CONFIG)
        print("✓ Connected to source database")
        return conn
    except Exception as e:
        print(f"✗ Connection failed: {e}")
        sys.exit(1)

def export_table_definitions(conn, output_file):
    """Export CREATE TABLE statements for skipped tables"""
    cursor = conn.cursor()
    
    output_file.write("# Tablas Pendientes de Migración\n\n")
    output_file.write("Las siguientes tablas fueron omitidas por su tamaño (>50,000 filas).\n\n")
    output_file.write("---\n\n")
    
    for table_name in SKIPPED_TABLES:
        try:
            # Get row count
            cursor.execute(f"SELECT COUNT(*) FROM `{table_name}`")
            row_count = cursor.fetchone()[0]
            
            # Get table size
            cursor.execute(f"""
                SELECT ROUND((data_length + index_length) / 1024 / 1024, 2) AS size_mb
                FROM information_schema.tables 
                WHERE table_schema = 'operaciones_tqw' AND table_name = '{table_name}'
            """)
            size_result = cursor.fetchone()
            size_mb = size_result[0] if size_result else 0
            
            # Get CREATE TABLE statement
            cursor.execute(f"SHOW CREATE TABLE `{table_name}`")
            create_stmt = cursor.fetchone()[1]
            
            output_file.write(f"## {table_name}\n\n")
            output_file.write(f"- **Filas**: {row_count:,}\n")
            output_file.write(f"- **Tamaño**: {size_mb} MB\n\n")
            output_file.write("```sql\n")
            output_file.write(create_stmt)
            output_file.write(";\n```\n\n")
            output_file.write("---\n\n")
            
            print(f"  ✓ Exported table: {table_name} ({row_count:,} rows)")
            
        except Exception as e:
            print(f"  ✗ Error exporting {table_name}: {e}")
    
    cursor.close()

def export_views(conn, output_file):
    """Export all view definitions"""
    cursor = conn.cursor()
    
    output_file.write("\n\n# Vistas (Views)\n\n")
    output_file.write("Las siguientes vistas necesitan ser recreadas manualmente.\n\n")
    output_file.write("---\n\n")
    
    cursor.execute("""
        SELECT table_name 
        FROM information_schema.views 
        WHERE table_schema = 'operaciones_tqw'
        ORDER BY table_name
    """)
    
    views = cursor.fetchall()
    
    for (view_name,) in views:
        try:
            cursor.execute(f"SHOW CREATE VIEW `{view_name}`")
            result = cursor.fetchone()
            create_stmt = result[1] if result else None
            
            if create_stmt:
                output_file.write(f"## {view_name}\n\n")
                output_file.write("```sql\n")
                output_file.write(create_stmt)
                output_file.write(";\n```\n\n")
                output_file.write("---\n\n")
                
                print(f"  ✓ Exported view: {view_name}")
            
        except Exception as e:
            print(f"  ✗ Error exporting view {view_name}: {e}")
    
    cursor.close()

def export_procedures(conn, output_file):
    """Export all stored procedure definitions"""
    cursor = conn.cursor()
    
    output_file.write("\n\n# Stored Procedures\n\n")
    output_file.write("Los siguientes procedimientos almacenados necesitan ser recreados manualmente.\n\n")
    output_file.write("---\n\n")
    
    cursor.execute("""
        SELECT routine_name 
        FROM information_schema.routines 
        WHERE routine_schema = 'operaciones_tqw' AND routine_type = 'PROCEDURE'
        ORDER BY routine_name
    """)
    
    procedures = cursor.fetchall()
    
    for (proc_name,) in procedures:
        try:
            cursor.execute(f"SHOW CREATE PROCEDURE `{proc_name}`")
            result = cursor.fetchone()
            create_stmt = result[2] if result and len(result) > 2 else None
            
            if create_stmt:
                output_file.write(f"## {proc_name}\n\n")
                output_file.write("```sql\n")
                output_file.write(f"DROP PROCEDURE IF EXISTS `{proc_name}`;\n\n")
                output_file.write("DELIMITER $$\n\n")
                output_file.write(create_stmt)
                output_file.write("$$\n\n")
                output_file.write("DELIMITER ;\n")
                output_file.write("```\n\n")
                output_file.write("---\n\n")
                
                print(f"  ✓ Exported procedure: {proc_name}")
            
        except Exception as e:
            print(f"  ✗ Error exporting procedure {proc_name}: {e}")
    
    cursor.close()

def export_triggers(conn, output_file):
    """Export all trigger definitions"""
    cursor = conn.cursor()
    
    output_file.write("\n\n# Triggers\n\n")
    output_file.write("Los siguientes triggers necesitan ser recreados manualmente.\n\n")
    output_file.write("---\n\n")
    
    cursor.execute("""
        SELECT trigger_name, event_object_table
        FROM information_schema.triggers 
        WHERE trigger_schema = 'operaciones_tqw'
        ORDER BY trigger_name
    """)
    
    triggers = cursor.fetchall()
    
    for trigger_name, table_name in triggers:
        try:
            cursor.execute(f"SHOW CREATE TRIGGER `{trigger_name}`")
            result = cursor.fetchone()
            create_stmt = result[2] if result and len(result) > 2 else None
            
            if create_stmt:
                output_file.write(f"## {trigger_name}\n\n")
                output_file.write(f"**Tabla**: `{table_name}`\n\n")
                output_file.write("```sql\n")
                output_file.write(f"DROP TRIGGER IF EXISTS `{trigger_name}`;\n\n")
                output_file.write("DELIMITER $$\n\n")
                output_file.write(create_stmt)
                output_file.write("$$\n\n")
                output_file.write("DELIMITER ;\n")
                output_file.write("```\n\n")
                output_file.write("---\n\n")
                
                print(f"  ✓ Exported trigger: {trigger_name}")
            
        except Exception as e:
            print(f"  ✗ Error exporting trigger {trigger_name}: {e}")
    
    cursor.close()

def main():
    """Main execution"""
    print("="*60)
    print("EXPORTING DATABASE DEFINITIONS")
    print("="*60)
    print()
    
    conn = connect_to_source()
    
    output_filename = "c:/Users/pc/Documents/GitHub/AppTQW/Docs/pending_migration_objects.md"
    
    try:
        with open(output_filename, 'w', encoding='utf-8') as output_file:
            # Write header
            output_file.write("# Objetos Pendientes de Migración - operaciones_tqw\n\n")
            output_file.write("Este documento contiene las definiciones SQL de todos los objetos que no fueron migrados automáticamente.\n\n")
            output_file.write("**Fecha de exportación**: 2026-01-09\n\n")
            output_file.write("**Base de datos origen**: operaciones_tqw @ 170.239.85.233\n\n")
            output_file.write("**Base de datos destino**: operaciones_tqw_bkp @ localhost (VPS)\n\n")
            output_file.write("---\n\n")
            
            print("Exporting table definitions...")
            export_table_definitions(conn, output_file)
            
            print("\nExporting views...")
            export_views(conn, output_file)
            
            print("\nExporting stored procedures...")
            export_procedures(conn, output_file)
            
            print("\nExporting triggers...")
            export_triggers(conn, output_file)
        
        print()
        print("="*60)
        print(f"✓ Export completed successfully!")
        print(f"✓ Output file: {output_filename}")
        print("="*60)
        
    except Exception as e:
        print(f"✗ Error writing output file: {e}")
        sys.exit(1)
    finally:
        conn.close()
        print("Connection closed")

if __name__ == "__main__":
    main()
