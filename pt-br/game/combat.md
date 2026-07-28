# Game Mode: combate

Este guia explica como funciona o combate no Game Mode do Marinara Engine. Aqui você vê como uma luta começa, o que faz cada ação do menu e qual é a matemática de dados por trás de cada golpe. O guia também trata dos efeitos de status, das reações elementais, das mecânicas de chefe, do loot, do controle **Interrupt** e dos Quick-Time Events. Quem conduz o combate é o Game Master (GM), ou seja, o mestre do jogo: o personagem controlado pela IA que narra a aventura.

## Começar um encontro

O combate nunca começa por sua iniciativa. É o GM que inicia a luta quando a história pede, por exemplo quando você provoca um inimigo ou cai numa emboscada. Nesse momento, uma tela de batalha completa se abre por cima da narração. Marinara monta a luta a partir do que está acontecendo na história: a equipe, os inimigos, os atributos de cada um e as regras especiais.

A tela de batalha mostra a equipe de um lado e os inimigos do outro. Cada combatente tem uma barra de vida (HP, pontos de vida) e, se usar habilidades, uma barra de magia (MP, pontos de magia). A ordem dos turnos aparece no topo, como **Next:** seguido do nome de quem age em seguida. Um contador mostra **Round** e o número da rodada atual.

## O menu de ações

No seu turno, escolha uma ação do menu. As seis ações são:

- **Attack** (atacar): golpeia um inimigo com um ataque básico.
- **Skills** (habilidades): usa uma habilidade especial. Habilidades podem custar MP. Algumas curam um aliado, outras ferem um inimigo e outras aplicam um efeito positivo ou negativo.
- **Special** (ação livre): descreva uma ação com suas próprias palavras e clique em **Ask GM**. Por exemplo: "Eu chuto areia na lente rachada do Ruin Guard." O GM decide o que acontece.
- **Defend** (defender): aumenta a Defesa até o fim da rodada, para sofrer menos dano.
- **Items** (itens): usa um item da bolsa. Escolha **Full inventory** para abrir o inventário completo por ali mesmo.
- **Flee** (fugir): sai da luta na hora. Fugir encerra o combate imediatamente.

Depois da escolha, a rodada acontece. Os resultados aparecem como números de dano flutuantes, mudanças nas barras de vida e linhas no registro de combate.

## Como funciona a matemática do combate

Começada a luta, cada rodada é decidida por uma matemática de dados fixa, e não pela IA. O GM apenas narra os resultados. Ele nunca decide quem acerta nem quanto dano cai. Assim o combate fica justo e previsível. Onde você ler "d20", entenda a rolagem de um dado de vinte lados, ou seja, um número de 1 a 20.

### Iniciativa (ordem dos turnos)

No início de cada rodada, todo combatente rola um d20 e soma um bônus de acordo com a Velocidade. Quem tem o total mais alto age primeiro. Um combatente pula a rodada inteira se estiver congelado, atordoado ou aprisionado, ou se a Velocidade dele tiver chegado a 0.

### Ataque e defesa

Quando um combatente ataca outro:

1. O atacante rola um d20 e soma um bônus vindo do atributo de Ataque.
2. O defensor rola um d20 e soma um bônus vindo do atributo de Defesa.
3. Se o total do atacante for menor que o do defensor, o ataque erra.
4. O acerto crítico acontece com um 20 natural, ou quando o atacante supera o defensor por 10 ou mais.

### Dano

No acerto, o dano-base vem do atributo de Ataque do atacante e cresce conforme o nível. Somam-se dados extras de dano, e combatentes de nível mais alto rolam mais dados. O acerto crítico multiplica o total por 1,5. Em seguida, a Defesa do defensor reduz o dano, bloqueando até 40 por cento do valor de Defesa.

### Ajuste pela dificuldade

O último passo ajusta o dano de acordo com a opção **Difficulty** (dificuldade) do jogo, definida no assistente de configuração. As quatro opções multiplicam o dano final assim:

| Dificuldade | Multiplicador de dano |
|---|---|
| Casual | 0.6 |
| Normal | 1.0 |
| Hard | 1.3 |
| Brutal | 1.6 |

Quanto maior a dificuldade, mais forte batem os dois lados. As lutas ficam mais curtas e mais arriscadas.

## Efeitos de status e reações elementais

