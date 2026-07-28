# Referência de comandos de barra

Neste guia estão listados os comandos de barra que você pode digitar em um chat do Marinara Engine. Um comando de barra é um atalho digitado na caixa de mensagem, começando com uma barra, para fazer algo rápido. Alguns comandos agem na tela na hora, e outros pedem que a IA escreva alguma coisa.

## Como funcionam os comandos de barra

Para executar um comando de barra, digite ele na caixa de mensagem no rodapé do chat e clique em **Send** (enviar). A tecla Enter também envia, se a opção **Send on Enter** (enviar com Enter) estiver ativada para o modo de chat em uso na seção **Settings** (Configurações). Por padrão, Enter envia nos chats de Conversation e começa uma linha nova nos chats de Roleplay. A própria caixa de mensagem lembra os comandos de barra. Em um chat de Roleplay, o texto de exemplo diz **Write your response, / for commands**. Em um chat de Conversation, o texto de exemplo mostra o nome do personagem, como "Message @Alice, / for commands". Uma conversa com mais de um personagem mostra o nome do chat no lugar.

Assim que você digita uma barra, um pequeno menu com os comandos correspondentes aparece acima da caixa. Cada linha traz o nome do comando e uma descrição curta. Clique ou toque em uma linha para preencher a caixa com aquele comando, depois acrescente o texto extra e envie.

Muitos comandos têm apelidos mais curtos. Por exemplo, `/continue` e o apelido `/cont` fazem exatamente a mesma coisa. Para ver a lista completa dentro do aplicativo a qualquer momento, execute este comando:

```
/help
```

Alguns comandos rodam no navegador e mudam o chat na hora, sem custo nenhum. Outros pedem que a IA gere texto, o que usa o provedor conectado e pode consumir tokens. O token é a unidade que a maioria dos provedores de IA usa para medir e cobrar o texto. As tabelas abaixo indicam o que cada comando faz.

Os comandos de barra funcionam nas caixas de mensagem de **Conversation** e **Roleplay**. No modo **Game**, só `/illustrate` funciona como comando de barra. Qualquer outra coisa digitada com barra na frente é enviada como texto comum.

Vários comandos usam números de mensagem. Marinara conta as mensagens a partir da primeira do chat como número 1, depois 2, depois 3, e assim por diante. Comandos como `/goto`, `/hide` e `/unhide` usam esses números.

## Comandos de chat e de mensagem

Estes comandos ajudam a cuidar do chat e das mensagens dele. Funcionam nos chats de **Conversation** e **Roleplay**.

| Comando | Também funciona como | O que faz |
|---|---|---|
| `/help` | | Lista todos os comandos de barra. |
| `/continue` | `/cont` | Acrescenta mais texto à última resposta da IA, sem enviar uma mensagem nova. A opção **Add a new line before /continue text** em **Settings → General → Responses** define se esse texto começa depois de uma linha em branco ou direto no ponto em que parou. |
| `/goto` | `/jump`, `/scroll` | Rola o chat até uma mensagem pelo número dela. |
| `/hide` | | Esconde uma ou mais mensagens da IA nos turnos seguintes. |
| `/unhide` | | Devolve as mensagens escondidas para a visão da IA. |
| `/sys` | `/system` | Acrescenta uma mensagem de sistema. Essa nota aparece no chat e orienta a IA, mas nenhum personagem a diz. |
| `/macros` | `/macro` | Lista as macros de prompt com suporte, como `{{user}}` e `{{char}}`. |
| `/remind` | `/reminder`, `/timer` | Marca um tempo e depois publica uma mensagem de lembrete no chat. |

Para pular até a mensagem 27, digite isto:

```
/goto 27
```

Os comandos `/hide` e `/unhide` aceitam um número, um intervalo ou uma mistura dos dois. Este exemplo esconde as mensagens de 3 a 8:

```
/hide 3-8
```

Também vale escrever `/hide 5` para uma única mensagem, ou `/hide 2-5,9,12` para várias. As mensagens escondidas continuam no chat, mas a IA não as lê no turno seguinte. Use `/unhide` com o mesmo tipo de lista de números para trazê-las de volta.

