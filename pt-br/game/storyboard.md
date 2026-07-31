# Guia do Storyboard Engine

Este guia explica os storyboards no Marinara Engine. O storyboard transforma um trecho concluído da história em uma pequena sequência de imagens, os quadros-chave, e pode acrescentar clipes animados. No Game Mode, o storyboard cobre um turno concluído do GM. No Roleplay, o storyboard reúne trocas de mensagens já concluídas em um episódio exibido dentro do chat. Os chats de Conversation não usam storyboards.

## O que é um storyboard

Game Mode é o modo de chat em que um Game Master (GM) de IA, ou seja, o mestre do jogo, narra uma aventura por turnos. Quando o GM termina um turno de narração, o Storyboard Engine pode ilustrar aquele único turno. No Roleplay, o agente Storyboard lê as mensagens do usuário e do assistente concluídas desde o último episódio bem-sucedido.

Marinara lê a narração do GM e divide o texto em uma pequena sequência de quadros-chave ordenados. Cada quadro-chave é uma imagem de um momento do turno. O storyboard comporta de 1 a 6 quadros-chave. O padrão é 3.

Cada quadro-chave fica ligado a um trecho do texto do turno. Esses trechos se chamam seções de leitura. Conforme você desce a leitura do turno, um pequeno visualizador mostra o quadro-chave correspondente ao ponto em que você está.

Antes de planejar as imagens, Marinara remove as tags de comando do GM. As tags de comando do GM são instruções ocultas dentro de uma mensagem do GM, como rolagens de dados ou atualizações do estado do jogo. Elas saem do texto para não aparecer na imagem.

As imagens estáticas dos quadros-chave são salvas na **Gallery** (Galeria), na aba **Images**. Os clipes dos quadros-chave são salvos como vídeos de cena, na aba **Videos**. Como são itens normais da Gallery, cada quadro-chave pode ser visualizado, baixado, fixado, e você também pode copiar o prompt dele, o texto que Marinara envia para a IA.

## Episódios de storyboard no Roleplay

No Roleplay, o storyboard é independente do Illustrator. O Illustrator continua criando as imagens únicas de sempre, enquanto o Storyboard planeja um ou mais quadros-chave ordenados a partir de um trecho já concluído do chat.

1. Instale o agente **Storyboard** em **Agents > Download Agents**.
2. Abra um chat em Roleplay e acrescente o agente **Storyboard** em **Chat Settings > Agents**.
3. Na seção Storyboard, escolha **Manual only**, **Still images** ou **Animations**.
4. Selecione a conexão de prompt, a de imagem e, se quiser, a de vídeo. A conexão de imagem é obrigatória.
5. Para um episódio manual, abra a **Gallery** e clique em **Create storyboard**. Os episódios automáticos rodam quando o número configurado de mensagens do usuário e do assistente se acumula e uma resposta do assistente termina.

O intervalo padrão é 1, ou seja, um episódio automático pode surgir a cada nova resposta concluída do assistente. Um valor maior no campo **Messages per episode** deixa o diálogo e a troca de mensagens se acumularem. As mensagens do usuário e as do assistente avançam o intervalo. Ao atingir o intervalo, Marinara junta as mensagens desde o último Storyboard bem-sucedido, dentro de uma janela recente limitada. Abrir um chat existente não recupera as mensagens antigas, e um episódio que falha não avança o marco de cadência.

No Roleplay, os quadros-chave aparecem logo depois da resposta do assistente que encerra o episódio. Nos storyboards com vários quadros-chave, use as setas para passar de um quadro para outro. As imagens e os clipes também são salvos na Gallery.

O planejamento no Roleplay tem quatro camadas editáveis nas configurações globais em **Agents > Storyboard**:

