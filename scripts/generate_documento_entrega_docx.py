# -*- coding: utf-8 -*-
"""
Generador de documento Word (.docx) formal para la entrega de la integración de
Supabase Auth, roles y frontend de BiblioVR Admin.
"""

import os
import docx
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT
from docx.oxml import OxmlElement, parse_xml
from docx.oxml.ns import qn, nsdecls

def set_cell_background(cell, fill_hex):
    """Asigna color de fondo a una celda."""
    shading_elm = parse_xml(f'<w:shd {nsdecls("w")} w:fill="{fill_hex}"/>')
    cell._tc.get_or_add_tcPr().append(shading_elm)

def set_cell_margins(cell, top=140, bottom=140, left=200, right=200):
    """Establece márgenes internos de una celda en dxa."""
    tcPr = cell._tc.get_or_add_tcPr()
    tcMar = OxmlElement('w:tcMar')
    for m, val in [('top', top), ('bottom', bottom), ('left', left), ('right', right)]:
        node = OxmlElement(f'w:{m}')
        node.set(qn('w:w'), str(val))
        node.set(qn('w:type'), 'dxa')
        tcMar.append(node)
    tcPr.append(tcMar)

def add_heading_styled(doc, text, level, color_rgb):
    """Agrega un encabezado con estilo y color personalizado."""
    p = doc.add_paragraph()
    p.paragraph_format.space_before = Pt(14)
    p.paragraph_format.space_after = Pt(4)
    p.paragraph_format.keep_with_next = True
    run = p.add_run(text)
    run.font.name = 'Calibri'
    run.font.bold = True
    run.font.color.rgb = color_rgb
    if level == 1:
        run.font.size = Pt(17)
    elif level == 2:
        run.font.size = Pt(13.5)
    elif level == 3:
        run.font.size = Pt(11.5)
    return p

def add_callout(doc, text, title=None, fill_hex="F8FAFC", border_hex="E5A00D"):
    """Agrega un cuadro de llamada o nota con barra izquierda de color."""
    tbl = doc.add_table(rows=1, cols=1)
    tbl.alignment = WD_TABLE_ALIGNMENT.CENTER
    tbl.autofit = False
    tbl.columns[0].width = Inches(7.0)

    cell = tbl.cell(0, 0)
    set_cell_background(cell, fill_hex)
    set_cell_margins(cell, top=120, bottom=120, left=180, right=180)

    tcPr = cell._tc.get_or_add_tcPr()
    borders_xml = f'''
    <w:tcBorders {nsdecls("w")}>
        <w:top w:val="none"/>
        <w:left w:val="single" w:sz="36" w:space="0" w:color="{border_hex}"/>
        <w:bottom w:val="none"/>
        <w:right w:val="none"/>
    </w:tcBorders>
    '''
    tcPr.append(parse_xml(borders_xml))

    p = cell.paragraphs[0]
    p.paragraph_format.space_before = Pt(2)
    p.paragraph_format.space_after = Pt(2)
    p.paragraph_format.line_spacing = 1.15

    if title:
        rt = p.add_run(title + "\n")
        rt.font.bold = True
        rt.font.size = Pt(10)
        rt.font.color.rgb = RGBColor(11, 26, 48)

    r = p.add_run(text)
    r.font.size = Pt(9.5)
    r.font.color.rgb = RGBColor(51, 65, 85)
    doc.add_paragraph().paragraph_format.space_after = Pt(4)