O comando `/remind` recebe um tempo e depois uma mensagem. O tempo usa `h` para horas, `m` para minutos e `s` para segundos. Este exemplo avisa você em 30 minutos:

```
/remind 30m check the oven
```

O lembrete vive na sessão do navegador, então deixe a aba aberta até a hora chegar.

## Comandos de história e roleplay

Estes comandos ajudam a conduzir a história, interpretar um personagem e acrescentar arte. A maioria funciona melhor em um chat de **Roleplay**. A exceção é `/scene`, que você executa a partir de um chat de **Conversation**.

| Comando | Também funciona como | O que faz |
|---|---|---|
| `/guided` | `/narrator`, `/narrate`, `/nar` | Conduz a próxima resposta da IA na direção que você descrever. |
| `/as` | `/respond` | Publica uma mensagem como um personagem, ou pede que um personagem responda. |
| `/emote` | `/emotion`, `/sprite` | Lista ou troca a expressão do sprite de um personagem. |
| `/roll` | `/r`, `/dice` | Rola os dados e publica o resultado. |
| `/random` | `/rand`, `/event` | Pede que a IA acrescente um evento surpresa à história. |
| `/scene` | `/rp` | Executado a partir de um chat de Conversation. Começa uma cena nova de Roleplay, criando uma ramificação a partir daquela conversa. |
| `/illustrate` | `/ill` | Gera uma imagem de galeria para o chat atual. |
| `/impersonate` | `/imp` | Escreve uma resposta no papel da persona. |
| `/impersonate_prompt` | `/imp_prompt` | Define a instrução que `/impersonate` usa neste chat. |

Para conduzir a próxima resposta, escreva a direção depois de `/guided`:

```
/guided make him confess he is lying
```

O comando `/roll` entende a notação de dados. Este exemplo rola dois dados de seis lados:

```
/roll 2d6
```

Você pode acrescentar um modificador, como `/roll 1d20+5`. Se digitar `/roll` sem mais nada, Marinara rola `1d20`.

O sprite é uma imagem do personagem que mostra uma expressão. O comando `/emote` troca qual delas aparece. Digite `/emote` sozinho para ver as expressões disponíveis, ou escreva o nome de uma para trocar:

```
/emote joy
```

A troca de sprite exige um chat de Roleplay com sprites enviados. Veja [Sprites de personagem](../characters/sprites.md) para saber como acrescentá-los.

A persona é o personagem que representa você em um chat, escrito como `{{user}}` nos prompts. O comando `/impersonate` escreve uma resposta no seu lugar. Você pode acrescentar uma direção depois dele:

```
/impersonate ask about the weather
```

Os comandos `/impersonate` e `/impersonate_prompt` não estão disponíveis nos chats de **Conversation**. Para um passo a passo completo de geração guiada e personificação, veja [Geração guiada e Impersonate](guided-and-impersonate.md).

## Comandos do Conversation Mode

Estes comandos só funcionam em um chat de **Conversation**.

| Comando | O que faz |
|---|---|
| `/uno` | Começa uma partida de UNO com os personagens do chat. |
| `/chess` | Começa uma partida de xadrez de um contra um com um personagem. |
| `/poker` | Começa uma partida de pôquer Texas Hold'em com os personagens. |
| `/8ball` | Começa uma partida de sinuca bola 8 de um contra um com um personagem. `/pool` faz a mesma coisa. |
| `/status` | Define ou limpa o status de presença de um personagem. |

Os comandos `/uno`, `/chess`, `/poker` e `/8ball` abrem a tela de configuração daquele jogo. Só é possível jogar uma partida por vez em um chat. Para as regras e as opções, veja [Jogos de mesa](../conversation/table-games.md).

O comando `/status` sobrepõe a presença de um personagem. O status pode ser `online`, `idle`, `dnd` (não perturbe) ou `offline`. Use `clear` para remover a sobreposição. Este exemplo deixa o personagem ausente:

```
/status idle
```

Em um chat com mais de um personagem, escreva o nome do personagem no fim, como `/status online Alice`.

## Guias relacionados

- [Ações de mensagem](messages.md)
- [Geração guiada e Impersonate](guided-and-impersonate.md)
- [Jogos de mesa](../conversation/table-games.md)
- [Macros](../prompts/macros.md)
