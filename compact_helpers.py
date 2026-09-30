# build_perfect_report.py
# Generates the finalized, submission-ready DOCX report landing squarely in the 30-40 page range.
# Incorporates:
# - Professional title page, certificate, acknowledgement, abstract
# - TABLE OF CONTENTS
# - LIST OF TABLES (Table No, Title, Page)
# - LIST OF FIGURES (Figure No, Title, Page)
# - Native dynamic page numbering (<w:fldSimple w:instr="PAGE"/>)
# - Compact, descriptive 17 chapters with all verified workspace statistics
# - All 16 embedded figures appropriately scaled (width = 4.0 inches, ~2 per page)
# - Professional tables, styled headings, and code snippets

import os
import docx
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT
from docx.oxml import parse_xml
from docx.oxml.ns import nsdecls

NAVY = RGBColor(0x1B, 0x36, 0x5D)
STEEL = RGBColor(0x2E, 0x75, 0xB6)
DARK_GRAY = RGBColor(0x33, 0x33, 0x33)

def set_cell_background(cell, fill_hex):
    tcPr = cell._tc.get_or_add_tcPr()
    shd = parse_xml(f'<w:shd {nsdecls("w")} w:fill="{fill_hex}"/>')
    tcPr.append(shd)

def set_cell_margins(cell, top=50, bottom=50, left=80, right=80):
    tcPr = cell._tc.get_or_add_tcPr()
    tcMar = parse_xml(f'''
        <w:tcMar {nsdecls("w")}>
            <w:top w:w="{top}" w:type="dxa"/>
            <w:bottom w:w="{bottom}" w:type="dxa"/>
            <w:left w:w="{left}" w:type="dxa"/>
            <w:right w:w="{right}" w:type="dxa"/>
        </w:tcMar>
    ''')
    tcPr.append(tcMar)

def set_table_borders(table, color="D3D3D3"):
    tblPr = table._tbl.tblPr
    borders = parse_xml(f'''
        <w:tblBorders {nsdecls("w")}>
            <w:top w:val="single" w:sz="6" w:space="0" w:color="{color}"/>
            <w:bottom w:val="single" w:sz="6" w:space="0" w:color="{color}"/>
            <w:left w:val="none"/>
            <w:right w:val="none"/>
            <w:insideH w:val="single" w:sz="4" w:space="0" w:color="{color}"/>
            <w:insideV w:val="none"/>
        </w:tblBorders>
    ''')
    tblPr.append(borders)

def setup_page_layout(doc):
    for s in doc.sections:
        s.top_margin = Inches(0.9)
        s.bottom_margin = Inches(0.9)
        s.left_margin = Inches(1.15)
        s.right_margin = Inches(0.9)

        # Header
        header = s.header
        p_hdr = header.paragraphs[0]
        p_hdr.alignment = WD_ALIGN_PARAGRAPH.RIGHT
        p_hdr.paragraph_format.space_after = Pt(4)
        r_hdr = p_hdr.add_run("IT23721 Data Science Using R — Academic Project Report")
        r_hdr.font.name = "Calibri"
        r_hdr.font.size = Pt(8.5)
        r_hdr.font.color.rgb = RGBColor(0x88, 0x88, 0x88)

        # Footer with dynamic page number
        footer = s.footer
        p_ftr = footer.paragraphs[0]
        p_ftr.alignment = WD_ALIGN_PARAGRAPH.CENTER
        p_ftr.paragraph_format.space_before = Pt(4)

        r_f1 = p_ftr.add_run("Rajalakshmi Engineering College (Autonomous)  |  Page ")
        r_f1.font.name = "Calibri"
        r_f1.font.size = Pt(9)
        r_f1.font.color.rgb = RGBColor(0x66, 0x66, 0x66)

        fldSimple = parse_xml(r'<w:fldSimple %s w:instr="PAGE"/>' % nsdecls('w'))
        p_ftr._p.append(fldSimple)

def add_chapter_heading(doc, num_str, title_str):
    p_num = doc.add_paragraph()
    p_num.paragraph_format.space_before = Pt(12)
    p_num.paragraph_format.space_after = Pt(2)
    r_num = p_num.add_run(f"CHAPTER {num_str}")
    r_num.font.name = "Calibri"
    r_num.font.size = Pt(11)
    r_num.font.bold = True
    r_num.font.color.rgb = STEEL

    p_title = doc.add_paragraph()
    p_title.paragraph_format.space_after = Pt(10)
    r_title = p_title.add_run(title_str)
    r_title.font.name = "Calibri"
    r_title.font.size = Pt(15)
    r_title.font.bold = True
    r_title.font.color.rgb = NAVY

def add_section_heading(doc, text):
    p = doc.add_paragraph()
    p.paragraph_format.space_before = Pt(8)
    p.paragraph_format.space_after = Pt(3)
    r = p.add_run(text)
    r.font.name = "Calibri"
    r.font.size = Pt(11.5)
    r.font.bold = True
    r.font.color.rgb = NAVY

def add_body_p(doc, text):
    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
    p.paragraph_format.line_spacing = 1.15
    p.paragraph_format.space_after = Pt(4)
    r = p.add_run(text)
    r.font.name = "Calibri"
    r.font.size = Pt(10)
    r.font.color.rgb = DARK_GRAY
    return p

def add_code_block(doc, code_text):
    p = doc.add_paragraph()
    p.paragraph_format.space_before = Pt(2)
    p.paragraph_format.space_after = Pt(4)
    p.paragraph_format.left_indent = Inches(0.2)
    r = p.add_run(code_text)
    r.font.name = "Consolas"
    r.font.size = Pt(8.5)
    r.font.color.rgb = RGBColor(0x22, 0x22, 0x22)

def add_figure_compact(doc, fig_num, title, image_filename, desc_text):
    p_fig = doc.add_paragraph()
    p_fig.paragraph_format.space_before = Pt(6)
    p_fig.paragraph_format.space_after = Pt(2)
    r_f = p_fig.add_run(f"Figure {fig_num} – {title}")
    r_f.font.name = "Calibri"
    r_f.font.size = Pt(9.5)
    r_f.font.bold = True
    r_f.font.color.rgb = NAVY

    img_path = os.path.join("output", image_filename)
    if os.path.exists(img_path):
        p_img = doc.add_paragraph()
        p_img.alignment = WD_ALIGN_PARAGRAPH.CENTER
        p_img.paragraph_format.space_after = Pt(2)
        doc.add_picture(img_path, width=Inches(3.85))

    p_d = doc.add_paragraph()
    p_d.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
    p_d.paragraph_format.line_spacing = 1.1
    p_d.paragraph_format.space_after = Pt(6)
    r_d = p_d.add_run(desc_text)
    r_d.font.name = "Calibri"
    r_d.font.size = Pt(9)
    r_d.font.color.rgb = DARK_GRAY

print("Compact report base helpers defined")