def add_screenshot_box(doc, num, title, what_to_capture, technical_explanation):
    """Genera un contenedor formal para insertar la captura de pantalla."""
    tbl = doc.add_table(rows=2, cols=1)
    tbl.alignment = WD_TABLE_ALIGNMENT.CENTER
    tbl.autofit = False
    tbl.columns[0].width = Inches(7.0)

    # 1. Cabecera del bloque de captura
    header_cell = tbl.cell(0, 0)
    set_cell_background(header_cell, "0B1A30")
    set_cell_margins(header_cell, top=100, bottom=100, left=150, right=150)
    
    p_head = header_cell.paragraphs[0]
    p_head.paragraph_format.space_before = Pt(2)
    p_head.paragraph_format.space_after = Pt(2)
    r_cam = p_head.add_run(f"📸 CAPTURA {num}: {title.upper()}")
    r_cam.font.name = 'Calibri'
    r_cam.font.bold = True
    r_cam.font.size = Pt(10)
    r_cam.font.color.rgb = RGBColor(229, 160, 13) # Dorado #E5A00D

    # 2. Contenido / Espacio para la imagen y especificaciones
    body_cell = tbl.cell(1, 0)
    set_cell_background(body_cell, "F8FAFC")
    set_cell_margins(body_cell, top=140, bottom=140, left=180, right=180)

    # Borde sutil alrededor del cuerpo
    tcPr = body_cell._tc.get_or_add_tcPr()
    borders_xml = f'''
    <w:tcBorders {nsdecls("w")}>
        <w:top w:val="none"/>
        <w:left w:val="single" w:sz="12" w:space="0" w:color="CBD5E1"/>
        <w:bottom w:val="single" w:sz="12" w:space="0" w:color="CBD5E1"/>
        <w:right w:val="single" w:sz="12" w:space="0" w:color="CBD5E1"/>
    </w:tcBorders>
    '''
    tcPr.append(parse_xml(borders_xml))

    p_body = body_cell.paragraphs[0]
    p_body.paragraph_format.space_before = Pt(4)
    p_body.paragraph_format.space_after = Pt(6)
    p_body.paragraph_format.line_spacing = 1.15

    # Placeholder visual para la captura
    p_place = body_cell.add_paragraph()
    p_place.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_place.paragraph_format.space_before = Pt(12)
    p_place.paragraph_format.space_after = Pt(12)
    r_place = p_place.add_run("┌────────────────────────────────────────────────────────┐\n│         [ PEGAR AQUÍ LA CAPTURA DE PANTALLA ]          │\n└────────────────────────────────────────────────────────┘")
    r_place.font.name = 'Consolas'
    r_place.font.size = Pt(9.5)
    r_place.font.color.rgb = RGBColor(148, 163, 184)

    # Qué debe mostrar
    p_what = body_cell.add_paragraph()
    p_what.paragraph_format.space_before = Pt(4)
    p_what.paragraph_format.space_after = Pt(4)
    p_what.paragraph_format.line_spacing = 1.15
    rw_title = p_what.add_run("QUÉ DEBE MOSTRAR ESTA CAPTURA:\n")
    rw_title.font.bold = True
    rw_title.font.size = Pt(9.5)
    rw_title.font.color.rgb = RGBColor(11, 26, 48)
    rw_desc = p_what.add_run(what_to_capture)
    rw_desc.font.size = Pt(9.5)
    rw_desc.font.color.rgb = RGBColor(71, 85, 105)

    # Mini explicación técnica
    p_why = body_cell.add_paragraph()
    p_why.paragraph_format.space_before = Pt(4)
    p_why.paragraph_format.space_after = Pt(4)
    p_why.paragraph_format.line_spacing = 1.15
    ry_title = p_why.add_run("MINI EXPLICACIÓN TÉCNICA:\n")
    ry_title.font.bold = True
    ry_title.font.size = Pt(9.5)
    ry_title.font.color.rgb = RGBColor(74, 14, 14) # Borgoña
    ry_desc = p_why.add_run(technical_explanation)
    ry_desc.font.size = Pt(9.5)
    ry_desc.font.color.rgb = RGBColor(71, 85, 105)

    # Espacio posterior
    p_end = doc.add_paragraph()
    p_end.paragraph_format.space_before = Pt(0)
    p_end.paragraph_format.space_after = Pt(8)

