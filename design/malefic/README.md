# Molduras vetoriais — Malefic

Molduras SVG transparentes desenhadas para o conceito em `../referencias/hud-malefic.webp`. Os arquivos não contêm texto nem controles: esses elementos continuam em HTML para permanecer acessíveis e interativos.

| Arquivo | Área | ViewBox |
| --- | --- | --- |
| `perfil.svg` | Treinador e Pokémon ativo | 330 × 76 |
| `menu.svg` | Menu superior | 480 × 48 |
| `hunt.svg` | Hunt Analyzer | 270 × 150 |
| `skills.svg` | Barra de habilidades | 720 × 86 |
| `chat.svg` | Chat recolhido | 190 × 48 |

`preview.png` mostra as cinco molduras em seus tamanhos de desenho. Antes de aplicar no jogo, cada componente precisa ter uma única fonte de DOM; a moldura é uma camada decorativa (`pointer-events: none`) no componente existente, e não um novo painel sobre o original. Não estique o SVG inteiro para outra proporção: use o tamanho indicado ou ajuste o desenho/recorte por região.