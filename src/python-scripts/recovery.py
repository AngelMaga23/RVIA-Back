import re
import csv
import sys
import os
from PyPDF2 import PdfReader

RGX_PATH = re.compile(r'^.*\\Path\s+\d+:')
RGX_SEVERITY = re.compile(r'Severity\s*(.*)$')
RGX_FILE_NAME = re.compile(r'File Name\s*(.*)$')
RGX_LINE = re.compile(r'Line\s*(.*)$')
RGX_OBJECT = re.compile(r'Object\s*(.*)$')
RGX_DESCRIPTION = re.compile(r'Source Destination\s*(.*)$')
RGX_DATE = re.compile(r'Detection Date\s*(.*)$')
DELIMITER = '|'

def extraer_texto_de_pdf(ruta_pdf):
    try:
        with open(ruta_pdf, 'rb') as archivo:
            lector_pdf = PdfReader(archivo)
            numero_de_paginas = len(lector_pdf.pages)
            texto_completo = ""

            for pagina in range(numero_de_paginas):
                pagina_objeto = lector_pdf.pages[pagina]
                texto_pagina = pagina_objeto.extract_text() if pagina_objeto.extract_text() else ""
                texto_pagina = texto_pagina.replace("'", '"') # Cambiar todas las comillas simples a dobles
                texto_completo += texto_pagina
            
            return texto_completo
    except Exception as e:
        return f"Error al extraer texto: {e}"

def split_by_frags(txt):
    frags = []
    current_frags = []

    for line in txt.split('\n'):
        if RGX_PATH.match(line):
            if current_frags:
                frags.append('\n'.join(current_frags))
                current_frags = []
        current_frags.append(line)
    if current_frags:
        frags.append('\n'.join(current_frags))
    
    return frags

def get_info_frags(frags):
    info_all_frags = []
    
    for frag in frags:
        info_frag = {}
        
        lines = frag.split('\n')
        flag_txt_desc = False
        description = []
        file_name = None
        
        for line in lines:
            if RGX_PATH.match(line):
                info_frag['Type'] = line.strip()
            elif RGX_SEVERITY.match(line):
                info_frag['Severity'] = RGX_SEVERITY.match(line).group(1)
            elif RGX_DATE.match(line):
                flag_txt_desc = True  
            elif RGX_DESCRIPTION.match(line):  
                flag_txt_desc = False
                description_text = ' '.join(description)
                description_text = re.sub(r'\bof\s+[^.]*\.php', '', description_text).strip()
                description_text = re.sub(r'\bin\s+[^.]*\.php', '', description_text).strip()
                description_text = re.sub(r'\bpage\b(?!\bpage\b).*?\.php', 'page', description_text).strip()
                info_frag['Description'] = description_text
            elif flag_txt_desc:
                description.append(line.strip())
            elif RGX_FILE_NAME.match(line):
                file_name = RGX_FILE_NAME.match(line).group(1).strip()
                info_frag['File Name'] = file_name
            elif RGX_LINE.match(line):
                info_frag['Line'] = RGX_LINE.match(line).group(1).split()[0]
            elif RGX_OBJECT.match(line):
                info_frag['Object'] = RGX_OBJECT.match(line).group(1).split()[0]
            
        if info_frag:
            info_all_frags.append(info_frag)
    
    return info_all_frags

def clean_info(info):
    for frag in info:
        for key in frag:
            frag[key] = frag[key].strip()
            if ' PAGE' in frag[key]:
                index = frag[key].find(' PAGE')
                frag[key] = frag[key][:index]
        tmp = frag['Type'].split('\\')
        frag['Type'] = tmp[0]
    return info

def save_to_csv(info, file_name):
    if not info:
        print("No data to save.")
        return

    keys = info[0].keys()
    with open(file_name, 'w', newline='', encoding='utf-8') as output_file:
        dict_writer = csv.DictWriter(output_file, fieldnames=keys, delimiter=DELIMITER, quoting=csv.QUOTE_NONE, escapechar='\\')
        dict_writer.writeheader()
        dict_writer.writerows(info)

def group_by_file_name(info):
    groups = {}
    for element in info:
        file_name = element["File Name"]
        if file_name in groups:
            groups[file_name].append(element)
        else:
            groups[file_name] = [element]

    final_groups = []
    for group in groups:
        total_des = []
        for vul in groups[group]:
            total_des.append(vul['Description'])

        final_groups.append(
            {
                'File Name': group,
                'Description': '\n'.join(total_des),
                'Total': len(total_des)
            }
        )

    return final_groups

def obtener_ultimo_pdf(ruta,nombre_pdf):
    try:
        archivos = [f for f in os.listdir(ruta) if f.endswith('.pdf')]
        if not archivos:
            raise FileNotFoundError(f"No se encontraron archivos PDF en la ruta {ruta}")
        archivos.sort(key=lambda f: os.path.getmtime(os.path.join(ruta, f)), reverse=True)
        return os.path.join(ruta, nombre_pdf)
    except Exception as e:
        print(f"Error al obtener el último PDF: {e}")
        sys.exit()

def extraer_nombre_aplicacion(pdf_file_name):
    return pdf_file_name.split('.', 1)[-1]  # Extrae todo lo que sigue después del primer punto

def main():
    nombre_aplicacion = sys.argv[1]  # Quitar la extensión del nombre de la aplicación
    nombre_pdf = sys.argv[2]
    
    ruta = '/sysx/bito/projects'
    pdf_path = obtener_ultimo_pdf(ruta,nombre_pdf)

    
    # Ruta de la carpeta donde se guardará el CSV
    carpeta_destino = os.path.join(ruta, nombre_aplicacion)
    
    # Verifica si la carpeta existe
    if not os.path.exists(carpeta_destino):
        print(f"ERROR: La carpeta {carpeta_destino} no existe.")
        sys.exit(1)
    
    # Generar el nombre del archivo CSV
    csv_file_name = f'checkmarx_{nombre_aplicacion}.csv'
    csv_file_path = os.path.join(carpeta_destino, csv_file_name)
    
    txt_from_pdf = extraer_texto_de_pdf(pdf_path)

    position_txt = txt_from_pdf.find("Scan Results Details")
    if position_txt != -1:
        useful_txt = txt_from_pdf[position_txt:]
    else:
        print("ERROR - 'Scan Results Details' not found ")
        sys.exit()

    all_frags = split_by_frags(useful_txt)
    all_dic_frags = get_info_frags(all_frags)
    all_dic_clean = clean_info(all_dic_frags)
    groups = group_by_file_name(all_dic_clean)

    save_to_csv(groups, csv_file_path)

    print(f"CSV guardado en {csv_file_path}")

if __name__ == '__main__':
    main()
