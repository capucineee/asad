from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import A4
from reportlab.lib.colors import HexColor, white, Color
from reportlab.lib.utils import ImageReader
from reportlab.pdfbase.pdfmetrics import stringWidth
from PIL import Image, ImageChops
import os, math

OUT = '/Users/c/asad/output/pdf/plaquette-presentation-asad-veyliria.pdf'
VEY_SRC = '/Users/c/Downloads/ChatGPT Image 20 sept. 2026, 10_01_41.png'
TMP = '/Users/c/asad/tmp/pdfs'
VEY = os.path.join(TMP, 'veyliria-transparent.png')
VEY_MARK = os.path.join(TMP, 'veyliria-mark.png')
W, H = A4

# Detour the supplied Veyliria logo: remove the original white square and crop to the actual mark.
im = Image.open(VEY_SRC).convert('RGBA')
pixels = im.load()
for y in range(im.height):
    for x in range(im.width):
        r, g, b, _ = pixels[x, y]
        # The source background is near-white. Keep the coloured/dark logo, soften its antialiased edges.
        distance = max(255-r, 255-g, 255-b)
        alpha = max(0, min(255, (distance - 12) * 18))
        pixels[x, y] = (r, g, b, alpha)
bbox = im.getchannel('A').getbbox()
full = im.crop(bbox)
full.save(VEY)
# Compact icon for the small presentation stamp (the V symbol without the wordmark).
mark = im.crop((260, 270, 1010, 875))
mark_bbox = mark.getchannel('A').getbbox()
mark.crop(mark_bbox).save(VEY_MARK)

# Palette: Veyliria = technological/precise, ASAD = gentle/warm
NAVY = HexColor('#061B47')
BLUE = HexColor('#0D76E8')
CYAN = HexColor('#36CDE7')
PURPLE = HexColor('#6B32E9')
CORAL = HexColor('#E3495D')
CORAL_D = HexColor('#C9354A')
INK = HexColor('#2C2730')
MUTED = HexColor('#706A73')
CREAM = HexColor('#FFFDFB')
ROSE = HexColor('#FFF0F2')
PEACH = HexColor('#FFF0E8')
BUTTER = HexColor('#FFF5C8')
LINE = HexColor('#F1DFE2')
LIGHTBLUE = HexColor('#EDF8FF')

c = canvas.Canvas(OUT, pagesize=A4)
c.setTitle('Plaquette de presentation - ASAD x Veyliria')
c.setAuthor('Veyliria')
c.setSubject('Presentation du site asso-asad.fr')

# ---------- primitive helpers ----------
def rect(x,y,w,h,fill,stroke=None,r=0):
    c.setFillColor(fill)
    c.setStrokeColor(stroke or fill)
    if r: c.roundRect(x,y,w,h,r,fill=1,stroke=1 if stroke else 0)
    else: c.rect(x,y,w,h,fill=1,stroke=1 if stroke else 0)

def text(s,x,y,size=10,color=INK,font='Helvetica', leading=None):
    c.setFont(font,size); c.setFillColor(color)
    if '\n' not in s:
        c.drawString(x,y,s); return
    lead = leading or size*1.3
    for line in s.split('\n'):
        c.drawString(x,y,line); y -= lead

def center(s,x,y,size=10,color=INK,font='Helvetica'):
    c.setFont(font,size); c.setFillColor(color); c.drawCentredString(x,y,s)

def lines(s,x,y,maxw,size=10,color=INK,font='Helvetica',leading=None):
    c.setFont(font,size); c.setFillColor(color)
    lead=leading or size*1.38
    words=s.split(); row=''; out=[]
    for word in words:
        cand=(row+' '+word).strip()
        if stringWidth(cand,font,size) <= maxw: row=cand
        else: out.append(row); row=word
    if row: out.append(row)
    for line in out:
        c.drawString(x,y,line); y-=lead
    return y

def pill(label,x,y,bg,fg=INK,size=8):
    w=stringWidth(label,'Helvetica-Bold',size)+22
    rect(x,y-4,w,20,bg,r=10)
    text(label,x+11,y+3,size,fg,'Helvetica-Bold')
    return w

def small_paw(x,y,s,color=CORAL):
    c.setFillColor(color)
    c.circle(x,y,8*s,fill=1,stroke=0)
    c.circle(x-12*s,y+10*s,4*s,fill=1,stroke=0)
    c.circle(x-4*s,y+18*s,4*s,fill=1,stroke=0)
    c.circle(x+5*s,y+18*s,4*s,fill=1,stroke=0)
    c.circle(x+13*s,y+10*s,4*s,fill=1,stroke=0)

