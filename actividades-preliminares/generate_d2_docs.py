import os
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable, KeepTogether
)
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_JUSTIFY

from docx import Document
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT
from docx.oxml import parse_xml
from docx.oxml.ns import nsdecls

BASE_DIR = r"c:\GitHub\PruebasVR.demsam\actividades-preliminares"

PRIMARY_HEX = "#1e3a8a"     # Navy Blue
SECONDARY_HEX = "#0284c7"   # Sky Blue
DARK_HEX = "#1e293b"        # Slate Dark
LIGHT_BG_HEX = "#f8fafc"    # Slate 50
ACCENT_HEX = "#b45309"      # Amber/Gold

C_PRIMARY = colors.HexColor(PRIMARY_HEX)
C_SECONDARY = colors.HexColor(SECONDARY_HEX)
C_DARK = colors.HexColor(DARK_HEX)
C_LIGHT = colors.HexColor(LIGHT_BG_HEX)
C_MUTED = colors.HexColor("#64748b")
C_BORDER = colors.HexColor("#cbd5e1")

def get_reportlab_styles():
    styles = getSampleStyleSheet()
    return {
        'title': ParagraphStyle('DocTitle', parent=styles['Normal'], fontName='Helvetica-Bold', fontSize=14, leading=18, textColor=C_PRIMARY, spaceAfter=2),
        'subtitle': ParagraphStyle('DocSubtitle', parent=styles['Normal'], fontName='Helvetica', fontSize=9.5, leading=13, textColor=C_MUTED, spaceAfter=4),
        'meta': ParagraphStyle('MetaInfo', parent=styles['Normal'], fontName='Helvetica-Bold', fontSize=8, leading=11, textColor=C_SECONDARY, spaceAfter=2),
        'authors': ParagraphStyle('AuthorsInfo', parent=styles['Normal'], fontName='Helvetica-Oblique', fontSize=8, leading=11, textColor=colors.HexColor(ACCENT_HEX), spaceAfter=6),
        'h1': ParagraphStyle('Heading1Custom', parent=styles['Normal'], fontName='Helvetica-Bold', fontSize=10.5, leading=14, textColor=C_PRIMARY, spaceBefore=7, spaceAfter=3),
        'h2': ParagraphStyle('Heading2Custom', parent=styles['Normal'], fontName='Helvetica-Bold', fontSize=9, leading=12, textColor=colors.HexColor(ACCENT_HEX), spaceBefore=4, spaceAfter=2),
        'body': ParagraphStyle('BodyCustom', parent=styles['Normal'], fontName='Helvetica', fontSize=8, leading=11, textColor=C_DARK, spaceAfter=3),
        'bullet': ParagraphStyle('BulletCustom', parent=styles['Normal'], fontName='Helvetica', fontSize=8, leading=11, textColor=C_DARK, leftIndent=10, spaceAfter=2),
        'table_cell': ParagraphStyle('TableCell', parent=styles['Normal'], fontName='Helvetica', fontSize=7.5, leading=10, textColor=C_DARK),
        'table_cell_bold': ParagraphStyle('TableCellBold', parent=styles['Normal'], fontName='Helvetica-Bold', fontSize=7.5, leading=10, textColor=C_PRIMARY),
        'table_header': ParagraphStyle('TableHeader', parent=styles['Normal'], fontName='Helvetica-Bold', fontSize=8, leading=11, textColor=colors.white)
    }

def set_docx_cell_bg(cell, color_hex):
    shd = parse_xml(f'<w:shd {nsdecls("w")} w:fill="{color_hex}"/>')
    cell._tc.get_or_add_tcPr().append(shd)

def create_docx_header(doc, title, subtitle, authors):
    p_meta = doc.add_paragraph()
    r_meta = p_meta.add_run("TALLER FULL STACK | SEMESTRE VII | EQUIPO 10")
    r_meta.bold = True
    r_meta.font.size = Pt(8.5)
    r_meta.font.color.rgb = RGBColor(2, 132, 199)

    p_proj = doc.add_paragraph()
    r_proj = p_proj.add_run("Proyecto: Módulo Inmersivo WebXR para la Difusión de las Culturas Vivas de Nayarit y Fomento a la Lectura\nSede: Biblioteca Pública Profesor Solón Argüello (Tepic, Nayarit)")
    r_proj.font.size = Pt(8)
    r_proj.font.color.rgb = RGBColor(100, 116, 139)

    p_title = doc.add_paragraph()
    r_title = p_title.add_run(title)
    r_title.bold = True
    r_title.font.size = Pt(13)
    r_title.font.color.rgb = RGBColor(30, 58, 138)

    p_sub = doc.add_paragraph()
    r_sub = p_sub.add_run(subtitle)
    r_sub.font.size = Pt(9.5)
    r_sub.font.color.rgb = RGBColor(100, 116, 139)

    p_team = doc.add_paragraph()
    r_team = p_team.add_run("Integrantes: Eddie David Altamirano Plantillas, Luis Carlos Durán Ocampo, Samir Adrián Cárdenas Gámez, Ulises Alejandro Bautista Meza\n")
    r_team.font.size = Pt(8)
    r_auth = p_team.add_run(f"Sección Elaborada por: {authors}")
    r_auth.bold = True
    r_auth.italic = True
    r_auth.font.size = Pt(8)
    r_auth.font.color.rgb = RGBColor(180, 83, 9)
    doc.add_paragraph().paragraph_format.space_after = Pt(4)

