# Perfis do Conversation Mode (nome de exibição, About Me e comportamento)

Todo personagem e toda persona ganham um pequeno perfil no Conversation Mode, e é isso que este guia explica. O perfil tem três partes: um nome de exibição, uma bio no estilo "sobre mim" e uma instrução de comportamento. Esses campos funcionam como o perfil de um aplicativo de mensagens (pense no Discord). Eles valem só no Conversation Mode e nunca são usados no Roleplay nem no Game Mode.

Conversation Mode é o chat no estilo DM ou mensageiro. Se você ainda não conhece esse modo, leia antes [Conversation Mode: primeiros passos](getting-started.md). A persona é o perfil que representa você (o `{{user}}`) dentro de um chat.

## Onde ficam esses campos

Todos os campos do perfil ficam em uma aba chamada **Convo**. Personagens e personas têm essa aba.

1. Para editar o perfil de um personagem, abra o personagem no **Character Editor** (editor de personagens) e clique na aba **Convo**.
2. Para editar o perfil da sua persona, abra a persona no **Persona Editor** (editor de personas) e clique na aba **Convo**.

A aba **Convo** reúne três campos: **Convo Display Name**, **About Me** e **Convo Behavior**. Eles são iguais para personagens e personas, com uma pequena diferença explicada mais adiante.

## Convo Display Name

O campo **Convo Display Name** (nome de exibição no Convo) define o nome mostrado para esse personagem ou persona nos chats do Conversation Mode. Deixe em branco para usar o nome do card. Ao mudar esse nome, as mensagens já existentes passam a mostrar o novo na hora. O efeito vale só no Conversation Mode.

Personagens (não personas) também têm uma caixa de seleção: **Declare this name on the card in the prompt** (declarar esse nome no card dentro do prompt). Quando você ativa essa opção, Marinara acrescenta uma linha curta ao texto do card do personagem. Essa linha diz ao modelo qual card aparece sob qual nome de exibição. Para usar a caixa, o nome de exibição precisa estar preenchido antes.

A macro `{{convo_display}}` coloca o nome de exibição do personagem que está respondendo dentro de um prompt personalizado. Macro é um marcador, como `{{convo_display}}`, que é substituído por texto de verdade. Fora do Conversation Mode, ela não resolve para nada. Veja [Macros](../prompts/macros.md).

## About Me

O campo **About Me** (sobre mim) guarda uma bio curta escrita na voz do personagem ou da persona, exibida no Conversation Mode. Pode ser uma ou duas linhas, um único emoji, uma piada ou simplesmente nada. Há um botão de emoji na barra de ferramentas da caixa de texto para inserir um emoji na bio.

A bio não serve só de enfeite. Por padrão, Marinara adiciona ao prompt, a cada turno, o **About Me** de todos os personagens e personas presentes. As bios entram como uma lista curta de perfis dos participantes. Assim, o modelo sempre sabe como cada um se apresenta. Você não precisa fazer nada para isso funcionar.

### Escrever um About Me com a Professor Mari

Você não precisa escrever a bio por conta própria. Abra a Professor Mari na tela inicial e peça que ela escreva ou revise o **About Me** de um personagem ou de uma persona pelo nome. Ela lê primeiro o perfil salvo, escreve uma bio curta na voz daquela pessoa e salva direto no campo **About Me** de verdade.

Por exemplo, peça: `Write Luna's About Me as a cryptic one-line bio.` Você também pode pedir uma revisão, como deixar uma bio existente mais engraçada, mais curta, mais calorosa ou mais fiel ao card.

A Professor Mari usa o modelo normal configurado para ela. Não existe conexão separada, seletor de origem nem botão de geração de About Me nos editores de personagem e de persona. A alteração salva por ela aparece no fluxo de revisão de sempre, onde você pode manter ou restaurar o texto. As edições manuais no editor continuam mostrando o botão **Revert** (reverter), que traz de volta o texto anterior à edição atual.

## Convo Behavior

O campo **Convo Behavior** (comportamento no Convo) é uma instrução em texto livre sobre como o personagem ou a persona deve agir no Conversation Mode. Por exemplo: manter as respostas curtas e em letras minúsculas, e escrever como uma pessoa de verdade, não como um narrador. Esse texto nunca é enviado no Roleplay nem no Game Mode.

