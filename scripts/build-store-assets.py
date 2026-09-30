"""Build simple store artwork from original shapes; requires Pillow."""
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parents[1]


def font(size, bold=False):
    path = '/usr/share/fonts/truetype/dejavu/DejaVuSans' + ('-Bold' if bold else '') + '.ttf'
    return ImageFont.truetype(path, size)


def icon():
    scale = 4
    image = Image.new('RGBA', (128 * scale, 128 * scale))
    draw = ImageDraw.Draw(image)
    s = lambda points: [(int(x * scale), int(y * scale)) for x, y in points]
    frame = [(31, 16), (97, 16), (112, 31), (112, 97), (97, 112),
             (31, 112), (16, 97), (16, 31)]
    draw.polygon(s(frame), fill='#08263b', outline='#75dff4', width=5 * scale)
    draw.line(s([(29, 40), (99, 40)]), fill='#256485', width=2 * scale)
    draw.line(s([(29, 88), (99, 88)]), fill='#256485', width=2 * scale)
    star = [(64, 31), (72, 51), (93, 53), (77, 66), (82, 87), (64, 76),
            (46, 87), (51, 66), (35, 53), (56, 51)]
    draw.line(s(star + [star[0]]), fill='#70e4d1', width=5 * scale, joint='curve')
    draw.ellipse((57 * scale, 57 * scale, 71 * scale, 71 * scale), fill='#b8faff')
    image = image.resize((128, 128), Image.Resampling.LANCZOS)
    dest = ROOT / 'icons'
    dest.mkdir(exist_ok=True)
    for size in (16, 48, 128):
        image.resize((size, size), Image.Resampling.LANCZOS).save(dest / f'icon{size}.png')


def promo():
    image = Image.new('RGB', (440, 280), '#061727')
    draw = ImageDraw.Draw(image)
    draw.rounded_rectangle((20, 20, 420, 69), 12, '#0d2b42', outline='#6bd4e9', width=2)
    for label, x in [('GUIAHUD', 37), ('MAPA', 177), ('HUNT', 255), ('SKILLS', 330)]:
        draw.text((x, 39), label, font=font(11, True), fill='#abedfa')
    draw.rounded_rectangle((20, 87, 210, 219), 13, '#0a293f', outline='#54b9d4', width=2)
    draw.ellipse((39, 117, 93, 171), fill='#123c54', outline='#73dbec', width=2)
    draw.polygon([(66, 124), (80, 158), (66, 150), (52, 158)], outline='#95eafa', width=3)
    draw.text((106, 119), 'TREINADOR', font=font(11, True), fill='#edfaff')
    draw.text((106, 145), 'Equipe ativa', font=font(10), fill='#bed8e6')
    draw.text((106, 165), 'Alvo e HP', font=font(10), fill='#bed8e6')
    draw.rounded_rectangle((227, 87, 420, 219), 13, '#0a293f', outline='#54b9d4', width=2)
    draw.text((243, 114), 'HUNT ANALYZER', font=font(11, True), fill='#9aebfa')
    draw.text((243, 150), 'XP/h       614,5k', font=font(11), fill='#edfaff')
    draw.text((243, 178), 'Derrotados  4,2k', font=font(11), fill='#edfaff')
    draw.line((0, 239, 440, 239), fill='#245775', width=1)
    draw.text((20, 253), 'Interface compacta para PokeIdle Online', font=font(11), fill='#b4d8e6')
    image.save(ROOT / 'store-assets' / 'promo-440x280.png')


if __name__ == '__main__':
    icon()
    promo()
