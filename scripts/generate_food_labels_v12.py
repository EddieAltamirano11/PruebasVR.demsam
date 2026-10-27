# -*- coding: utf-8 -*-
import os
from PIL import Image, ImageDraw, ImageFont

os.makedirs('public/texturas', exist_ok=True)
os.makedirs('imagenesRef/texturas', exist_ok=True)

w, h = 1536, 480
font_path = r'C:\Windows\Fonts\trebucbd.ttf'

cards = [
    {
        'file': 'letrero_gastro_tortillas.png',
        'text': 'TORTILLAS DE MA\u00cdZ',
        'size': 148
    },
    {
        'file': 'letrero_gastro_tamales.png',
        'text': 'TAMALES',
        'size': 230
    },
    {
        'file': 'letrero_gastro_atole.png',
        'text': 'ATOLE DE MA\u00cdZ',
        'size': 188
    },
    {
        'file': 'letrero_gastro_caldo_toro.png',
        'text': 'CALDO DE TORO',
        'size': 176
    },
    {
        'file': 'letrero_gastro_maiz_tostado.png',
        'text': 'MA\u00cdZ TOSTADO',
        'size': 192
    },
    {
        'file': 'letrero_gastro_perruri.png',
        'text': 'PERRURI',
        'size': 230
    },
    {
        'file': 'letrero_gastro_elotes.png',
        'text': 'ELOTES COCIDOS',
        'size': 170
    }
]

for c in cards:
    img = Image.new('RGBA', (w, h), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    
    # Base museum cantera stone card
    draw.rounded_rectangle([10, 10, w-10, h-10], radius=32, fill=(252, 250, 244, 255), outline=(175, 130, 42, 255), width=10)
    draw.rounded_rectangle([26, 26, w-26, h-26], radius=22, outline=(218, 180, 80, 220), width=4)
    
    # Corner geometric ornaments
    for cx, cy in [(48, 48), (w-48, 48), (48, h-48), (w-48, h-48)]:
        draw.regular_polygon((cx, cy, 14), 4, rotation=45, fill=(175, 130, 42, 255))
        
    font = ImageFont.truetype(font_path, c['size'])
    text = c['text']
    
    # Measure text bounding box
    bbox = font.getbbox(text)
    bw = bbox[2] - bbox[0]
    bh = bbox[3] - bbox[1]
    
    # Draw drop shadow for crisp 3D carved depth in VR
    draw.text((w/2 + 3, h/2 + 3), text, font=font, fill=(140, 105, 50, 150), anchor='mm')
    # Draw main text in deep contrasting charcoal black
    draw.text((w/2, h/2), text, font=font, fill=(18, 18, 18, 255), anchor='mm')
    
    p1 = os.path.join('public', 'texturas', c['file'])
    p2 = os.path.join('imagenesRef', 'texturas', c['file'])
    img.save(p1)
    img.save(p2)
    print(f"Generated {c['file']}: text='{text}', size={c['size']}, width={bw} ({bw/w*100:.1f}%), height={bh} ({bh/h*100:.1f}%)")