def main():
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    output_docx = os.path.join(base_dir, "Documentacion_Integracion_Supabase_Frontend.docx")

    doc = docx.Document()

    # Márgenes de página: 0.75 pulgadas
    for sec in doc.sections:
        sec.top_margin = Inches(0.75)
        sec.bottom_margin = Inches(0.75)
        sec.left_margin = Inches(0.75)
        sec.right_margin = Inches(0.75)
        sec.page_width = Inches(8.5)
        sec.page_height = Inches(11.0)

    # Colores corporativos
    c_navy = RGBColor(11, 26, 48)     # #0B1A30
    c_gold = RGBColor(229, 160, 13)   # #E5A00D
    c_wine = RGBColor(74, 14, 14)     # #4A0E0E
    c_slate = RGBColor(71, 85, 105)   # #475569

    # -------------------------------------------------------------
    # PORTADA / ENCABEZADO FORMAL
    # -------------------------------------------------------------
    p_inst = doc.add_paragraph()
    p_inst.paragraph_format.space_before = Pt(4)
    p_inst.paragraph_format.space_after = Pt(2)
    r_inst = p_inst.add_run("TALLER DE DESARROLLO FULL STACK | SEMESTRE VII")
    r_inst.font.name = 'Calibri'
    r_inst.font.bold = True
    r_inst.font.size = Pt(9.5)
    r_inst.font.color.rgb = c_gold

    p_title = doc.add_paragraph()
    p_title.paragraph_format.space_before = Pt(2)
    p_title.paragraph_format.space_after = Pt(4)
    r_title = p_title.add_run("DOCUMENTACIÓN TÉCNICA: INTEGRACIÓN DE SUPABASE AUTH, ROLES Y ARQUITECTURA FRONTEND BIBLIOVR ADMIN")
    r_title.font.name = 'Calibri'
    r_title.font.bold = True
    r_title.font.size = Pt(18)
    r_title.font.color.rgb = c_navy

    p_sub = doc.add_paragraph()
    p_sub.paragraph_format.space_before = Pt(0)
    p_sub.paragraph_format.space_after = Pt(12)
    r_sub = p_sub.add_run("Plataforma Web para la Biblioteca Pública Profesor Solón Argüello • Tepic, Nayarit\nStack: React 18, Vite, Tailwind CSS, Supabase (PostgreSQL / Auth / RLS), Three.js, React Three Fiber y WebXR.")
    r_sub.font.size = Pt(10)
    r_sub.font.color.rgb = c_slate

    add_callout(
        doc,
        "Este documento recopila la implementación completa del sistema de acceso seguro con Supabase Auth, asignación de perfiles y roles relacionales en PostgreSQL, y la reconstrucción total de la interfaz gráfica de usuario respetando la identidad cromática institucional (Azul Marino #0B1A30, Amarillo Dorado #E5A00D y Borgoña #4A0E0E) en sus cuatro pantallas principales.",
        title="RESUMEN DE ENTREGA TÉCNICA",
        fill_hex="F8FAFC",
        border_hex="E5A00D"
    )

    # -------------------------------------------------------------
    # SECCIÓN 1: MÓDULO DE LOGIN Y AUTENTICACIÓN
    # -------------------------------------------------------------
    add_heading_styled(doc, "1. MÓDULO DE AUTENTICACIÓN (LOGIN, REGISTRO Y RECUPERACIÓN)", 1, c_navy)
    
    p = doc.add_paragraph()
    p.paragraph_format.line_spacing = 1.15
    p.paragraph_format.space_after = Pt(6)
    p.add_run(
        "El módulo de autenticación fue desarrollado con React 18 y estilizado con Tailwind CSS bajo la paleta cromática solicitada. "
        "Consta de dos componentes principales: la vista completa LoginView.jsx y el modal interactivo AuthModal.jsx. "
        "Permite el inicio de sesión con correo y contraseña, registro con nombre completo, flujo transaccional de verificación mediante Gmail, "
        "recuperación de contraseña mediante correo con token de un solo uso, y un botón de acceso rápido para demostración."
    )

    add_screenshot_box(
        doc,
        1,
        "Pantalla de Login de BiblioVR Admin",
        "Captura de pantalla completa del navegador en http://localhost:3000/. Debe verse el fondo azul marino (#0B1A30), el isotipo de rombo geométrico dorado, el título 'BiblioVR Admin', las pestañas de selección 'Iniciar Sesión' y 'Crear Cuenta', los campos de correo y contraseña, el botón dorado 'Ingresar al Sistema' y el acceso demo inferior.",
        "Interfaz de autenticación y punto de entrada al sistema desarrollada con React y Tailwind CSS, integrada con Supabase Auth para validar credenciales y proteger el panel administrativo."
    )

    add_screenshot_box(
        doc,
        2,
        "Pantalla de Registro y Aviso de Confirmación Gmail",
        "Captura del formulario en la pestaña 'Crear Cuenta' o de la pantalla de confirmación exitosa con el icono circular verde y el encabezado '¡Confirma tu cuenta!', donde se aprecia el correo electrónico ingresado y las instrucciones para revisar la bandeja de entrada en Gmail.",
        "Flujo de validación transaccional que asegura que ninguna cuenta sea utilizada en el sistema sin antes haber verificado la legitimidad de su dirección de correo electrónico mediante el enlace seguro de Supabase."
    )

    # -------------------------------------------------------------
    # SECCIÓN 2: CONEXIÓN A SUPABASE Y CLIENTE
    # -------------------------------------------------------------
    add_heading_styled(doc, "2. CONEXIÓN A SUPABASE DEL PROGRAMA Y VARIABLES DE ENTORNO", 1, c_navy)
    
    p = doc.add_paragraph()
    p.paragraph_format.line_spacing = 1.15
    p.paragraph_format.space_after = Pt(6)
    p.add_run(
        "La conexión con los servicios en la nube de Supabase está encapsulada en el módulo src/lib/supabaseClient.js. "
        "Utiliza la librería oficial @supabase/supabase-js y lee de forma reactiva las variables de entorno VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY. "
        "Se configuraron las opciones de persistencia automática en localStorage (persistSession: true), refresco de tokens (autoRefreshToken: true) "
        "y detección de tokens de sesión en la URL (detectSessionInUrl: true) para capturar el redireccionamiento tras confirmar el correo."
    )

    add_screenshot_box(
        doc,
        3,
        "Configuración del Cliente Supabase y Variables de Entorno",
        "Captura del archivo .env.example en VS Code mostrando VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY, o captura del panel web de Supabase (Project Settings > API) mostrando la Project URL y la API Key (anon/public).",
        "Desacoplamiento seguro de credenciales mediante variables de entorno en Vite y protección en .gitignore para evitar la filtración de llaves del proyecto en el repositorio git."
    )

    # -------------------------------------------------------------
    # SECCIÓN 3: CONEXIÓN DE AUTH CON EL FRONTEND Y ROLES
    # -------------------------------------------------------------
    add_heading_styled(doc, "3. INTEGRACIÓN DE SUPABASE AUTH Y ROLES EN TABLA DE USUARIOS", 1, c_navy)
    
    p = doc.add_paragraph()
    p.paragraph_format.line_spacing = 1.15
    p.paragraph_format.space_after = Pt(6)
    p.add_run(
        "El ciclo de vida de la sesión se gestiona centralizadamente en src/context/AuthContext.jsx mediante un React Context Provider. "
        "Cuando un usuario se registra o inicia sesión por correo, se sincroniza en tiempo real con la tabla relacional public.profiles en PostgreSQL. "
        "Esta tabla vincula el UUID del usuario con su nombre completo, fecha de registro y rol activo (admin, bibliotecario o lector), "
        "el cual determina los privilegios visualizados en el panel y en el log de sesión de los trabajadores de la biblioteca."
    )

    add_callout(
        doc,
        "La API de libros y culturas queda formalmente diferida para la siguiente fase donde se implementará el motor de recomendaciones en 3D y la interacción con los libros en el visor VR. Para esta fase, la gestión de autenticación, el ciclo de sesiones por correo y los roles de usuario están 100% operativos.",
        title="ALCANCE DE LA API DE LIBROS Y CULTURAS",
        fill_hex="FFFBEB",
        border_hex="E5A00D"
    )

    add_screenshot_box(
        doc,
        4,
        "Tabla de Perfiles y Roles en Supabase (public.profiles)",
        "Captura del Table Editor en la consola de Supabase (https://supabase.com/dashboard) mostrando la tabla 'profiles' con sus columnas id, nombre_completo, rol y created_at, exhibiendo registros con roles 'admin', 'bibliotecario' y 'lector'.",
        "Estructura relacional en PostgreSQL donde cada usuario autenticado dispone de un perfil persistente que especifica su jerarquía y permisos en el sistema bibliotecario."
    )

    add_screenshot_box(
        doc,
        5,
        "Correo de Confirmación Transaccional Recibido en Gmail",
        "Captura de la bandeja de entrada o del cuerpo del mensaje recibido en Gmail desde Supabase Auth, mostrando el botón o enlace de activación 'Confirm your mail' de la biblioteca.",
        "Evidencia del flujo de verificación por correo electrónico (SMTP) que valida la identidad del trabajador o usuario antes de permitir el acceso completo a la plataforma."
    )

    add_screenshot_box(
        doc,
        6,
        "Panel de Usuario y Log de Sesión (UserProfileModal)",
        "Captura del modal desplegado en el frontend al hacer clic en el avatar circular 'AD' superior derecho. Debe mostrar el nombre, rol activo ('Administrador General' / 'Bibliotecario'), lista de privilegios, ID de usuario truncado, último ingreso y botón rojo de cierre de sesión.",
        "Componente de auditoría y control de acceso que interpreta el perfil cargado desde Supabase y brinda a los trabajadores un log de sesión claro y seguro."
    )

    # -------------------------------------------------------------
    # SECCIÓN 4: PANTALLAS DEL FRONTEND BIBLIOVR ADMIN
    # -------------------------------------------------------------
    add_heading_styled(doc, "4. ARQUITECTURA INTEGRAL DEL FRONTEND Y PANTALLAS DEL SISTEMA", 1, c_navy)
    
    p = doc.add_paragraph()
    p.paragraph_format.line_spacing = 1.15
    p.paragraph_format.space_after = Pt(6)
    p.add_run(
        "El frontend fue completamente transformado para replicar las maquetas oficiales de BiblioVR Admin, integrando un Sidebar "
        "azul marino fijo con botones dorados activos, cabecera con avatar 'AD' y cuatro pantallas especializadas:"
    )

    # Dashboard
    add_heading_styled(doc, "4.1. Panel de Control General (Dashboard)", 2, c_navy)
    p_dash = doc.add_paragraph()
    p_dash.paragraph_format.line_spacing = 1.15
    p_dash.add_run(
        "Presenta 4 tarjetas métricas con borde izquierdo amarillo (#E5A00D): Libros en catálogo (1,284), Sesiones VR semanales (342), "
        "Recomendaciones activas (48) y Tiempo medio de mirada (1.5 s), junto con los dos banners de acceso rápido a Wireframes VR (Azul Marino) "
        "y Prototipo VR funcional (Vino Tinto / Borgoña)."
    )

    add_screenshot_box(
        doc,
        7,
        "Panel de Control General (Dashboard)",
        "Captura de pantalla completa de http://localhost:3000/ mostrando el Dashboard con el sidebar lateral izquierdo, las 4 tarjetas métricas con su borde izquierdo dorado y los dos banners de navegación rápida.",
        "Tablero principal de supervisión administrativa que condensa los indicadores operativos de la biblioteca y provee navegación fluida a los demás módulos del sistema."
    )

    # Gestión de Libros
    add_heading_styled(doc, "4.2. Gestión de Libros", 2, c_navy)
    p_books = doc.add_paragraph()
    p_books.paragraph_format.line_spacing = 1.15
    p_books.add_run(
        "Módulo de catalogación con tabla en contenedor blanco. Muestra columnas Título, Autor y Recomendado con las insignias oscuras 'Sí' "
        "para libros recomendados en el espacio virtual y texto 'No' para el catálogo general, además de un buscador interactivo en tiempo real."
    )

    add_screenshot_box(
        doc,
        8,
        "Vista de Gestión de Libros",
        "Captura de la vista 'Gestión de Libros' en el navegador con la tabla de literatura mexicana (Pedro Páramo, El laberinto de la soledad, Aura, Balún Canán...) mostrando la columna de recomendaciones y el campo de búsqueda.",
        "Módulo administrativo para la curaduría de obras bibliográficas destacadas dentro del entorno virtual para fomento de lectura comunitaria."
    )

    # Wireframes VR
    add_heading_styled(doc, "4.3. Wireframes del Espacio VR", 2, c_navy)
    p_wires = doc.add_paragraph()
    p_wires.paragraph_format.line_spacing = 1.15
    p_wires.add_run(
        "Diagrama vectorial interactivo en formato SVG que recrea la 'Vista cenital — distribución espacial'. "
        "Ilustra el abanico visual FOV 100° en tono arena, el Menú central a Z = -2.0 m con flecha roja de 2.0 m, el arco curvado vino tinto "
        "para Recomendados a -20°, y el punto de origen Usuario (0,0,0), fundamentado en especificaciones ergonómicas ISO 9241-210."
    )

    add_screenshot_box(
        doc,
        9,
        "Wireframes del Espacio VR (Vista Cenital FOV 100°)",
        "Captura de la pantalla 'Wireframes VR' mostrando el diagrama técnico SVG con el abanico de visión, cotas de distancia de 2.0 m, el arco de obras recomendadas y las tarjetas técnicas de especificaciones ergonómicas.",
        "Diseño arquitectónico 3D que fundamenta matemáticamente los ángulos de visibilidad y las distancias focales para visores móviles Homido Grab."
    )

    # Prototipo VR
    add_heading_styled(doc, "4.4. Prototipo VR del Museo Wixárika", 2, c_navy)
    p_vr = doc.add_paragraph()
    p_vr.paragraph_format.line_spacing = 1.15
    p_vr.add_run(
        "Módulo inmersivo WebXR embebido directamente en la aplicación. Permite recorrer el modelo 3D low-poly del Museo Wixárika con "
        "sus cuatro pabellones culturales (Deidades, Gastronomía, Fiestas y Kiosco Lector). Incorpora el retículo de interacción manos libres "
        "Gaze Fuse a 1.5 segundos y un botón superior 'Volver al Panel' para alternar instantáneamente entre la experiencia inmersiva y el panel 2D."
    )

    add_screenshot_box(
        doc,
        10,
        "Escena 3D del Prototipo VR Interactivo (Museo Wixárika)",
        "Captura del lienzo 3D dentro de la pestaña 'Prototipo VR', mostrando la sala circular del Museo Wixárika, las deidades sagradas, el retículo central de gaze fuse y el botón flotante 'Volver al Panel'.",
        "Experiencia inmersiva WebXR que materializa la difusión de las culturas vivas de Nayarit con navegación sin mandos manuales para visores móviles."
    )

    # -------------------------------------------------------------
    # SECCIÓN 5: VERIFICACIÓN Y COMPILACIÓN
    # -------------------------------------------------------------
    add_heading_styled(doc, "5. VERIFICACIÓN DE COMPILACIÓN Y CALIDAD (VITE BUILD)", 1, c_navy)
    
    p = doc.add_paragraph()
    p.paragraph_format.line_spacing = 1.15
    p.paragraph_format.space_after = Pt(6)
    p.add_run(
        "Para validar la estabilidad del código, se ejecutó la compilación de producción con Vite (npm run build). "
        "Se procesaron satisfactoriamente 2,219 módulos sin advertencias bloqueantes ni errores de sintaxis, generando los paquetes "
        "optimizados de Three.js, React Framework y la lógica de la aplicación."
    )

    add_screenshot_box(
        doc,
        11,
        "Compilación Exitosa en Terminal (npm run build)",
        "Captura de la terminal (PowerShell) mostrando la ejecución del comando 'npm run build' en PruebasVR.demsam con la salida verde '✓ 2219 modules transformed.' y la lista de archivos empaquetados en dist/.",
        "Verificación formal de integridad de dependencias, tipos y empaquetado del bundle para despliegue en producción sin errores."
    )

    # Guardar documento
    doc.save(output_docx)
    print(f"Documento generado exitosamente en: {output_docx}")

if __name__ == '__main__':
    main()