- **Episode contract** escolhe os momentos de história já concluídos entre as mensagens enviadas.
- **Visual style** oferece as opções normal/anime, NovelAI, quadrinhos, mangá colorido e mangá em preto e branco.
- **Animation addon** entra apenas nos storyboards animados. Ele trata a ilustração como o quadro exato de T=0 e depois descreve uma ação simples, o comportamento da câmera, o diálogo de origem, os efeitos sonoros, o ambiente e uma pausa no fim.
- **Output contract** define o JSON de quadros-chave que o modelo de planejamento devolve.

Esses prompts do Roleplay não substituem a biblioteca otimizada de planejadores do Game Mode. Os formatadores dos provedores de imagem e de vídeo continuam compartilhados e podem ser selecionados. O plano de animação é neutro em relação ao provedor, então ele pode usar Google Gemini Omni, LTX/ComfyUI ou outra conexão Video Generation configurada que aceite pedidos de imagem para vídeo. Ainda assim, os recursos de cada provedor e a qualidade do resultado variam.

## Storyboards no Game Mode

Esta seção explica como configurar, gerar, revisar e animar os storyboards dos turnos do Game Mode.

## Antes de começar

Algumas coisas precisam estar prontas para o storyboard ser gerado.

1. Um chat em Game Mode. A configuração abaixo é específica do fluxo de trabalho do Game Mode.
2. Uma conexão de imagem funcionando para o ilustrador do jogo. Configure em um dos dois lugares. Só um já basta:
   - Jogo existente: abra **Chat Settings** (configurações do chat), vá em **Agents** e depois na seção **Illustrator**. Ative **Game Illustrator** e escolha uma **Image Connection**.
   - Jogo novo: no assistente de configuração, ative **Visual Generation** e escolha uma **Image Generation Connection**.
3. O melhor é usar um modelo de imagem recente e potente. O aplicativo sugere um modelo de imagem de ponta, ou algo equivalente ao Google Nano Banana 2 Lite.

Para os clipes animados, você também precisa de uma conexão de vídeo. Veja os passos de animação mais adiante.

Sem nenhuma conexão de imagem configurada, o pedido de storyboard falha com esta mensagem: "Choose an Illustrator image connection in Game Settings first."

Para manter a aparência dos personagens estável entre os quadros-chave, use cards de personagem com avatar e ative **Send Avatar References** na seção **Illustrator**. Assim, o avatar de cada personagem é enviado como imagem de referência.

## Início rápido

1. Abra ou crie um chat em Game Mode.
2. Configure a conexão de imagem como mostra a seção acima.
3. Jogue até o GM concluir um turno de narração.
4. Abra o painel **Gallery**.
5. Clique em **Create storyboard**. Durante a execução, o botão mostra **Creating...** com um indicador de carregamento.
   - Com a opção **Expose image prompts before sending** ativada em **Settings > Generation**, revise e edite o prompt compilado de cada quadro-chave e depois confirme a geração.
6. Continue lendo o turno. O visualizador flutuante aparece e troca de quadro-chave conforme a leitura avança.

Se você fechar o visualizador, é só reabrir. No painel **Gallery**, clique em **View storyboard**.

Enquanto o storyboard é gerado, a **Gallery** mostra este aviso: "Storyboard generation is running. Keyframes will appear in the game storyboard viewer when ready."

## Storyboards automáticos e manuais

Você pode criar os storyboards na mão ou deixar que Marinara crie para você.

O modo manual é o botão **Create storyboard** na **Gallery**. Ele monta um storyboard para o último turno de narração concluído do GM, só quando você pede. Use esse botão também para atualizar ou reilustrar o turno atual, mesmo com os storyboards automáticos desligados.

Os storyboards automáticos são definidos por chat. Os controles ficam em um dos dois lugares:

- Jogo novo: assistente de configuração, **Visual Generation**, depois a subseção **Storyboards**.
- Jogo existente: **Chat Settings**, **Agents**, depois a seção **Storyboards**.

**Automatic Storyboard Illustrations** cria quadros-chave estáticos depois de cada turno concluído do GM, sem nenhum clique da sua parte. Esse é o caminho mais barato. Em um jogo novo criado pelo assistente de configuração, a opção já vem ativada assim que **Visual Generation** é ligado. Ela não faz nada até **Game Illustrator** estar configurado.