O efeito de status é uma mudança temporária no Ataque, na Defesa, na Velocidade ou no HP de um combatente. Os efeitos positivos ajudam e os negativos atrapalham. Um status dura um número definido de rodadas e depois passa. Efeitos do tipo veneno drenam HP a cada rodada, enquanto efeitos do tipo regeneração devolvem HP. Três efeitos com nome próprio, congelado, atordoado e aprisionado, fazem o combatente afetado perder o turno.

Alguns ataques e habilidades carregam um elemento: Fire, Ice, Lightning, Poison, Holy ou Shadow. O primeiro elemento a atingir um alvo deixa uma aura, isto é, um rastro daquele elemento que continua ali. Quando um elemento diferente atinge o mesmo alvo, isso aciona uma reação elemental. A reação acrescenta dano bônus e, muitas vezes, um efeito de status.

Entre as reações possíveis estão Melt, Shatter, Overload, Superconduct, Toxic Blaze, Purification, Eclipse e Electrotoxin. Esse sistema funciona sozinho. Você não precisa ativar nem configurar nada. As reações acontecem automaticamente quando os elementos certos se encadeiam no mesmo alvo.

## Mecânicas de chefe e loot

Inimigos fortes podem ter mecânicas de chefe, que são regras especiais escritas pelo GM para aquela luta. Uma mecânica pode ser acionada por agenda, a cada tantas rodadas, ou quando a vida do chefe cai abaixo de um valor definido. As mecânicas podem atingir a equipe inteira, fortalecer o chefe ou aplicar um efeito de status. Quando uma delas dispara, o efeito aparece no registro de combate para você reagir.

Ao vencer uma luta, os inimigos deixam loot, ou seja, itens caídos. Cada item tem uma raridade, do mais comum ao mais raro: common, uncommon, rare, epic e legendary. A dificuldade mais alta puxa os itens para as raridades maiores e entrega um pouco mais deles. Na vitória aparece o aviso **Victory!**, e se a equipe cair aparece o aviso **Defeat...**.

## Interromper o GM

Enquanto o GM ainda escreve a resposta, você pode cortar a narração com o botão **Interrupt** (interromper). Nada do que você digita é registrado antes do envio. Ao clicar em **Interrupt**, abre-se uma janela de confirmação chamada **Attempt to Interrupt?**, com três opções:

- **No**: cancela e deixa o GM continuar escrevendo.
- **Force Interrupt**: corta a narração direto. O GM não fica sabendo da interrupção. A caixa de mensagem ganha um contorno verde.
- **Yes**: tenta uma interrupção dentro da história, e o GM pode resistir. A caixa de mensagem fica vermelha e o aplicativo avisa "using dice recommended", com o botão de dados piscando. Rolar os dados aqui aumenta a chance de a tentativa dar certo.

Depois de confirmar, digite a mensagem e envie. Se mudar de ideia, clique em **Resume** para descartar a interrupção pendente e retomar a narração. Esse controle é útil num momento de tensão, como reagir no instante anterior ao início de uma luta.

## Quick-Time Events

O GM pode abrir um overlay de Quick-Time Events, também chamado de QTE, para cenas de ação rápida como desviar de um golpe ou perseguir alguém. O overlay mostra uma barra de contagem regressiva que encolhe, o aviso **React quickly!** e um botão para cada opção. Os botões são numerados (1, 2, 3 e assim por diante). Clique no botão da ação que você quer.

Escolha uma ação antes de o tempo acabar para ganhar um bônus. Quanto mais rápida a reação, maior o bônus. Se o tempo acabar antes, você leva uma penalidade. O Quick-Time Event não usa dados. Vale só a velocidade.

## Combate no celular

No celular, a tela de batalha se reorganiza para caber numa tela pequena. Os botões de ação ficam fixos na parte de baixo da tela. Os painéis que não cabem na tela vão para um painel lateral que sobe de baixo, com quatro abas:

- **Party** (equipe): os integrantes da equipe e a vida de cada um.
- **Boss Mechanics** (mecânicas de chefe): as regras especiais da luta atual.
- **Dialogue** (falas): as falas de batalha dos combatentes.
- **Combat Log** (registro de combate): o relato rodada a rodada do que aconteceu.

Toque numa aba para abrir o painel dela. Para fechar, toque fora do painel ou no botão de fechar.

## Guias relacionados

- [Game Mode: Dados e Testes de Perícia](dice-and-skill-checks.md)
- [Game Mode: Equipe e NPCs](party-and-npcs.md)
- [Game Mode: Primeiros Passos](getting-started.md)
- [Encontros de combate (Roleplay)](../roleplay/combat-encounters.md)
