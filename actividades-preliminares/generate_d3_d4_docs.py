import os
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable, KeepTogether, PageBreak
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
        'title': ParagraphStyle('DocTitle', parent=styles['Normal'], fontName='Helvetica-Bold', fontSize=13, leading=17, textColor=C_PRIMARY, spaceAfter=2),
        'subtitle': ParagraphStyle('DocSubtitle', parent=styles['Normal'], fontName='Helvetica', fontSize=8.5, leading=12, textColor=C_MUTED, spaceAfter=3),
        'meta': ParagraphStyle('MetaInfo', parent=styles['Normal'], fontName='Helvetica-Bold', fontSize=7.5, leading=10, textColor=C_SECONDARY, spaceAfter=2),
        'authors': ParagraphStyle('AuthorsInfo', parent=styles['Normal'], fontName='Helvetica-Oblique', fontSize=7.5, leading=10, textColor=colors.HexColor(ACCENT_HEX), spaceAfter=5),
        'h1': ParagraphStyle('Heading1Custom', parent=styles['Normal'], fontName='Helvetica-Bold', fontSize=9.5, leading=13, textColor=C_PRIMARY, spaceBefore=6, spaceAfter=2),
        'h2': ParagraphStyle('Heading2Custom', parent=styles['Normal'], fontName='Helvetica-Bold', fontSize=8.5, leading=11, textColor=colors.HexColor(ACCENT_HEX), spaceBefore=3, spaceAfter=1.5),
        'body': ParagraphStyle('BodyCustom', parent=styles['Normal'], fontName='Helvetica', fontSize=7.5, leading=10, textColor=C_DARK, spaceAfter=2.5),
        'bullet': ParagraphStyle('BulletCustom', parent=styles['Normal'], fontName='Helvetica', fontSize=7.5, leading=10, textColor=C_DARK, leftIndent=10, spaceAfter=1.5),
        'table_cell': ParagraphStyle('TableCell', parent=styles['Normal'], fontName='Helvetica', fontSize=6.8, leading=9, textColor=C_DARK),
        'table_cell_bold': ParagraphStyle('TableCellBold', parent=styles['Normal'], fontName='Helvetica-Bold', fontSize=6.8, leading=9, textColor=C_PRIMARY),
        'table_header': ParagraphStyle('TableHeader', parent=styles['Normal'], fontName='Helvetica-Bold', fontSize=7.2, leading=9.5, textColor=colors.white)
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
# DOC 3: ESPECIFICACIONES TÉCNICAS
# ==============================================================================
def generate_d3():
    pdf_path = os.path.join(BASE_DIR, "D3. ESPECIFICACIONES TÉCNICAS Equipo 10.pdf")
    docx_path = os.path.join(BASE_DIR, "D3. ESPECIFICACIONES TÉCNICAS Equipo 10.docx")
    authors = "Equipo 10 (Eddie Altamirano, Luis Carlos Durán, Samir Cárdenas, Ulises Bautista)"
    title = "D3: ESPECIFICACIONES TÉCNICAS Y VIABILIDAD DE STACK"
    sub = "Arquitectura Full Stack, Modelo de Datos Relacional y Demostración de Viabilidad para VR en Móviles"

    doc = SimpleDocTemplate(pdf_path, pagesize=letter, leftMargin=36, rightMargin=36, topMargin=36, bottomMargin=36)
    st = get_reportlab_styles()

    story = [
        Paragraph("TALLER FULL STACK | SEMESTRE VII | EQUIPO 10", st['meta']),
        Paragraph("Proyecto: Módulo Inmersivo WebXR para la Difusión de las Culturas Vivas de Nayarit y Fomento a la Lectura<br/>Sede: Biblioteca Pública Profesor Solón Argüello (Tepic, Nayarit)", st['subtitle']),
        Paragraph(title, st['title']),
        Paragraph(f"<b>Sección Elaborada por:</b> {authors}", st['authors']),
        HRFlowable(width="100%", thickness=1, color=C_SECONDARY, spaceAfter=6),

        Paragraph("1. STACK TECNOLÓGICO SELECCIONADO Y JUSTIFICACIÓN TÉCNICA", st['h1']),
        
        Paragraph("<b>A. Frontend: Interfaz de Usuario y Módulo Inmersivo WebXR</b>", st['h2']),
        Paragraph("• <b>Tecnologías:</b> React 18, Vite, Three.js, React Three Fiber (@react-three/fiber, @react-three/drei, @react-three/xr), Tailwind CSS.", st['bullet']),
        Paragraph("• <b>Justificación Técnica:</b><br/>"
                  "- <i>React 18 + Vite:</i> Arquitectura basada en componentes reutilizables con tiempos de compilación instantáneos (HMR) y empaquetado optimizado mediante Rollup (cero dependencias innecesarias). Esto garantiza tiempos de carga inicial menores a 3.5 segundos sobre la red Wi-Fi de la biblioteca.<br/>"
                  "- <i>Three.js + React Three Fiber:</i> Abstracción declarativa del pipeline WebGL. Permite desacoplar el ciclo de renderizado de la escena 3D de la lógica de interfaz de usuario. Al utilizar una escena ceremonial estática (< 8,000 polígonos) y menús flotantes, se reduce drásticamente el consumo de memoria GPU y la temperatura en smartphones económicos.<br/>"
                  "- <i>WebXR Device API (@react-three/xr) con Fallback Estereoscópico:</i> Conexión directa a los sensores de orientación física (giroscopio y acelerómetro) para experiencia 3DOF sin requerir la instalación de apps nativas (APK/IPA). Si el navegador no activa la sesión inmersiva nativa, el fallback implementado en split-screen garantiza la compatibilidad con visores pasivos Homido Grab.<br/>"
                  "- <i>Tailwind CSS:</i> Framework de utilidades para maquetar con alta velocidad y mínimo peso tanto la pantalla 2D previa como el panel administrativo.", st['body']),

        Paragraph("<b>B. Backend: API RESTful y Servidor de Aplicación</b>", st['h2']),
        Paragraph("• <b>Tecnologías:</b> Node.js con Express, CORS, Morgan, Helmet.", st['bullet']),
        Paragraph("• <b>Justificación Técnica:</b><br/>"
                  "- <i>Unificación de Lenguaje:</i> Permite al equipo Full Stack utilizar JavaScript/TypeScript en todo el ciclo de desarrollo, reduciendo la fricción de cambio de contexto.<br/>"
                  "- <i>I/O No Bloqueante Asíncrono:</i> Altamente eficiente para despachar peticiones concurrentes de catálogo (libros, videos, fotos) y servir transmisiones HTTP Range para las cápsulas de video sin bloquear el Event Loop.<br/>"
                  "- <i>Arquitectura Desacoplada:</i> Endpoints RESTful claros y modulares (`/api/v1/culturas`, `/api/v1/libros`, `/api/v1/multimedia`, `/api/v1/auth`), lo que permite que el cliente VR solo consuma JSON ligero.", st['body']),

        Paragraph("<b>C. Base de Datos: Persistencia y Modelo Relacional Escalable</b>", st['h2']),
        Paragraph("• <b>Tecnologías:</b> PostgreSQL con Prisma ORM.", st['bullet']),
        Paragraph("• <b>Justificación Técnica:</b><br/>"
                  "- <i>Integridad Referencial ACID:</i> Esencial para vincular de forma estricta los libros físicos disponibles en la biblioteca con las secciones culturales pertinentes.<br/>"
                  "- <i>Arquitectura Modular para las Culturas Vivas de Nayarit:</i> La estructura de datos cuenta con una entidad maestra `culturas` (id, nombre, descripcion, activa) y entidades secundarias `secciones`, `libros_recomendados` y `recursos_multimedia`. El MVP comienza exclusivamente con la cultura Wixárika para garantizar máxima calidad; una vez aprobado por el cliente, la adición de las culturas Cora (Na'ayeri), Tepehuano (O'dam) y Mexicanero se realiza insertando nuevos registros sin modificar el código ni el esquema.<br/>"
                  "- <i>Prisma ORM:</i> Garantiza tipado seguro en tiempo de compilación, migraciones reproducibles y prevención automática de inyecciones SQL.", st['body']),

        Paragraph("<b>D. Autenticación y Seguridad</b>", st['h2']),
        Paragraph("• <b>Tecnologías:</b> JWT (JSON Web Tokens) en cookies HTTP-Only, Bcrypt (10 salt rounds), validación de esquemas con Zod.", st['bullet']),
        Paragraph("• <b>Justificación Técnica:</b><br/>"
                  "- <i>Separación de Perfiles:</i> El acceso al módulo VR público en el kiosco es 100% libre de credenciales (consumo anónimo de solo lectura con caché perimetral).<br/>"
                  "- <i>Protección del Panel de Gestión:</i> Los endpoints de creación, edición y borrado (POST, PUT, DELETE) están estrictamente restringidos al personal bibliotecario mediante tokens JWT firmados y expiración automática, impidiendo manipulaciones no autorizadas al catálogo cultural.", st['body']),

        Paragraph("<b>E. Infraestructura, Despliegue y Repositorio</b>", st['h2']),
        Paragraph("• <b>Hosting Frontend / WebXR:</b> Cloudflare Pages (CDN perimetral global, compresión Brotli, HTTPS estricto indispensable para activar la API de WebXR en Chrome móvil).<br/>"
                  "• <b>Hosting Backend y Base de Datos:</b> Render / Supabase con certificado SSL administrado y conexión cifrada TLS.<br/>"
                  "• <b>Repositorio GitHub:</b> https://github.com/demsam/PruebasVR.demsam", st['body']),

        Spacer(1, 4),
        Paragraph("2. DEMOSTRACIÓN DE VIABILIDAD TÉCNICA (DEMO FUNCIONAL PARA EVALUACIÓN)", st['h1']),
        Paragraph("Para validar y aprobar el stack ante la maestra Myrna, el equipo cuenta con una <b>Demo Funcional Operativa</b> en el repositorio, la cual demuestra:", st['body']),
        Paragraph("1. <b>Control de Giroscopio y Orientación de Cabeza:</b> Integración de `DeviceOrientationControls` y matrices de vista estereoscópica que responden a la rotación angular del usuario en tiempo real.", st['bullet']),
        Paragraph("2. <b>Modo Estereoscópico Split-Screen Calibrado:</b> Renderizado de doble cámara sincronizada con línea de centrado pupilar adaptada a las ópticas del visor Homido Grab.", st['bullet']),
        Paragraph("3. <b>Menú Espacial 3D Flotante con Gaze Fuse (1.2 s):</b> Interacción manos libres mediante retícula central con temporizador circular y respuesta instantánea al botón mecánico superior del visor.", st['bullet']),
        Paragraph("4. <b>Rendimiento Estable a 60 FPS:</b> Verificación de que la arquitectura sin físicas pesadas mantiene fluidez constante y sin sobrecalentamiento en celulares de gama de entrada.", st['bullet'])
    ]

    doc.build(story)

    # DOCX
    d = Document()
    create_docx_header(d, title, sub, authors)
    d.add_heading("1. Stack Tecnológico Seleccionado y Justificación", level=1)
    
    sections = [
        ("A. Frontend: Interfaz de Usuario y Módulo Inmersivo WebXR",
         "• Tecnologías: React 18, Vite, Three.js, React Three Fiber (@react-three/xr), Tailwind CSS.\n"
         "• Justificación:\n"
         "  - React 18 + Vite: Modularidad por componentes, empaquetado optimizado y tiempos de carga < 3.5 s.\n"
         "  - Three.js + React Three Fiber: Renderizado WebGL declarativo de bajo consumo para GPU móvil.\n"
         "  - WebXR API + Fallback Split-Screen: Compatibilidad directa con sensores y visores Homido Grab sin instalar APK.\n"
         "  - Tailwind CSS: Estilos utilitarios rápidos y ligeros para la pantalla 2D y el panel administrativo."),
        ("B. Backend: API RESTful y Servidor de Aplicación",
         "• Tecnologías: Node.js con Express, CORS, Helmet.\n"
         "• Justificación:\n"
         "  - Unificación de lenguaje JavaScript para todo el equipo Full Stack.\n"
         "  - Arquitectura I/O asíncrona ideal para servir JSON y streaming de video HTTP Range.\n"
         "  - Endpoints RESTful desacoplados (/api/v1/culturas, /api/v1/libros, /api/v1/multimedia)."),
        ("C. Base de Datos: Persistencia y Modelo Relacional Escalable",
         "• Tecnologías: PostgreSQL con Prisma ORM.\n"
         "• Justificación:\n"
         "  - Integridad referencial estricta para asociar libros recomendados a secciones culturales.\n"
         "  - Arquitectura modular para las Culturas Vivas de Nayarit: MVP inicia con Wixárika y escala a Cora, Tepehuano y Mexicanero sin alterar el esquema.\n"
         "  - Prisma ORM: Tipado seguro en TypeScript/JS y migraciones automatizadas."),
        ("D. Autenticación y Seguridad",
         "• Tecnologías: JWT en cookies HTTP-Only, Bcrypt, Zod.\n"
         "• Justificación:\n"
         "  - Kiosco VR público de solo lectura (consumo anónimo sin login).\n"
         "  - Panel administrativo protegido por JWT y contraseñas hasheadas con Bcrypt para el personal de la biblioteca."),
        ("E. Infraestructura, Despliegue y Repositorio",
         "• Frontend: Cloudflare Pages (CDN perimetral con HTTPS estricto para WebXR).\n"
         "• Backend y BD: Render / Supabase con SSL TLS.\n"
         "• Repositorio: https://github.com/demsam/PruebasVR.demsam")
    ]
    for s_title, s_desc in sections:
        d.add_heading(s_title, level=2)
        d.add_paragraph(s_desc)

    d.add_heading("2. Demostración de Viabilidad Técnica (Demo Funcional)", level=1)
    d.add_paragraph("Para aprobar el stack en la sesión de evaluación, el equipo presenta la demo funcional desarrollada en el repositorio:\n"
                    "1. Control de giroscopio y orientación de cabeza en tiempo real.\n"
                    "2. Modo estereoscópico split-screen con línea de centrado para Homido Grab.\n"
                    "3. Menú flotante 3D con retícula Gaze Fuse calibrada a 1.2 segundos y botón capacitivo.\n"
                    "4. Rendimiento validado a 60 FPS estables sin sobrecalentamiento en celulares económicos.")
    d.save(docx_path)
    print("D3 generated.")