Os storyboards automáticos não pausam o processo de fim de turno para a revisão do prompt. Com **Expose image prompts before sending** ativado, use a ação manual **Create storyboard** para ver e editar o prompt final compilado de cada quadro-chave. As execuções automáticas seguem sem janela de revisão, para que o jogo não trave enquanto o chat está sem ninguém acompanhando.

**Automatic Storyboard Animations** cria também um clipe MP4 para cada quadro-chave. Vem desativado. Precisa das ilustrações estáticas mais uma conexão de vídeo. Ligar as animações liga as ilustrações junto. Desligar as ilustrações desliga as animações.

Para configurar os clipes:

1. Crie uma conexão **Video Generation** em **Settings** (Configurações), depois **Connections**.
2. Selecione essa conexão no campo **Video Generation Connection** do assistente de configuração, ou em **Chat Settings**, **Agents**, **Scene Videos**, depois **Video Connection**.
3. Ative **Automatic Storyboard Animations**.

Se você ligar as animações sem uma conexão de vídeo, o assistente de configuração avisa: "Choose a Video Generation connection below to save automatic storyboard animations."

Normalmente o storyboard cria 3 tarefas de imagem, uma por quadro-chave. Com as animações ligadas, cria também até 3 tarefas de vídeo. O número acompanha **Keyframes per Turn**, então escolher 5 pode significar 5 tarefas de imagem e até 5 tarefas de vídeo. As tarefas de vídeo são bem mais lentas e custam mais. Comece com as ilustrações estáticas e acrescente animações só nos chats em que a espera e o custo compensam.

## Configurações do storyboard

Tudo isto fica na seção **Storyboards**. Abra **Chat Settings**, vá em **Agents**, depois **Storyboards**.

| Configuração | Padrão | O que faz |
| --- | --- | --- |
| **Automatic Storyboard Illustrations** | Ativado em jogos novos do assistente com Visual Generation; nos demais, desativado | Cria quadros-chave estáticos depois de cada turno do GM |
| **Automatic Storyboard Animations** | Off | Acrescenta um clipe MP4 por quadro-chave; precisa de conexão de vídeo |
| **Keyframes per Turn** | 3 (de 1 a 6) | Quantos quadros-chave cada turno planeja |
| **Animation Clip Duration** | 6 segundos (de 1 a 15) | Duração de cada clipe |
| **Viewer Display** | Floating | Painel flutuante ou plano de fundo inteiro |
| **Illustration Planner** | Still Keyframes | Planeja quadros-chave estáticos finalizados e as descrições de imagem deles |
| **Animation Planner** | Comic Page Animation | Planeja imagens de origem prontas para animar e as direções de movimento |
| **Use Storyboard Template** | On | Formata as cenas planejadas com o Storyboard Illustration Prompt selecionado. Desative para prompts de tag diretos do NovelAI |
| **Storyboard Illustration Prompt** | Game Scene Illustration | Formata cada quadro-chave planejado para o modelo de imagem |
| **Storyboard Video Prompt** | Igual ao Game Video Prompt | Prompt de movimento usado só nos clipes dos quadros-chave do storyboard |

O campo **Keyframes per Turn** é um controle deslizante. O motor tenta planejar essa quantidade de quadros-chave. Um turno curto pode render menos. Nunca passa de 6.

O campo **Animation Clip Duration** é um número de segundos. Ele fica indisponível enquanto **Automatic Storyboard Animations** estiver desligado. Até você definir um valor, valem os 6 segundos padrão e aparece uma etiqueta **Storyboard default**. Depois que você define o seu valor, surge o botão **Use storyboard default** para limpá-lo. Alguns provedores de vídeo podem reduzir o valor até o máximo que aceitam, então a duração exata não é garantida.

