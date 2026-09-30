# Preparação da Chrome Web Store — guiaHUD 0.9.1

## Descrição curta

HUD compacta com temas, atalhos e modo econômico para PokeIdle Online. Projeto independente.

## Descrição longa sugerida

A guiaHUD reorganiza a interface de PokeIdle Online para acompanhar sua hunt em menos espaço. Exibe treinador, Pokémon ativo e alvo, Hunt Analyzer, boss global, habilidades e chat, com atalhos para controles existentes no jogo.

Escolha entre Padrão minimalista, Malefic, Seavell, Volcanic, Orebound, Wingeon, Naturia, GardeStrike, Psycraft e Rainbolt. Arraste os elementos para ajustar a posição e mantenha suas preferências neste navegador.

O Modo Econômico pode reduzir o trabalho de renderização da apresentação da hunt normal. Quando ativado e disponível, mostra uma tela preta com cards do Pokémon ativo e alvo, mantendo a HUD visível. O recurso não controla o modo HD Modern do jogo.

A extensão funciona somente em `https://pokeidle.online/game/*` e não é afiliada ou oficial do PokeIdle Online.

## Declarações para o painel

- **Finalidade única:** personalizar e condensar a interface do PokeIdle Online, incluindo a opção de reduzir o desenho visual da hunt normal.
- **Permissão `storage`:** salvar localmente tema, estado e layout da HUD, inclusive a preferência do Modo Econômico.
- **Acesso ao site:** restrito a `https://pokeidle.online/game/*` para ler os elementos de interface do jogo e acionar seus controles existentes.
- **Código remoto:** não. Todos os scripts da extensão estão no pacote; a página do jogo executa seu próprio código, independente da extensão.
- **Dados:** a extensão processa temporariamente dados visíveis da interface do jogo para exibir a HUD. Não os transmite para servidores da guiaHUD. Revise as categorias solicitadas no painel conforme a redação vigente na submissão.
- **Política de privacidade pública:** `https://github.com/guilhermeasmoreira/guiaHUD/blob/main/PRIVACY.md`.

## Recursos gráficos

- Ícones no pacote: `icons/icon16.png`, `icons/icon48.png`, `icons/icon128.png`.
- Imagem promocional: `store-assets/promo-440x280.png` (enviar pelo painel, fora do ZIP).
- Captura de tela: **pendente**. Capture a extensão real em uso, 1280×800 ou 640×400, com conta e chat protegidos. Não use os concepts de `design/referencias` como captura do produto.

## Instruções ao revisor

Instale e abra `https://pokeidle.online/game/`. Após entrar no jogo, a HUD substitui os controles principais; o ícone de engrenagem abre os temas e o Modo Econômico. O primeiro item do menu, Treinador, aciona o Perfil nativo; Bolsa abre o inventário. Uma hunt ativa permite observar os dados do Analyzer e o mapa congelar no Modo Econômico. Se o revisor precisar de acesso a uma conta de teste, forneça credenciais de teste pelo campo privado de instruções do painel, nunca no repositório.

## Pendências antes de clicar em Enviar para análise

1. Fazer regressão na conta real: Treinador, Bolsa, mapa, loja, chat, Analyzer, troca de Pokémon, temas e Modo Econômico por ao menos um minuto, incluindo retomar e HD Modern ligado/desligado.
2. Produzir a captura de tela real e enviá-la à ficha da loja.
3. Confirmar identidade do desenvolvedor, verificação em duas etapas, categoria, idioma, países e declarações de privacidade no painel.
4. Conferir direitos de uso de qualquer captura do jogo ou marca exibida na ficha e manter clara a independência do projeto.
5. Subir apenas o ZIP gerado pelo script de release e conferir sua listagem antes de enviar.
