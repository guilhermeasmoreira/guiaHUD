# Molduras vetoriais — Malefic

Molduras SVG transparentes desenhadas para o conceito em `../referencias/hud-malefic.webp`. Os arquivos não contêm texto nem controles: esses elementos continuam em HTML para permanecer acessíveis e interativos.

| Arquivo | Área | ViewBox |
| --- | --- | --- |
| `perfil.svg` | Treinador e Pokémon ativo | 330 × 76 |
| `menu.svg` | Menu superior | 480 × 48 |
| `hunt.svg` | Hunt Analyzer | 270 × 150 |
| `skills.svg` | Barra de habilidades | 720 × 86 |
| `chat.svg` | Chat recolhido | 190 × 48 |

`preview.png` mostra as cinco molduras em seus tamanhos de desenho. A extensão aplica cada SVG como camada decorativa (`pointer-events: none`) no componente funcional e controla a visibilidade do painel original correspondente. O chat completo, o Auto Helper e os atalhos continuam controles do jogo com cores do tema. Evite esticar o SVG para outra proporção: use o tamanho indicado ou ajuste o desenho/recorte por região.