No modo **Background** do visualizador, cada animação toca uma vez com som quando o trecho da história correspondente fica ativo. A narração pode aparecer durante a reprodução, mas a leitura automática espera o clipe terminar. A animação então fica parada no último quadro. A barra de ferramentas do jogo oferece controles de repetição, reproduzir/pausar e mudo, no computador e no celular. Os vídeos do storyboard flutuante também tocam uma vez e podem ser repetidos, em vez de ficar em repetição infinita.

Os dois planejadores criam o plano visual. **Illustration Planner** é usado nos storyboards estáticos. **Animation Planner** entra quando há geração de vídeo e produz tanto uma descrição de imagem pronta para animar quanto uma direção de movimento enxuta.

O **Storyboard Illustration Prompt** então formata a descrição de imagem do planejador no pedido final enviado ao modelo de imagem. Nos chats existentes, o padrão é **Game Scene Illustration**. A opção **Storyboard Illustration** mantém o resultado do planejador em primeiro plano e acrescenta referências de personagem, notas de aparência, a direção de arte da campanha e as instruções de imagem.

O **Storyboard Video Prompt** é diferente do **Game Video Prompt** geral, que fica na seção **Scene Videos**. Ele combina o quadro-chave gerado, a direção de movimento do Animation Planner e o contexto da cena atual no pedido final enviado ao modelo de vídeo. Deixe na opção herdada para reaproveitar o prompt geral, ou selecione **Anime Game Video** para os clipes dos quadros-chave sem mexer nos vídeos manuais da Gallery e do Game Assets.

Selecione **Comic Page Animation** para as páginas de origem em quadrinhos que levam a duração em conta, e depois escolha **Comic Page Video** para interpretar esses quadrinhos como referências visuais ordenadas de um único clipe. A opção original **Comic Page** continua disponível para as ilustrações comuns. Por ser uma escolha de vídeo separada, o **Game Video Prompt** herdado e os vídeos manuais da Gallery e do Game Assets ficam inalterados.

Os jogos novos criados com a apresentação **Storyboard Optimized** já vêm com **Storyboard Game Prompt**, o planejador **Comic Page Animation**, **Storyboard Illustration** e **Comic Page Video**. Você pode mudar esse chat para a combinação de tomada única a qualquer momento, selecionando **Still Keyframe Animation** e **Anime Game Video**.

### LTX 2.3 de imagem para vídeo

Para um fluxo de trabalho local LTX 2.3 no ComfyUI, comece com **LTX Simple Image-to-Video** como Animation Planner, **Storyboard First Frame** como Storyboard Illustration Prompt e **LTX Director Video** como Storyboard Video Prompt. O Animation Planner cria tanto o prompt de imagem em linguagem natural do T=0 quanto o parágrafo completo de movimento. O Storyboard First Frame entrega a cena T=0 a um provedor de imagem em linguagem natural com o mínimo de formatação em volta, enquanto o LTX Director Video envia o parágrafo de movimento para a entrada `%prompt%` do fluxo de trabalho. **LTX Director Storyboard** é a alternativa mais detalhada, que leva a duração em conta; ela usa o mesmo prompt de vídeo e o mesmo contrato de fluxo de trabalho.

Veja [Storyboards com LTX 2.3 no Game Mode](ltx-2-3-storyboards.md) para a escolha do modelo, os marcadores do ComfyUI, o perfil completo de configurações do Game, os passos de validação e a solução de problemas.

## Presets de estilo

Os presets de planejamento, cada um um modelo de prompt salvo, definem como cada quadro-chave é escolhido e descrito. Dois seletores fazem essa escolha:

- **Illustration Planner** é usado quando os storyboards geram quadros-chave estáticos sem vídeo. Padrão: **Still Keyframes**.
- **Animation Planner** é usado quando **Automatic Storyboard Animations** está ligado. Padrão: **Comic Page Animation**.

Os dois seletores têm listas de presets separadas. Os presets de ilustração descrevem imagens estáticas finalizadas e podem incluir letreiramento de quadrinhos ou mangá visível para quem lê. Os presets de animação descrevem um primeiro quadro estável mais uma direção de movimento que leva a duração em conta. Um preset de ilustração nunca aparece no menu do Animation Planner, e um preset de animação nunca aparece no menu do Illustration Planner.