# ==============================================================================
# DOC 1: FICHA DE USUARIO
# ==============================================================================
def generate_doc1():
    pdf_path = os.path.join(BASE_DIR, "Ficha de Usuario (ISO 9241-210) Equipo 10.pdf")
    docx_path = os.path.join(BASE_DIR, "Ficha de Usuario (ISO 9241-210) Equipo 10.docx")
    authors = "Eddie David Altamirano Plantillas y Luis Carlos Durán Ocampo"
    title = "ENTREGABLE FASE 1: FICHA DE USUARIO (ISO 9241-210:2019)"
    sub = "Especificación de Perfiles de Usuario para el Kiosco Inmersivo y Panel de Gestión Bibliotecaria"

    # PDF
    doc = SimpleDocTemplate(pdf_path, pagesize=letter, leftMargin=36, rightMargin=36, topMargin=36, bottomMargin=36)
    st = get_reportlab_styles()
    story = [
        Paragraph("TALLER FULL STACK | SEMESTRE VII | EQUIPO 10", st['meta']),
        Paragraph("Proyecto: Módulo Inmersivo WebXR para la Difusión de las Culturas Vivas de Nayarit y Fomento a la Lectura<br/>Sede: Biblioteca Pública Profesor Solón Argüello (Tepic, Nayarit)", st['subtitle']),
        Paragraph(title, st['title']),
        Paragraph(f"<b>Sección Elaborada por:</b> {authors}", st['authors']),
        HRFlowable(width="100%", thickness=1, color=C_SECONDARY, spaceAfter=6),
        
        Paragraph("1. PERFIL DE USUARIO 1 (USUARIO FINAL PRIMARIO): VISITANTE DE LA BIBLIOTECA", st['h1']),
        Paragraph("<b>Nombre:</b> Mateo Morales | <b>Edad:</b> 17 años | <b>Rol:</b> Estudiante de Bachillerato y Visitante Asiduo | <b>Nivel Digital:</b> Medio", st['meta']),
        Paragraph("<b>Biografía y Perfil General:</b> Mateo acude con regularidad a la Biblioteca Pública Profesor Solón Argüello para estudiar y hacer tareas. Aunque vive en Tepic, su cercanía con las culturas vivas del estado (Wixárika, Na'ayeri/Cora, O'dam/Tepehuano y Mexicanero) se ha limitado a libros de texto tradicionales con fotos descontextualizadas. Desconoce las tradiciones, lengua y cosmovisión viva porque le resultan poco atractivas en formato puramente impreso.", st['body']),
        Paragraph("<b>Objetivos y Necesidades:</b>", st['h2']),
        Paragraph("• Vivir una experiencia inmersiva e interactiva sobre la cosmovisión Wixárika sin mareos en el visor Homido Grab de la biblioteca.", st['bullet']),
        Paragraph("• Conocer contenidos multimedia breves (videos de cantos del Mara'akame, galerías de arte en chaquira y fiestas patronales) en un menú central flotante cómodo.", st['bullet']),
        Paragraph("• Descubrir qué libros de la biblioteca abordan estos temas mediante un panel lateral de portadas recomendadas, para pedirlos en préstamo al personal.", st['bullet']),
        Paragraph("<b>Frustraciones y Puntos de Dolor:</b>", st['h2']),
        Paragraph("• Experiencias 3D pesadas que se traban, calientan el smartphone o provocan mareo por movimiento (cinetosis).", st['bullet']),
        Paragraph("• Menús VR complicados donde es difícil apuntar o los textos son ilegibles con el visor puesto.", st['bullet']),
        Paragraph("• Desconexión entre atracciones digitales y los libros físicos disponibles en las salas de lectura.", st['bullet']),
        Paragraph("<b>Motivaciones y Expectativas:</b>", st['h2']),
        Paragraph("• Conectar con la riqueza cultural de Nayarit de manera moderna y visualmente atractiva.", st['bullet']),
        Paragraph("• Salir del módulo con el interés genuino de solicitar un libro físico en ventanilla para profundizar en el tema.", st['bullet']),
        
        Spacer(1, 4),
        Paragraph("2. PERFIL DE USUARIO 2 (USUARIO SECUNDARIO / GESTOR): MEDIADORA CULTURAL Y BIBLIOTECARIA", st['h1']),
        Paragraph("<b>Nombre:</b> Mtra. Elena Rivas | <b>Edad:</b> 44 años | <b>Rol:</b> Bibliotecaria y Coordinadora Cultural | <b>Nivel Digital:</b> Básico - Intermedio", st['meta']),
        Paragraph("<b>Biografía y Perfil General:</b> Elena es encargada del área de vinculación y fomento a la lectura en la Biblioteca Solón Argüello. Se preocupa por el desinterés de los jóvenes hacia los libros físicos sobre historia y etnias nayaritas. Busca implementar tecnologías innovadoras, de bajo costo y autónomas que sirvan de puente hacia el acervo bibliográfico.", st['body']),
        Paragraph("<b>Objetivos y Necesidades:</b>", st['h2']),
        Paragraph("• Contar con un kiosco cultural VR de bajo presupuesto (visor Homido Grab + celular) que atraiga a estudiantes sin requerir costosos visores autónomos.", st['bullet']),
        Paragraph("• Utilizar un panel web administrativo 2D sencillo para dar de alta, editar y vincular portadas de libros físicos con las distintas secciones culturales.", st['bullet']),
        Paragraph("• Actualizar cápsulas de video e imágenes conforme avancen los programas cívicos y culturales de la biblioteca.", st['bullet']),
        Paragraph("<b>Frustraciones y Puntos de Dolor:</b>", st['h2']),
        Paragraph("• Sistemas tecnológicos cerrados que requieren programadores para cambiar una foto o agregar un libro nuevo al catálogo.", st['bullet']),
        Paragraph("• Presupuesto municipal limitado para mantenimiento de equipos de cómputo de alta gama.", st['bullet']),
        Paragraph("<b>Motivaciones y Expectativas:</b>", st['h2']),
        Paragraph("• Elevar el préstamo y consulta de libros sobre lenguas y tradiciones de Nayarit.", st['bullet']),
        Paragraph("• Disponer de una plataforma modular que inicie con la cultura Wixárika y permita agregar las culturas Cora, Tepehuano y Mexicanero en fases posteriores.", st['bullet'])
    ]
    doc.build(story)

    # DOCX
    d = Document()
    create_docx_header(d, title, sub, authors)
    d.add_heading("1. Perfil de Usuario 1: Mateo Morales (Visitante de la Biblioteca)", level=1)
    p = d.add_paragraph()
    p.add_run("Nombre: Mateo Morales | Edad: 17 años | Rol: Estudiante de Bachillerato | Nivel Digital: Medio\n").bold = True
    p.add_run("Biografía: Mateo acude a la Biblioteca Profesor Solón Argüello para estudiar. Desconoce la riqueza de las culturas vivas de Nayarit debido a que los libros de texto escolares presentan información descontextualizada. Busca una experiencia inmersiva que lo motive a leer y profundizar.")
    d.add_heading("Objetivos y Necesidades", level=2)
    d.add_paragraph("• Experimentar un recorrido inmersivo sobre la cultura Wixárika con visor Homido Grab sin mareos.", style='List Bullet')
    d.add_paragraph("• Explorar videos y fotografías culturales en un menú central flotante fijo.", style='List Bullet')
    d.add_paragraph("• Ver portadas de libros recomendados en un panel lateral para solicitarlos al bibliotecario.", style='List Bullet')
    d.add_heading("Frustraciones y Puntos de Dolor", level=2)
    d.add_paragraph("• Sobrecalentamiento y lentitud en celulares de gama de entrada con gráficos 3D pesados.", style='List Bullet')
    d.add_paragraph("• Menús en VR difíciles de operar con botones confusos o textos pequeños.", style='List Bullet')
    
    d.add_heading("2. Perfil de Usuario 2: Mtra. Elena Rivas (Bibliotecaria / Administradora)", level=1)
    p2 = d.add_paragraph()
    p2.add_run("Nombre: Mtra. Elena Rivas | Edad: 44 años | Rol: Coordinadora de Fomento a la Lectura | Nivel Digital: Básico-Intermedio\n").bold = True
    p2.add_run("Biografía: Elena gestiona las salas y actividades de la Biblioteca Solón Argüello. Busca conectar a los jóvenes con los libros físicos de las culturas de Nayarit mediante un kiosco VR económico y un panel administrativo 2D para gestionar los libros recomendados.")
    d.add_heading("Objetivos y Necesidades", level=2)
    d.add_paragraph("• Ofrecer un módulo inmersivo estable con visor Homido Grab que no requiera visores caros.", style='List Bullet')
    d.add_paragraph("• Administrar fácilmente desde una interfaz web tradicional los libros, videos e imágenes culturales.", style='List Bullet')
    d.add_paragraph("• Escalar el sistema de forma modular hacia las demás culturas vivas de Nayarit.", style='List Bullet')
    d.save(docx_path)
    print("Doc 1 generated.")

