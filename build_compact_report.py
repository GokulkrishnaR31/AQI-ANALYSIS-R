# build_compact_report.py
# Generates the 30-40 page complete academic project report for IT23721 DATA SCIENCE USING R

import os
import docx
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT
from compact_helpers import (
    NAVY, STEEL, DARK_GRAY,
    set_cell_background, set_cell_margins, set_table_borders,
    setup_page_layout, add_chapter_heading, add_section_heading,
    add_body_p, add_code_block, add_figure_compact
)

def create_report():
    doc = docx.Document()
    setup_page_layout(doc)

    # =========================================================================
    # TITLE PAGE
    # =========================================================================
    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p.paragraph_format.space_before = Pt(36)
    p.paragraph_format.space_after = Pt(12)
    r = p.add_run("AIR QUALITY INDEX (AQI) ANALYSIS AND PREDICTION PLATFORM USING R")
    r.font.name = "Calibri"
    r.font.size = Pt(18)
    r.font.bold = True
    r.font.color.rgb = NAVY

    p2 = doc.add_paragraph()
    p2.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p2.paragraph_format.space_after = Pt(8)
    r2 = p2.add_run("IT23721 DATA SCIENCE USING R\nPROJECT REPORT")
    r2.font.name = "Calibri"
    r2.font.size = Pt(13)
    r2.font.bold = True
    r2.font.color.rgb = STEEL

    p3 = doc.add_paragraph()
    p3.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p3.paragraph_format.space_before = Pt(30)
    p3.paragraph_format.space_after = Pt(4)
    r3 = p3.add_run("Submitted by")
    r3.font.name = "Calibri"
    r3.font.size = Pt(11)
    r3.font.italic = True

    p4 = doc.add_paragraph()
    p4.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p4.paragraph_format.space_after = Pt(30)
    r4 = p4.add_run("[STUDENT NAME] ([REGISTER NUMBER])")
    r4.font.name = "Calibri"
    r4.font.size = Pt(12)
    r4.font.bold = True

    p5 = doc.add_paragraph()
    p5.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p5.paragraph_format.space_after = Pt(4)
    r5 = p5.add_run("in partial fulfilment of the award of the degree of")
    r5.font.name = "Calibri"
    r5.font.size = Pt(11)

    p6 = doc.add_paragraph()
    p6.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p6.paragraph_format.space_after = Pt(4)
    r6 = p6.add_run("BACHELOR OF TECHNOLOGY\nin\nINFORMATION TECHNOLOGY")
    r6.font.name = "Calibri"
    r6.font.size = Pt(12)
    r6.font.bold = True
    r6.font.color.rgb = NAVY

    p7 = doc.add_paragraph()
    p7.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p7.paragraph_format.space_before = Pt(40)
    p7.paragraph_format.space_after = Pt(4)
    r7 = p7.add_run("RAJALAKSHMI ENGINEERING COLLEGE\n(AUTONOMOUS), CHENNAI – 602 105")
    r7.font.name = "Calibri"
    r7.font.size = Pt(13)
    r7.font.bold = True
    r7.font.color.rgb = NAVY

    p8 = doc.add_paragraph()
    p8.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p8.paragraph_format.space_before = Pt(20)
    r8 = p8.add_run("OCTOBER 2026")
    r8.font.name = "Calibri"
    r8.font.size = Pt(11)
    r8.font.bold = True

    doc.add_page_break()

    # =========================================================================
    # BONAFIDE CERTIFICATE
    # =========================================================================
    p_inst = doc.add_paragraph()
    p_inst.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_inst.paragraph_format.space_after = Pt(2)
    r1 = p_inst.add_run("RAJALAKSHMI ENGINEERING COLLEGE")
    r1.font.name = "Calibri"
    r1.font.size = Pt(13)
    r1.font.bold = True
    r1.font.color.rgb = NAVY

    p_sub = doc.add_paragraph()
    p_sub.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_sub.paragraph_format.space_after = Pt(18)
    r2 = p_sub.add_run("(An Autonomous Institution Affiliated to Anna University Chennai)")
    r2.font.name = "Calibri"
    r2.font.size = Pt(10.5)
    r2.font.italic = True

    p_title = doc.add_paragraph()
    p_title.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_title.paragraph_format.space_after = Pt(18)
    r3 = p_title.add_run("BONAFIDE CERTIFICATE")
    r3.font.name = "Calibri"
    r3.font.size = Pt(14)
    r3.font.bold = True
    r3.font.color.rgb = NAVY

    p_body = doc.add_paragraph()
    p_body.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
    p_body.paragraph_format.line_spacing = 1.25
    p_body.paragraph_format.space_after = Pt(14)
    r4 = p_body.add_run(
        "Certified that this Project titled “AIR QUALITY INDEX (AQI) ANALYSIS AND PREDICTION PLATFORM USING R” "
        "is the Bonafide work of [STUDENT NAME] ([REGISTER NUMBER]) who carried out the work under my supervision. "
        "Certified further that to the best of my knowledge the work reported herein does not form part of any other "
        "thesis or dissertation on the basis of which a degree or award was conferred on an earlier occasion on this or "
        "any other candidate."
    )
    r4.font.name = "Calibri"
    r4.font.size = Pt(10.5)

    p_sdg = doc.add_paragraph()
    p_sdg.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
    p_sdg.paragraph_format.line_spacing = 1.15
    p_sdg.paragraph_format.space_after = Pt(30)
    r_sdg = p_sdg.add_run(
        "This project addresses the following Sustainable Development Goals (SDGs):\n"
        "• SDG 3: Good Health and Well-being (Target 3.9 — Substantially reduce illnesses and deaths from air pollution)\n"
        "• SDG 11: Sustainable Cities and Communities (Target 11.6 — Reduce per capita urban environmental impact)\n"
        "• SDG 13: Climate Action (Target 13.2 — Integrate climate change measures into national policies)\n"
        "• SDG 15: Life on Land (Target 15.1 — Conservation and sustainable use of terrestrial ecosystems)"
    )
    r_sdg.font.name = "Calibri"
    r_sdg.font.size = Pt(10)
    r_sdg.font.italic = True

    p_viva = doc.add_paragraph()
    p_viva.paragraph_format.space_before = Pt(16)
    p_viva.paragraph_format.space_after = Pt(40)
    r_viva = p_viva.add_run("Submitted to Project Viva-Voce Examination held on ....................................")
    r_viva.font.name = "Calibri"
    r_viva.font.size = Pt(10.5)

    sig_table = doc.add_table(rows=2, cols=2)
    sig_table.alignment = WD_TABLE_ALIGNMENT.CENTER
    sig_table.autofit = False

    sig_table.rows[0].cells[0].paragraphs[0].text = "Internal Examiner"
    sig_table.rows[0].cells[0].paragraphs[0].runs[0].font.bold = True
    sig_table.rows[0].cells[0].paragraphs[0].runs[0].font.name = "Calibri"
    sig_table.rows[0].cells[0].paragraphs[0].runs[0].font.size = Pt(10.5)

    sig_table.rows[0].cells[1].paragraphs[0].text = "External Examiner"
    sig_table.rows[0].cells[1].paragraphs[0].alignment = WD_ALIGN_PARAGRAPH.RIGHT
    sig_table.rows[0].cells[1].paragraphs[0].runs[0].font.bold = True
    sig_table.rows[0].cells[1].paragraphs[0].runs[0].font.name = "Calibri"
    sig_table.rows[0].cells[1].paragraphs[0].runs[0].font.size = Pt(10.5)

    sig_table.rows[1].cells[0].paragraphs[0].text = "[PROJECT GUIDE NAME]\nProject Guide / Assistant Professor"
    sig_table.rows[1].cells[0].paragraphs[0].runs[0].font.name = "Calibri"
    sig_table.rows[1].cells[0].paragraphs[0].runs[0].font.size = Pt(9.5)

    sig_table.rows[1].cells[1].paragraphs[0].text = "Department of Information Technology\nRajalakshmi Engineering College"
    sig_table.rows[1].cells[1].paragraphs[0].alignment = WD_ALIGN_PARAGRAPH.RIGHT
    sig_table.rows[1].cells[1].paragraphs[0].runs[0].font.name = "Calibri"
    sig_table.rows[1].cells[1].paragraphs[0].runs[0].font.size = Pt(9.5)

    doc.add_page_break()

    # =========================================================================
    # ACKNOWLEDGEMENT
    # =========================================================================
    p_head = doc.add_paragraph()
    p_head.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_head.paragraph_format.space_after = Pt(18)
    r = p_head.add_run("ACKNOWLEDGEMENT")
    r.font.name = "Calibri"
    r.font.size = Pt(14)
    r.font.bold = True
    r.font.color.rgb = NAVY

    acks = [
        "First, we thank the almighty God for the successful completion of the project.",
        "Our sincere thanks to our Chairman Mr. S. Meganathan, B.E., F.I.E., for his sincere endeavor in educating us in his premier institution. We would like to express our deep gratitude to our beloved Chairperson Dr. Thangam Meganathan, for her enthusiastic motivation which inspired us a lot in completing this project, and Vice-Chairman Mr. Abhay Shankar Meganathan, B.E., M.S., for providing us with the requisite infrastructure and modern technological computing resources.",
        "We also express our sincere gratitude to our college Principal, Dr. S. N. Murugesan, M.E., Ph.D., for his kind support and facilities to complete our work on time. We extend heartfelt gratitude to Dr. P. Valarmathie, Professor and Head of the Department of Information Technology, for her constant guidance, constructive suggestions, and encouragement throughout the course of this academic work.",
        "We extend our sincere and special thanks to our Project Guide, [PROJECT GUIDE NAME], for offering valuable technical guidance, scholarly critiques, and continuous supervision during every phase of this data science investigation.",
        "Finally, we extend our heartfelt appreciation to all faculty members, technical supporting staff, parents, and friends for their direct and indirect involvement, encouragement, and understanding throughout the successful completion of this project."
    ]

    for p_text in acks:
        p = doc.add_paragraph()
        p.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
        p.paragraph_format.line_spacing = 1.2
        p.paragraph_format.space_after = Pt(10)
        run = p.add_run(p_text)
        run.font.name = "Calibri"
        run.font.size = Pt(10.5)

    doc.add_page_break()

    # =========================================================================
    # ABSTRACT
    # =========================================================================
    p_head = doc.add_paragraph()
    p_head.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_head.paragraph_format.space_after = Pt(18)
    r = p_head.add_run("ABSTRACT")
    r.font.name = "Calibri"
    r.font.size = Pt(14)
    r.font.bold = True
    r.font.color.rgb = NAVY

    abstract_texts = [
        "Ambient air pollution represents one of the most critical environmental health challenges in India. The project “Air Quality Index (AQI) Analysis and Prediction Platform Using R” establishes an enterprise-grade analytical ecosystem designed to ingest, cleanse, statistically analyze, model, and visualize extensive longitudinal air quality data. The study is conducted upon an official national observation dataset comprising 235,785 records spanning 32 Indian States/UTs and 291 discrete monitoring areas from April 2022 to April 2025. Leveraging R and the tidyverse paradigm (readr, dplyr, tidyr, lubridate, stringr, forcats), the pipeline executes systematic preprocessing including deduplication, date feature derivation, outlier validation, missing-value imputation, and CPCB category reconciliation.",
        "Exploratory Data Analysis (EDA) reveals that national AQI is moderately right-skewed (mean = 111.13, median = 92.00, SD = 71.45, IQR = 83.00, skewness = 1.425). Under CPCB classification standards, 37.70% of days fall into the 'Satisfactory' category (AQI 51–100), 32.88% are 'Moderate' (101–200), 17.80% are 'Good' (0–50), 8.97% are 'Poor' (201–300), 2.41% are 'Very Poor' (301–400), and 0.24% reach 'Severe' hazardous levels (AQI > 400). Particulate matter constitutes the primary driver of ambient degradation, with PM10 acting as the prominent pollutant in 47.10% of observations and PM2.5 in 25.31%, followed by Ozone (6.87%) and CO (5.46%). Crucially, observations dominated by PM2.5 register the highest average AQI severity of 168.03. Geographically, Delhi (mean 206.42), Jharkhand (164.94), Himachal Pradesh (159.88), Bihar (157.29), Chandigarh (141.87), and Haryana (140.73) exhibit chronic pollution, while Mizoram (47.20) and Sikkim (53.69) maintain pristine standards. A pronounced seasonal inversion cycle exists: mean AQI surges to 160.94 in November and 151.74 in January due to thermal inversion and crop burning, whereas monsoon wet deposition reduces national mean AQI to a trough of 62.78 in July.",
        "Parametric inferential testing confirms highly significant variations across states (ANOVA F = 1674, p < 2.2e-16), months (ANOVA F = 5403, p < 2.2e-16), and pollutant classes (ANOVA F = 1644, p < 2.2e-16). Welch two-sample t-testing demonstrates significant divergence between Delhi and Jharkhand (t = 11.12, p < 2.2e-16). Predictive machine learning models were trained on an 80/20 train-test partition using engineered features (pollutant severity scoring, seasonal indicators, and state historical baselines). Random Forest (200 trees, mtry = 3) substantially outperformed Linear Regression, achieving an RMSE of 48.2871, MAE of 34.4654, and R² of 0.5412 (explaining 54.0% of AQI variance) compared to Linear Regression (RMSE 55.6092, MAE 41.4362, R² 0.3901). Variable importance analysis identifies Pollutant Score (%IncMSE = 168.01) and State Historical Mean (%IncMSE = 135.09) as the dominant predictive drivers.",
        "The analytical engine extends into 7-day Holt-Winters exponential smoothing forecasting, Z-score anomaly detection (1,125 anomaly days), regulatory compliance auditing (55.51% CPCB compliance vs 17.80% WHO compliance), University of Chicago AQLI life expectancy loss calculations, and public health policy scenario modeling (demonstrating that a 20% vehicular, 50% stubble, and 15% industrial curb yields a 27.2% AQI reduction, preventing 13.7 emergency hospitalizations per 100,000 population). The complete pipeline is operationalized via an R Plumber REST API exposing 12 endpoints and connected to modern interactive dashboards and live WAQI GIS tracking."
    ]

    for p_text in abstract_texts:
        p = doc.add_paragraph()
        p.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
        p.paragraph_format.line_spacing = 1.15
        p.paragraph_format.space_after = Pt(6)
        run = p.add_run(p_text)
        run.font.name = "Calibri"
        run.font.size = Pt(10)

    p_kw = doc.add_paragraph()
    p_kw.paragraph_format.space_before = Pt(8)
    p_kw.paragraph_format.space_after = Pt(12)
    r_kwh = p_kw.add_run("Keywords: ")
    r_kwh.font.name = "Calibri"
    r_kwh.font.size = Pt(10)
    r_kwh.font.bold = True
    r_kwh.font.color.rgb = NAVY

    r_kw = p_kw.add_run(
        "Air Quality Index (AQI), Data Science Using R, Particulate Matter (PM2.5/PM10), Exploratory Data Analysis, "
        "ANOVA, Random Forest, Linear Regression, Holt-Winters Forecasting, Anomaly Detection, AQLI, Policy Simulation, Plumber API."
    )
    r_kw.font.name = "Calibri"
    r_kw.font.size = Pt(10)
    r_kw.font.italic = True

    doc.add_page_break()

    # =========================================================================
    # TABLE OF CONTENTS
    # =========================================================================
    p_head = doc.add_paragraph()
    p_head.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_head.paragraph_format.space_after = Pt(16)
    r = p_head.add_run("TABLE OF CONTENTS")
    r.font.name = "Calibri"
    r.font.size = Pt(14)
    r.font.bold = True
    r.font.color.rgb = NAVY

    toc_items = [
        ("BONAFIDE CERTIFICATE", "ii"),
        ("ACKNOWLEDGEMENT", "iii"),
        ("ABSTRACT", "iv"),
        ("TABLE OF CONTENTS", "v"),
        ("LIST OF TABLES", "vi"),
        ("LIST OF FIGURES", "vii"),
        ("CHAPTER 1 – INTRODUCTION", "1"),
        ("CHAPTER 2 – PROBLEM STATEMENT", "3"),
        ("CHAPTER 3 – OBJECTIVES", "4"),
        ("CHAPTER 4 – SCOPE OF THE PROJECT", "5"),
        ("CHAPTER 5 – LITERATURE REVIEW", "6"),
        ("CHAPTER 6 – SYSTEM REQUIREMENTS", "8"),
        ("CHAPTER 7 – DATASET DESCRIPTION", "10"),
        ("CHAPTER 8 – METHODOLOGY", "12"),
        ("CHAPTER 9 – DATA PREPROCESSING", "14"),
        ("CHAPTER 10 – EXPLORATORY DATA ANALYSIS", "16"),
        ("CHAPTER 11 – DATA VISUALIZATION", "19"),
        ("CHAPTER 12 – IMPLEMENTATION USING R", "26"),
        ("CHAPTER 13 – RESULTS AND DISCUSSION", "28"),
        ("CHAPTER 14 – CONCLUSION", "32"),
        ("CHAPTER 15 – FUTURE ENHANCEMENT", "33"),
        ("CHAPTER 16 – REFERENCES", "34"),
        ("CHAPTER 17 – APPENDIX", "35")
    ]

    t_toc = doc.add_table(rows=len(toc_items), cols=2)
    t_toc.alignment = WD_TABLE_ALIGNMENT.CENTER
    t_toc.autofit = False
    set_table_borders(t_toc, color="E0E0E0")

    for i, (title, page) in enumerate(toc_items):
        row = t_toc.rows[i]
        c0, c1 = row.cells[0], row.cells[1]
        c0.width = Inches(5.5)
        c1.width = Inches(0.9)
        set_cell_margins(c0, top=25, bottom=25, left=50, right=50)
        set_cell_margins(c1, top=25, bottom=25, left=50, right=50)

        p0 = c0.paragraphs[0]
        p0.paragraph_format.space_after = Pt(1)
        p0.paragraph_format.space_before = Pt(1)
        r0 = p0.add_run(title)
        r0.font.name = "Calibri"
        r0.font.size = Pt(9.5)
        if title.startswith("CHAPTER") or title in ["BONAFIDE CERTIFICATE", "ACKNOWLEDGEMENT", "ABSTRACT", "TABLE OF CONTENTS", "LIST OF TABLES", "LIST OF FIGURES"]:
            r0.font.bold = True
            r0.font.color.rgb = NAVY

        p1 = c1.paragraphs[0]
        p1.alignment = WD_ALIGN_PARAGRAPH.RIGHT
        p1.paragraph_format.space_after = Pt(1)
        p1.paragraph_format.space_before = Pt(1)
        r1 = p1.add_run(page)
        r1.font.name = "Calibri"
        r1.font.size = Pt(9.5)
        if title.startswith("CHAPTER") or title in ["BONAFIDE CERTIFICATE", "ACKNOWLEDGEMENT", "ABSTRACT", "TABLE OF CONTENTS", "LIST OF TABLES", "LIST OF FIGURES"]:
            r1.font.bold = True

    doc.add_page_break()

    # =========================================================================
    # LIST OF TABLES & LIST OF FIGURES
    # =========================================================================
    p_head = doc.add_paragraph()
    p_head.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_head.paragraph_format.space_after = Pt(12)
    r = p_head.add_run("LIST OF TABLES")
    r.font.name = "Calibri"
    r.font.size = Pt(13)
    r.font.bold = True
    r.font.color.rgb = NAVY

    tables_list = [
        ("Table 6.1", "Hardware Specifications", "8"),
        ("Table 6.2", "Software Specifications and Package Dependencies", "9"),
        ("Table 7.1", "Dataset Attribute Dictionary", "10"),
        ("Table 7.2", "Missing Value Audit of Raw Dataset", "11"),
        ("Table 7.3", "CPCB National Air Quality Index (NAQI) Classification Scale", "11"),
        ("Table 10.1", "Distribution of Air Quality Categories (N = 235,785)", "16"),
        ("Table 10.2", "Top 15 Most Polluted States vs Cleanest States in India", "17"),
        ("Table 10.3", "Monthly AQI Progression Across India", "17"),
        ("Table 10.4", "Breakdown of Prominent Pollutants and Associated AQI Severity", "18"),
        ("Table 13.1", "Summary of Parametric Statistical Tests (ANOVA, t-test, correlation)", "28"),
        ("Table 13.2", "Machine Learning Model Performance Comparison (LR vs RF)", "29"),
        ("Table 13.3", "Random Forest Variable Importance Hierarchy", "30"),
        ("Table 17.1", "Sample Records from Cleaned AQI Dataset", "36")
    ]

    t_tbl = doc.add_table(rows=len(tables_list), cols=3)
    t_tbl.alignment = WD_TABLE_ALIGNMENT.CENTER
    t_tbl.autofit = False
    set_table_borders(t_tbl, color="E0E0E0")

    for i, (t_no, title, page) in enumerate(tables_list):
        row = t_tbl.rows[i]
        c0, c1, c2 = row.cells[0], row.cells[1], row.cells[2]
        c0.width = Inches(1.1)
        c1.width = Inches(4.5)
        c2.width = Inches(0.8)
        set_cell_margins(c0, 20, 20, 40, 40)
        set_cell_margins(c1, 20, 20, 40, 40)
        set_cell_margins(c2, 20, 20, 40, 40)

        p0 = c0.paragraphs[0]
        r0 = p0.add_run(t_no)
        r0.font.name = "Calibri"
        r0.font.size = Pt(9)
        r0.font.bold = True

        p1 = c1.paragraphs[0]
        r1 = p1.add_run(title)
        r1.font.name = "Calibri"
        r1.font.size = Pt(9)

        p2 = c2.paragraphs[0]
        p2.alignment = WD_ALIGN_PARAGRAPH.RIGHT
        r2 = p2.add_run(page)
        r2.font.name = "Calibri"
        r2.font.size = Pt(9)

    doc.add_paragraph().paragraph_format.space_before = Pt(8)

    p_fig_head = doc.add_paragraph()
    p_fig_head.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_fig_head.paragraph_format.space_before = Pt(8)
    p_fig_head.paragraph_format.space_after = Pt(12)
    r_f = p_fig_head.add_run("LIST OF FIGURES")
    r_f.font.name = "Calibri"
    r_f.font.size = Pt(13)
    r_f.font.bold = True
    r_f.font.color.rgb = NAVY

    figures_list = [
        ("Figure 8.1", "End-to-End Methodological Architecture Pipeline", "12"),
        ("Figure 11.1", "Distribution of AQI Values Across India (Histogram)", "19"),
        ("Figure 11.2", "AQI Category Distribution (Bar Chart)", "19"),
        ("Figure 11.3", "Top 15 Most Polluted States Ranked by Average AQI", "20"),
        ("Figure 11.4", "Monthly AQI Trend and Seasonal Inversion (Line Chart)", "20"),
        ("Figure 11.5", "AQI Boxplot Across Top 10 Polluted States", "21"),
        ("Figure 11.6", "AQI Probability Density by Category (Density Plot)", "21"),
        ("Figure 11.7", "Relative Frequency Distribution of Prominent Pollutants", "22"),
        ("Figure 11.8", "Average AQI Severity by Prominent Pollutant Class", "22"),
        ("Figure 11.9", "Monitoring Station Density versus AQI Value (Scatter Plot)", "23"),
        ("Figure 11.10", "State-Wise Proportionate Breakdown of AQI Categories (Stacked)", "23"),
        ("Figure 11.11", "Multi-Year Longitudinal AQI Trajectory (Yearly Trend)", "24"),
        ("Figure 11.12", "Dual-Axis Heatmap: State versus Month AQI Severity", "24"),
        ("Figure 11.13", "Violin and Boxplot Distribution of AQI by Pollutant Type", "25"),
        ("Figure 11.14", "Random Forest Variable Importance Plot (%IncMSE)", "25"),
        ("Figure 11.15", "Linear Regression Diagnostic: Actual vs Predicted AQI", "26"),
        ("Figure 11.16", "Random Forest Model Diagnostic: Actual vs Predicted AQI", "26")
    ]

    t_fig = doc.add_table(rows=len(figures_list), cols=3)
    t_fig.alignment = WD_TABLE_ALIGNMENT.CENTER
    t_fig.autofit = False
    set_table_borders(t_fig, color="E0E0E0")

    for i, (f_no, title, page) in enumerate(figures_list):
        row = t_fig.rows[i]
        c0, c1, c2 = row.cells[0], row.cells[1], row.cells[2]
        c0.width = Inches(1.1)
        c1.width = Inches(4.5)
        c2.width = Inches(0.8)
        set_cell_margins(c0, 20, 20, 40, 40)
        set_cell_margins(c1, 20, 20, 40, 40)
        set_cell_margins(c2, 20, 20, 40, 40)

        p0 = c0.paragraphs[0]
        r0 = p0.add_run(f_no)
        r0.font.name = "Calibri"
        r0.font.size = Pt(9)
        r0.font.bold = True

        p1 = c1.paragraphs[0]
        r1 = p1.add_run(title)
        r1.font.name = "Calibri"
        r1.font.size = Pt(9)

        p2 = c2.paragraphs[0]
        p2.alignment = WD_ALIGN_PARAGRAPH.RIGHT
        r2 = p2.add_run(page)
        r2.font.name = "Calibri"
        r2.font.size = Pt(9)

    doc.add_page_break()

    # =========================================================================
    # CHAPTER 1 – INTRODUCTION
    # =========================================================================
    add_chapter_heading(doc, "1", "INTRODUCTION")
    add_section_heading(doc, "1.1 Background of Environmental Data Science")
    add_body_p(
        doc,
        "Environmental data science combines atmospheric chemistry, computational statistics, epidemiology, and software engineering "
        "to tackle deteriorating ambient air quality across rapidly developing economies. In India, ambient air pollution is an escalating public health "
        "crisis driving respiratory morbidities, cardiovascular mortality, and macroeconomic productivity losses. The primary metric utilized to quantify "
        "atmospheric safety is the Air Quality Index (AQI), promulgated by the Central Pollution Control Board (CPCB). The AQI standardizes multi-pollutant "
        "concentrations (PM10, PM2.5, NO2, SO2, CO, O3) into a single 0–500 numerical scale that guides public health advisories."
    )
    add_section_heading(doc, "1.2 The Air Pollution Context in India")
    add_body_p(
        doc,
        "India exhibits remarkable geographical diversity and complex air pollution dynamics. The landlocked Indo-Gangetic Plain (Delhi, Bihar, UP, Haryana) "
        "endures severe winter pollution crises driven by seasonal temperature inversions, shallow boundary layer heights, and post-monsoon agricultural crop "
        "burning. In contrast, coastal peninsular states (Tamil Nadu, Kerala) benefit from maritime breezes and monsoon wet deposition that scavenge airborne "
        "particulates. Understanding these regional and seasonal dynamics is crucial for formulating targeted environmental interventions."
    )
    add_section_heading(doc, "1.3 Role of R Programming in Modern Data Analytics")
    add_body_p(
        doc,
        "R is the premier environment for statistical computing, exploratory analysis, and reproducible research. The tidyverse ecosystem (readr, dplyr, "
        "tidyr, lubridate, stringr, forcats) enables high-throughput data cleaning and temporal feature extraction. Leland Wilkinson’s Grammar of Graphics "
        "implemented in ggplot2 provides unmatched visualization power. Furthermore, R seamlessly integrates parametric hypothesis testing (ANOVA, t-tests) "
        "with supervised machine learning (Random Forest, Linear Regression) and production microservice deployment via R Plumber."
    )
    add_section_heading(doc, "1.4 Purpose and Organization of the Project")
    add_body_p(
        doc,
        "This project establishes a comprehensive, end-to-end analytical intelligence platform utilizing 235,785 official air quality monitoring records "
        "across 32 Indian States/UTs and 291 cities from April 2022 to April 2025. The report is organized into 17 chapters detailing problem definition, "
        "system requirements, dataset schema, preprocessing, EDA, 16 visual graphics, R implementation, empirical results, and future enhancements."
    )

    doc.add_page_break()

    # =========================================================================
    # CHAPTER 2 – PROBLEM STATEMENT
    # =========================================================================
    add_chapter_heading(doc, "2", "PROBLEM STATEMENT")
    add_section_heading(doc, "2.1 The Environmental Crisis and Public Health Reality")
    add_body_p(
        doc,
        "Ambient air pollution across India poses an urgent public health hazard. Chronic exposure to fine particulate matter (PM2.5) causes pulmonary "
        "inflammation, ischemic heart disease, stroke, and reduced lung capacity in children. Despite extensive continuous monitoring, observational data "
        "frequently remains under-utilized in municipal planning workflows."
    )
    add_section_heading(doc, "2.2 Pitfalls of Traditional Environmental Monitoring")
    add_body_p(
        doc,
        "1. Retrospective Stagnation: Most regional boards publish static retrospective summaries that fail to uncover latent seasonal patterns or spatial correlations.\n"
        "2. Manual Data Wrangling: Disparate sensor logs suffer from missing timestamps, non-standardized pollutant naming, and unvalidated status categories.\n"
        "3. Lack of Predictive Intelligence: Traditional workflows lack automated machine learning models capable of forecasting AQI levels ahead of time.\n"
        "4. Absence of Policy Simulation Utilities: Decision-makers lack quantitative tools to estimate the air quality dividends and avoided hospital visits resulting from specific emission curbs."
    )
    add_section_heading(doc, "2.3 Formal Problem Formulation")
    add_body_p(
        doc,
        "“To develop an end-to-end, statistically rigorous Data Science platform using the R programming language that ingests, cleanses, transforms, "
        "analyzes, and models multi-year national ambient air quality monitoring records across 32 Indian States and 291 cities; identifies temporal, "
        "seasonal, and chemical dynamics through exploratory analysis and ANOVA hypothesis testing; constructs predictive machine learning models to "
        "forecast AQI levels; evaluates compliance against CPCB and WHO benchmarks; and provides simulation utilities to quantify public health impacts.”"
    )

    doc.add_page_break()

    # =========================================================================
    # CHAPTER 3 – OBJECTIVES
    # =========================================================================
    add_chapter_heading(doc, "3", "OBJECTIVES")
    add_body_p(doc, "The project fulfills the following ten concrete technical and academic objectives:")
    objectives_list = [
        ("1. Data Ingestion & Auditing", "Import and systematically audit 235,785 records across 9 columns from aqi.csv using readr."),
        ("2. Automated Preprocessing", "Eliminate duplicate records, prune uninformative metadata ('note' and 'unit'), and standardize character strings."),
        ("3. Temporal Feature Derivation", "Convert calendar strings to formal Date objects via lubridate and extract year, month, and day components."),
        ("4. Exploratory Data Profiling", "Compute univariate moments (mean, median, SD, skewness) and profile category and geographic distributions."),
        ("5. Parametric Hypothesis Testing", "Execute One-Way ANOVA tests across states, months, and pollutants, along with Welch t-tests and correlation analysis."),
        ("6. Predictive Machine Learning", "Train and validate Linear Regression and Ensemble Random Forest models (80/20 split) using engineered features."),
        ("7. Variable Importance Extraction", "Quantify the predictive power of chemical, seasonal, and geographic features using Random Forest %IncMSE."),
        ("8. Time-Series Forecasting", "Implement 7-day Holt-Winters exponential smoothing forecasting and statistical Z-score anomaly event tracking."),
        ("9. Environmental Health Modeling", "Calculate AQLI life expectancy loss, indoor air purifier CADR sizing, and multi-sectoral policy simulation impact."),
        ("10. API & Dashboard Delivery", "Operationalize all analytical engines behind a 12-endpoint R Plumber REST API connected to interactive dashboards.")
    ]
    for o_num, o_desc in objectives_list:
        p = doc.add_paragraph()
        p.paragraph_format.left_indent = Inches(0.2)
        p.paragraph_format.space_after = Pt(3)
        r_t = p.add_run(f"• {o_num}: ")
        r_t.font.bold = True
        r_t.font.size = Pt(9.5)
        r_t.font.color.rgb = STEEL
        r_d = p.add_run(o_desc)
        r_d.font.size = Pt(9.5)

    doc.add_page_break()

    # =========================================================================
    # CHAPTER 4 – SCOPE OF THE PROJECT
    # =========================================================================
    add_chapter_heading(doc, "4", "SCOPE OF THE PROJECT")
    add_section_heading(doc, "4.1 Current Analytical Scope")
    add_body_p(
        doc,
        "The project encompasses the complete data science lifecycle applied to ambient environmental monitoring. It covers data loading, "
        "programmatic hygiene, temporal feature engineering, univariate and bivariate exploratory profiling, parametric statistical inference (ANOVA, "
        "t-test, correlation), supervised machine learning regression, time-series forecasting, anomaly tracking, health impact modeling, and RESTful API deployment."
    )
    add_section_heading(doc, "4.2 Geographic and Temporal Boundaries")
    add_body_p(
        doc,
        "Geographically, the study spans 32 Indian States and Union Territories across 291 discrete monitoring areas. Temporally, it covers 37 longitudinal "
        "months from April 1, 2022 to April 30, 2025, capturing three full annual seasonal cycles (winter stagnation, pre-monsoon heat, monsoon rain, and post-monsoon harvest)."
    )
    add_section_heading(doc, "4.3 Practical Significance & Limitations")
    add_body_p(
        doc,
        "The platform provides municipal planners and regulators with actionable evidence to target seasonal industrial and vehicular restrictions. "
        "Key operational limitations include the absence of co-located microclimate measurements (wind speed, boundary layer height) in the historical CSV, "
        "and spatial sensor clustering in urban centers relative to rural districts."
    )

    doc.add_page_break()

    # =========================================================================
    # CHAPTER 5 – LITERATURE REVIEW
    # =========================================================================
    add_chapter_heading(doc, "5", "LITERATURE REVIEW")
    add_section_heading(doc, "5.1 Ambient Air Quality Standards and Indices")
    add_body_p(
        doc,
        "The Air Quality Index concept originated with the US EPA's Pollutant Standards Index (Ott & Hunt, 1976). In India, the Central Pollution Control "
        "Board (CPCB, 2014) established the National Air Quality Index (NAQI) under the Ministry of Environment, Forest and Climate Change. The Indian standard "
        "synthesizes sub-indices for eight criteria pollutants (PM10, PM2.5, NO2, SO2, CO, O3, NH3, Pb) using piecewise linear breakpoint functions to categorize "
        "air quality into six health risk tiers: Good, Satisfactory, Moderate, Poor, Very Poor, and Severe."
    )
    add_section_heading(doc, "5.2 Statistical and Machine Learning Approaches")
    add_body_p(
        doc,
        "Classical environmental studies have applied Analysis of Variance (ANOVA) to confirm regional air quality disparities across urban airsheds "
        "(Pant et al., 2015; Sharma et al., 2016). In predictive modeling, machine learning techniques have emerged as superior alternatives to physical "
        "chemical transport models. Breiman (2001) demonstrated that Random Forest ensembles effectively capture non-linear atmospheric relationships while "
        "resisting overfitting. Comparative environmental studies (Guo et al., 2017; Rybarczyk & Zalakeviciute, 2018) consistently confirm that tree-based "
        "ensembles outperform classical multivariate linear regression in predicting airborne particulate concentrations."
    )
    add_section_heading(doc, "5.3 R in Environmental Data Science")
    add_body_p(
        doc,
        "R provides an ideal ecosystem for environmental informatics. The tidyverse paradigm (Wickham & Grolemund, 2017) fundamentally enhances data wrangling "
        "reproducibility. The ggplot2 package (Wickham, 2016) provides unmatched visual grammar. Furthermore, the Plumber package (Armstrong & Treurnicht, 2021) "
        "enables direct deployment of R models into high-throughput REST APIs, addressing the gap between static academic research and live decision dashboards."
    )

    doc.add_page_break()

    # =========================================================================
    # CHAPTER 6 – SYSTEM REQUIREMENTS
    # =========================================================================
    add_chapter_heading(doc, "6", "SYSTEM REQUIREMENTS")
    add_section_heading(doc, "6.1 Hardware Requirements")
    add_body_p(doc, "Table 6.1 outlines the hardware specifications utilized to process the 235,785 observation records and train machine learning models.")

    p_t1 = doc.add_paragraph()
    r_t1 = p_t1.add_run("Table 6.1 – Hardware Specifications")
    r_t1.font.bold = True
    r_t1.font.size = Pt(10)
    r_t1.font.color.rgb = NAVY

    hw_table = doc.add_table(rows=6, cols=3)
    hw_table.alignment = WD_TABLE_ALIGNMENT.CENTER
    set_table_borders(hw_table)

    headers_hw = ["Component", "Minimum Requirement", "Specification in Use"]
    for j, h in enumerate(headers_hw):
        cell = hw_table.rows[0].cells[j]
        set_cell_background(cell, "1B365D")
        p = cell.paragraphs[0]
        p.alignment = WD_ALIGN_PARAGRAPH.CENTER
        r = p.add_run(h)
        r.font.bold = True
        r.font.size = Pt(9)
        r.font.color.rgb = RGBColor(0xFF, 0xFF, 0xFF)

    hw_rows = [
        ("Processor (CPU)", "Intel Core i3 / AMD Ryzen 3 (Quad Core)", "Intel Core i5 / i7 / Ryzen 5 (6+ Cores, 2.5 GHz+)"),
        ("Memory (RAM)", "8 GB DDR4", "16 GB DDR4 Dual-Channel (Required for RF training)"),
        ("Storage", "10 GB Free Storage Space", "512 GB NVMe SSD (High I/O throughput)"),
        ("Display", "1366 × 768 Resolution", "1920 × 1080 Full HD IPS Display"),
        ("Network", "1 Mbps Broadband", "High-speed Internet (WAQI API & CRAN packages)")
    ]
    for i, row in enumerate(hw_rows):
        cells = hw_table.rows[i+1].cells
        bg = "F9FAFB" if i % 2 == 1 else "FFFFFF"
        for j, val in enumerate(row):
            set_cell_background(cells[j], bg)
            set_cell_margins(cells[j], 40, 40, 60, 60)
            r = cells[j].paragraphs[0].add_run(val)
            r.font.size = Pt(8.5)
            if j == 0: r.font.bold = True

    add_section_heading(doc, "6.2 Software Specifications")
    add_body_p(doc, "Table 6.2 details the software tools and R package dependencies employed across the analytical workflow.")

    p_t2 = doc.add_paragraph()
    r_t2 = p_t2.add_run("Table 6.2 – Software Specifications and Package Dependencies")
    r_t2.font.bold = True
    r_t2.font.size = Pt(10)
    r_t2.font.color.rgb = NAVY

    sw_table = doc.add_table(rows=12, cols=3)
    sw_table.alignment = WD_TABLE_ALIGNMENT.CENTER
    set_table_borders(sw_table)

    headers_sw = ["Software / Package", "Version", "Functional Purpose in Project"]
    for j, h in enumerate(headers_sw):
        cell = sw_table.rows[0].cells[j]
        set_cell_background(cell, "1B365D")
        p = cell.paragraphs[0]
        p.alignment = WD_ALIGN_PARAGRAPH.CENTER
        r = p.add_run(h)
        r.font.bold = True
        r.font.size = Pt(9)
        r.font.color.rgb = RGBColor(0xFF, 0xFF, 0xFF)

    sw_rows = [
        ("Operating System", "Windows 10 / 11 64-bit", "Host operating system environment"),
        ("R Runtime", "R version 4.4.2", "Core statistical computing engine and runtime"),
        ("RStudio Desktop", "Build 2024.09.0+ / Posit", "Integrated Development Environment for scripting"),
        ("readr & dplyr", "v2.1.5 / v1.1.4", "High-throughput CSV ingestion and tabular data wrangling"),
        ("tidyr & lubridate", "v1.3.1 / v1.9.3", "Data tidying and ISO calendar date feature extraction"),
        ("stringr & forcats", "v1.5.1 / v1.0.0", "String trimming and categorical factor level ordering"),
        ("ggplot2 & scales", "v3.5.1 / v1.3.0", "High-resolution data graphics and axis formatting"),
        ("randomForest", "v4.7-1.2", "Training 200-tree ensemble regressor and variable importance"),
        ("Metrics", "v0.1.4", "Computation of model evaluation metrics (RMSE, MAE, R²)"),
        ("plumber", "v1.2.2", "Exposing R analytical logic as JSON REST API endpoints on port 8000"),
        ("httr & jsonlite", "v1.4.7 / v1.8.9", "HTTP client calls for live WAQI API telemetry and JSON serialization")
    ]
    for i, row in enumerate(sw_rows):
        cells = sw_table.rows[i+1].cells
        bg = "F9FAFB" if i % 2 == 1 else "FFFFFF"
        for j, val in enumerate(row):
            set_cell_background(cells[j], bg)
            set_cell_margins(cells[j], 30, 30, 60, 60)
            r = cells[j].paragraphs[0].add_run(val)
            r.font.size = Pt(8.5)
            if j == 0: r.font.bold = True

    doc.add_page_break()

    # =========================================================================
    # CHAPTER 7 – DATASET DESCRIPTION
    # =========================================================================
    add_chapter_heading(doc, "7", "DATASET DESCRIPTION")
    add_section_heading(doc, "7.1 Dataset Overview & Provenance")
    add_body_p(
        doc,
        "The project analyzes the official Indian National Air Quality Index dataset stored in the workspace as 'aqi.csv'. "
        "The dataset originates from the Central Pollution Control Board (CPCB) and Open Government Data Platform India (data.gov.in). "
        "It aggregates continuous and manual monitoring records across 32 States and Union Territories and 291 cities from April 1, 2022 to April 30, 2025. "
        "The raw dataset contains 235,785 observation rows and 9 columns, expanding to 11 structured columns after feature engineering."
    )
    add_section_heading(doc, "7.2 Attribute Dictionary")
    add_body_p(doc, "Table 7.1 establishes the schema dictionary for all attributes in the dataset.")

    p_t_attr = doc.add_paragraph()
    r_t_attr = p_t_attr.add_run("Table 7.1 – Dataset Attribute Dictionary")
    r_t_attr.font.bold = True
    r_t_attr.font.size = Pt(10)
    r_t_attr.font.color.rgb = NAVY

    attr_tbl = doc.add_table(rows=10, cols=5)
    attr_tbl.alignment = WD_TABLE_ALIGNMENT.CENTER
    set_table_borders(attr_tbl)

    headers_attr = ["Attribute", "Raw Type", "Clean Type", "Valid Range", "Description"]
    for j, h in enumerate(headers_attr):
        cell = attr_tbl.rows[0].cells[j]
        set_cell_background(cell, "1B365D")
        p = cell.paragraphs[0]
        p.alignment = WD_ALIGN_PARAGRAPH.CENTER
        r = p.add_run(h)
        r.font.bold = True
        r.font.size = Pt(8.5)
        r.font.color.rgb = RGBColor(0xFF, 0xFF, 0xFF)

    schema_rows = [
        ("date", "character", "Date", "2022-04-01 to 2025-04-30", "Observation date (parsed from DD-MM-YYYY via lubridate::dmy)"),
        ("state", "character", "Factor", "32 States / UTs", "Name of State or Union Territory containing monitoring station"),
        ("area", "character", "character", "291 Cities / Zones", "Specific urban area or municipality name"),
        ("number_of_monitoring_stations", "numeric", "integer", "1 to 40", "Active monitoring stations contributing to daily average"),
        ("prominent_pollutants", "character", "Factor", "49 categories", "Dominant pollutant dictating the daily AQI (PM10, PM2.5, etc.)"),
        ("aqi_value", "numeric", "numeric", "3.0 to 500.0", "Composite numerical Air Quality Index score (CPCB formula)"),
        ("air_quality_status", "character", "Ord. Factor", "Good to Severe", "CPCB qualitative status band (Good, Satisfactory, Moderate, etc.)"),
        ("unit / note", "character", "Dropped", "AQI / 100% NA", "Constant unit and unpopulated metadata field (pruned)"),
        ("year / month / month_num", "Derived", "num / ord / num", "2022–2025 / Jan–Dec / 1–12", "Derived temporal features for seasonal cycle analysis")
    ]
    for i, row in enumerate(schema_rows):
        cells = attr_tbl.rows[i+1].cells
        bg = "F9FAFB" if i % 2 == 1 else "FFFFFF"
        for j, val in enumerate(row):
            set_cell_background(cells[j], bg)
            set_cell_margins(cells[j], 25, 25, 50, 50)
            r = cells[j].paragraphs[0].add_run(val)
            r.font.size = Pt(8)
            if j == 0: r.font.bold = True

    add_section_heading(doc, "7.3 Missing Values and CPCB Classification Scale")
    add_body_p(
        doc,
        "Table 7.2 presents the missing-value audit. Operational attributes contain zero missing values across all 235,785 records. "
        "The administrative 'note' field had 235,785 missing entries (100% missing) and was pruned. Table 7.3 presents the official CPCB classification scale."
    )

    # Side-by-side or consecutive compact tables
    p_t_mv = doc.add_paragraph()
    r_t_mv = p_t_mv.add_run("Table 7.2 – Missing Value Audit & Table 7.3 – CPCB Classification Scale")
    r_t_mv.font.bold = True
    r_t_mv.font.size = Pt(9.5)
    r_t_mv.font.color.rgb = NAVY

    cpcb_tbl = doc.add_table(rows=7, cols=4)
    cpcb_tbl.alignment = WD_TABLE_ALIGNMENT.CENTER
    set_table_borders(cpcb_tbl)

    headers_cpcb = ["AQI Category", "Breakpoint", "Health Impact", "Missing in Raw Data"]
    for j, h in enumerate(headers_cpcb):
        cell = cpcb_tbl.rows[0].cells[j]
        set_cell_background(cell, "1B365D")
        p = cell.paragraphs[0]
        p.alignment = WD_ALIGN_PARAGRAPH.CENTER
        r = p.add_run(h)
        r.font.bold = True
        r.font.size = Pt(8.5)
        r.font.color.rgb = RGBColor(0xFF, 0xFF, 0xFF)

    cpcb_compact = [
        ("Good", "0 – 50", "Minimal health impact; satisfactory air", "date: 0 | state: 0"),
        ("Satisfactory", "51 – 100", "Minor breathing discomfort to sensitive groups", "area: 0 | stations: 0"),
        ("Moderate", "101 – 200", "Breathing discomfort to asthma/heart patients", "prominent_pollutants: 0"),
        ("Poor", "201 – 300", "Breathing discomfort to most people on prolonged exposure", "aqi_value: 0"),
        ("Very Poor", "301 – 400", "Respiratory illness on prolonged exposure", "air_quality_status: 0"),
        ("Severe", "> 400", "Affects healthy people; emergency medical impact", "note: 235,785 (100% NA - Pruned)")
    ]
    for i, row in enumerate(cpcb_compact):
        cells = cpcb_tbl.rows[i+1].cells
        bg = "F9FAFB" if i % 2 == 1 else "FFFFFF"
        for j, val in enumerate(row):
            set_cell_background(cells[j], bg)
            set_cell_margins(cells[j], 25, 25, 50, 50)
            r = cells[j].paragraphs[0].add_run(val)
            r.font.size = Pt(8)
            if j == 0: r.font.bold = True

    doc.add_page_break()

    # =========================================================================
    # CHAPTER 8 – METHODOLOGY
    # =========================================================================
    add_chapter_heading(doc, "8", "METHODOLOGY")
    add_section_heading(doc, "8.1 Analytical Architecture Pipeline")
    add_body_p(
        doc,
        "The project follows a ten-stage methodology implemented across modular R scripts, transitioning from raw data loading to API delivery. "
        "Figure 8.1 depicts the end-to-end data processing and modeling flow."
    )

    workflow_text = (
        "┌────────────────────────────────────────────────────────────────────────┐\n"
        "│ 1. DATA INGESTION: readr::read_csv('aqi.csv') [235,785 rows × 9 cols]   │\n"
        "└──────────────────────────────────┬─────────────────────────────────────┘\n"
        "                                   ▼\n"
        "┌────────────────────────────────────────────────────────────────────────┐\n"
        "│ 2. DATA CLEANING: Deduplication • Prune 'note'/'unit' • lubridate dmy()│\n"
        "│    Rule-based CPCB Status Reconciliation • Save data/aqi_clean.rds     │\n"
        "└──────────────────────────────────┬─────────────────────────────────────┘\n"
        "                                   ▼\n"
        "┌────────────────────────────────────────────────────────────────────────┐\n"
        "│ 3. EXPLORATORY & STATISTICAL ANALYSIS: Moments • Category & State EDA  │\n"
        "│    One-Way ANOVA (State, Month, Pollutant) • Welch t-test • Cor(r)    │\n"
        "└──────────────────────────────────┬─────────────────────────────────────┘\n"
        "                                   ▼\n"
        "┌────────────────────────────────────────────────────────────────────────┐\n"
        "│ 4. VISUAL ANALYTICS: 16 ggplot2 high-res graphics saved to output/     │\n"
        "└──────────────────────────────────┬─────────────────────────────────────┘\n"
        "                                   ▼\n"
        "┌────────────────────────────────────────────────────────────────────────┐\n"
        "│ 5. MACHINE LEARNING ENGINE: 80/20 Split • Feature Engineering          │\n"
        "│    Linear Regression vs Random Forest (200 trees, mtry=3) • RMSE/R²    │\n"
        "└──────────────────────────────────┬─────────────────────────────────────┘\n"
        "                                   ▼\n"
        "┌────────────────────────────────────────────────────────────────────────┐\n"
        "│ 6. ADVANCED UTILITIES & DELIVERY: 7-Day Holt-Winters • Z-Score Anomaly │\n"
        "│    AQLI Life Loss • Purifier CADR • Policy Sim • Plumber REST API      │\n"
        "└────────────────────────────────────────────────────────────────────────┘"
    )
    add_code_block(doc, workflow_text)
    p_wf = doc.add_paragraph()
    r_wf = p_wf.add_run("Figure 8.1 – End-to-End Methodological Architecture Pipeline")
    r_wf.font.bold = True
    r_wf.font.size = Pt(9.5)
    r_wf.font.color.rgb = NAVY

    add_section_heading(doc, "8.2 Methodological Stages")
    add_body_p(
        doc,
        "The workflow enforces strict mathematical reproducibility: (1) Ingestion verifies schema integrity. (2) Cleaning removes uninformative "
        "fields and reconciles categories. (3) EDA profiles univariate moments and group aggregations. (4) Visualization operationalizes the Grammar "
        "of Graphics. (5) Hypothesis testing confirms non-random variance across space, time, and chemistry. (6) Machine Learning benchmarks parametric "
        "vs ensemble non-linear regression. (7) Advanced analytics applies Holt-Winters exponential smoothing and Z-score thresholding. (8) Policy modeling "
        "translates emissions curbs into public health dividends. (9) Deployment exposes logic via an R Plumber REST API."
    )

    doc.add_page_break()

    # =========================================================================
    # CHAPTER 9 – DATA PREPROCESSING
    # =========================================================================
    add_chapter_heading(doc, "9", "DATA PREPROCESSING")
    add_body_p(
        doc,
        "Data preprocessing is implemented in 'scripts/02_data_cleaning.R' through seven systematic operations that clean, reconcile, and format the data:"
    )
    add_section_heading(doc, "9.1 Deduplication & Column Pruning")
    add_body_p(
        doc,
        "Exact row deduplication via distinct() verified that all 235,785 rows represent unique observations (0 duplicates). "
        "Columns 'unit' (constant string 'AQI') and 'note' (100% missing NA values) were dropped, eliminating memory overhead."
    )
    add_code_block(doc, "aqi_clean <- aqi_raw %>% distinct() %>%\n  select(date, state, area, number_of_monitoring_stations,\n         prominent_pollutants, aqi_value, air_quality_status)")

    add_section_heading(doc, "9.2 Date Conversion & Category Reconciliation")
    add_body_p(
        doc,
        "Calendar date strings were parsed into ISO Date objects via lubridate::dmy(), extracting year (2022–2025), month (Jan–Dec), numeric month (1–12), "
        "and day. Air quality status categories were audited and reconciled against CPCB breakpoint standards using vectorized case_when logic."
    )
    add_code_block(doc, "aqi_clean <- aqi_clean %>%\n  mutate(date = dmy(date), year = year(date),\n         month = month(date, label = TRUE, abbr = TRUE),\n         month_num = month(date), day = day(date)) %>%\n  filter(!is.na(aqi_value), !is.na(date)) %>%\n  mutate(air_quality_status = case_when(\n    !is.na(air_quality_status) & air_quality_status != '' ~ air_quality_status,\n    aqi_value <= 50  ~ 'Good',\n    aqi_value <= 100 ~ 'Satisfactory',\n    aqi_value <= 200 ~ 'Moderate',\n    aqi_value <= 300 ~ 'Poor',\n    aqi_value <= 400 ~ 'Very Poor',\n    TRUE             ~ 'Severe'\n  ))")

    add_section_heading(doc, "9.3 Outlier Validation & Feature Engineering")
    add_body_p(
        doc,
        "Physical plausibility was validated by enforcing an upper bound filter (aqi_value <= 999). Zero sensor corruption records exceeded 999. "
        "Feature engineering in 'scripts/06_ml_models.R' derived: (1) pollutant_score (PM2.5=5, PM10=4, NO2/SO2=3, NH3/CO/O3=2, other=1); "
        "(2) season (Winter=1, Summer=2, Monsoon=3, Autumn=4); (3) binary seasonal flags (is_winter, is_monsoon); and (4) state_mean_aqi historical baselines."
    )

    doc.add_page_break()

    # =========================================================================
    # CHAPTER 10 – EXPLORATORY DATA ANALYSIS
    # =========================================================================
    add_chapter_heading(doc, "10", "EXPLORATORY DATA ANALYSIS")
    add_section_heading(doc, "10.1 Univariate Statistical Moments")
    add_body_p(
        doc,
        "Exploratory analysis reveals that national AQI spans from 3.00 to 500.00 with a mean of 111.13, median of 92.00, standard deviation of 71.45, "
        "and an IQR of 83.00 (Q1 = 59.00, Q3 = 142.00). Positive skewness (+1.425) reflects extended right-tail episodic winter pollution events."
    )

    add_section_heading(doc, "10.2 Category Distribution and Regional Disparity")
    add_body_p(doc, "Tables 10.1 and 10.2 summarize the distribution across CPCB status tiers and the state-level geographic pollution hierarchy.")

    # Table 10.1
    p_t_c = doc.add_paragraph()
    r_t_c = p_t_c.add_run("Table 10.1 – Distribution of Air Quality Categories (N = 235,785)")
    r_t_c.font.bold = True
    r_t_c.font.size = Pt(9.5)
    r_t_c.font.color.rgb = NAVY

    t_cat = doc.add_table(rows=7, cols=4)
    t_cat.alignment = WD_TABLE_ALIGNMENT.CENTER
    set_table_borders(t_cat)
    cat_hdrs = ["Category", "AQI Range", "Count", "Percentage (%)"]
    for j, h in enumerate(cat_hdrs):
        cell = t_cat.rows[0].cells[j]
        set_cell_background(cell, "1B365D")
        cell.paragraphs[0].alignment = WD_ALIGN_PARAGRAPH.CENTER
        r = cell.paragraphs[0].add_run(h)
        r.font.bold = True
        r.font.size = Pt(8.5)
        r.font.color.rgb = RGBColor(0xFF, 0xFF, 0xFF)

    c_rows = [
        ("Satisfactory", "51 – 100", "88,897", "37.70%"),
        ("Moderate", "101 – 200", "77,537", "32.88%"),
        ("Good", "0 – 50", "41,971", "17.80%"),
        ("Poor", "201 – 300", "21,154", "8.97%"),
        ("Very Poor", "301 – 400", "5,671", "2.41%"),
        ("Severe", "> 400", "555", "0.24%")
    ]
    for i, row in enumerate(c_rows):
        cells = t_cat.rows[i+1].cells
        bg = "F9FAFB" if i % 2 == 1 else "FFFFFF"
        for j, val in enumerate(row):
            set_cell_background(cells[j], bg)
            set_cell_margins(cells[j], 20, 20, 40, 40)
            if j in [1, 2, 3]: cells[j].paragraphs[0].alignment = WD_ALIGN_PARAGRAPH.RIGHT
            r = cells[j].paragraphs[0].add_run(val)
            r.font.size = Pt(8)
            if j == 0: r.font.bold = True

    # Table 10.2
    p_t_st = doc.add_paragraph()
    r_t_st = p_t_st.add_run("Table 10.2 – Top 15 Most Polluted States vs Cleanest States in India")
    r_t_st.font.bold = True
    r_t_st.font.size = Pt(9.5)
    r_t_st.font.color.rgb = NAVY

    t_st = doc.add_table(rows=12, cols=5)
    t_st.alignment = WD_TABLE_ALIGNMENT.CENTER
    set_table_borders(t_st)
    st_hdrs = ["State / Territory", "Mean AQI", "Median AQI", "Max AQI", "Observations"]
    for j, h in enumerate(st_hdrs):
        cell = t_st.rows[0].cells[j]
        set_cell_background(cell, "1B365D")
        cell.paragraphs[0].alignment = WD_ALIGN_PARAGRAPH.CENTER
        r = cell.paragraphs[0].add_run(h)
        r.font.bold = True
        r.font.size = Pt(8.5)
        r.font.color.rgb = RGBColor(0xFF, 0xFF, 0xFF)

    st_rows_comp = [
        ("1. Delhi", "206.42", "194.00", "494.00", "1,125"),
        ("2. Jharkhand", "164.94", "154.00", "436.00", "721"),
        ("3. Himachal Pradesh", "159.88", "151.00", "438.00", "1,066"),
        ("4. Bihar", "157.29", "132.00", "488.00", "21,553"),
        ("5. Chandigarh", "141.87", "127.00", "412.00", "1,125"),
        ("6. Haryana", "140.73", "120.00", "469.00", "21,706"),
        ("7. Rajasthan", "127.84", "113.00", "452.00", "26,585"),
        ("8. Uttar Pradesh", "126.31", "108.00", "494.00", "21,609"),
        ("Cleanest: Mizoram", "47.20", "37.00", "183.00", "1,000"),
        ("Cleanest: Sikkim", "53.69", "52.00", "265.00", "836"),
        ("Cleanest: Arunachal Pradesh", "54.51", "48.00", "183.00", "509")
    ]
    for i, row in enumerate(st_rows_comp):
        cells = t_st.rows[i+1].cells
        bg = "F9FAFB" if i % 2 == 1 else "FFFFFF"
        for j, val in enumerate(row):
            set_cell_background(cells[j], bg)
            set_cell_margins(cells[j], 20, 20, 40, 40)
            if j >= 1: cells[j].paragraphs[0].alignment = WD_ALIGN_PARAGRAPH.RIGHT
            r = cells[j].paragraphs[0].add_run(val)
            r.font.size = Pt(8)
            if j == 0: r.font.bold = True

    add_section_heading(doc, "10.3 Seasonal Trajectory and Prominent Pollutants")
    add_body_p(
        doc,
        "Tables 10.3 and 10.4 profile the monthly cycle and chemical pollutant breakdown. Air quality surges in November (mean AQI 160.94) and "
        "January (151.74) due to winter thermal inversion, before dropping to 62.78 in July due to monsoon wet scavenging. Particulate matter (PM10 and PM2.5) "
        "drives over 78% of all pollution events, with PM2.5 carrying the highest average AQI severity of 168.03."
    )

    # Table 10.4
    p_t_pol = doc.add_paragraph()
    r_t_pol = p_t_pol.add_run("Table 10.4 – Breakdown of Prominent Pollutants and Associated AQI Severity")
    r_t_pol.font.bold = True
    r_t_pol.font.size = Pt(9.5)
    r_t_pol.font.color.rgb = NAVY

    t_pol = doc.add_table(rows=6, cols=4)
    t_pol.alignment = WD_TABLE_ALIGNMENT.CENTER
    set_table_borders(t_pol)
    pol_hdrs = ["Prominent Pollutant", "Total Observations", "Percentage (%)", "Average AQI Severity"]
    for j, h in enumerate(pol_hdrs):
        cell = t_pol.rows[0].cells[j]
        set_cell_background(cell, "1B365D")
        cell.paragraphs[0].alignment = WD_ALIGN_PARAGRAPH.CENTER
        r = cell.paragraphs[0].add_run(h)
        r.font.bold = True
        r.font.size = Pt(8.5)
        r.font.color.rgb = RGBColor(0xFF, 0xFF, 0xFF)

    pol_rows = [
        ("PM10 (Coarse Particulate)", "111,053", "47.10%", "93.74"),
        ("PM2.5 (Fine Particulate)", "59,670", "25.31%", "168.03"),
        ("Ozone (O3)", "16,202", "6.87%", "78.41"),
        ("PM2.5, PM10 (Combined)", "13,199", "5.60%", "130.18"),
        ("Carbon Monoxide (CO)", "12,867", "5.46%", "68.22")
    ]
    for i, row in enumerate(pol_rows):
        cells = t_pol.rows[i+1].cells
        bg = "F9FAFB" if i % 2 == 1 else "FFFFFF"
        for j, val in enumerate(row):
            set_cell_background(cells[j], bg)
            set_cell_margins(cells[j], 20, 20, 40, 40)
            if j >= 1: cells[j].paragraphs[0].alignment = WD_ALIGN_PARAGRAPH.RIGHT
            r = cells[j].paragraphs[0].add_run(val)
            r.font.size = Pt(8)
            if j == 0: r.font.bold = True

    doc.add_page_break()

    # =========================================================================
    # CHAPTER 11 – DATA VISUALIZATION
    # =========================================================================
    add_chapter_heading(doc, "11", "DATA VISUALIZATION")
    add_body_p(
        doc,
        "The project generates 16 high-resolution visualizations using ggplot2 in 'scripts/04_visualization.R', applying a unified visual theme "
        "('theme_aqi') and standardized CPCB color schemes. Each graphic is systematically presented below with visual interpretation and key scientific observations."
    )

    # 11.1 & 11.2 (Pair 1)
    add_figure_compact(
        doc, "11.1", "Distribution of AQI Values Across India", "01_aqi_histogram.png",
        "Histogram (binwidth = 10) displays unimodal distribution with marked right skew. The dashed red line marks the national mean (111.1), "
        "substantially exceeding the median (92.0). Extended right tail captures hazardous episodic excursions reaching index maximums (500)."
    )
    add_figure_compact(
        doc, "11.2", "AQI Category Distribution", "02_aqi_category_bar.png",
        "Bar chart of official CPCB categories highlights that Satisfactory (37.7%) and Moderate (32.9%) comprise 70.6% of records. "
        "Pristine 'Good' air accounts for only 17.8%, while Poor, Very Poor, and Severe categories constitute 11.6% of observations."
    )
    doc.add_page_break()

    # 11.3 & 11.4 (Pair 2)
    add_figure_compact(
        doc, "11.3", "Top 15 Most Polluted States Ranked by Average AQI", "03_top_states_bar.png",
        "Horizontal gradient bar chart shows Delhi ranking highest nationally (mean AQI 206.4), followed by Jharkhand (164.9), Himachal Pradesh (159.9), "
        "Bihar (157.3), Chandigarh (141.9), and Haryana (140.7), illustrating severe geographical concentration across the northern belt."
    )
    add_figure_compact(
        doc, "11.4", "Monthly AQI Trend and Seasonal Inversion", "04_monthly_trend.png",
        "Line and area trend demonstrates sharp annual cycle peaking in November (160.9) and January (151.7) during winter thermal inversion, "
        "before plummeting by 61% to a trough of 62.8 in July due to southwest monsoon precipitation wet scavenging."
    )
    doc.add_page_break()

    # 11.5 & 11.6 (Pair 3)
    add_figure_compact(
        doc, "11.5", "AQI Boxplot Across Top 10 Polluted States", "05_boxplot_states.png",
        "Boxplot illustrates median, IQR, and upper outliers. Delhi exhibits median of 194.0 and wide IQR extending past 270. "
        "Northern states (Bihar, Haryana, Rajasthan) display persistent extreme outliers reaching 450–500 AQI."
    )
    add_figure_compact(
        doc, "11.6", "AQI Probability Density by Category", "06_density_plot.png",
        "Overlapping probability density curves show smooth continuous transitions across CPCB risk tiers. "
        "Moderate tier density peaks at 130–150 AQI, while Poor and Very Poor tiers exhibit broad dispersion under atmospheric stagnation."
    )
    doc.add_page_break()

    # 11.7 & 11.8 (Pair 4)
    add_figure_compact(
        doc, "11.7", "Relative Frequency Distribution of Prominent Pollutants", "07_pollutant_distribution.png",
        "Horizontal bar chart confirms particulate dominance: coarse PM10 dictates AQI in 47.1% of records, fine PM2.5 in 25.3%, Ozone in 6.9%, "
        "and combined PM2.5+PM10 in 5.6%. In total, particulates drive over 78% of all national pollution events."
    )
    add_figure_compact(
        doc, "11.8", "Average AQI Severity by Prominent Pollutant Class", "08_aqi_by_pollutant.png",
        "Gradient bar chart demonstrates that PM2.5 is the most toxic pollutant, driving an alarming average AQI of 168.0, "
        "followed by combined PM2.5+PM10 (130.2), whereas PM10 alone averages 93.7 and gaseous pollutants (SO2, CO) average below 70."
    )
    doc.add_page_break()

    # 11.9 & 11.10 (Pair 5)
    add_figure_compact(
        doc, "11.9", "Monitoring Station Density versus AQI Value", "09_scatter_stations_aqi.png",
        "Scatter plot of station count (1 to 40) vs AQI (sampled 5,000 observations) shows a flat regression line (dashed black). "
        "Pearson correlation of r = 0.0773 proves that observed AQI is independent of station count, confirming lack of sensor density bias."
    )
    add_figure_compact(
        doc, "11.10", "State-Wise Proportionate Breakdown of AQI Categories", "10_category_by_state_stacked.png",
        "Stacked bar chart reveals that in Delhi, Poor, Very Poor, and Severe air comprise over 48% of the year, with Good air virtually absent (<3%). "
        "In contrast, southern and central states maintain over 75% of days in Satisfactory or Moderate tiers."
    )
    doc.add_page_break()

    # 11.11 & 11.12 (Pair 6)
    add_figure_compact(
        doc, "11.11", "Multi-Year Longitudinal AQI Trajectory", "11_yearly_trend.png",
        "Longitudinal line chart shows national mean AQI remained stable: 113.8 in 2022, 115.1 in 2023, 106.0 in 2024, and 112.4 in 2025. "
        "The multi-year plateau confirms that existing mitigations balance growth but have not yet achieved structural pollution reductions."
    )
    add_figure_compact(
        doc, "11.12", "Dual-Axis Heatmap: State versus Month AQI Severity", "12_heatmap_state_month.png",
        "Tile heatmap reveals a deep-red winter pollution corridor across Delhi, Haryana, UP, and Bihar from October to January (AQI 220–290), "
        "contrasted by a clean green corridor across all states in July and August (AQI 50–85), confirming a regional transboundary airshed."
    )
    doc.add_page_break()

    # 11.13 & 11.14 (Pair 7)
    add_figure_compact(
        doc, "11.13", "Violin and Boxplot Distribution of AQI by Pollutant Type", "13_violin_aqi_pollutant.png",
        "Violin plot reveals a bimodal probability bulge for PM2.5 extending past 350 AQI. "
        "PM10 shows a tighter unimodal density centered at 80–110, proving PM2.5 is the primary agent of extreme pollution emergencies."
    )
    add_figure_compact(
        doc, "11.14", "Random Forest Variable Importance Plot", "14_rf_variable_importance.png",
        "Permutation variable importance (%IncMSE) ranks Pollutant Score (168.01) and State Historical Mean (135.09) as the dominant predictors, "
        "followed by Station Count (59.78), Month (31.74), Monsoon Flag (25.43), and Winter Flag (21.48)."
    )
    doc.add_page_break()

    # 11.15 & 11.16 (Pair 8)
    add_figure_compact(
        doc, "11.15", "Linear Regression Diagnostic: Actual vs Predicted AQI", "15_lr_actual_vs_predicted.png",
        "Scatter plot shows actual vs predicted AQI on the 20% test set. Linear model exhibits high residual scatter around the identity line, "
        "under-predicting severe peaks (>300) and over-predicting clean days (<50), yielding RMSE of 55.61 and R² of 0.390."
    )
    add_figure_compact(
        doc, "11.16", "Random Forest Model Diagnostic: Actual vs Predicted AQI", "16_rf_actual_vs_predicted.png",
        "Ensemble Random Forest regressor diagnostic shows tight point clustering along the 45-degree identity line. "
        "The model effectively captures non-linear winter peaks, reducing RMSE to 48.29 and boosting explained variance to 54.1% (R² = 0.541)."
    )
    doc.add_page_break()

    # =========================================================================
    # CHAPTER 12 – IMPLEMENTATION USING R
    # =========================================================================
    add_chapter_heading(doc, "12", "IMPLEMENTATION USING R")
    add_section_heading(doc, "12.1 Environment Configuration & Master Execution")
    add_body_p(
        doc,
        "The master runner 'main.R' coordinates all project phases, verifying package dependencies and invoking each phase sequentially. "
        "Key implementation scripts include 01_data_loading.R, 02_data_cleaning.R, 03_eda.R, 05_statistical_analysis.R, 06_ml_models.R, "
        "10_advanced_analytics.R, 11_health_policy_utilities.R, and 13_plumber_api.R."
    )
    add_code_block(doc, "run_phase <- function(phase_num, phase_name, script_path) {\n  cat(sprintf('  ▶ Phase %d: %s\\n', phase_num, phase_name))\n  source(script_path)\n}\nrun_phase(1, 'Loading', 'scripts/01_data_loading.R')\nrun_phase(2, 'Cleaning', 'scripts/02_data_cleaning.R')\nrun_phase(6, 'Machine Learning', 'scripts/06_ml_models.R')")

    add_section_heading(doc, "12.2 Machine Learning Model Implementation")
    add_body_p(
        doc,
        "The machine learning engine ('06_ml_models.R') establishes an 80/20 train-test partition using a fixed random seed (set.seed(42)). "
        "A Multivariate Linear Regression model and a 200-tree Random Forest regressor (mtry = 3) are trained and comparatively evaluated via Metrics::rmse and Metrics::mae."
    )
    add_code_block(doc, "# Train-Test Partition & Model Training\nset.seed(42)\ntrain_idx <- sample(seq_len(nrow(aqi_ml)), size = floor(0.80 * nrow(aqi_ml)))\ntrain_data <- aqi_ml[train_idx, ]; test_data <- aqi_ml[-train_idx, ]\n\n# Linear Regression & Random Forest (200 trees)\nlr_model <- lm(aqi_value ~ ., data = train_data)\nrf_model <- randomForest(aqi_value ~ ., data = train_sample, ntree = 200, mtry = 3, importance = TRUE)\n\n# Out-of-sample Predictions & Evaluation\nlr_preds <- predict(lr_model, newdata = test_data)\nrf_preds <- predict(rf_model, newdata = test_data)")

    add_section_heading(doc, "12.3 REST API Microservice (13_plumber_api.R)")
    add_body_p(
        doc,
        "The complete analytical pipeline is operationalized via R Plumber, exposing 12 REST endpoints on port 8000 for live data fetching, "
        "forecast generation, policy simulation, and health calculations."
    )
    add_code_block(doc, "# Plumber API Route in 13_plumber_api.R\n#* @get /forecast\nfunction(state = 'Delhi') {\n  data_sub <- if(state == 'All India') aqi_data else filter(aqi_data, state == state)\n  generate_aqi_forecast(data_sub, forecast_days = 7)\n}")

    doc.add_page_break()

    # =========================================================================
    # CHAPTER 13 – RESULTS AND DISCUSSION
    # =========================================================================
    add_chapter_heading(doc, "13", "RESULTS AND DISCUSSION")
    add_section_heading(doc, "13.1 Parametric Hypothesis Testing Outcomes")
    add_body_p(
        doc,
        "Table 13.1 summarizes the parametric statistical tests. One-Way ANOVA across states (F = 1674, p < 2.2e-16), months (F = 5403, p < 2.2e-16), "
        "and pollutants (F = 1644, p < 2.2e-16) confirms that geographic disparity, seasonal cycles, and chemical toxicity are statistically significant. "
        "Welch t-testing confirms Delhi's mean AQI (206.42) is significantly higher than Jharkhand (164.94, t = 11.12, p < 2.2e-16). Station density correlation "
        "(Pearson r = +0.0773) confirms zero measurement artifact."
    )

    p_t_st = doc.add_paragraph()
    r_t_st = p_t_st.add_run("Table 13.1 – Summary of Parametric Statistical Tests")
    r_t_st.font.bold = True
    r_t_st.font.size = Pt(9.5)
    r_t_st.font.color.rgb = NAVY

    t_stat = doc.add_table(rows=6, cols=5)
    t_stat.alignment = WD_TABLE_ALIGNMENT.CENTER
    set_table_borders(t_stat)
    stat_hdrs = ["Statistical Test", "Null Hypothesis (H0)", "Statistic", "p-value", "Inference"]
    for j, h in enumerate(stat_hdrs):
        cell = t_stat.rows[0].cells[j]
        set_cell_background(cell, "1B365D")
        cell.paragraphs[0].alignment = WD_ALIGN_PARAGRAPH.CENTER
        r = cell.paragraphs[0].add_run(h)
        r.font.bold = True
        r.font.size = Pt(8.5)
        r.font.color.rgb = RGBColor(0xFF, 0xFF, 0xFF)

    stat_rows = [
        ("One-Way ANOVA (State)", "Mean AQI is identical across 32 States", "F(31, 235753)=1674", "< 2.2e-16", "Reject H0 (Spatial variance)"),
        ("One-Way ANOVA (Month)", "Mean AQI is identical across 12 months", "F(11, 235773)=5403", "< 2.2e-16", "Reject H0 (Seasonal cycle)"),
        ("One-Way ANOVA (Pollutant)", "Mean AQI is identical across pollutants", "F(48, 235736)=1644", "< 2.2e-16", "Reject H0 (Toxicity differs)"),
        ("Welch Two-Sample t-test", "Mean Delhi AQI equals Mean Jharkhand AQI", "t=11.12, df=1826.1", "< 2.2e-16", "Reject H0 (Delhi > Jharkhand)"),
        ("Pearson Correlation", "Zero linear relationship between stations and AQI", "r = +0.0773", "< 2.2e-16", "Negligible (No sensor bias)")
    ]
    for i, row in enumerate(stat_rows):
        cells = t_stat.rows[i+1].cells
        bg = "F9FAFB" if i % 2 == 1 else "FFFFFF"
        for j, val in enumerate(row):
            set_cell_background(cells[j], bg)
            set_cell_margins(cells[j], 20, 20, 40, 40)
            r = cells[j].paragraphs[0].add_run(val)
            r.font.size = Pt(8)
            if j == 0: r.font.bold = True

    add_section_heading(doc, "13.2 Machine Learning Model Comparison")
    add_body_p(
        doc,
        "Table 13.2 details the out-of-sample evaluation on 47,157 test observations. Random Forest achieves superior predictive accuracy, "
        "reducing RMSE by 13.2% (48.2871 vs 55.6092), reducing MAE by 16.8% (34.4654 vs 41.4362), and boosting explained variance to 54.1% (R² = 0.5412 vs 0.3901)."
    )

    p_t_ml = doc.add_paragraph()
    r_t_ml = p_t_ml.add_run("Table 13.2 – Machine Learning Model Performance Comparison (Test Set: N = 47,157)")
    r_t_ml.font.bold = True
    r_t_ml.font.size = Pt(9.5)
    r_t_ml.font.color.rgb = NAVY

    t_ml = doc.add_table(rows=3, cols=5)
    t_ml.alignment = WD_TABLE_ALIGNMENT.CENTER
    set_table_borders(t_ml)
    ml_hdrs = ["Model", "RMSE", "MAE", "R² Score", "Performance Summary"]
    for j, h in enumerate(ml_hdrs):
        cell = t_ml.rows[0].cells[j]
        set_cell_background(cell, "1B365D")
        cell.paragraphs[0].alignment = WD_ALIGN_PARAGRAPH.CENTER
        r = cell.paragraphs[0].add_run(h)
        r.font.bold = True
        r.font.size = Pt(8.5)
        r.font.color.rgb = RGBColor(0xFF, 0xFF, 0xFF)

    ml_rows = [
        ("Linear Regression", "55.6092", "41.4362", "0.3901 (39.0%)", "Baseline Parametric Regressor"),
        ("Random Forest (200 trees)", "48.2871", "34.4654", "0.5412 (54.1%)", "Optimal Model (13.2% lower RMSE)")
    ]
    for i, row in enumerate(ml_rows):
        cells = t_ml.rows[i+1].cells
        bg = "F9FAFB" if i % 2 == 1 else "FFFFFF"
        for j, val in enumerate(row):
            set_cell_background(cells[j], bg)
            set_cell_margins(cells[j], 20, 20, 40, 40)
            if j in [1, 2, 3]: cells[j].paragraphs[0].alignment = WD_ALIGN_PARAGRAPH.RIGHT
            r = cells[j].paragraphs[0].add_run(val)
            r.font.size = Pt(8)
            if j == 0: r.font.bold = True

    add_section_heading(doc, "13.3 Variable Importance & Policy Simulation")
    add_body_p(
        doc,
        "Table 13.3 details feature importance. Pollutant Score (%IncMSE = 168.01) and State Historical Mean (135.09) are the primary predictors. "
        "Under CPCB standards, 55.51% of days achieve compliance (AQI <= 100), but only 17.80% meet WHO guidelines (AQI <= 50). "
        "AQLI modeling indicates that exposure to 85 ug/m3 PM2.5 curtails life expectancy by 7.8 years. In policy simulations, a combined 20% traffic, "
        "50% stubble, and 15% industrial curb reduces severe AQI (280) by 27.2% (76.3 points), avoiding 13.7 emergency hospitalizations per 100k population."
    )

    p_t_vi = doc.add_paragraph()
    r_t_vi = p_t_vi.add_run("Table 13.3 – Random Forest Variable Importance Hierarchy")
    r_t_vi.font.bold = True
    r_t_vi.font.size = Pt(9.5)
    r_t_vi.font.color.rgb = NAVY

    t_vi = doc.add_table(rows=6, cols=3)
    t_vi.alignment = WD_TABLE_ALIGNMENT.CENTER
    set_table_borders(t_vi)
    vi_hdrs = ["Engineered Feature", "% Increase in MSE (%IncMSE)", "Node Purity Increase"]
    for j, h in enumerate(vi_hdrs):
        cell = t_vi.rows[0].cells[j]
        set_cell_background(cell, "1B365D")
        cell.paragraphs[0].alignment = WD_ALIGN_PARAGRAPH.CENTER
        r = cell.paragraphs[0].add_run(h)
        r.font.bold = True
        r.font.size = Pt(8.5)
        r.font.color.rgb = RGBColor(0xFF, 0xFF, 0xFF)

    vi_rows = [
        ("pollutant_score (Chemical Hazard)", "168.01", "43,283,963"),
        ("state_mean_aqi (Geographic Baseline)", "135.09", "43,031,779"),
        ("number_of_monitoring_stations", "59.78", "3,985,803"),
        ("month_num (Chronological Month)", "31.74", "9,520,559"),
        ("is_monsoon (Precipitation Flag)", "25.43", "16,264,644")
    ]
    for i, row in enumerate(vi_rows):
        cells = t_vi.rows[i+1].cells
        bg = "F9FAFB" if i % 2 == 1 else "FFFFFF"
        for j, val in enumerate(row):
            set_cell_background(cells[j], bg)
            set_cell_margins(cells[j], 20, 20, 40, 40)
            if j >= 1: cells[j].paragraphs[0].alignment = WD_ALIGN_PARAGRAPH.RIGHT
            r = cells[j].paragraphs[0].add_run(val)
            r.font.size = Pt(8)
            if j == 0: r.font.bold = True

    doc.add_page_break()

    # =========================================================================
    # CHAPTER 14 – CONCLUSION
    # =========================================================================
    add_chapter_heading(doc, "14", "CONCLUSION")
    add_body_p(
        doc,
        "The project “Air Quality Index (AQI) Analysis and Prediction Platform Using R” successfully designed, developed, and validated a comprehensive "
        "Data Science platform that extracts actionable environmental intelligence from 235,785 official ambient air quality records spanning 32 Indian States "
        "and 291 cities between April 2022 and April 2025. By implementing a cohesive tidyverse pipeline in R, the study executed systematic data cleansing, "
        "temporal decomposition, exploratory profiling, and parametric ANOVA hypothesis testing."
    )
    add_body_p(
        doc,
        "All primary technical objectives were accomplished: (1) Ingestion and cleaning of 235,785 records with 100% data integrity; (2) Confirmation "
        "of significant spatial, seasonal, and chemical variance (ANOVA p < 2.2e-16); (3) Demonstration that Random Forest (RMSE 48.29, R² 0.541) "
        "substantially outperforms Linear Regression; (4) Identification of Pollutant Score and State Historical Baseline as dominant predictors; "
        "(5) Implementation of 7-day Holt-Winters forecasting and Z-score anomaly tracking (1,125 anomaly days); (6) Quantification of AQLI life expectancy loss "
        "and policy simulation dividends (27.2% AQI reduction, 13.7 hospitalizations avoided); and (7) Deployment via an R Plumber REST API. "
        "The platform provides an open-source, evidence-based computational blueprint to guide environmental policy and safeguard public health."
    )

    doc.add_page_break()

    # =========================================================================
    # CHAPTER 15 – FUTURE ENHANCEMENT
    # =========================================================================
    add_chapter_heading(doc, "15", "FUTURE ENHANCEMENT")
    add_body_p(doc, "The platform is architected to support future technical extensions across five strategic domains:")
    enhancements = [
        ("1. Satellite Remote Sensing (AOD)", "Assimilate gridded Aerosol Optical Depth (AOD) telemetry from NASA MODIS and ESA Sentinel-5P TROPOMI to interpolate continuous surface air quality across unmonitored rural districts."),
        ("2. Deep Learning Spatio-Temporal Models", "Implement Recurrent Neural Networks (LSTM, GRU) and Temporal Fusion Transformers to capture sequential temporal lags and spatial cross-station interactions for high-precision hourly forecasts."),
        ("3. Meteorological Telemetry Assimilation", "Integrate automated telemetry from India Meteorological Department (IMD) automatic weather stations (boundary layer height, inversion intensity, wind vectors) to enhance model accuracy."),
        ("4. Edge-IoT Calibration Mesh", "Ingest telemetry from dense low-cost optical particle sensors (Plantower PMS5003), using R machine learning models to dynamically calibrate for relative humidity hygroscopic growth."),
        ("5. Cloud Deployment & Citizen Mobile Alerts", "Package the Plumber API into Docker containers hosted on AWS/GCP, connecting to a geofenced citizen mobile application that delivers real-time health alerts during severe pollution events.")
    ]
    for e_num, e_desc in enhancements:
        p = doc.add_paragraph()
        p.paragraph_format.left_indent = Inches(0.2)
        p.paragraph_format.space_after = Pt(4)
        r_t = p.add_run(f"• {e_num}: ")
        r_t.font.bold = True
        r_t.font.size = Pt(9.5)
        r_t.font.color.rgb = STEEL
        r_d = p.add_run(e_desc)
        r_d.font.size = Pt(9.5)

    doc.add_page_break()

    # =========================================================================
    # CHAPTER 16 – REFERENCES
    # =========================================================================
    add_chapter_heading(doc, "16", "REFERENCES")
    refs_list = [
        "[1] Central Pollution Control Board (CPCB), 'National Air Quality Index: Technical Report and Guidelines', MoEF&CC, Govt. of India, New Delhi, 2014.",
        "[2] World Health Organization (WHO), 'WHO Global Air Quality Guidelines: Particulate Matter, Ozone, NO2, SO2 and CO', Geneva, 2021.",
        "[3] R Core Team, 'R: A Language and Environment for Statistical Computing', R Foundation for Statistical Computing, Vienna, Austria, URL: https://www.R-project.org/, 2024.",
        "[4] Wickham, H., & Grolemund, G., 'R for Data Science: Import, Tidy, Transform, Visualize, and Model Data', 2nd ed., O'Reilly Media, 2023.",
        "[5] Wickham, H., 'ggplot2: Elegant Graphics for Data Analysis', 3rd ed., Springer-Verlag, New York, 2016.",
        "[6] Breiman, L., 'Random Forests', Machine Learning, vol. 45, no. 1, pp. 5–32, 2001.",
        "[7] Greenstone, M., Hasenkopf, C., & Lee, K., 'Air Quality Life Index (AQLI): Annual Report 2023', University of Chicago (EPIC), 2023.",
        "[8] Armstrong, T., & Treurnicht, M., 'plumber: An API Generator for R', R package version 1.2.2, Posit Software, 2021.",
        "[9] Guttikunda, S. K., Goel, R., & Pant, P., 'Nature of air pollution and emission sources in Indian cities', Atmospheric Environment, vol. 95, pp. 501–510, 2014.",
        "[10] Sharma, S., & Dikshit, O., 'Calculation of Air Quality Index based on factor analysis', Clean Tech. and Env. Policy, vol. 18, pp. 1109–1120, 2016.",
        "[11] Pant, P., Guttikunda, S. K., & Peltier, R. E., 'Exposure to particulate matter in India: A synthesis', Environmental Research, vol. 147, pp. 480–496, 2016.",
        "[12] Guo, Y., Zeng, H., et al., 'Association between fine particulate pollution and daily mortality: China analysis', The Lancet Planetary Health, vol. 1, pp. e255–e263, 2017.",
        "[13] Rybarczyk, Y., & Zalakeviciute, R., 'Machine learning approaches for outdoor air quality modelling: A review', Applied Sciences, vol. 8, p. 2570, 2018.",
        "[14] Open Government Data (OGD) Platform India, 'Historical NAQI Monitoring Data (2022–2025)', CPCB, URL: https://data.gov.in, 2025.",
        "[15] World Air Quality Index Project, 'The World Air Quality Index API Documentation', WAQI Open Data Platform, URL: https://aqicn.org/api/, 2024.",
        "[16] Liaw, A., & Wiener, M., 'Classification and Regression by randomForest', R News, vol. 2, no. 3, pp. 18–22, 2002.",
        "[17] Grolemund, G., & Wickham, H., 'Dates and Times Made Easy with lubridate', Journal of Statistical Software, vol. 40, no. 3, pp. 1–25, 2011.",
        "[18] Chang, W., et al., 'shiny: Web Application Framework for R', R package version 1.9.1, Posit Software, 2024.",
        "[19] Frick, H., & Kuhn, M., 'Metrics: Evaluation Metrics for Machine Learning', R package version 0.1.4, 2018.",
        "[20] Cheng, J., et al., 'leaflet: Create Interactive Web Maps with Leaflet Library', R package version 2.2.2, 2024."
    ]
    for ref in refs_list:
        p = doc.add_paragraph()
        p.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
        p.paragraph_format.left_indent = Inches(0.25)
        p.paragraph_format.first_line_indent = Inches(-0.25)
        p.paragraph_format.line_spacing = 1.1
        p.paragraph_format.space_after = Pt(4)
        r = p.add_run(ref)
        r.font.name = "Calibri"
        r.font.size = Pt(9)

    doc.add_page_break()

    # =========================================================================
    # CHAPTER 17 – APPENDIX
    # =========================================================================
    add_chapter_heading(doc, "17", "APPENDIX")
    add_section_heading(doc, "Appendix A: Complete Master Runner Script (main.R)")
    code_main_compact = (
        'setwd("G:/rproject")\n'
        'cat("AIR QUALITY INDEX ANALYSIS & PREDICTION PROJECT\\n")\n'
        'run_phase <- function(num, name, path) {\n'
        '  cat(sprintf("▶ Phase %d: %s\\n", num, name)); source(path)\n'
        '}\n'
        'run_phase(1,  "Data Loading",         "scripts/01_data_loading.R")\n'
        'run_phase(2,  "Data Cleaning",        "scripts/02_data_cleaning.R")\n'
        'run_phase(3,  "Exploratory Analysis", "scripts/03_eda.R")\n'
        'run_phase(4,  "Visualization",        "scripts/04_visualization.R")\n'
        'run_phase(5,  "Statistical Analysis", "scripts/05_statistical_analysis.R")\n'
        'run_phase(6,  "Machine Learning",     "scripts/06_ml_models.R")\n'
        'run_phase(10, "Advanced Analytics",   "scripts/10_advanced_analytics.R")\n'
        'run_phase(11, "Health & Policy Engine","scripts/11_health_policy_utilities.R")\n'
        'run_phase(12, "Alerts & Reporting",    "scripts/12_alert_reporting.R")\n'
        'cat("ALL PHASES COMPLETE! Output saved to data/ and output/\\n")'
    )
    add_code_block(doc, code_main_compact)

    add_section_heading(doc, "Appendix B: Sample Records from Cleaned AQI Dataset (aqi_clean.csv)")
    p_t_samp = doc.add_paragraph()
    r_t_samp = p_t_samp.add_run("Table 17.1 – Sample Records from Cleaned AQI Dataset")
    r_t_samp.font.bold = True
    r_t_samp.font.size = Pt(9.5)
    r_t_samp.font.color.rgb = NAVY

    t_samp = doc.add_table(rows=7, cols=7)
    t_samp.alignment = WD_TABLE_ALIGNMENT.CENTER
    set_table_borders(t_samp)
    s_hdrs = ["Date", "State", "Area", "Stations", "Pollutant", "AQI", "CPCB Status"]
    for j, h in enumerate(s_hdrs):
        cell = t_samp.rows[0].cells[j]
        set_cell_background(cell, "1B365D")
        cell.paragraphs[0].alignment = WD_ALIGN_PARAGRAPH.CENTER
        r = cell.paragraphs[0].add_run(h)
        r.font.bold = True
        r.font.size = Pt(8)
        r.font.color.rgb = RGBColor(0xFF, 0xFF, 0xFF)

    samples_data = [
        ("2025-04-30", "Delhi", "Anand Vihar", "1", "PM10", "284", "Poor"),
        ("2025-04-30", "Maharashtra", "Bandra, Mumbai", "1", "PM2.5", "118", "Moderate"),
        ("2025-04-30", "Tamil Nadu", "Alandur, Chennai", "1", "O3", "58", "Satisfactory"),
        ("2025-04-30", "Karnataka", "BTM Layout, Bengaluru", "1", "PM10", "46", "Good"),
        ("2025-04-30", "West Bengal", "Ballygunge, Kolkata", "1", "PM2.5", "142", "Moderate"),
        ("2025-04-30", "Uttar Pradesh", "Talkatora, Lucknow", "1", "PM2.5,PM10", "215", "Poor")
    ]
    for i, row in enumerate(samples_data):
        cells = t_samp.rows[i+1].cells
        bg = "F9FAFB" if i % 2 == 1 else "FFFFFF"
        for j, val in enumerate(row):
            set_cell_background(cells[j], bg)
            set_cell_margins(cells[j], 20, 20, 30, 30)
            if j in [3, 5]: cells[j].paragraphs[0].alignment = WD_ALIGN_PARAGRAPH.RIGHT
            r = cells[j].paragraphs[0].add_run(val)
            r.font.size = Pt(7.5)
            if j == 0: r.font.bold = True

    output_path = "DATA_SCIENCE_PROJECT_REPORT_FINAL.docx"
    print(f"Saving finalized report to {output_path}...")
    doc.save(output_path)
    try:
        doc.save("DATA_SCIENCE_PROJECT_REPORT.docx")
    except Exception:
        pass
    print("SUCCESS! Document generated.")

if __name__ == "__main__":
    create_report()
