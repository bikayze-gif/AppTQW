
data = [
 ["16777767-8", "Gonzalo Antonio Carvacho Cano", "BARRERA", "621777,6"],
 ["19902657-7", "Diego Ignacio Torres Pérez", "GOMEZ", "600461"],
 ["18201897-K", "Leonardo Andrés Fuentealba Cáceres", "BARRERA", "600461"],
 ["17790323-K", "Pablo Andrés Núñez Jorquera", "BARRERA", "600461"],
 ["14777223-8", "Ricardo Isaias Lopez Torres", "BARRERA", "551451"],
 ["19025743-6", "Nicolás Alfonso Bravo Rain", "BARRERA", "308274"],
 ["19777151-8", "Ruperto Ignacio Rojas Jiménez", "CORROTEA", "213818"],
 ["16306008-6", "Sebastián Andrés Lazcano Arena", "BARRERA", "162970"],
 ["15093614-4", "César Alfredo Del Canto Ortega", "CORROTEA", "56000"],
 ["20139488-0", "Richard Jose Luis Olave Manríquez", "GUERRERO", "56000"],
 ["19582198-4", "Matias Alberto Nawrath Suazo", "BARRERA", "54323,33"]
]

columns = [
    'RutTecnicoOrig', 'NombreTecnico', 'Supervisor', 'Zona_Factura23', 'modelo_turno', 'categoria', 
    'Original_RUT_TECNICO', 'DIAS_BASE_DRIVE', 'SUM_OPERATIVO', 'Dias_Cantidad_HFC', 'Dias_Cantidad_FTTH', 
    'Puntos', 'Q_RGU', 'Promedio_HFC', 'Promedio_RGU', 'Q_OPERATIVO_TURNO', 'Q_AUSENTE_TURNO', 
    'Q_VACACIONES_TURNO', 'Q_LICENCIA_TURNO', 'FACTOR_AUSENCIA', 'FACTOR_VACACIONES', 'Meta_Produccion_FTTH', 
    'Meta_Produccion_HFC', '_cumplimientoProduccionRGU', '_CumplimientoProduccionHFC', 'Ratio_CalidadFTTH', 
    'Ratio_CalidadHFC', 'Q_Calidad30_FTTH', 'Q_Cantidad_FTTH', 'Q_Calidad30_HFC', 'Q_Cantidad_HFC', 
    'Meta_Calidad_FTTH', 'Meta_Calidad_HFC', '_cumplimientoMeta_Calidad_FTTH', '_cumplimientoMeta_Calidad_HFC', 
    'CalidadReactivaGrupoHFC', 'CalidadReactivaGrupoFTTH', 'Comisión_FTTH', 'Comisión_HFC', 
    'Comisión_FTTH_Ponderada', 'Comisión_HFC_Ponderada', 'periodo'
]

# Defaults for other columns
defaults = {
    'Zona_Factura23': "'SIN_ZONA'",
    'modelo_turno': "'SIN_TURNO'",
    'categoria': "'Sin Categoria'",
    'DIAS_BASE_DRIVE': 0,
    'SUM_OPERATIVO': 0,
    'Dias_Cantidad_HFC': 0,
    'Dias_Cantidad_FTTH': 0,
    'Puntos': 0,
    'Q_RGU': 0,
    'Promedio_HFC': 0,
    'Promedio_RGU': 0,
    'Q_OPERATIVO_TURNO': 0,
    'Q_AUSENTE_TURNO': 0,
    'Q_VACACIONES_TURNO': 0,
    'Q_LICENCIA_TURNO': 0,
    'FACTOR_AUSENCIA': 1,
    'FACTOR_VACACIONES': 1,
    'Meta_Produccion_FTTH': 0,
    'Meta_Produccion_HFC': 0,
    '_cumplimientoProduccionRGU': 0,
    '_CumplimientoProduccionHFC': 0,
    'Ratio_CalidadFTTH': 0,
    'Ratio_CalidadHFC': 0,
    'Q_Calidad30_FTTH': 0,
    'Q_Cantidad_FTTH': 0,
    'Q_Calidad30_HFC': 0,
    'Q_Cantidad_HFC': 0,
    'Meta_Calidad_FTTH': 0,
    'Meta_Calidad_HFC': 0,
    '_cumplimientoMeta_Calidad_FTTH': 0,
    '_cumplimientoMeta_Calidad_HFC': 0,
    'CalidadReactivaGrupoHFC': 0,
    'CalidadReactivaGrupoFTTH': 0,
    'Comisión_HFC': "'0'",
    'Comisión_HFC_Ponderada': 0,
    'periodo': "'202510'"
}

values_list = []
for row in data:
    rut, nombre, supervisor, comision_raw = row
    comision_val = comision_raw.replace(',', '.')
    
    # Defaults base
    row_map = defaults.copy()
    
    # Overwrite with specific data
    row_map['RutTecnicoOrig'] = f"'{rut}'"
    row_map['NombreTecnico'] = f"'{nombre}'"
    row_map['Supervisor'] = f"'{supervisor}'"
    row_map['Original_RUT_TECNICO'] = f"'{rut}'"
    row_map['Comisión_FTTH'] = f"'{comision_val}'" # Varchar field
    row_map['Comisión_FTTH_Ponderada'] = comision_val # Float field

    # Construct value string in order of 'columns'
    val_str = "(" + ", ".join(str(row_map[col]) for col in columns) + ")"
    values_list.append(val_str)

query = f"INSERT INTO TB_TQW_COMISION_RENEW ({', '.join(columns)}) VALUES \n" + ",\n".join(values_list) + ";"

print(query)
