# Game Mode: mapa, tempo e clima

Neste guia você conhece o painel de mapa do Game Mode e os sistemas que acompanham o mundo ao redor da equipe. Esses sistemas são o dia e a hora, o clima e o moral da equipe. O guia explica as visualizações do mapa, como se mover e dar zoom, e como definir o dia e a hora manualmente.

## O painel de mapa

Game Mode mostra um pequeno painel de mapa na tela do jogo. O painel traz o nome do mapa atual, o dia de jogo e um ícone de céu que indica a hora do dia.

No computador, o mapa é um painel embutido, fácil de consultar num relance. No celular, toque no ícone de mapa no canto superior esquerdo. Esse botão se chama **Open map** (abrir o mapa) e mostra o mapa em uma janela flutuante.

O painel pode ser arrastado e travado no lugar. Para entender como funcionam os painéis arrastáveis, veja o guia de widgets do HUD indicado no fim da página.

## Visualização em grade e visualização em nós

O mapa tem duas visualizações. Marinara Engine escolhe a visualização de acordo com o tipo de lugar que o mapa representa. Não é preciso trocar de visualização manualmente.

- A visualização **grid** (grade) serve para áreas abertas, como um mundo, uma região ou uma cidade. Ela mostra quadrados coloridos conforme o terreno: grama, floresta, água, montanha, deserto, neve, vila, estrada e caverna.
- A visualização **node** (nós) serve para áreas fechadas, como masmorras e interiores. Ela mostra os lugares como círculos ligados por linhas. Um lugar ainda não descoberto aparece com um ícone de interrogação. A linha tracejada indica um caminho por onde você ainda não passou. A linha contínua indica um caminho já percorrido.

## Como mover a equipe

Para viajar, escolha um lugar no mapa. Só alguns lugares podem ser escolhidos. No mapa em grade, o quadrado precisa estar ao lado da equipe e já ter sido descoberto. No mapa em nós, o nó precisa estar ligado ao lugar atual ou já ter sido descoberto. Os demais quadrados e nós não fazem nada quando você clica neles.

1. Clique em um quadrado da grade ou em um nó do mapa em nós.
2. Uma etiqueta **Destination:** (destino) aparece acima da caixa de mensagem com o nome do lugar.
3. Escreva a mensagem e envie. Marinara acrescenta uma linha curta como `*moves to <place>*` no começo da mensagem.

Para cancelar, clique no pequeno botão de limpar (o X) na etiqueta **Destination:**.

No celular, o caminho é um pouco diferente. Toque uma vez no nó para selecioná-lo e depois toque em **Set destination** (definir destino) no rodapé. O nó marcado com **You are here** é o lugar onde a equipe está.

## Zoom do mapa

Cada mapa tem um controle de zoom no canto superior direito.

- Clique em **Zoom in** (o botão de mais) para aproximar.
- Clique em **Zoom out** (o botão de menos) para afastar e enxergar mais.

O zoom vai de 75% a 180%, em intervalos de 25%.

## Como alternar entre mapas

Alguns jogos têm mais de um mapa ou região. Quando existe mais de um mapa, um pequeno menu suspenso aparece no topo do painel de mapa. Use esse menu para ver outro mapa. O mapa em que a equipe realmente está fica marcado com **(Current)**.

## Como gerar um novo mapa

O painel de mapa tem um botão de varinha no canto superior esquerdo, chamado **Generate another map** (gerar outro mapa). Clique nele para substituir o mapa atual por um novo.

Se o jogo ainda não tiver mapa, o painel mostra **No map yet** e um botão **Generate**, que faz a mesma coisa.

## Como definir o dia e a hora manualmente

O controle de dia e hora fica no topo do painel de mapa. Ele mostra **Day** (dia) e um número, além de um pequeno ícone de céu para a hora do dia.

1. Clique no controle **Day**.
2. Digite um novo número de dia na caixa. O dia vai de 1 a 9999.
3. Escolha uma hora do dia no menu suspenso. As opções são **Dawn**, **Morning**, **Afternoon**, **Evening**, **Night** e **Midnight**.
4. Clique fora do controle ou pressione Enter para salvar.

Esse é um ajuste manual. Você define o dia e a hora por conta própria, à parte do relógio automático descrito a seguir. O relógio também pode mostrar **Noon** sozinho, mas Noon não é uma das opções manuais.

## Como o tempo passa automaticamente

O relógio do jogo anda sozinho. Ele usa contas fixas, e não a IA, então o resultado é sempre coerente. Todo jogo novo começa no Day 1, às 08:00 da manhã. Cada ação que você faz adianta o relógio em uma quantidade definida.

| Ação | Tempo adicionado |
|---|---|
| Conversar | 15 minutos |
| Explorar | 30 minutos |
| Uma rodada de combate | 5 minutos |
| Um descanso curto | 1 hora |
| Um descanso longo | 8 horas |
| Viajar | 2 horas |

Quando o relógio passa da meia-noite, o número do dia aumenta em um.

## Clima

O jogo também acompanha o clima por conta própria, com contas fixas e sem IA. O clima depende do bioma e da estação do ano. O bioma é o tipo de lugar onde a equipe está, como deserto, ártico, litoral ou montanha. Alguns exemplos de clima: céu limpo, nublado, chuva, tempestade, neve, nevasca, neblina e tempestade de areia.

O clima pode mudar quando você age. Ele muda com mais frequência quando a equipe viaja ou faz um descanso longo, às vezes quando explora e raramente nas outras situações. O clima dá cor à maneira como o Game Master descreve cada cena.

Para ver o clima na tela, ative a opção **Dynamic weather effects (rain, snow, fog, etc.)** nas configurações de aparência do aplicativo. Ela vem ativada por padrão. Com ela ativa, partículas animadas de chuva, neve e neblina aparecem sobre o jogo. Elas combinam com o clima e a hora do dia do momento. Para mais opções de exibição, veja o guia de configurações de aparência indicado no fim da página.

## Moral da equipe

O jogo mantém uma pontuação oculta de moral da equipe, de 0 a 100. São cinco níveis, do mais baixo ao mais alto: Broken, Low, Steady, High e Inspired.

O moral muda conforme o que acontece na história. Vencer uma luta, concluir uma missão ou encontrar um tesouro faz o moral subir. Perder uma luta, falhar em uma missão ou perder um aliado faz o moral cair. Com o tempo, o moral volta aos poucos para o meio da escala.

O moral não aparece como um número no jogo. Ele age nos bastidores. O moral altera as rolagens de dados, de mais 2 em Inspired até menos 2 em Broken. Ele também influencia a forma como o Game Master descreve o humor da equipe.

## Guias relacionados

- [Game Mode: primeiros passos](getting-started.md)
- [Game Mode: widgets do HUD](hud-widgets.md)
- [Configurações de aparência](../appearance/appearance-settings.md)