### Insertion (onde a instrução entra)

Abaixo da caixa **Convo Behavior** fica o menu suspenso **Insertion** (inserção). Ele controla em que ponto do prompt a instrução é colocada. As opções são:

- A opção **Constant** marcada como "after the card" (padrão): sempre adicionada, logo depois do texto do card.
- A opção **Constant** marcada como "before the card": sempre adicionada, logo antes do texto do card.
- **Append to post-history**: adicionada no fim das instruções de pós-histórico.
- **Prepend to post-history**: adicionada no começo das instruções de pós-histórico.
- **Replace post-history**: usada no lugar das instruções de pós-histórico.
- **Only where `{{convo_behavior}}` is placed**: inserida apenas onde você colocar a macro `{{convo_behavior}}` em um prompt personalizado.

As instruções de pós-histórico são um texto do prompt que o aplicativo posiciona depois do histórico recente do chat. Se você não escreve prompts personalizados, mantenha o padrão.

## Substituir o About Me em um chat específico

O **About Me** do card é a bio padrão, usada em todo lugar. Você também pode definir uma bio diferente para um único chat. Essa é a substituição por chat, e ela é feita em uma janelinha de perfil.

1. Em um chat do Conversation Mode, clique no avatar ou no nome de um personagem ou de uma persona.
2. Um pequeno card de perfil abre ao lado do avatar. No celular, ele sobe a partir da parte de baixo da tela.
3. O card mostra o avatar ampliado, o nome e o **About Me** atual.
4. Um selo indica **Default** quando a bio do card está em uso, ou **Chat-specific** quando existe uma substituição para aquele chat. Personagens também exibem um status aqui: **Online**, **Away**, **Busy** ou **Offline**.

Para definir uma substituição:

1. Clique em **Edit** na janelinha.
2. Digite a bio para este chat. Você tem um seletor de emojis, incluindo uma aba **Custom emojis**.
3. Clique em **Save**. Deve aparecer um aviso informando que o about me específico do chat foi salvo.

Durante a edição, o botão **Revert** desfaz as alterações não salvas, e o botão **Cancel** fecha o modo de edição sem salvar. Quando existe uma substituição, o botão **Clear** a remove e devolve o padrão do card. Salvar uma bio vazia também remove a substituição. Lembre-se: o **About Me** padrão se edita no card, e a substituição vale apenas naquele chat.

## Deixar o personagem atualizar o próprio About Me quando quiser

Existe também uma ferramenta que o personagem pode acionar na hora para mudar a própria bio. O nome dela é **update_about_me**. Ela vem desativada por padrão. Ative em **Chat Settings** (configurações do chat), na seção **Function Calling**: ative **Enable Tool Use** e adicione a ferramenta **update_about_me**.

Com a ferramenta ativada, o personagem pode atualizar a própria bio de duas formas:

- O escopo público muda a bio real, vista em todos os chats. Essa mudança passa antes pela sua aprovação.
- O escopo de chat muda uma bio que fica restrita à conversa atual.

## Usar os perfis em prompts personalizados

Os perfis chegam ao modelo sem precisar de macro nenhuma. As bios do **About Me** entram no prompt automaticamente, e o **Convo Behavior** segue a configuração de **Insertion**. As macros servem para prompts personalizados, quando você mesmo quer colocar um valor em um ponto exato.

Quatro macros inserem esses valores de perfil no texto. Nenhuma delas resolve para nada fora do Conversation Mode:

- `{{convo_display}}`: o nome de exibição do personagem que está respondendo.
- `{{char_about}}`: o **About Me** em vigor do personagem.
- `{{persona_about}}`: o **About Me** em vigor da persona.
- `{{convo_behavior}}`: a instrução de **Convo Behavior** do personagem.

Veja [Macros](../prompts/macros.md) para a lista completa de macros.

## Guias relacionados

- [Conversation Mode: primeiros passos](getting-started.md)
- [Criando e editando personagens](../characters/creating-and-editing-characters.md)
- [Personas do usuário: criar e editar](../characters/personas.md)
- [Referência dos agentes para download](../agents/built-in-agents.md)
- [Macros](../prompts/macros.md)