# ==============================================================================
# DOC 4: CRONOGRAMA DE ACTIVIDADES
# ==============================================================================
def generate_d4():
    pdf_path = os.path.join(BASE_DIR, "D4. Cronograma de Actividades Equipo 10.pdf")
    docx_path = os.path.join(BASE_DIR, "D4. Cronograma de Actividades Equipo 10.docx")
    authors = "Equipo 10 (Eddie Altamirano, Luis Carlos Durán, Samir Cárdenas, Ulises Bautista)"
    title = "D4: CRONOGRAMA DE ACTIVIDADES (METODOLOGÍA SCRUM / AGILE)"
    sub = "Planificación de 6 Sprints (12 Oct – 27 Nov), Rotación de Roles y Configuración Detallada para Notion"

    doc = SimpleDocTemplate(pdf_path, pagesize=letter, leftMargin=30, rightMargin=30, topMargin=30, bottomMargin=30)
    st = get_reportlab_styles()

    # Sprint table
    sprint_table_data = [
        [
            Paragraph("<b>Sprint y Fechas</b>", st['table_header']),
            Paragraph("<b>Eddie Altamirano</b>", st['table_header']),
            Paragraph("<b>Luis Carlos Durán</b>", st['table_header']),
            Paragraph("<b>Samir Cárdenas</b>", st['table_header']),
            Paragraph("<b>Ulises Bautista</b>", st['table_header'])
        ],
        [
            Paragraph("<b>Sprint 1</b><br/>(12 - 16 Oct)", st['table_cell_bold']),
            Paragraph("<b>[Fullstack Lead]</b><br/>Setup Vite + React 18, R3F y repo GitHub.", st['table_cell']),
            Paragraph("<b>[Backend / BD]</b><br/>Esquema PostgreSQL (Culturas, Libros, Secciones) en Prisma.", st['table_cell']),
            Paragraph("<b>[Frontend Admin]</b><br/>Layout base y Wireframes del Panel Bibliotecario 2D.", st['table_cell']),
            Paragraph("<b>[3D / Assets]</b><br/>Escena 3D estática ceremonial Wixárika low-poly (<5MB).", st['table_cell'])
        ],
        [
            Paragraph("<b>Sprint 2</b><br/>(19 - 23 Oct)", st['table_cell_bold']),
            Paragraph("<b>[WebXR / VR]</b><br/>Integración de sensores, split-screen y botón Homido Grab.", st['table_cell']),
            Paragraph("<b>[Backend API]</b><br/>Endpoints REST (/api/v1/libros, /culturas) y autenticación JWT.", st['table_cell']),
            Paragraph("<b>[Frontend Admin]</b><br/>UI Login administrativo y Dashboard de métricas de biblioteca.", st['table_cell']),
            Paragraph("<b>[VR Interaction]</b><br/>Retícula central con Gaze Fuse interactivo a 1.2 segundos.", st['table_cell'])
        ],
        [
            Paragraph("<b>Sprint 3</b><br/>(26 - 30 Oct)", st['table_cell_bold']),
            Paragraph("<b>[VR UI]</b><br/>Menú 2D flotante central fijo con módulos culturales Wixárika.", st['table_cell']),
            Paragraph("<b>[VR UI / Books]</b><br/>Panel lateral interactivo de Libros Recomendados en la escena.", st['table_cell']),
            Paragraph("<b>[Backend CRUD]</b><br/>Servicio de carga y vinculación de portadas y fichas de libros.", st['table_cell']),
            Paragraph("<b>[Frontend Admin]</b><br/>Formularios CRUD para registrar libros físicos de la biblioteca.", st['table_cell'])
        ],
        [
            Paragraph("<b>Sprint 4</b><br/>(2 - 6 Nov)", st['table_cell_bold']),
            Paragraph("<b>[Multimedia Streaming]</b><br/>Reproductor de video ligero 720p/480p con HTTP Range en menú.", st['table_cell']),
            Paragraph("<b>[Contenido Cultural]</b><br/>Carga y curaduría de Cosmovisión, Fiestas, Costumbres y Lengua.", st['table_cell']),
            Paragraph("<b>[Frontend Admin]</b><br/>Módulo CMS para actualizar enlaces de video y fotos de arte.", st['table_cell']),
            Paragraph("<b>[Modularidad]</b><br/>Pruebas de escalabilidad para futuras culturas (Coras, Tepehuanos).", st['table_cell'])
        ],
        [
            Paragraph("<b>Sprint 5</b><br/>(9 - 13 Nov)", st['table_cell_bold']),
            Paragraph("<b>[UX / Calibración]</b><br/>Pantalla 2D de bienvenida y guía de centrado pupilar para visor.", st['table_cell']),
            Paragraph("<b>[Flujo Lector]</b><br/>Pantalla de salida con resumen de libros para pedir en mostrador.", st['table_cell']),
            Paragraph("<b>[Seguridad Backend]</b><br/>Validaciones con Zod, sanitización de entradas y Helmet en API.", st['table_cell']),
            Paragraph("<b>[Admin UX]</b><br/>Modales de confirmación al borrar libros y alertas de éxito.", st['table_cell'])
        ],
        [
            Paragraph("<b>Sprint 6</b><br/>(16 - 20 Nov)", st['table_cell_bold']),
            Paragraph("<b>[Optimización Móvil]</b><br/>Perfilado a 60 FPS estables en celular de gama económica.", st['table_cell']),
            Paragraph("<b>[Accesibilidad WCAG]</b><br/>Auditoría de contraste AAA (7:1) y tamaño angular en VR.", st['table_cell']),
            Paragraph("<b>[Cloudflare / CI-CD]</b><br/>Despliegue final en Cloudflare Pages con HTTPS estricto.", st['table_cell']),
            Paragraph("<b>[Backend Deploy]</b><br/>Despliegue de Node.js + PostgreSQL en la nube con SSL TLS.", st['table_cell'])
        ],
        [
            Paragraph("<b>Cierre y Demo</b><br/>(23 - 27 Nov)", st['table_cell_bold']),
            Paragraph("Pruebas E2E de hardware en visor Homido Grab físico.", st['table_cell']),
            Paragraph("Pruebas de flujo completo de préstamo de libros con usuario.", st['table_cell']),
            Paragraph("Verificación de panel administrativo y consistencia de BD.", st['table_cell']),
            Paragraph("Presentación y defensa de la Demo final en vivo con la maestra.", st['table_cell'])
        ]
    ]

    t_sprint = Table(sprint_table_data, colWidths=[65, 120, 120, 120, 125])
    t_sprint.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), C_PRIMARY),
        ('ALIGN', (0,0), (-1,-1), 'LEFT'),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('GRID', (0,0), (-1,-1), 0.5, C_BORDER),
        ('BACKGROUND', (0,1), (0,-1), C_LIGHT),
        ('TOPPADDING', (0,0), (-1,-1), 3),
        ('BOTTOMPADDING', (0,0), (-1,-1), 3),
        ('LEFTPADDING', (0,0), (-1,-1), 4),
        ('RIGHTPADDING', (0,0), (-1,-1), 4),
    ]))

    story = [
        Paragraph("TALLER FULL STACK | SEMESTRE VII | EQUIPO 10", st['meta']),
        Paragraph("Proyecto: Módulo Inmersivo WebXR para la Difusión de las Culturas Vivas de Nayarit y Fomento a la Lectura<br/>Sede: Biblioteca Pública Profesor Solón Argüello (Tepic, Nayarit)", st['subtitle']),
        Paragraph(title, st['title']),
        Paragraph(f"<b>Sección Elaborada por:</b> {authors}", st['authors']),
        HRFlowable(width="100%", thickness=1, color=C_SECONDARY, spaceAfter=5),

        Paragraph("1. MARCO TEMPORAL, METODOLOGÍA Y DEFINICIÓN DE HECHO (DoD)", st['h1']),
        Paragraph("• <b>Metodología:</b> Scrum / Agile con Sprints de 1 semana lectiva (Lunes a Viernes).<br/>"
                  "• <b>Ceremonias Obligatorias:</b> Sprint Planning (Lunes 8:00 AM para definir Sprint Goal), Daily Standups asíncronos en Notion/Discord (10 min) y Sprint Review / Retrospective (Viernes al cierre).<br/>"
                  "• <b>Definición de Hecho (DoD):</b> Código revisado vía Pull Request en GitHub, pruebas de render en celular económico con visor Homido Grab, contraste WCAG verificado y despliegue continuo en Cloudflare.", st['body']),

        Spacer(1, 3),
        Paragraph("2. CRONOGRAMA DE SPRINTS Y ROTACIÓN DE ROLES (12 DE OCTUBRE – 27 DE NOVIEMBRE)", st['h1']),
        t_sprint,

        Spacer(1, 4),
        Paragraph("3. CONFIGURACIÓN DEL TABLERO EN NOTION Y PROPIEDADES DE TARJETA", st['h1']),
        Paragraph("Propiedades obligatorias configuradas en la base de datos de Notion:<br/>"
                  "<b>1. Título principal</b> | <b>2. Estado</b> (Backlog / Por hacer / En progreso / En revisión / Hecho) | <b>3. Responsable</b> | "
                  "<b>4. Sprints</b> (Sprint 1 a 6) | <b>5. Roles</b> | <b>6. Prioridad</b> (Alta / Media / Baja) | <b>7. Dificultad</b> (Fácil / Media / Difícil) | "
                  "<b>8. Fecha Inicio</b> | <b>9. Fecha Fin</b> | <b>10. Evidencia</b> (URL Commit / PR / Swagger / Captura) | <b>11. Descripción detallada</b>.", st['body']),

        Spacer(1, 3),
        Paragraph("4. DESGLOSE DETALLADO DE TARJETAS DEL SPRINT 1 (12 - 16 OCTUBRE) POR INTEGRANTE", st['h1']),
        
        # Notion cards detail
        Paragraph("<b>TARJETA 1 — Eddie David Altamirano Plantillas</b>", st['h2']),
        Paragraph("• <b>Título:</b> Setup de Proyecto React 18 + Vite, Three.js y Repositorio Base.<br/>"
                  "• <b>Estado:</b> En progreso | <b>Rol:</b> Fullstack Lead & WebXR Architect | <b>Prioridad:</b> Alta | <b>Dificultad:</b> Media.<br/>"
                  "• <b>Fechas:</b> 12/10/2026 - 16/10/2026 | <b>Sprint:</b> Sprint 1.<br/>"
                  "• <b>Evidencia:</b> Repositorio GitHub configurado con Vite, scripts de build y Cloudflare Pages conectado.<br/>"
                  "• <b>Descripción:</b> Inicializar el entorno del proyecto con Vite y React 18. Configurar dependencias de Three.js (@react-three/fiber, @react-three/drei, @react-three/xr) y Tailwind CSS. Implementar la estructura de carpetas modular (`/components`, `/views`, `/services`, `/hooks`) y verificar que el build en producción sea menor a 500 KB gzip.", st['bullet']),

        Paragraph("<b>TARJETA 2 — Luis Carlos Durán Ocampo</b>", st['h2']),
        Paragraph("• <b>Título:</b> Diseño del Esquema de Base de Datos PostgreSQL y Configuración de Prisma ORM.<br/>"
                  "• <b>Estado:</b> En progreso | <b>Rol:</b> Backend & Database Engineer | <b>Prioridad:</b> Alta | <b>Dificultad:</b> Media.<br/>"
                  "• <b>Fechas:</b> 12/10/2026 - 16/10/2026 | <b>Sprint:</b> Sprint 1.<br/>"
                  "• <b>Evidencia:</b> Archivo `schema.prisma` con modelos de Culturas, Secciones, Libros y Usuarios, y migración inicial ejecutada.<br/>"
                  "• <b>Descripción:</b> Diseñar el modelo entidad-relación relacional en PostgreSQL. Crear las tablas `culturas`, `secciones`, `libros_recomendados`, `recursos_multimedia` y `usuarios_admin`. Dejar el esquema preparado para el MVP Wixárika y la escalabilidad hacia las demás culturas de Nayarit. Configurar Prisma Client y seed inicial de datos de prueba.", st['bullet']),

        Paragraph("<b>TARJETA 3 — Samir Adrián Cárdenas Gámez</b>", st['h2']),
        Paragraph("• <b>Título:</b> Wireframes y Layout Base del Panel Web Administrativo 2D.<br/>"
                  "• <b>Estado:</b> En progreso | <b>Rol:</b> Frontend Admin & UI Designer | <b>Prioridad:</b> Media | <b>Dificultad:</b> Fácil.<br/>"
                  "• <b>Fechas:</b> 12/10/2026 - 16/10/2026 | <b>Sprint:</b> Sprint 1.<br/>"
                  "• <b>Evidencia:</b> Componente de layout con barra lateral de navegación y rutas React Router (`/admin/dashboard`, `/admin/libros`).<br/>"
                  "• <b>Descripción:</b> Diseñar la interfaz del panel administrativo que utilizará el personal de la biblioteca para gestionar libros y contenidos. Crear la barra lateral con accesos directos, encabezado con perfil del bibliotecario y contenedor responsive para formularios de libros.", st['bullet']),

        Paragraph("<b>TARJETA 4 — Ulises Alejandro Bautista Meza</b>", st['h2']),
        Paragraph("• <b>Título:</b> Modelado y Optimización de Escena 3D Ceremonial Wixárika Low-Poly.<br/>"
                  "• <b>Estado:</b> En progreso | <b>Rol:</b> 3D Asset & Graphics Optimization Specialist | <b>Prioridad:</b> Alta | <b>Dificultad:</b> Media.<br/>"
                  "• <b>Fechas:</b> 12/10/2026 - 16/10/2026 | <b>Sprint:</b> Sprint 1.<br/>"
                  "• <b>Evidencia:</b> Archivo `.glb` ceremonial comprimido con Draco (< 3 MB) importable en React Three Fiber sin errores.<br/>"
                  "• <b>Descripción:</b> Crear y optimizar el entorno 3D estático representativo de la sierra Wixárika (colinas estilizadas, cielo sagrado y elementos tradicionales de bajo poligonaje). Aplicar retopología estricta (< 8,000 vértices), compresión Draco y texturas WebP para asegurar que cargue instantáneamente en smartphones de gama de entrada sin calentar el dispositivo.", st['bullet'])
    ]

    doc.build(story)

    # DOCX
    d = Document()
    create_docx_header(d, title, sub, authors)
    d.add_heading("1. Marco Temporal, Metodología y Definición de Hecho (DoD)", level=1)
    d.add_paragraph("• Metodología: Scrum / Agile con Sprints de 1 semana (Lunes a Viernes).\n"
                    "• Periodo: 12 de Octubre a 27 de Noviembre (6 Sprints lectivos + Cierre y Demo Final).\n"
                    "• Ceremonias: Sprint Planning semanal, Daily Standups asíncronos y Sprint Review / Retrospective.\n"
                    "• Definición de Hecho: Código en GitHub, pruebas en visor Homido Grab físico, contraste WCAG verificado y despliegue en Cloudflare.")

    d.add_heading("2. Cronograma de Sprints y Rotación de Roles", level=1)
    t_docx = d.add_table(rows=len(sprint_table_data), cols=5)
    t_docx.alignment = WD_TABLE_ALIGNMENT.CENTER
    for r_idx, row in enumerate(sprint_table_data):
        for c_idx, cell_content in enumerate(row):
            cell = t_docx.cell(r_idx, c_idx)
            text_val = cell_content.text.replace('<b>','').replace('</b>','').replace('<br/>','\n')
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

    d.add_heading("3. Propiedades Obligatorias de la Tarjeta en Notion", level=1)
    d.add_paragraph("1. Título principal\n2. Estado (Backlog, Por hacer, En progreso, En revisión, Hecho)\n3. Responsable\n4. Sprints\n5. Roles\n6. Prioridad\n7. Nivel de dificultad\n8. Fecha Inicio\n9. Fecha Fin\n10. Evidencia\n11. Descripción detallada")

    d.add_heading("4. Desglose Exhaustivo del Sprint 1 (12 - 16 Octubre) por Integrante", level=1)
    cards = [
        ("Tarjeta 1: Eddie David Altamirano Plantillas",
         "• Título: Setup de Proyecto React 18 + Vite, Three.js y Repositorio Base.\n"
         "• Estado: En progreso | Rol: Fullstack Lead & WebXR Architect | Prioridad: Alta | Dificultad: Media\n"
         "• Fechas: 12/10/2026 - 16/10/2026 | Sprint: Sprint 1\n"
         "• Evidencia: Repositorio GitHub configurado con scripts de build y Cloudflare Pages conectado.\n"
         "• Descripción: Inicializar Vite + React 18 con Three.js (@react-three/xr) y Tailwind CSS. Modularizar carpetas y validar build ultraligero."),
        ("Tarjeta 2: Luis Carlos Durán Ocampo",
         "• Título: Diseño del Esquema de Base de Datos PostgreSQL y Configuración de Prisma ORM.\n"
         "• Estado: En progreso | Rol: Backend & Database Engineer | Prioridad: Alta | Dificultad: Media\n"
         "• Fechas: 12/10/2026 - 16/10/2026 | Sprint: Sprint 1\n"
         "• Evidencia: Archivo schema.prisma con modelos de Culturas, Secciones, Libros y Usuarios, y migración inicial.\n"
         "• Descripción: Diseñar el modelo relacional en PostgreSQL preparado para el MVP Wixárika y escalabilidad hacia las demás culturas de Nayarit. Configurar Prisma Client y seeds de prueba."),
        ("Tarjeta 3: Samir Adrián Cárdenas Gámez",
         "• Título: Wireframes y Layout Base del Panel Web Administrativo 2D.\n"
         "• Estado: En progreso | Rol: Frontend Admin & UI Designer | Prioridad: Media | Dificultad: Fácil\n"
         "• Fechas: 12/10/2026 - 16/10/2026 | Sprint: Sprint 1\n"
         "• Evidencia: Componente de layout con barra lateral de navegación y rutas React Router (/admin/dashboard, /admin/libros).\n"
         "• Descripción: Diseñar la interfaz del panel que utilizará el personal de la biblioteca para gestionar libros y contenidos. Estructurar la barra lateral, cabecera y contenedor principal."),
        ("Tarjeta 4: Ulises Alejandro Bautista Meza",
         "• Título: Modelado y Optimización de Escena 3D Ceremonial Wixárika Low-Poly.\n"
         "• Estado: En progreso | Rol: 3D Asset & Graphics Optimization Specialist | Prioridad: Alta | Dificultad: Media\n"
         "• Fechas: 12/10/2026 - 16/10/2026 | Sprint: Sprint 1\n"
         "• Evidencia: Archivo .glb ceremonial comprimido con Draco (< 3 MB) importable en React Three Fiber sin errores.\n"
         "• Descripción: Crear y optimizar el entorno 3D estático representativo de la sierra Wixárika con baja carga poligonal (< 8,000 vértices), compresión Draco y texturas WebP para smartphones económicos.")
    ]
    for c_title, c_content in cards:
        d.add_heading(c_title, level=2)
        d.add_paragraph(c_content)

    d.save(docx_path)
    print("D4 generated.")

if __name__ == "__main__":
    generate_d3()
    generate_d4()
    print("D3 and D4 generated successfully in PDF and DOCX!")

