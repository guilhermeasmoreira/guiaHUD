# Política de privacidade da guiaHUD

Última atualização: 30 de setembro de 2026.

A guiaHUD é uma extensão independente para personalizar a interface de `pokeidle.online/game/`. Ela funciona apenas nessa página e não é um produto oficial do PokeIdle Online.

## Dados usados durante o funcionamento

A extensão lê, na página do jogo, informações necessárias para montar seus painéis: nome e nível do treinador, equipe e Pokémon ativo, Pokémon alvo, HP, habilidades e cooldowns, indicadores da hunt, boss, chat e ações de menu disponíveis. Esses dados são usados localmente, enquanto a página está aberta, para atualizar a HUD. Quando disponíveis, as imagens dos Pokémon são usadas na interface.

Os botões da HUD acionam controles já presentes no jogo. O Modo Econômico solicita ao componente visual público do jogo que deixe de desenhar a apresentação da hunt, sem modificar contas ou comunicação com o servidor.

## Armazenamento

A extensão usa `chrome.storage.local` para guardar suas próprias preferências, como tema, modo compacto, estado da HUD, preferência do Modo Econômico e posições dos elementos arrastáveis. Esses dados permanecem no perfil local do Chrome até o usuário removê-los ou desinstalar a extensão. A guiaHUD não salva inventário, credenciais, tokens de acesso ou histórico de chat.

## Compartilhamento

O código da guiaHUD não envia as informações lidas nem as preferências armazenadas para servidores da extensão, serviços de análise ou terceiros. A extensão não vende dados. Ela não impede a comunicação normal do jogo com os servidores do próprio PokeIdle Online; essa comunicação é regida pelas práticas do jogo.

## Controle e contato

O usuário pode desativar a HUD no painel de configurações. Para remover as preferências salvas, pode limpar os dados da extensão no Chrome ou desinstalá-la. Dúvidas sobre esta política podem ser abertas em [Issues da guiaHUD](https://github.com/guilhermeasmoreira/guiaHUD/issues).
