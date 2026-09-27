# Símbolos vetoriais dos clans

Onze SVGs originais em `64 × 64`, criados a partir da folha de referência enviada pelo usuário. Todos usam contorno fino, sem preenchimento, seguindo o floco de neve compacto escolhido para Seavell. A ordem da referência é Fogo, Elétrico, Pedra, Planta/Inseto e Lutador na primeira linha; Metal, Dragão, Psíquico, Água e Malefic na segunda. Gelo foi desenhado adicionalmente. O Dragão é uma cabeça minimalista em vez da estrela da referência.

| Clan | Arquivo | HUD atual |
| --- | --- | --- |
| Fogo | `fire.svg` | Sim |
| Elétrico | `electric.svg` | Sim (Rainbolt) |
| Pedra | `stone.svg` | Sim |
| Planta/Inseto | `leaf.svg` | Sim (Naturia) |
| Lutador | `fighter.svg` | Sim (GardeStrike) |
| Metal | `metal.svg` | Reservado |
| Dragão | `dragon.svg` | Sim |
| Psíquico | `psychic.svg` | Sim (Psycraft) |
| Água | `water.svg` | Reservado |
| Malefic | `malefic.svg` | Sim |
| Gelo | `ice.svg` | Sim |

Os temas ativos usam a mesma geometria como SVG inline no perfil e na barra de habilidades, com a cor do tema; não criam painéis extras nem fazem requisições por ícones. `node scripts/export-clan-icons.cjs` regenera os arquivos a partir de `src/hud/clan-icons.js`.