# ==============================================================================
# DOC 2: MATRIZ DE CONTEXTO DE USO
# ==============================================================================
def generate_doc2():
    pdf_path = os.path.join(BASE_DIR, "Matriz de Contexto de Uso (ISO 9241-210) Equipo 10.pdf")
    docx_path = os.path.join(BASE_DIR, "Matriz de Contexto de Uso (ISO 9241-210) Equipo 10.docx")
    authors = "Samir Adrián Cárdenas Gámez y Ulises Alejandro Bautista Meza"
    title = "ENTREGABLE FASE 1: MATRIZ DE CONTEXTO DE USO (ISO 9241-210:2019)"
    sub = "Especificación Técnica y Operativa del Kiosco VR en la Biblioteca Pública Profesor Solón Argüello"

    doc = SimpleDocTemplate(pdf_path, pagesize=letter, leftMargin=36, rightMargin=36, topMargin=36, bottomMargin=36)
    st = get_reportlab_styles()
    
    table_data = [
        [Paragraph("<b>Dimensión de Contexto</b>", st['table_header']), Paragraph("<b>Especificación Técnica y Operativa (ISO 9241-210)</b>", st['table_header'])],
        [
            Paragraph("<b>Hardware y Dispositivo</b>", st['table_cell_bold']),
            Paragraph("• Smartphone gama de entrada (Android/iOS, pantalla HD 720p, 5.5 a 6.5 pulgadas).<br/>• Visor pasivo Homido Grab (FOV ~100°, botón mecánico capacitivo superior, ajuste interpupilar).<br/>• Sensores obligatorios: Giroscopio y acelerómetro para orientación angular 3DOF (rotación 360°).", st['table_cell'])
        ],
        [
            Paragraph("<b>Motor Gráfico y Optimización</b>", st['table_cell_bold']),
            Paragraph("• WebGL con React Three Fiber / Three.js optimizado para WebXR y modo estéreo split-screen.<br/>• Escena 3D estática e ilustrativa (cero físicas ni animaciones esqueletales para no saturar la GPU).<br/>• Assets comprimidos con Draco/Meshopt (< 5 MB totales). Tasa de 60 FPS estables.", st['table_cell'])
        ],
        [
            Paragraph("<b>Estructura de UI en VR</b>", st['table_cell_bold']),
            Paragraph("• Menú 2D flotante central estático (videos MP4 H.264 ligeros a 720p/480p, costumbres, fiestas, lengua).<br/>• Panel lateral dinámico con portadas de libros recomendados de la biblioteca.<br/>• Interacción dual: Botón físico del Homido Grab o fijación visual (Gaze Fuse) con temporizador de 1.2 segundos.", st['table_cell'])
        ],
        [
            Paragraph("<b>Condiciones de Red y Carga</b>", st['table_cell_bold']),
            Paragraph("• Red Wi-Fi de la Biblioteca Solón Argüello (ancho de banda moderado).<br/>• Carga inicial ultrarrápida (< 3 segundos). PWA con almacenamiento en caché para resiliencia ante caídas de señal.", st['table_cell'])
        ],
        [
            Paragraph("<b>Entorno Físico y Ergonomía</b>", st['table_cell_bold']),
            Paragraph("• Sala de lectura / Kiosco cultural de la biblioteca. Silla giratoria 360° para visualización sin desplazamiento.<br/>• Usuario sentado en posición fija (cero locomoción para prevenir caídas y cinetosis).<br/>• Mostrador de atención contiguo para que el usuario solicite los libros físicos recomendados.", st['table_cell'])
        ],
        [
            Paragraph("<b>Panel Administrativo (Backend 2D)</b>", st['table_cell_bold']),
            Paragraph("• Interfaz web tradicional para el personal de la biblioteca.<br/>• Módulo de gestión (CRUD) de libros recomendados, videos, imágenes y administración de accesos.", st['table_cell'])
        ],
        [
            Paragraph("<b>Escenario Habitual de Uso</b>", st['table_cell_bold']),
            Paragraph("1. El usuario se sienta en la silla giratoria y escanea el QR en el kiosco.<br/>2. La app 2D muestra la bienvenida y activa la pantalla dividida con guía de centrado interocular.<br/>3. Monta el teléfono en el visor Homido Grab.<br/>4. Explora la escena 3D y el menú central (videos de fiestas y lengua Wixárika).<br/>5. Descubre portadas de libros recomendados en el panel lateral.<br/>6. Se retira el visor y solicita el libro en físico al personal de la biblioteca.", st['table_cell'])
        ]
    ]

    t = Table(table_data, colWidths=[150, 390])
    t.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (1,0), C_PRIMARY),
        ('ALIGN', (0,0), (-1,-1), 'LEFT'),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('TEXTCOLOR', (0,0), (-1,0), colors.white),
        ('GRID', (0,0), (-1,-1), 0.5, C_BORDER),
        ('BACKGROUND', (0,1), (0,-1), C_LIGHT),
        ('TOPPADDING', (0,0), (-1,-1), 4),
        ('BOTTOMPADDING', (0,0), (-1,-1), 4),
        ('LEFTPADDING', (0,0), (-1,-1), 6),
        ('RIGHTPADDING', (0,0), (-1,-1), 6),
    ]))

    story = [
        Paragraph("TALLER FULL STACK | SEMESTRE VII | EQUIPO 10", st['meta']),
        Paragraph("Proyecto: Módulo Inmersivo WebXR para la Difusión de las Culturas Vivas de Nayarit y Fomento a la Lectura<br/>Sede: Biblioteca Pública Profesor Solón Argüello (Tepic, Nayarit)", st['subtitle']),
        Paragraph(title, st['title']),
        Paragraph(f"<b>Sección Elaborada por:</b> {authors}", st['authors']),
        HRFlowable(width="100%", thickness=1, color=C_SECONDARY, spaceAfter=8),
        t
    ]
    doc.build(story)

    # DOCX
    d = Document()
    create_docx_header(d, title, sub, authors)
    t_docx = d.add_table(rows=len(table_data), cols=2)
    t_docx.alignment = WD_TABLE_ALIGNMENT.CENTER
    for r_idx, row in enumerate(table_data):
        for c_idx, cell_content in enumerate(row):
            cell = t_docx.cell(r_idx, c_idx)
            # plain text version
            text_val = cell_content.text.replace('<b>','').replace('</b>','').replace('<br/>','\n').replace('• ','- ')
            cell.text = text_val
            if r_idx == 0:
                set_docx_cell_bg(cell, "1E3A8A")
                for p in cell.paragraphs:
                    for r in p.runs:
                        r.font.color.rgb = RGBColor(255, 255, 255)
                        r.bold = True
            elif c_idx == 0:
                set_docx_cell_bg(cell, "F8FAFC")
                for p in cell.paragraphs:
                    for r in p.runs:
                        r.bold = True
    d.save(docx_path)
    print("Doc 2 generated.")