def heart(x,y,s,color=CORAL):
    c.setFillColor(color); c.setStrokeColor(color)
    p=c.beginPath(); p.moveTo(x,y-s*.25)
    p.curveTo(x-s*1.45,y+s*.75,x-s*.8,y+s*1.65,x,y+s*.75)
    p.curveTo(x+s*.8,y+s*1.65,x+s*1.45,y+s*.75,x,y-s*.25)
    c.drawPath(p,fill=1,stroke=0)

def asad_logo(x,y,scale=1):
    # Friendly bespoke logo mark for the brochure, echoing the supplied site's heart/paw identity.
    heart(x+27*scale,y+28*scale,28*scale,CORAL)
    c.setFillColor(white)
    c.circle(x+27*scale,y+28*scale,5*scale,fill=1,stroke=0)
    for dx,dy in [(-9,10),(-3,18),(4,18),(10,10)]:
        c.circle(x+(27+dx)*scale,y+(28+dy)*scale,2.8*scale,fill=1,stroke=0)
    text('ASAD',x+65*scale,y+34*scale,23*scale,INK,'Helvetica-Bold')
    text('ANIMAUX EN DETRESSE',x+66*scale,y+20*scale,6.3*scale,CORAL_D,'Helvetica-Bold')

def vey(x,y,w=84):
    img=Image.open(VEY)
    ratio=img.height/img.width
    c.drawImage(VEY,x,y,w,w*ratio,mask='auto')

def vey_mark(x,y,w=40):
    img=Image.open(VEY_MARK)
    ratio=img.height/img.width
    c.drawImage(VEY_MARK,x,y,w,w*ratio,mask='auto')

def page_footer(page):
    c.setStrokeColor(LINE); c.setLineWidth(.7); c.line(42,28,W-42,28)
    text('ASAD - Association des Animaux en Detresse',42,16,7,MUTED,'Helvetica')
    center('VEY LIRIA  |  Conception & developpement web',W/2,16,7,MUTED,'Helvetica-Bold')
    text(f'{page} / 4',W-74,16,7,MUTED,'Helvetica')

def card(x,y,w,h,fill=white):
    rect(x,y,w,h,fill,r=18)
    c.setStrokeColor(HexColor('#F0E5E8'));c.setLineWidth(.6);c.roundRect(x,y,w,h,18,fill=0,stroke=1)

def icon_circle(x,y,fill,emoji):
    c.setFillColor(fill); c.circle(x,y,21,fill=1,stroke=0)
    small_paw(x, y-5, .55, white)

# -------- page 1 cover --------
rect(0,0,W,H,CREAM)
# background curves
c.setFillColor(ROSE); c.circle(W+35,H-30,175,fill=1,stroke=0)
c.setFillColor(PEACH); c.circle(-40,35,125,fill=1,stroke=0)
c.setFillColor(BUTTER); c.circle(W-42,220,64,fill=1,stroke=0)
small_paw(76,684,.65,HexColor('#F7B9C1')); small_paw(509,106,.5,HexColor('#F3CC7A'))
# Veyliria tag
rect(402,774,152,32,white,r=16); vey_mark(419,780,33); text('PRESENTE',470,787,8,NAVY,'Helvetica-Bold')
# ASAD logo mark / title
asad_logo(58,600,1.38)
pill('PLAQUETTE CLIENT',58,560,ROSE,CORAL_D,8)
text('Une presence digitale\nau service des animaux\nen detresse.',58,485,29,INK,'Helvetica-Bold',37)
lines("Le site asso-asad.fr accompagne l'ASAD dans sa mission : rendre visibles les chiens et chats qui attendent une famille, mobiliser les visiteurs et simplifier le quotidien des benevoles.",58,347,330,12,MUTED,'Helvetica',18)
# visual panel right
rect(395,272,154,247,NAVY,r=32)
# wave
c.setFillColor(BLUE); c.circle(549,476,86,fill=1,stroke=0)
c.setFillColor(CYAN); c.circle(516,437,42,fill=1,stroke=0)
# simple dog/cat faces
c.setFillColor(white); c.circle(455,381,34,fill=1,stroke=0)
c.setFillColor(white); c.circle(500,354,29,fill=1,stroke=0)
c.setFillColor(white)
# dog ears
c.circle(426,404,13,fill=1,stroke=0);c.circle(484,404,13,fill=1,stroke=0)
# cat ears triangles
p=c.beginPath();p.moveTo(476,373);p.lineTo(482,399);p.lineTo(490,377);p.close();c.drawPath(p,fill=1,stroke=0)
p=c.beginPath();p.moveTo(510,375);p.lineTo(515,399);p.lineTo(525,380);p.close();c.drawPath(p,fill=1,stroke=0)
for ex,ey in [(444,385),(466,385),(491,358),(508,358)]: c.setFillColor(NAVY);c.circle(ex,ey,2.1,fill=1,stroke=0)
heart(479,313,15,HexColor('#FF8A9C'))
text('SITE WEB',417,293,8,HexColor('#A9DFFF'),'Helvetica-Bold')
text('asso-asad.fr',417,279,11,white,'Helvetica-Bold')
# key figures-strip, worded as scope instead of unverified data
rect(58,162,496,104,white,r=20)
for xx,head,body,col in [(82,'ADOPTER','Mettre en avant\nchaque animal',CORAL),(238,'PARTAGER','Conseils et\nhistoires de vie',BLUE),(394,'GERER','Un espace simple\npour les benevoles',PURPLE)]:
    c.setFillColor(col);c.circle(xx,214,15,fill=1,stroke=0)
    text(head,xx+24,219,8,INK,'Helvetica-Bold'); text(body,xx+24,199,8,MUTED,'Helvetica',11)
