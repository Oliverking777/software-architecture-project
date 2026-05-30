import csv
import os
import logging
from datetime import datetime
from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer
from reportlab.lib.styles import getSampleStyleSheet
from app.config import settings

logger = logging.getLogger(__name__)

os.makedirs(settings.reports_dir, exist_ok=True)

class ReportService:

    @staticmethod
    async def generate_pdf(data: dict) -> str:
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"report_{timestamp}.pdf"
        filepath = os.path.join(settings.reports_dir, filename)

        doc = SimpleDocTemplate(filepath, pagesize=A4)
        styles = getSampleStyleSheet()
        elements = []

        # Titre
        elements.append(Paragraph("Rapport Epidemiologique — DSAS", styles['Title']))
        elements.append(Spacer(1, 20))
        elements.append(Paragraph(
            f"Genere le : {datetime.now().strftime('%d/%m/%Y %H:%M')}",
            styles['Normal']
        ))
        elements.append(Spacer(1, 20))

        # Statistiques
        case_counts = data.get("case_counts", {})
        if case_counts:
            elements.append(Paragraph("Cas par maladie et region :", styles['Heading2']))
            elements.append(Spacer(1, 10))

            table_data = [["Maladie", "Region", "Cas"]]
            for key, count in case_counts.items():
                parts = key.split(":", 1)
                if len(parts) == 2:
                    table_data.append([parts[0].capitalize(), parts[1], str(count)])

            table = Table(table_data, colWidths=[150, 200, 80])
            table.setStyle(TableStyle([
                ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#1B2A4A')),
                ('TEXTCOLOR',  (0,0), (-1,0), colors.white),
                ('FONTNAME',   (0,0), (-1,0), 'Helvetica-Bold'),
                ('FONTSIZE',   (0,0), (-1,0), 12),
                ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, colors.HexColor('#F8FAFC')]),
                ('GRID',       (0,0), (-1,-1), 0.5, colors.HexColor('#CBD5E1')),
                ('PADDING',    (0,0), (-1,-1), 8),
            ]))
            elements.append(table)

        doc.build(elements)
        logger.info(f"PDF genere : {filepath}")
        return filepath

    @staticmethod
    async def generate_csv(data: dict) -> str:
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"report_{timestamp}.csv"
        filepath = os.path.join(settings.reports_dir, filename)

        case_counts = data.get("case_counts", {})

        with open(filepath, 'w', newline='', encoding='utf-8') as f:
            writer = csv.writer(f)
            writer.writerow(["Maladie", "Region", "Cas"])
            for key, count in case_counts.items():
                parts = key.split(":", 1)
                if len(parts) == 2:
                    writer.writerow([parts[0], parts[1], count])

        logger.info(f"CSV genere : {filepath}")
        return filepath