# ==============================================================================
# DOC 3: HISTORIAS DE USUARIO
# ==============================================================================
def generate_doc3():
    pdf_path = os.path.join(BASE_DIR, "Historias de Usuario (ISO 9241-210) Equipo 10.pdf")
    docx_path = os.path.join(BASE_DIR, "Historias de Usuario (ISO 9241-210) Equipo 10.docx")
    authors = "Eddie David Altamirano Plantillas y Luis Carlos Durán Ocampo"
    title = "ENTREGABLE FASE 2: HISTORIAS DE USUARIO (ISO 9241-210:2019)"
    sub = "Especificación de Requerimientos Funcionales bajo Enfoque Ágil y Centrado en el Humano"

    doc = SimpleDocTemplate(pdf_path, pagesize=letter, leftMargin=36, rightMargin=36, topMargin=36, bottomMargin=36)
    st = get_reportlab_styles()

    story = [
        Paragraph("TALLER FULL STACK | SEMESTRE VII | EQUIPO 10", st['meta']),
        Paragraph("Proyecto: Módulo Inmersivo WebXR para la Difusión de las Culturas Vivas de Nayarit y Fomento a la Lectura<br/>Sede: Biblioteca Pública Profesor Solón Argüello (Tepic, Nayarit)", st['subtitle']),
        Paragraph(title, st['title']),
        Paragraph(f"<b>Sección Elaborada por:</b> {authors}", st['authors']),
        HRFlowable(width="100%", thickness=1, color=C_SECONDARY, spaceAfter=6),
        
        Paragraph("1. HISTORIAS DE USUARIO: MÓDULO VR INMERSIVO (VISITANTE / LECTOR)", st['h1']),
        
        Paragraph("<b>HU-01: Inicialización Estereoscópica y Calibración para Homido Grab</b>", st['h2']),
        Paragraph("<b>Como</b> visitante de la biblioteca en el kiosco cultural,<br/><b>quiero</b> pulsar el botón 'Iniciar Recorrido Wixárika' en la web y visualizar la pantalla dividida con línea central de alineación,<br/><b>para</b> colocar con precisión el teléfono en el visor Homido Grab sin imágenes dobles ni distorsiones ópticas.", st['body']),
        
        Paragraph("<b>HU-02: Visualización en Entorno 3D Estático y Posición Fija</b>", st['h2']),
        Paragraph("<b>Como</b> usuario que utiliza un teléfono móvil de gama de entrada,<br/><b>quiero</b> que el entorno 3D ceremonial sea estático y mi posición esté fija en una silla giratoria virtual,<br/><b>para</b> disfrutar de una inmersión visual a 60 FPS estables sin sobrecalentar el teléfono ni sufrir mareos por cinetosis.", st['body']),

        Paragraph("<b>HU-03: Menú Central Flotante Fijo con Contenidos Culturales</b>", st['h2']),
        Paragraph("<b>Como</b> visitante explorando la cultura Wixárika,<br/><b>quiero</b> tener un menú 2D flotante siempre visible al frente con secciones de Cosmovisión, Fiestas Patronales, Tradiciones y Lengua,<br/><b>para</b> seleccionar de manera clara y cómoda qué manifestación cultural deseo conocer.", st['body']),

        Paragraph("<b>HU-04: Reproducción de Cápsulas de Video y Multimedia Optimizada</b>", st['h2']),
        Paragraph("<b>Como</b> usuario interesado en las tradiciones vivas,<br/><b>quiero</b> activar la reproducción de videos ligeros y fotos en alta definición dentro de la pantalla del menú central,<br/><b>para</b> escuchar los cantos tradicionales del Mara'akame y ver las artesanías en chaquira sin bloqueos en el navegador.", st['body']),

        Paragraph("<b>HU-05: Panel Lateral de Libros Recomendados de la Biblioteca</b>", st['h2']),
        Paragraph("<b>Como</b> estudiante con curiosidad por profundizar en la cultura observada,<br/><b>quiero</b> que se despliegue un panel lateral con portadas y títulos de libros disponibles en la Biblioteca Solón Argüello relacionados con la sección activa,<br/><b>para</b> identificar fácilmente qué libro físico puedo pedir al personal al concluir la sesión.", st['body']),

        Paragraph("<b>HU-06: Interacción Rápida con Botón Capacitivo y Gaze Fuse (1.2 segundos)</b>", st['h2']),
        Paragraph("<b>Como</b> usuario con el visor Homido Grab colocado,<br/><b>quiero</b> presionar el botón mecánico superior del visor o fijar mi mirada en un botón durante 1.2 segundos,<br/><b>para</b> activar opciones rápidamente con una sola mano o en modo manos libres sin fatiga en el cuello.", st['body']),

        Paragraph("<b>HU-07: Finalización y Llamado a la Acción para Préstamo Bibliográfico</b>", st['h2']),
        Paragraph("<b>Como</b> visitante que termina el recorrido inmersivo,<br/><b>quiero</b> seleccionar 'Concluir Visita', retirar el visor y ver un resumen con los libros recomendados en la pantalla 2D,<br/><b>para</b> mostrárselo directamente al bibliotecario y solicitar el ejemplar en préstamo físico.", st['body']),

        Spacer(1, 4),
        Paragraph("2. HISTORIAS DE USUARIO: PANEL ADMINISTRATIVO 2D (PERSONAL DE BIBLIOTECA)", st['h1']),

        Paragraph("<b>HU-08: Gestión de Libros Recomendados en Catálogo (CRUD)</b>", st['h2']),
        Paragraph("<b>Como</b> bibliotecaria y mediadora cultural,<br/><b>quiero</b> dar de alta, editar y vincular portadas y fichas de libros físicos a las distintas secciones culturales desde un panel web 2D,<br/><b>para</b> mantener actualizado el catálogo que se recomienda a los usuarios dentro del visor.", st['body']),

        Paragraph("<b>HU-09: Gestión de Contenidos Multimedia y Nuevas Culturas de Nayarit</b>", st['h2']),
        Paragraph("<b>Como</b> administradora del sistema,<br/><b>quiero</b> actualizar enlaces de videos, fotos y textos explicativos, con arquitectura modular para agregar futuras culturas (Coras, Tepehuanos, Mexicaneros),<br/><b>para</b> enriquecer la oferta cultural de la biblioteca conforme al calendario institucional.", st['body']),

        Paragraph("<b>HU-10: Autenticación Segura de Administrador</b>", st['h2']),
        Paragraph("<b>Como</b> personal autorizado de la biblioteca,<br/><b>quiero</b> iniciar sesión con credenciales seguras,<br/><b>para</b> proteger el catálogo y evitar alteraciones no autorizadas a los recursos del kiosco.", st['body'])
    ]
    doc.build(story)

    # DOCX
    d = Document()
    create_docx_header(d, title, sub, authors)
    d.add_heading("1. Historias de Usuario: Módulo VR Inmersivo (Visitante / Lector)", level=1)
    
    hus = [
        ("HU-01: Inicialización Estereoscópica y Calibración para Homido Grab",
         "Como visitante de la biblioteca en el kiosco cultural, quiero pulsar 'Iniciar Recorrido Wixárika' y ver la pantalla dividida con guía de centrado, para colocar el smartphone en el visor Homido Grab sin visión doble."),
        ("HU-02: Visualización en Entorno 3D Estático y Posición Fija",
         "Como usuario con teléfono de gama de entrada, quiero estar en posición fija en un entorno 3D estático, para disfrutar de la experiencia a 60 FPS estables sin sobrecalentar el móvil ni marearme."),
        ("HU-03: Menú Central Flotante Fijo con Contenidos Culturales",
         "Como visitante explorando la cultura Wixárika, quiero un menú 2D flotante siempre visible al frente con secciones de Cosmovisión, Fiestas, Tradiciones y Lengua, para elegir qué tema explorar."),
        ("HU-04: Reproducción de Cápsulas de Video y Multimedia Optimizada",
         "Como usuario interesado en las tradiciones vivas, quiero reproducir videos y fotos en el menú central, para apreciar los cantos del Mara'akame y artesanías sin congelamientos."),
        ("HU-05: Panel Lateral de Libros Recomendados de la Biblioteca",
         "Como estudiante interesado en profundizar, quiero ver un panel lateral con portadas de libros de la biblioteca relacionados con la sección activa, para solicitarlos en préstamo al salir."),
        ("HU-06: Interacción Rápida con Botón Capacitivo y Gaze Fuse (1.2 segundos)",
         "Como usuario con el visor colocado, quiero activar botones con el botón superior del Homido Grab o fijando la vista 1.2 segundos, para navegar ágilmente sin cansar el cuello."),
        ("HU-07: Finalización y Llamado a la Acción para Préstamo Bibliográfico",
         "Como visitante que concluye el recorrido, quiero pulsar 'Concluir Visita' y ver un resumen con las portadas de libros para mostrárselo al bibliotecario y solicitar el ejemplar en físico.")
    ]
    for hu_title, hu_desc in hus:
        d.add_heading(hu_title, level=2)
        d.add_paragraph(hu_desc)

    d.add_heading("2. Historias de Usuario: Panel Administrativo 2D (Personal Bibliotecario)", level=1)
    admin_hus = [
        ("HU-08: Gestión de Libros Recomendados en Catálogo (CRUD)",
         "Como bibliotecaria, quiero agregar y editar portadas y fichas de libros desde una interfaz web tradicional, para mantener actualizadas las recomendaciones exhibidas en el visor."),
        ("HU-09: Gestión de Contenidos Multimedia y Nuevas Culturas Vivas",
         "Como administradora cultural, quiero gestionar videos y fotos y contar con soporte modular para agregar culturas (Coras, Tepehuanos, Mexicaneros), para enriquecer la experiencia según el programa anual."),
        ("HU-10: Autenticación Segura de Administrador",
         "Como personal de la biblioteca, quiero iniciar sesión con credenciales protegidas, para asegurar la integridad de la información del kiosco cultural.")
    ]
    for hu_title, hu_desc in admin_hus:
        d.add_heading(hu_title, level=2)
        d.add_paragraph(hu_desc)

    d.save(docx_path)
    print("Doc 3 generated.")