vey(58,43,78)
text('Document de presentation - septembre 2026',W-232,55,8,MUTED,'Helvetica')
c.showPage()

# -------- page 2 website --------
rect(0,0,W,H,CREAM)
pill('01  -  L’EXPERIENCE VISITEUR',48,782,LIGHTBLUE,BLUE,8)
text('Un site qui donne envie\nd’agir, sans jamais perdre\nde vue l’essentiel.',48,690,26,INK,'Helvetica-Bold',33)
lines("Une interface chaleureuse, claire et adaptee au mobile pour connecter les futurs adoptants, les donateurs et les benevoles autour d'une meme cause.",48,586,330,11,MUTED,'Helvetica',16)
# Browser mockup
rect(50,352,495,190,white,r=18)
rect(50,510,495,32,NAVY,r=18)
# hide bottom rounded part to make top only a little less weird
rect(50,510,495,16,NAVY)
for x,col in [(69,CORAL),(82,BUTTER),(95,CYAN)]: c.setFillColor(col);c.circle(x,526,4,fill=1,stroke=0)
rect(118,518,210,15,HexColor('#173B72'),r=7)
# fake asad home
rect(70,373,202,116,ROSE,r=16); asad_logo(84,447,.48)
text('Chaque animal merite',84,428,13,INK,'Helvetica-Bold'); text('une famille.',84,412,13,INK,'Helvetica-Bold')
rect(84,386,103,19,CORAL,r=10);text('Voir les animaux',95,392,7,white,'Helvetica-Bold')
# fake cards
for xx,nam,col in [(290,'Noisette',PEACH),(375,'Filou',BUTTER),(460,'Plume',LIGHTBLUE)]:
    rect(xx,382,69,105,white,r=10); rect(xx+7,432,55,45,col,r=8); small_paw(xx+34,448,.34,CORAL)
    text(nam,xx+8,418,7,INK,'Helvetica-Bold'); text('Cherche une famille',xx+8,407,5.4,MUTED,'Helvetica')
# three cards
cards=[('🐾','Decouvrir','Des fiches animaux simples, avec photo, description et statut.'),('💛','S’emouvoir','Des histoires d’adoption pour raconter les belles nouvelles.'),('✍️','S’informer','Un blog de conseils : animal perdu, adoption, bons reflexes.')]
for i,(ico,title,desc) in enumerate(cards):
    x=48+i*170; card(x,157,154,156,white); icon_circle(x+29,272,[CORAL,BLUE,PURPLE][i],ico)
    text(title,x+18,234,14,INK,'Helvetica-Bold'); lines(desc,x+18,211,118,8.5,MUTED,'Helvetica',12)
# section notes
text('PENSE POUR LE QUOTIDIEN',48,114,8,CORAL_D,'Helvetica-Bold')
text('Navigation lisible • ton doux et joyeux • compatible mobile • contact immediat',48,95,10,INK,'Helvetica')
page_footer(2);c.showPage()

# -------- page 3 admin --------
rect(0,0,W,H,CREAM)
pill('02  -  L’ESPACE BENEVOLes',48,782,ROSE,CORAL_D,8)
text('Une administration\naussi simple qu’un\nmessage a un ami.',48,686,27,INK,'Helvetica-Bold',34)
lines("L'equipe peut mettre le site a jour sans competence technique : tout est guide, ecrit en francais simple et organise autour des actions utiles.",48,566,330,11,MUTED,'Helvetica',16)
# Workflow
text('UN PARCOURS TRES SIMPLE',48,500,8,PURPLE,'Helvetica-Bold')
steps=[('1','AJOUTER','Une photo, un nom, une description.'),('2','PUBLIER','Enregistrer : la fiche est en ligne.'),('3','SUIVRE','Signaler une urgence ou une adoption.'),('4','PARTAGER','Raconter la suite de l’histoire.')]
for i,(n,h,b) in enumerate(steps):
    x=48+i*126
    c.setFillColor([CORAL,BLUE,PURPLE,CYAN][i]);c.circle(x+19,449,19,fill=1,stroke=0);center(n,x+19,443,12,white,'Helvetica-Bold')
    if i<3:
        c.setStrokeColor(HexColor('#D6D0D7'));c.setLineWidth(1.2);c.line(x+42,449,x+118,449)
    text(h,x,410,8,INK,'Helvetica-Bold');lines(b,x,393,100,7.5,MUTED,'Helvetica',10)