| Trilha | Preset | Melhor para |
| --- | --- | --- |
| Ilustração | **Still Keyframes** | Leitura normal. Quadros-chave de cena única, sem quadrinhos, balões de fala, legendas nem texto de efeito sonoro. |
| Ilustração | **NovelAI Keyframes** | Prompts de tag enxutos para imagem estática, ajustados para o NovelAI V4 e V4.5. Para um prompt de tag direto, desative **Use Storyboard Template**. |
| Ilustração | **Comic Page** | Páginas de quadrinhos finalizadas com 2 a 6 quadrinhos, balões de diálogo, legendas e letreiramento. |
| Ilustração | **Colored Manga** | Composição finalizada de mangá colorido com sombreamento em blocos, retículas, balões de fala e efeitos sonoros. |
| Ilustração | **B&W Manga** | Arte-final de mangá em preto e branco, com retículas, pretos densos, balões de fala e efeitos sonoros. |
| Animação | **Still Keyframe Animation** | Tomadas únicas ordenadas, com primeiro quadro exato, um movimento principal, câmera simples, movimento do ambiente e uma pausa no fim. |
| Animação | **Anime Episode Director** | Tomadas únicas de anime de TV, com continuidade do primeiro quadro, direção de movimento enxuta e composição segura para os provedores. |
| Animação | **NovelAI Keyframe Animation** | Primeiros quadros em tags do NovelAI, com o tempo e o movimento mantidos em uma direção de animação separada. |
| Animação | **Comic Page Animation** | Páginas de origem em quadrinhos que levam a duração em conta e cujos quadrinhos em ordem cronológica servem de referência visual ordenada para um clipe. |
| Animação | **Colored Manga Animation** | Primeiros quadros de mangá colorido sem texto, com movimento que preserva o traço e o sombreamento cel. |
| Animação | **B&W Manga Animation** | Primeiros quadros monocromáticos sem texto, com movimento que preserva a arte-final e as retículas. |

O preset **Still Keyframe Animation** é o equivalente em movimento do **Still Keyframes**, igualmente neutro em estilo. O **Anime Episode Director** é uma opção especializada à parte, que combina com **Anime Game Video** quando você quer planejamento de tomadas no estilo do anime de TV. Ele mantém a violência pesada fora do explícito e a encena, quando possível, pela antecipação, pelo obstáculo, pela reação ou pelas consequências, o que pode reduzir as recusas de segurança dos provedores sem mudar a história oficial do GM.

O preset **Comic Page Animation** usa a duração do clipe de animação para controlar a densidade da página. O padrão são 2 quadrinhos para um clipe de 6 a 7 segundos, com um terceiro permitido só quando há três momentos simples de cerca de 2 segundos cada; usa 2 a 3 quadrinhos para 8 a 10 segundos e no máximo 4 nos clipes mais longos. As páginas de animação priorizam o ritmo visual em vez do letreiramento, mantêm cada quadrinho focado e reservam uma pausa curta no fim. Os quadrinhos seguem causa e efeito na ordem de leitura. O **Comic Page Video** normalmente entra direto no quadrinho 1; ele só permite um estabelecimento bem rápido da página inteira quando isso não revela cedo demais alguma consequência posterior.

O preset **NovelAI Keyframes** escreve tags do Danbooru enxutas. As tags do Danbooru são palavras-chave curtas separadas por vírgula, esperadas por alguns modelos de imagem de anime. Escolher um preset de animação, quadrinhos ou mangá não liga as animações sozinho. Para ter clipes, ainda são necessários **Automatic Storyboard Animations** e uma conexão de vídeo.

## Estilo de arte da campanha e perfis de estilo de imagem

A configuração do jogo gera um estilo de arte para a campanha inteira, para manter a coerência visual. Em um jogo existente, abra **Chat Settings > Agents > Illustrator** para vê-lo em **Campaign art style**. Você pode editar o texto, limpá-lo, restaurar a redação original gerada na configuração, ou desativar **Use Campaign Art Style**.