# ==============================================================================
# DOC 4: CRITERIOS DE ACEPTACIÓN Y USABILIDAD
# ==============================================================================
def generate_doc4():
    pdf_path = os.path.join(BASE_DIR, "Criterios de Aceptación y Usabilidad (ISO 9241-210) Equipo 10.pdf")
    docx_path = os.path.join(BASE_DIR, "Criterios de Aceptación y Usabilidad (ISO 9241-210) Equipo 10.docx")
    authors = "Samir Adrián Cárdenas Gámez y Ulises Alejandro Bautista Meza"
    title = "ENTREGABLE FASE 2: CRITERIOS DE ACEPTACIÓN Y USABILIDAD (ISO 9241-210:2019)"
    sub = "Requisitos de Rendimiento en Gama Baja, Accesibilidad WCAG 2.1 y Prevención de Errores"

    doc = SimpleDocTemplate(pdf_path, pagesize=letter, leftMargin=36, rightMargin=36, topMargin=36, bottomMargin=36)
    st = get_reportlab_styles()

    story = [
        Paragraph("TALLER FULL STACK | SEMESTRE VII | EQUIPO 10", st['meta']),
        Paragraph("Proyecto: Módulo Inmersivo WebXR para la Difusión de las Culturas Vivas de Nayarit y Fomento a la Lectura<br/>Sede: Biblioteca Pública Profesor Solón Argüello (Tepic, Nayarit)", st['subtitle']),
        Paragraph(title, st['title']),
        Paragraph(f"<b>Sección Elaborada por:</b> {authors}", st['authors']),
        HRFlowable(width="100%", thickness=1, color=C_SECONDARY, spaceAfter=6),
        
        Paragraph("1. REQUISITOS DE EFICIENCIA Y RENDIMIENTO TÉCNICO (HARDWARE DE GAMA BAJA)", st['h1']),
        Paragraph("• <b>Optimización de Geometría y Escena 3D:</b> El entorno ceremonial Wixárika debe ser estrictamente estático, con una carga poligonal total inferior a 8,000 polígonos. Cero físicas de colisión en tiempo real ni esqueletos de animación que saturen la GPU del smartphone.", st['bullet']),
        Paragraph("• <b>Compresión de Assets:</b> Todos los modelos 3D y texturas deben estar comprimidos con Draco y KTX2/WebP, limitando el peso total de descarga inicial a menos de 5 MB.", st['bullet']),
        Paragraph("• <b>Streaming de Video Ligero:</b> Las cápsulas de video (cantos, fiestas y lengua) se codificarán en MP4/H.264 a 720p/480p con un bitrate optimizado menor a 1.2 Mbps, transmitidas mediante HTTP Range requests para inicio instantáneo sin sobrecalentar el procesador.", st['bullet']),
        Paragraph("• <b>Tasa de Fotogramas Estable:</b> Mantener 60 FPS estables en modo split-screen en smartphones de gama de entrada con resolución HD 720p.", st['bullet']),
        Paragraph("• <b>Tiempo de Carga Inicial:</b> La aplicación en React debe mostrar la interfaz interactiva en menos de 3.5 segundos sobre la red Wi-Fi de la biblioteca.", st['bullet']),

        Paragraph("2. REQUISITOS DE ACCESIBILIDAD Y USABILIDAD WCAG 2.1 EN ENTORNO VR", st['h1']),
        Paragraph("• <b>Tamaño Angular Mínimo de Botones en VR:</b> Todo botón interactivo del menú central y lateral debe subtender un ángulo visual mínimo de 5.5° en el campo de visión (FOV), garantizando que el usuario apunte con facilidad sin movimientos bruscos de cabeza.", st['bullet']),
        Paragraph("• <b>Contraste de Color (Nivel AAA):</b> Los paneles informativos y fichas de libros utilizarán fondo oscuro translúcido (rgba(15, 23, 42, 0.92)) con tipografía blanca o dorada brillante (#fde047), asegurando un ratio de contraste superior a 7:1 para lectura nítida a través de las lentes del visor.", st['bullet']),
        Paragraph("• <b>Mecanismo de Interacción Dual Calibrado:</b> Activación inmediata al presionar el botón mecánico capacitivo del Homido Grab, o mediante fijación de mirada (Gaze Fuse) con animación circular de progreso de exactamente 1.2 segundos (evitando fatiga en el cuello).", st['bullet']),
        Paragraph("• <b>Legibilidad de Portadas Bibliográficas:</b> Las portadas de los libros recomendados en el panel lateral se proyectarán a una distancia virtual de 2.2 metros, complementadas con un título y autor en tipografía de alto contraste legible sin esfuerzo ocular.", st['bullet']),

        Paragraph("3. REQUISITOS DE PREVENCIÓN DE ERRORES, ERGONOMÍA Y SEGURIDAD (ISO 9241-210)", st['h1']),
        Paragraph("• <b>Guía de Centrado Interocular:</b> La pantalla 2D previa al modo inmersivo mostrará una línea divisoria vertical roja/blanca y un icono de lentes para alinear con precisión el centro del smartphone con el tabique del Homido Grab antes de cerrarlo.", st['bullet']),
        Paragraph("• <b>Ergonomía y Cero Cinetosis:</b> El usuario permanecerá en posición virtual fija dentro de la escena. La navegación panorámica se realizará mediante una silla giratoria física de 360°, eliminando traslaciones forzadas en la cámara para erradicar cualquier síntoma de mareo o vértigo.", st['bullet']),
        Paragraph("• <b>Menú Central con Retorno Rápido:</b> El menú principal estará anclado en posición espacial fija. Si el usuario gira 180° y desea reorientarse, dispondrá de una flecha guía discreta en la retícula que señala la ubicación del menú.", st['bullet']),
        Paragraph("• <b>Prevención de Errores en Panel Administrativo:</b> El formulario de registro de libros en el backend validará campos requeridos (título, autor, imagen de portada, sección cultural) y solicitará confirmación modal obligatoria antes de eliminar cualquier registro.", st['bullet'])
    ]
    doc.build(story)

    # DOCX
    d = Document()
    create_docx_header(d, title, sub, authors)
    d.add_heading("1. Requisitos de Eficiencia y Rendimiento (Hardware Gama de Entrada)", level=1)
    d.add_paragraph("• Entorno 3D estático e ilustrativo con menos de 8,000 polígonos totales, sin físicas ni mallas dinámicas para proteger la GPU móvil.", style='List Bullet')
    d.add_paragraph("• Peso total de assets 3D comprimidos con Draco menor a 5 MB.", style='List Bullet')
    d.add_paragraph("• Videos ligeros en MP4/H.264 (720p/480p, bitrate < 1.2 Mbps) con streaming bajo demanda.", style='List Bullet')
    d.add_paragraph("• Tasa de 60 FPS estables en resolución 720p sin sobrecalentamiento térmico.", style='List Bullet')
    
    d.add_heading("2. Requisitos de Accesibilidad y Usabilidad WCAG 2.1 en VR", level=1)
    d.add_paragraph("• Tamaño angular de botones interactivos de al menos 5.5° del campo de visión (FOV).", style='List Bullet')
    d.add_paragraph("• Ratio de contraste superior a 7:1 (Nivel AAA) en textos explicativos y títulos de libros sobre fondo oscuro.", style='List Bullet')
    d.add_paragraph("• Interacción dual: Botón físico capacitivo del Homido Grab o fijación visual (Gaze Fuse) calibrado a 1.2 segundos.", style='List Bullet')
    d.add_paragraph("• Portadas de libros proyectadas con tipografía nítida legible a 2.2 metros virtuales.", style='List Bullet')

    d.add_heading("3. Prevención de Errores, Ergonomía y Seguridad (ISO 9241-210)", level=1)
    d.add_paragraph("• Guía visual de centrado interocular en pantalla antes de introducir el celular al visor.", style='List Bullet')
    d.add_paragraph("• Posición fija en silla giratoria 360° para anular el mareo por cinetosis.", style='List Bullet')
    d.add_paragraph("• Menú central fijo con indicador sutil de orientación para evitar desorientación espacial.", style='List Bullet')
    d.add_paragraph("• Validaciones y modales de confirmación en el panel administrativo 2D.", style='List Bullet')
    d.save(docx_path)
    print("Doc 4 generated.")

