"""
Script para analizar la estructura de la tabla TP_META_GEO_2023_V3
y comprender cómo insertar los datos de las metas de producción.
"""

import pyodbc
import pandas as pd
from datetime import datetime

# Configuración de conexión a SQL Server
SERVER = '181.212.32.10'
DATABASE = 'telqway'
USERNAME = 'ncornejo'
PASSWORD = 'N1c0l7as17'
PORT = '1433'

def get_connection():
    """Establece conexión con SQL Server"""
    connection_string = (
        f'DRIVER={{ODBC Driver 17 for SQL Server}};'
        f'SERVER={SERVER},{PORT};'
        f'DATABASE={DATABASE};'
        f'UID={USERNAME};'
        f'PWD={PASSWORD}'
    )
    return pyodbc.connect(connection_string)

def analyze_table_structure():
    """Analiza la estructura de la tabla TP_META_GEO_2023_V3"""
    print("=" * 80)
    print("ANÁLISIS DE ESTRUCTURA: TP_META_GEO_2023_V3")
    print("=" * 80)
    
    conn = get_connection()
    cursor = conn.cursor()
    
    # Consulta para obtener la estructura de la tabla
    query_structure = """
    SELECT 
        COLUMN_NAME,
        DATA_TYPE,
        CHARACTER_MAXIMUM_LENGTH,
        IS_NULLABLE,
        COLUMN_DEFAULT
    FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_NAME = 'TP_META_GEO_2023_V3'
    ORDER BY ORDINAL_POSITION;
    """
    
    df_structure = pd.read_sql(query_structure, conn)
    print("\n📋 ESTRUCTURA DE LA TABLA:")
    print("-" * 80)
    print(df_structure.to_string(index=False))
    
    cursor.close()
    conn.close()
    
    return df_structure

def get_sample_data():
    """Obtiene datos de ejemplo de la tabla"""
    print("\n" + "=" * 80)
    print("DATOS DE EJEMPLO")
    print("=" * 80)
    
    conn = get_connection()
    
    # Consulta para obtener algunos registros de ejemplo
    query_sample = """
    SELECT TOP 10 *
    FROM TP_META_GEO_2023_V3
    ORDER BY 1 DESC;
    """
    
    df_sample = pd.read_sql(query_sample, conn)
    print("\n📊 PRIMEROS 10 REGISTROS:")
    print("-" * 80)
    print(df_sample.to_string(index=False))
    
    conn.close()
    
    return df_sample

def get_period_data():
    """Obtiene datos de períodos específicos para entender el formato"""
    print("\n" + "=" * 80)
    print("DATOS POR PERÍODO")
    print("=" * 80)
    
    conn = get_connection()
    
    # Consulta para ver cómo están estructurados los períodos existentes
    query_periods = """
    SELECT DISTINCT 
        CAST(SUBSTRING(CAST(periodo AS VARCHAR), 1, 4) AS INT) as Año,
        CAST(SUBSTRING(CAST(periodo AS VARCHAR), 5, 2) AS INT) as Mes,
        periodo,
        COUNT(*) as Total_Registros
    FROM TP_META_GEO_2023_V3
    WHERE periodo >= 202501
    GROUP BY periodo
    ORDER BY periodo DESC;
    """
    
    df_periods = pd.read_sql(query_periods, conn)
    print("\n📅 PERÍODOS EXISTENTES (2025 en adelante):")
    print("-" * 80)
    print(df_periods.to_string(index=False))
    
    conn.close()
    
    return df_periods

def get_unique_values():
    """Obtiene valores únicos de campos categóricos"""
    print("\n" + "=" * 80)
    print("VALORES ÚNICOS EN CAMPOS CATEGÓRICOS")
    print("=" * 80)
    
    conn = get_connection()
    cursor = conn.cursor()
    
    # Primero, obtener los nombres de las columnas
    cursor.execute("""
        SELECT COLUMN_NAME
        FROM INFORMATION_SCHEMA.COLUMNS
        WHERE TABLE_NAME = 'TP_META_GEO_2023_V3'
        ORDER BY ORDINAL_POSITION;
    """)
    
    columns = [row[0] for row in cursor.fetchall()]
    
    # Buscar columnas que probablemente contengan zonas, turnos, tipos de servicio
    categorical_keywords = ['zona', 'turno', 'tipo', 'servicio', 'red', 'geo']
    
    for column in columns:
        if any(keyword in column.lower() for keyword in categorical_keywords):
            try:
                query = f"""
                SELECT DISTINCT {column}, COUNT(*) as Cantidad
                FROM TP_META_GEO_2023_V3
                GROUP BY {column}
                ORDER BY {column};
                """
                df_unique = pd.read_sql(query, conn)
                print(f"\n🔍 Valores únicos en '{column}':")
                print("-" * 40)
                print(df_unique.to_string(index=False))
            except Exception as e:
                print(f"Error al consultar {column}: {e}")
    
    cursor.close()
    conn.close()

def get_recent_period_details():
    """Obtiene detalles de un período reciente para usar como plantilla"""
    print("\n" + "=" * 80)
    print("DETALLE DE PERÍODO RECIENTE (PLANTILLA)")
    print("=" * 80)
    
    conn = get_connection()
    
    # Obtener el período más reciente
    query_recent = """
    SELECT TOP 20 *
    FROM TP_META_GEO_2023_V3
    WHERE periodo = (SELECT MAX(periodo) FROM TP_META_GEO_2023_V3)
    ORDER BY 1;
    """
    
    df_recent = pd.read_sql(query_recent, conn)
    print("\n📋 REGISTROS DEL PERÍODO MÁS RECIENTE:")
    print("-" * 80)
    print(df_recent.to_string(index=False))
    
    conn.close()
    
    return df_recent

def main():
    """Función principal"""
    try:
        print("\n🔍 Iniciando análisis de tabla TP_META_GEO_2023_V3...")
        print(f"⏰ Fecha y hora: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")
        
        # 1. Analizar estructura
        df_structure = analyze_table_structure()
        
        # 2. Obtener datos de ejemplo
        df_sample = get_sample_data()
        
        # 3. Analizar períodos
        df_periods = get_period_data()
        
        # 4. Obtener valores únicos
        get_unique_values()
        
        # 5. Obtener detalles de período reciente
        df_recent = get_recent_period_details()
        
        print("\n" + "=" * 80)
        print("✅ ANÁLISIS COMPLETADO")
        print("=" * 80)
        print("\n📝 RESUMEN:")
        print(f"   - Total de columnas: {len(df_structure)}")
        print(f"   - Períodos únicos encontrados: {len(df_periods)}")
        print(f"   - Registros en período más reciente: {len(df_recent)}")
        
        print("\n💡 PRÓXIMO PASO:")
        print("   Con esta información, podemos crear el script de INSERT")
        print("   para los períodos 202601, 202602 y 202603.")
        
    except Exception as e:
        print(f"\n❌ ERROR: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    main()