O estilo de arte da campanha e o perfil **Image Style** são camadas de prompt separadas. Com as duas ativadas, Marinara inclui ambas. Desativar ou limpar o estilo da campanha mantém o perfil Image Style selecionado no lugar. Essa configuração vale para os quadros-chave do storyboard e para os demais recursos visuais gerados no jogo.

Com **Expose image prompts before sending** ativado em **Settings > Generation**, os pedidos manuais de **Create storyboard** mostram antes os prompts positivo e negativo exatamente como foram compilados, para todos os quadros-chave planejados. As alterações feitas nessa revisão valem só para aquele storyboard; elas não substituem o estilo da campanha nem as configurações do perfil Image Style.

## Editar os presets de storyboard

Os presets nativos são somente leitura. Para criar os seus, abra **Edit Illustration Planner Presets**, **Edit Animation Planner Presets**, **Edit Illustration Prompt Presets** ou **Edit Video Prompt Presets** dentro da seção **Storyboards**. Cada seção mostra apenas os presets nativos e as cópias personalizadas daquela etapa.

Copie um preset nativo para um modelo editável válido só naquele chat e depois escolha essa cópia no seletor correspondente. As cópias do Illustration Planner não podem ser selecionadas como Animation Planner, e as cópias do Animation Planner não podem ser selecionadas como Illustration Planner. As cópias do Storyboard Illustration Prompt afetam apenas as imagens do storyboard. As cópias de prompt de vídeo continuam compartilhadas com o Game Video Prompt geral, então qualquer um dos dois seletores de vídeo pode usá-las.

Cada cópia personalizada tem um nome, uma descrição curta e o corpo do prompt que você edita. Um botão de lixeira remove a cópia depois de uma confirmação. Essas cópias ficam guardadas naquele chat, não no aplicativo inteiro.

## O visualizador do storyboard

O visualizador acompanha o ponto em que você está lendo. Ele mostra o quadro-chave cuja seção de leitura corresponde ao trecho do turno em que você se encontra. Não é apenas "a imagem mais nova da Gallery". Há dois estilos de exibição, definidos em **Viewer Display**.

**Floating** é o padrão. Um pequeno painel arrastável fica sobre o jogo. O cabeçalho dele mostra **Storyboard**. Ele reproduz o vídeo do quadro-chave assim que fica pronto e volta para a imagem enquanto o clipe está pendente ou falhou.

O visualizador flutuante tem estes controles:

- **Close storyboard viewer** esconde o painel só no turno atual. Ele reaparece quando o próximo turno do GM termina. Atualizar a página também desfaz esse esconder.
- **Drag storyboard viewer** é a alça do cabeçalho. Arraste o painel para qualquer canto da tela.
- **Play storyboard video** e **Pause storyboard video** controlam a reprodução do clipe. Os clipes começam sem som.
- **Mute storyboard video** e **Unmute storyboard video** só aparecem quando o quadro-chave tem um clipe gerado.
- **Change storyboard viewer size** alterna três larguras: pequena, média (o padrão) e grande.
- Uma alça no canto redimensiona o painel livremente e ignora o tamanho escolhido.

**Background** preenche toda a área do jogo com o quadro-chave ativo, em vez de usar um card flutuante. A imagem ou o clipe fica atrás dos controles do jogo. A lógica de posição de leitura é a mesma do visualizador flutuante.

O modo Background tem uma contrapartida. Ele desliga o plano de fundo de local de cena que Marinara costuma gerar. Enquanto esse modo estiver ligado, o botão **Generate background** no menu do ilustrador fica desativado. O botão mostra este aviso: "Storyboard background display is active, so scene background generation is disabled."

## Como obter resultados melhores

O storyboard só é tão claro quanto o turno que ele lê. Os melhores turnos dizem quem se move, o que muda e onde está o momento decisivo. Um turno vago como "a luta continua" dá muito menos material ao motor do que um turno com ação concreta e detalhes de ambiente.

