# Game Mode: widgets do HUD

Este guia explica os widgets do HUD no Game Mode do Marinara Engine. HUD quer dizer heads-up display: pequenos painéis de informação que ficam nas bordas esquerda e direita da tela do jogo. Aqui você vê os tipos de widget, a etapa de revisão antes de o jogo começar, como mover e travar os painéis e como compartilhar layouts de widgets.

## O que são os widgets do HUD

Os widgets do HUD são pequenos painéis personalizados que acompanham informações durante o jogo, como uma barra de vida, um contador de ouro ou o nível de confiança de um aliado. Cada jogo tem os próprios widgets. Eles não têm relação com os trackers do HUD de Roleplay. Para conhecer a faixa de trackers usada nos chats de Roleplay, veja os guias relacionados no fim da página.

Você pode ter no máximo 4 widgets no total. A divisão entre o lado esquerdo e o lado direito da tela fica a seu critério.

Os widgets só entram em cena quando a opção **Custom HUD Widgets** (widgets personalizados do HUD) está ativada no jogo. Essa opção vem ativada por padrão no assistente de configuração. Com ela ativa, o Game Master (GM) de IA, o mestre do jogo, monta um conjunto inicial de widgets enquanto cria o mundo.

## Os 8 tipos de widget

São oito tipos de widget. O GM escolhe um tipo para cada widget que cria. Você também escolhe o tipo quando monta os widgets manualmente.

| Tipo de widget | O que mostra |
|---|---|
| **Progress Bar** | Uma barra horizontal com um valor dentro de um máximo, como vida ou estamina. |
| **Gauge** | Um mostrador em meia-lua com um valor dentro de um máximo. |
| **Relationship Meter** | Uma barra com marcos e um rótulo, boa para a confiança de um NPC ou um vínculo. |
| **Counter** | Um número grande, como ouro, dias passados ou abates. |
| **Stat Block** | Uma grade pequena de campos nomeados com valores, como STR e DEX ou uma palavra de status. |
| **List** | Uma lista curta com marcadores, como as metas ativas. |
| **Inventory Grid** | Uma grade de espaços de itens, com abas de categoria e contagem de itens opcionais. |
| **Timer** | Um cronômetro regressivo em minutos e segundos que pode correr em tempo real. |

## A janela de revisão antes da sessão

Quando existem widgets personalizados, uma etapa de revisão acontece antes do primeiro turno. No momento em que você aperta **Start Game** (começar o jogo), a janela **Review Starting Widgets** (revisar os widgets iniciais) abre. Ela lista todos os widgets iniciais para você ajustar antes de o jogo fixá-los.

Nessa janela você pode:

- Apertar **Edit** (editar) em um widget para mudar os valores iniciais ou renomear os campos do **Stat Block**.
- Apertar **Remove** (remover) para tirar um widget que você não quer.
- Apertar **Back** (voltar) para fechar a janela sem começar.
- Apertar **Start Game** para começar a jogar com os widgets como estão.

Uma janela parecida aparece quando você inicia uma nova sessão em um jogo em andamento. O nome dela é **Prepare Next Session Widgets** e ela traz o botão **Start Next Session** no lugar de **Start Game**. O botão de fechar se chama **Cancel** em vez de **Back**.

## Editar um widget durante o jogo

Durante a partida, o GM atualiza os valores dos widgets conforme a história avança. Se o GM deixar passar uma atualização, ajuste o widget na mão.

1. Encontre o painel do widget na borda esquerda ou direita da tela.
2. Clique no botão de lápis (**Edit**) no cabeçalho do widget.
3. Mude os valores na janela de edição. Por exemplo, defina um novo **Current value** e **Maximum value** em uma barra.
4. Clique em **Save Changes** (salvar as alterações).

O cabeçalho também tem um sinal pequeno de mais ou de menos. Clique no cabeçalho do widget para recolher ou expandir o corpo dele.

## Mover e travar os painéis

Os painéis de widget ficam travados no lugar por padrão. Cada painel tem um ícone de cadeado no cabeçalho.

1. Clique no ícone de cadeado para destravar o painel. Um contorno leve indica que ele já pode ser movido.
2. Arraste o painel para o novo lugar.
3. Clique no ícone de cadeado de novo para travá-lo ali.

Para devolver um painel ao lugar padrão, dê um duplo clique no ícone de cadeado ou aperte a tecla R com o ícone em foco. Cada painel guarda a própria posição e o estado de trava por jogo. O layout não passa de um jogo para outro.

No celular, os widgets aparecem como pequenas pastilhas, e não como painéis inteiros. Toque em uma pastilha para abrir aquele widget e toque no X para fechá-la.

## Montar os próprios widgets

Você mesmo pode desenhar os widgets em vez de deixar o GM criá-los. O editor manual de widgets abre em dois lugares:

- No assistente de configuração do jogo: ative **Custom HUD Widgets** e depois ative o botão liga/desliga **Build Widget Setup**. O editor aparece logo abaixo.
- Em um jogo já existente: abra **Chat Settings** (configurações do chat) e vá até a seção **Widgets**.

No editor, escolha um tipo de widget no menu suspenso e aperte **Add** (adicionar). Para cada widget você define:

- **Icon**: um símbolo curto ou emoji exibido no cabeçalho.
- **Label**: o nome exibido no topo do widget.
- **Type**: um dos oito tipos de widget.
- **Side**: **Left HUD** ou **Right HUD**.
- **Accent**: a cor do widget.

Abaixo desses campos, cada tipo tem os seus. Uma barra usa **Value** e **Max**. Um contador usa **Count**. Uma grade de inventário usa **Slots** e **Contents**. Um cronômetro usa **Seconds** e **Running**. O editor mostra quantos widgets você já usou dos 4 permitidos.

Na seção **Chat Settings**, aperte **Save Widgets** (salvar os widgets) para aplicar as mudanças ao jogo ou aperte **Reset** para desfazer as edições não salvas.

## Compartilhar widgets com a importação e a exportação

Um layout de widgets pode ser salvo em um arquivo e carregado em outro jogo. Esses botões estão tanto no assistente de configuração quanto na seção **Widgets** de **Chat Settings**.

1. Aperte **Export Widgets** (exportar os widgets) para baixar os widgets atuais como um arquivo JSON. JSON é um formato de dados em texto simples.
2. Aperte **Import Widgets** (importar widgets) no outro jogo e escolha esse arquivo para carregar os mesmos widgets.

Na seção **Chat Settings**, lembre de apertar **Save Widgets** depois de uma importação, para que os widgets carregados sejam aplicados.

## Guias relacionados

- [Game Mode: primeiros passos](getting-started.md)
- [HUD e trackers do Roleplay](../roleplay/hud-and-trackers.md)
