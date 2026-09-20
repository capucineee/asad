from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import A4
from reportlab.lib.colors import HexColor, white
from reportlab.pdfbase.pdfmetrics import stringWidth
from datetime import date

OUT = '/Users/c/asad/output/pdf/facture-parodie-asad-veyliria.pdf'
W, H = A4

NAVY = HexColor('#071D4D')
BLUE = HexColor('#1479E8')
CYAN = HexColor('#38CBE3')
PURPLE = HexColor('#6D35E8')
CORAL = HexColor('#E54861')
PINK = HexColor('#FFF0F3')
CREAM = HexColor('#FFFCF9')
INK = HexColor('#2D2730')
MUTED = HexColor('#746D75')
LINE = HexColor('#EFDDE1')

c = canvas.Canvas(OUT, pagesize=A4)
c.setTitle('Facture parodie - ASAD x Veyliria')
c.setAuthor('Veyliria - document parodique')

def txt(s, x, y, size=10, color=INK, font='Helvetica'):
    c.setFillColor(color); c.setFont(font, size); c.drawString(x, y, s)

def right(s, x, y, size=10, color=INK, font='Helvetica'):
    c.setFillColor(color); c.setFont(font, size); c.drawRightString(x, y, s)

def rounded(x, y, w, h, col, r=12):
    c.setFillColor(col); c.setStrokeColor(col); c.roundRect(x, y, w, h, r, fill=1, stroke=0)

def paw(x, y, s, col):
    c.setFillColor(col)
    c.ellipse(x-13*s, y-10*s, x+13*s, y+11*s, fill=1, stroke=0)
    for dx, dy, a, b in [(-13, 11, 4, 6), (-5, 18, 4.5, 6.5), (5, 18, 4.5, 6.5), (13, 11, 4, 6)]:
        c.ellipse(x+(dx-a)*s, y+(dy-b)*s, x+(dx+a)*s, y+(dy+b)*s, fill=1, stroke=0)

def vmark(x, y, s=1):
    # Simplified Veyliria-inspired V mark, used only as a decorative mark.
    p=c.beginPath(); p.moveTo(x, y+64*s); p.lineTo(x+22*s,y+64*s); p.lineTo(x+52*s,y); p.lineTo(x+36*s,y); p.close()
    c.setFillColor(PURPLE); c.drawPath(p,fill=1,stroke=0)
    p=c.beginPath(); p.moveTo(x+45*s,y); p.lineTo(x+72*s,y+47*s); p.curveTo(x+76*s,y+55*s,x+84*s,y+64*s,x+94*s,y+64*s); p.lineTo(x+114*s,y+64*s); p.lineTo(x+65*s,y); p.close()
    c.setFillColor(CYAN); c.drawPath(p,fill=1,stroke=0)

def money(n): return f'{n:,.0f}'.replace(',', ' ') + ' Pinguïs'

# page background
c.setFillColor(CREAM); c.rect(0,0,W,H,fill=1,stroke=0)
c.setFillColor(PINK); c.circle(W+35,H-40,150,fill=1,stroke=0)
c.setFillColor(HexColor('#EAF8FF')); c.circle(-40,75,112,fill=1,stroke=0)

# watermark: intentionally non-commercial
c.saveState(); c.translate(W/2,H/2); c.rotate(33)
c.setFillColor(HexColor('#F6D7DC')); c.setFont('Helvetica-Bold',42)
c.drawCentredString(0,0,'PARODIE - NE PAS PAYER')
c.restoreState()

# header
vmark(49,742,.64)
txt('VEYLIRIA',128,771,17,NAVY,'Helvetica-Bold')
txt('facturation imaginaire & bonne humeur',128,754,8,MUTED,'Helvetica')

rounded(395,748,150,32,NAVY,16)
txt('FACTURE 100% FAUSSE',411,760,8,white,'Helvetica-Bold')

txt('FACTURE',48,670,34,INK,'Helvetica-Bold')
txt('N° F-LOL-2026-001',49,647,10,CORAL,'Helvetica-Bold')
txt(f'Émise le {date.today().strftime("%d/%m/%Y")}',49,630,9,MUTED)

# From / To
rounded(48,538,230,70,white,16); rounded(306,538,239,70,white,16)
txt('DE',64,586,8,CORAL,'Helvetica-Bold'); txt('Veyliria',64,565,14,NAVY,'Helvetica-Bold'); txt('Atelier de sites qui ont du cœur',64,548,8,MUTED)
txt('POUR',322,586,8,CORAL,'Helvetica-Bold'); txt('ASAD',322,565,14,INK,'Helvetica-Bold'); txt('Association des Animaux en Détresse',322,548,8,MUTED)

# table
table_x, table_y, table_w = 48, 286, 497
rounded(table_x, table_y, table_w, 222, white, 16)
txt('DESCRIPTION',64,486,8,MUTED,'Helvetica-Bold'); right('QTÉ',423,486,8,MUTED,'Helvetica-Bold'); right('TOTAL',525,486,8,MUTED,'Helvetica-Bold')
c.setStrokeColor(LINE); c.setLineWidth(.7); c.line(64,474,529,474)

items = [
    ('Un paquet de Pinguïs', '1 paquet XXL', 4800, CORAL),
    ('Boisson du Québec', '1 bouteille très fraîche', 2900, BLUE),
    ('Câlins de Kilou', 'Illimités, avec supplément poils', 4800, PURPLE),
]
for i,(label,qty,amount,col) in enumerate(items):
    y = 438 - i*53
    c.setFillColor(col); c.circle(76,y+3,10,fill=1,stroke=0)
    paw(76,y+2,.30,white)
    txt(label,96,y+8,11,INK,'Helvetica-Bold')
    txt(qty,96,y-8,8,MUTED)
    right('1',423,y+2,10,INK)
    right(money(amount),525,y+2,10,INK,'Helvetica-Bold')
    if i < 2:
        c.setStrokeColor(LINE); c.line(64,y-24,529,y-24)

# total card
rounded(315,205,230,61,NAVY,18)
txt('TOTAL À NE SURTOUT PAS PAYER',332,244,7,HexColor('#A9EFFF'),'Helvetica-Bold')
right(money(12500),527,217,19,white,'Helvetica-Bold')

# Terms and playful note
rounded(48,84,244,112,PINK,18)
txt('CONDITIONS DE REGLEMENT',65,171,8,CORAL,'Helvetica-Bold')
txt('• Aucun paiement accepté.',65,149,9,INK)
txt('• Valable contre un sourire.',65,131,9,INK)
txt('• Kilou peut réclamer une friandise.',65,113,9,INK)

rounded(311,84,234,112,HexColor('#EDF9FF'),18)
txt('NOTE IMPORTANTE',328,171,8,BLUE,'Helvetica-Bold')
txt('Cette facture est un gag.',328,149,10,NAVY,'Helvetica-Bold')
txt('Elle ne vaut ni euro, ni croquette,',328,131,8,MUTED)
txt('ni droit à un service réel.',328,115,8,MUTED)

# footer
c.setStrokeColor(LINE); c.line(48,67,545,67)
paw(65,43,.45,CORAL)
txt('Document humoristique sans valeur comptable ou commerciale.',84,40,8,MUTED)
right('ASAD x Veyliria - pour rire uniquement',545,40,8,NAVY,'Helvetica-Bold')

c.save()
print(OUT)