# ==============================================================================
# DOC 5: DIAGRAMA DE FLUJO DE USUARIOS
# ==============================================================================
def generate_doc5():
    pdf_path = os.path.join(BASE_DIR, "Diagrama de flujo de usuarios (ISO 9241-210) Equipo 10.pdf")
    docx_path = os.path.join(BASE_DIR, "Diagrama de flujo de usuarios (ISO 9241-210) Equipo 10.docx")
    authors = "Ulises Alejandro Bautista Meza y Samir Adrián Cárdenas Gámez"
    title = "ENTREGABLE FASE 3: DIAGRAMA DE FLUJO DE USUARIOS (ISO 9241-210:2019)"
    sub = "Estructura Lógica de Navegación del Kiosco VR y del Panel Web de Gestión Bibliotecaria"

    doc = SimpleDocTemplate(pdf_path, pagesize=letter, leftMargin=36, rightMargin=36, topMargin=36, bottomMargin=36)
    st = get_reportlab_styles()

    story = [
        Paragraph("TALLER FULL STACK | SEMESTRE VII | EQUIPO 10", st['meta']),
        Paragraph("Proyecto: Módulo Inmersivo WebXR para la Difusión de las Culturas Vivas de Nayarit y Fomento a la Lectura<br/>Sede: Biblioteca Pública Profesor Solón Argüello (Tepic, Nayarit)", st['subtitle']),
        Paragraph(title, st['title']),
        Paragraph(f"<b>Sección Elaborada por:</b> {authors}", st['authors']),
        HRFlowable(width="100%", thickness=1, color=C_SECONDARY, spaceAfter=6),
        
        Paragraph("FLUJO PRINCIPAL 1: EXPERIENCIA INMERSIVA VR DEL VISITANTE EN LA BIBLIOTECA", st['h1']),
        Paragraph("<b>Objetivo del Usuario:</b> Conocer las manifestaciones vivas de la cultura Wixárika mediante un recorrido virtual inmersivo y descubrir libros recomendados para solicitar en préstamo físico.", st['body']),
        
        Paragraph("<b>Paso 1: Llegada al Kiosco y Escaneo QR</b><br/>El visitante toma asiento en la silla giratoria del área cultural de la Biblioteca Solón Argüello y escanea el código QR del kiosco con su teléfono (o utiliza el dispositivo provisto).", st['bullet']),
        Paragraph("<b>Paso 2: Pantalla de Bienvenida 2D e Instrucciones</b><br/>La web en React carga la pantalla 2D con una breve introducción a las Culturas Vivas de Nayarit, indicando que el recorrido comenzará con el pueblo Wixárika como primera fase.", st['bullet']),
        Paragraph("<b>Paso 3: Verificación de Sensores y Modo Split-Screen</b><br/>El usuario pulsa 'Iniciar Experiencia VR'. El sistema valida la presencia de giroscopio y WebXR. Se activa la vista estereoscópica en pantalla dividida con la línea vertical de centrado interocular.", st['bullet']),
        Paragraph("<b>Paso 4: Inserción en Visor Homido Grab</b><br/>El usuario alinea el smartphone con la guía, lo coloca dentro del visor Homido Grab, ajusta las correas y sujeta el visor orientando su mirada hacia el frente.", st['bullet']),
        Paragraph("<b>Paso 5: Lobby 3D y Menú Central Flotante</b><br/>Inicia la experiencia en un entorno 3D estático representativo. Al frente flota un menú 2D con los módulos: <i>Cosmovisión, Costumbres, Fiestas Patronales</i> y <i>Lengua</i>.", st['bullet']),
        Paragraph("<b>Paso 6: Exploración Multimedia y Panel Lateral de Libros</b><br/>Al enfocar una sección con la retícula (1.2 s) o pulsar el botón del visor:<br/>• En la pantalla central se reproduce un video ligero o galería explicativa.<br/>• En el panel lateral derecho se actualizan automáticamente las <b>portadas de libros recomendados</b> disponibles en la biblioteca vinculados al tema.", st['bullet']),
        Paragraph("<b>Paso 7: Rotación Panorámica 360°</b><br/>El usuario rota libremente en la silla giratoria para contemplar el entorno paisajístico y puede regresar al menú central en cualquier momento.", st['bullet']),
        Paragraph("<b>Paso 8: Conclusión y Solicitud del Libro Físico</b><br/>El usuario selecciona 'Finalizar Experiencia', se retira las gafas y la pantalla del teléfono muestra un resumen con los títulos y autores recomendados para presentarlo al bibliotecario y tramitar el préstamo.", st['bullet']),

        Spacer(1, 4),
        Paragraph("FLUJO SECUNDARIO 2: PANEL ADMINISTRATIVO 2D (PERSONAL BIBLIOTECARIO)", st['h1']),
        Paragraph("<b>Objetivo del Administrador:</b> Gestionar de forma autónoma el catálogo de libros recomendados y el material multimedia de las culturas vivas.", st['body']),
        Paragraph("<b>Paso A: Acceso Seguro al Sistema</b><br/>La bibliotecaria ingresa a la ruta administrativa web, introduce usuario y contraseña para autenticarse.", st['bullet']),
        Paragraph("<b>Paso B: Dashboard de Administración</b><br/>Visualiza el panel de control con métricas de visitas al kiosco y el listado de culturas activas (Wixárika activa; Na'ayeri, O'dam y Mexicanero en preparación).", st['bullet']),
        Paragraph("<b>Paso C: Gestión de Libros Recomendados (CRUD)</b><br/>Selecciona una cultura y sección temática. Puede agregar un nuevo libro (subiendo la imagen de portada, título, autor y código de estante), editar datos o desvincular títulos agotados.", st['bullet']),
        Paragraph("<b>Paso D: Publicación Inmediata</b><br/>Al guardar los cambios, la base de datos actualiza el API y el menú lateral en el visor VR refleja inmediatamente los nuevos libros recomendados.", st['bullet'])
    ]
    doc.build(story)

    # DOCX
    d = Document()
    create_docx_header(d, title, sub, authors)
    d.add_heading("Flujo Principal 1: Experiencia Inmersiva VR del Visitante en la Biblioteca", level=1)
    steps = [
        ("Paso 1: Llegada al Kiosco y Escaneo QR", "El visitante se sienta en la silla giratoria del kiosco en la Biblioteca Solón Argüello y escanea el código QR."),
        ("Paso 2: Bienvenida 2D e Instrucciones", "Carga la web en React con la introducción a las Culturas Vivas de Nayarit y el enfoque inicial en la cultura Wixárika."),
        ("Paso 3: Verificación Técnica y Calibración", "Se verifica el giroscopio y WebXR. Se activa la pantalla dividida (split-screen) con guía central de centrado pupilar."),
        ("Paso 4: Inserción en Visor Homido Grab", "El usuario coloca el smartphone en el visor, ajusta las correas y enfoca la mirada al centro."),
        ("Paso 5: Lobby 3D y Menú Central Flotante", "Aparece la escena 3D estática ceremonial y un menú central flotante fijo con módulos culturales."),
        ("Paso 6: Exploración Multimedia y Panel Lateral de Libros", "Al activar un tema con el botón del visor o Gaze Fuse (1.2s): el menú central reproduce video/fotos y el panel lateral muestra las portadas de libros recomendados."),
        ("Paso 7: Rotación Panorámica 360°", "El usuario rota en la silla giratoria observando el entorno 360° con total estabilidad y sin mareos."),
        ("Paso 8: Retiro del Visor y Solicitud del Libro Físico", "Pulsa 'Finalizar', se quita el visor y la pantalla muestra las portadas y datos del libro para solicitarlo en ventanilla.")
    ]
    for st_title, st_desc in steps:
        d.add_heading(st_title, level=2)
        d.add_paragraph(st_desc)

    d.add_heading("Flujo Secundario 2: Panel Administrativo 2D (Personal Bibliotecario)", level=1)
    admin_steps = [
        ("Paso A: Inicio de Sesión", "La bibliotecaria ingresa con credenciales autorizadas al panel administrativo."),
        ("Paso B: Dashboard de Culturas Vivas", "Visualiza el listado de módulos (Wixárika activa y futuras culturas de Nayarit)."),
        ("Paso C: Gestión de Libros y Multimedia (CRUD)", "Registra nuevas portadas de libros físicos, autores y cápsulas de video asociadas a cada sección."),
        ("Paso D: Publicación en Tiempo Real", "Los cambios se guardan y el visor VR actualiza de inmediato las recomendaciones exhibidas.")
    ]
    for ast_title, ast_desc in admin_steps:
        d.add_heading(ast_title, level=2)
        d.add_paragraph(ast_desc)

    d.save(docx_path)
    print("Doc 5 generated.")

if __name__ == "__main__":
    generate_doc1()
    generate_doc2()
    generate_doc3()
    generate_doc4()
    generate_doc5()
    print("All 5 D2 documents successfully generated in PDF and DOCX!")