# right mock admin panel
card(48,151,496,202,white)
rect(48,313,496,40,NAVY,r=18);rect(48,313,496,20,NAVY)
asad_logo(65,324,.38)
text('Bonjour, equipe ASAD',185,327,10,white,'Helvetica-Bold')
# side menu
rect(64,167,132,130,HexColor('#FFF7F8'),r=12)
for yy,label in [(274,'Accueil'),(252,'Animaux'),(230,'Histoires'),(208,'Articles'),(186,'Reglages')]:
    text(label,88,yy,8,INK if label=='Animaux' else MUTED,'Helvetica-Bold' if label=='Animaux' else 'Helvetica')
    if label=='Animaux': rect(73,266,5,12,CORAL,r=3)
# content tiles
text('Les animaux',218,280,13,INK,'Helvetica-Bold')
rect(410,267,112,22,CORAL,r=11);text('+ Ajouter un animal',422,274,7,white,'Helvetica-Bold')
for yy,name,status in [(239,'Noisette','En detresse'),(208,'Filou','Cherche une famille'),(177,'Rocky','Adopte')]:
    rect(218,yy-7,304,25,HexColor('#FFFDFC'),r=7); text(name,231,yy+1,8,INK,'Helvetica-Bold');
    pill(status,405,yy-1, ROSE if status=='En detresse' else (LIGHTBLUE if 'Cherche' in status else BUTTER), CORAL_D if status=='En detresse' else INK,6.2)
# feature callouts
text('DES OUTILS QUI LIBERENT DU TEMPS',48,112,8,CORAL_D,'Helvetica-Bold')
text('• Photos iPhone HEIC converties automatiquement   • Messages et histoires relus avant publication',48,92,9,INK,'Helvetica')
text('• Recherche, filtres et badge “en detresse”   • Comptes benevoles et aide integree',48,75,9,INK,'Helvetica')
page_footer(3);c.showPage()

# -------- page 4 --------
rect(0,0,W,H,CREAM)
# top blue credit band
rect(0,696,W,146,NAVY)
vey_mark(51,760,62)
text('VEY LIRIA',48,735,10,white,'Helvetica-Bold')
text('UN PROJET CONCU PAR VEYLIRIA',169,776,10,HexColor('#9BEAFF'),'Helvetica-Bold')
text('Une vitrine utile, humaine\net durable pour l’ASAD.',169,728,23,white,'Helvetica-Bold',29)
# deliverables
text('CE QUI A ETE REALISE',48,648,8,CORAL_D,'Helvetica-Bold')
items=[
 ('Identite & interface','Un univers doux et joyeux, construit autour des animaux, de la confiance et de l’action.'),
 ('Site public','Accueil, animaux, histoires d’adoption, blog de conseils, livre d’or et contact.'),
 ('Espace equipe','Gestion des animaux, articles, histoires, messages, reglages et comptes benevoles.'),
 ('Fondations techniques','Site responsive, acces protege, validation de contenu et conversion des photos iPhone.')]
for i,(h,b) in enumerate(items):
    yy=591-i*92
    c.setFillColor([CORAL,BLUE,PURPLE,CYAN][i]);c.circle(64,yy+8,15,fill=1,stroke=0);center(str(i+1),64,yy+3,9,white,'Helvetica-Bold')
    text(h,91,yy+12,13,INK,'Helvetica-Bold');lines(b,91,yy-7,410,9,MUTED,'Helvetica',12)
# CTA panel
rect(48,136,496,115,ROSE,r=22)
small_paw(89,186,.72,CORAL)
text('Le site est pret a faire grandir la cause.',124,201,16,INK,'Helvetica-Bold')
text('Decouvrir : asso-asad.fr',124,179,10,CORAL_D,'Helvetica-Bold')
rect(395,166,124,33,CORAL,r=16);center('VOIR LE SITE',457,177,8,white,'Helvetica-Bold')
# baseline
text('VEYLIRIA',48,69,12,NAVY,'Helvetica-Bold')
text('Design. Developpement. Experiences digitales utiles.',48,52,8,MUTED,'Helvetica')
text('Plaquette de presentation client',W-260,52,8,MUTED,'Helvetica')
page_footer(4)
c.save()
print(OUT)