Para resultados mais consistentes:

- Mantenha o ambiente, o tom e o estilo de arte do jogo bem específicos durante a configuração.
- Use cards de personagem com avatares detalhados e ative **Send Avatar References**.
- Deixe claras na narração as roupas, os ferimentos, os objetos e os lugares importantes.
- Use os perfis de estilo de imagem para chegar ao acabamento que você quer.
- Use **Still Keyframes** para a leitura normal, e um preset de quadrinhos ou mangá quando os clipes estiverem ligados.

## Opções do NovelAI

Para um pedido enxuto ao NovelAI, escolha **NovelAI Keyframes** e desative **Use Storyboard Template** na seção **Storyboards**. Assim, o prompt da cena planejada é enviado direto, e as configurações separadas de aparência, imagem de referência, instrução de imagem e estilo continuam disponíveis.

A opção **Use NovelAI Character Prompts** manda cada personagem visível pelas legendas e posições nativas do Add Character do NovelAI. Ela vem ativada. Importante: só tem efeito em uma conexão oficial do NovelAI usando um modelo V4 ou V4.5 em novelai.net. Em qualquer outro provedor ou modelo, o botão liga/desliga não faz nada, e Marinara usa o prompt antigo compartilhado.

## Solução de problemas

**"Choose an Illustrator image connection in Game Settings first."** Abra **Chat Settings**, **Agents**, depois a seção **Illustrator**. Ative **Game Illustrator** e escolha uma **Image Connection**. Em um jogo novo, ative **Visual Generation** e escolha uma **Image Generation Connection** no assistente de configuração.

**"Storyboards can only be generated from GM narration turns."** O botão **Create storyboard** só funciona em um turno de narração já concluído do GM. Ele não funciona nas suas próprias mensagens de jogador. Espere a resposta do GM terminar e tente de novo.

**"This GM turn has no narration to storyboard."** O turno não tem texto de história para desenhar. Isso acontece quando um turno do GM traz apenas tags de comando ocultas e nenhuma narração. Continue jogando até o GM escrever um turno com texto de história e faça o storyboard desse turno.

**As imagens aparecem, mas não os vídeos.** Os vídeos precisam de **Automatic Storyboard Animations** ligado e de uma conexão **Video Generation** selecionada. Com as animações desligadas, o storyboard gera só quadros-chave estáticos.

**Os storyboards automáticos não rodam.** Verifique se **Automatic Storyboard Illustrations** ou **Automatic Storyboard Animations** está ligado. Confira se a conexão de imagem está configurada e se o turno do GM terminou de ser transmitido. Marinara não gera um segundo storyboard para um turno que já tem um. Mesmo assim, você pode refazê-lo na mão com **Create storyboard** na **Gallery**.

**O storyboard ficou incompleto ou travado.** Normalmente isso quer dizer que uma ou mais tarefas de imagem ou vídeo falharam, estouraram o tempo limite ou esbarraram no limite de uso do provedor. Conteúdo proibido também pode bloquear uma tarefa. Se o provedor estiver lento, aumente os tempos limite de geração de imagem e de vídeo no arquivo `.env` e reinicie Marinara. Veja a [Referência de configuração do servidor](../CONFIGURATION.md) para os nomes exatos das variáveis.

Para um diagnóstico mais fundo, coloque o nível de log em debug e acompanhe o log do servidor, ou seja, o registro do servidor. As linhas de log do storyboard levam as marcações `[debug/game/storyboard-illustrator]`, `[debug/game/storyboard-image-preview]`, `[debug/game/storyboard-image-assets]` e `[debug/game/storyboard-video]`.

## Guias relacionados

- [Geração de vídeo de cena](../media/scene-video.md)
- [Provedores de geração de imagens](../media/image-providers.md)
- [Game Mode: primeiros passos](getting-started.md)
- [Storyboards com LTX 2.3 no Game Mode](ltx-2-3-storyboards.md)
