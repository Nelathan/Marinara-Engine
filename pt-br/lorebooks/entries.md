# Entradas de lorebook: chaves, posição e momento de acionar

Este guia explica como montar as entradas dentro de um lorebook (um conjunto de fatos do seu mundo). Ele apresenta a aba **Entries** (entradas), as palavras-chave de gatilho e os três tipos de entrada. Também mostra onde cada entrada entra no prompt (o texto que Marinara envia para a IA) e quais controles decidem o momento em que ela é acionada. Se você nunca mexeu com lorebooks, leia antes a [Visão geral dos lorebooks](overview.md).

Uma entrada é um bloco de texto mais as regras que decidem quando Marinara Engine acrescenta esse texto ao prompt da IA. Quando a entrada é ativada, Marinara insere o conteúdo dela e a IA passa a "lembrar" de um fato que você nunca digitou no chat.

## A aba Entries

Abra um lorebook pelo painel **Lorebooks** para chegar ao editor de página inteira. O editor tem duas abas laterais: **Overview** (visão geral) e **Entries**. Clique em **Entries** para ver a lista de entradas. O selo da aba mostra quantas entradas o lorebook tem.

A barra de ferramentas no topo da aba **Entries** traz estes controles:

- A caixa **Search entries…** (buscar entradas): filtra a lista por nome, chaves ou conteúdo da entrada.
- Um menu suspenso de ordenação com **Order**, **Entries**, **Name A→Z**, **Name Z→A**, **Tokens ↓**, **Keys ↓**, **Newest** e **Oldest**. As opções com ↓ ordenam do maior para o menor.
- O botão **Select** (selecionar): liga a seleção múltipla, para copiar, mover ou excluir várias entradas de uma vez.
- O botão **Add Folder** (adicionar pasta): cria uma pasta para agrupar entradas (veja a seção sobre pastas de entradas mais abaixo).
- O botão **Add Entry** (adicionar uma entrada): cria uma entrada em branco no topo da lista.

Abaixo da barra de ferramentas, uma linha de resumo mostra a quantidade de entradas, a quantidade de pastas e o tamanho total estimado, em tokens, de todo o conteúdo das entradas.

## Adicionar e editar uma entrada

Para criar uma entrada, siga estes passos:

1. Abra o lorebook e clique na aba **Entries**.
2. Clique em **Add Entry**. Uma nova linha aparece na lista.
3. Digite um nome no campo de nome da linha. Toda entrada precisa de um nome.
4. Clique na linha (ou na seta em forma de chevron) para expandir o painel lateral com o editor completo.
5. Preencha as palavras-chave e o conteúdo, descritos nas seções abaixo.

Marinara salva as edições sozinha. Enquanto você digita, o painel lateral mostra **Autosaving…**, depois **Saving…** e por fim **Saved automatically**. Se um salvamento falhar, o texto continua onde está e Marinara tenta de novo na edição seguinte. Entradas não têm botão de salvar separado.

Cada entrada aparece como uma única linha compacta. A linha reúne os controles mais usados. Expanda a linha para chegar ao resto.

Para duplicar uma entrada, passe o mouse sobre a linha e clique no botão **Duplicate** (duplicar). Para removê-la, clique no botão **Delete** (excluir). Marinara pede uma confirmação com a pergunta "Delete this lorebook entry?".

## Conteúdo e chaves da entrada

Expanda uma entrada para editar os campos principais.

- **Primary Keys** (chaves primárias): as palavras-chave que acionam a entrada. Quando qualquer uma dessas palavras aparece no chat recente, a entrada é ativada. Digite uma palavra-chave e pressione Enter para adicioná-la como etiqueta.
- **Content** (conteúdo): o texto que Marinara insere no prompt da IA quando a entrada é ativada. Escreva como um fato simples que você quer que a IA saiba. O conteúdo aceita macros de prompt, e uma estimativa de tokens em tempo real aparece abaixo da caixa.
- **Secondary Keys** (chaves secundárias): palavras-chave extras, usadas só quando o tipo da entrada é **Selective**. Veja a seção sobre tipos de entrada abaixo.
- **Description** (descrição): um resumo curto da entrada. Só o agente **Knowledge Router** lê esse campo, para decidir se insere a entrada. Ele nunca vai como conteúdo para a IA principal. Veja [Fontes de conhecimento](../agents/knowledge-sources.md).

Veja um exemplo simples.

- Nome: `Silverhaven`
- Primary Keys: `Silverhaven`, `the capital`
- Content: `Silverhaven is the mountain capital. Its people mine blue crystal and distrust outsiders.`

Quando você ou a IA mencionam `Silverhaven` ou `the capital` no chat, a IA recebe esse fato automaticamente.

## Regras de correspondência das palavras-chave

Por padrão, uma chave primária corresponde se a palavra aparecer em qualquer lugar do texto recente do chat, sem diferenciar maiúsculas de minúsculas. Três controles mudam esse comportamento. As opções **Whole Words** e **Case Sensitive** ficam no painel lateral expandido. O botão liga/desliga **Regex** é o ícone pequeno da linha compacta, e fica laranja quando está ativado.

| Controle | Onde fica | Padrão | O que faz |
|---|---|---|---|
| **Whole Words** | Painel da entrada | Off | A chave precisa corresponder à palavra inteira, não a um pedaço de uma palavra maior. |
| **Case Sensitive** | Painel da entrada | Off | Maiúsculas e minúsculas precisam bater exatamente. |
| **Regex** | Linha compacta | Off | Trata cada chave como um padrão de expressão regular, e não como texto simples. |

Uma expressão regular (regex) é uma linguagem de busca por padrões em texto. Use esse recurso só se você já conhece regex. Marinara executa cada chave de regex com um tempo limite curto de segurança. Um padrão que demora demais não corresponde naquela varredura, então mantenha os padrões simples.

## Tipos de entrada: Normal, Constant, Selective

Toda entrada tem um tipo. Clique no pontinho colorido da linha da entrada para abrir o menu de tipos e escolher um.

- **Normal** (ponto verde): aciona quando uma chave primária corresponde ao texto varrido. É o padrão.
- **Constant** (ponto amarelo): insere o conteúdo toda vez que o lorebook está ativo, sem precisar de palavra-chave. Use para fatos que precisam estar sempre presentes.
- **Selective** (ponto vermelho): as chaves primárias precisam corresponder, e a lógica das chaves secundárias também precisa passar.

Uma entrada **Constant** continua obedecendo ao momento de acionar, à probabilidade e a qualquer filtro que você definir. Ela só não precisa de palavra-chave.

Quando a entrada é **Selective**, acrescente uma ou mais **Secondary Keys** e escolha um botão em **Logic** (lógica) no painel lateral:

- **AND Any**: pelo menos uma chave secundária também precisa aparecer.
- **AND All**: todas as chaves secundárias precisam aparecer.
- **NOT Any**: a entrada é bloqueada se qualquer chave secundária aparecer.
- **NOT All**: a entrada só é bloqueada se todas as chaves secundárias aparecerem.

Veja um exemplo: uma entrada **Selective** com a chave primária `king` e a chave secundária `Silverhaven`, definida como **AND Any**. Ela só é acionada quando o chat menciona tanto o rei quanto Silverhaven. Assim uma palavra genérica como `king` não aciona a entrada na cena errada.

## Position, Depth e Order

Esses controles decidem onde a entrada ativada entra no prompt. Eles ficam na linha compacta em telas largas. Em telas estreitas, toque no botão de controles rápidos da linha para chegar até eles.

- **Position** (posição): escolha entre **Before chat**, **After chat**, **@ Depth** e **Outlet**. Before chat e After chat colocam a entrada em volta do histórico do chat. A opção **@ Depth** insere a entrada dentro do histórico do chat. A opção **Outlet** não insere a entrada automaticamente; ela disponibiliza o conteúdo ativado para uma macro `{{outlet::name}}` com nome. Em telas largas, a linha mostra as três primeiras posições com as etiquetas curtas **↑Char**, **↓Char** e **@Depth**.
- **Depth** (profundidade): aparece só quando **Position** está em **@ Depth**. Define quantas mensagens antes da última a entrada é inserida. O padrão é 4.
- **Order** (ordem): a ordem de inserção quando várias entradas são ativadas ao mesmo tempo. Número menor vem antes no prompt. O padrão é 100.

Ao escolher **Outlet**, aparece o campo **Outlet name** (nome do outlet). Informe um nome exato, com diferença entre maiúsculas e minúsculas, como `character_rules`, e depois coloque `{{outlet::character_rules}}` em uma seção do prompt. Cada entrada atribuída a esse Outlet continua seguindo as próprias regras de palavra-chave, constante, probabilidade, filtro, momento de acionar, limite de entradas e orçamento de tokens. Marinara reúne apenas as entradas ativadas para a geração atual. Entradas que compartilham o mesmo nome de Outlet são unidas na ordem de **Order**, separadas por quebras de linha.

Uma macro de Outlet sem entradas ativas correspondentes não gera nada. O conteúdo de um Outlet não pode chamar outra macro de Outlet, o que evita laços recursivos de Outlet. As macros de Outlet funcionam nas seções de prompt dos modos Conversation, Roleplay e Game.

## Probabilidade do gatilho

Cada entrada tem um valor em **Probability** (probabilidade), mostrado como porcentagem na linha. O padrão é 100%, ou seja, a entrada sempre é acionada quando as chaves correspondem. Reduza esse valor para que a entrada seja acionada só de vez em quando. Por exemplo, 25% significa uma chance em quatro de ativação a cada correspondência das chaves.

## Momento de acionar: Sticky, Cooldown, Delay, Ephemeral

Os campos em **Timing** (momento de acionar), no painel lateral, controlam o comportamento da entrada ao longo de várias mensagens. **Sticky**, **Cooldown** e **Delay** contam mensagens. **Ephemeral** conta ativações. Os quatro começam desligados (0, ou seja, sem efeito).

- **Sticky** (fixar): depois de a entrada ser acionada, ela continua ativa por esta quantidade de mensagens, mesmo sem uma nova correspondência de palavra-chave.
- **Cooldown** (espera): depois de a entrada ser acionada, ela espera esta quantidade de mensagens até poder ser acionada de novo.
- **Delay** (atraso): a entrada espera esta quantidade de mensagens no chat até poder ser ativada pela primeira vez.
- **Ephemeral** (efêmera): a entrada se desativa depois desta quantidade de ativações. O valor 0 significa ilimitado.

Por exemplo, defina **Sticky** como 3 para manter um fato no prompt por alguns turnos depois que ele surgir. Assim a IA não esquece o fato no meio da cena.

## Outras opções da entrada

O painel lateral expandido tem mais alguns campos.

- **Role** (papel): define se o texto inserido é marcado como **System**, **User** ou **Assistant**. Isso só importa quando **Position** está em **@ Depth**. O padrão é **System**.
- **Group** (grupo) e **Tag** (tag): coloque entradas no mesmo **Group** para que só uma delas seja ativada por vez. O campo **Tag** é uma etiqueta de texto livre, para você organizar do seu jeito.
- **Locked** (bloqueada): impede que o agente **Lorebook Keeper** altere esta entrada. Veja a [Referência dos agentes para download](../agents/built-in-agents.md).
- A opção **No Vector** e o selo de status de vetor têm a ver com a busca semântica. Veja [Busca semântica para lorebooks](semantic-search.md).

O painel lateral também tem a seção **Context filters & matching sources** (filtros de contexto e fontes de correspondência). Nela você limita a entrada a determinados personagens, tags de personagem ou tipos de geração. Também é possível varrer campos extras do card de personagem (a descrição do personagem, por exemplo) atrás das palavras-chave da entrada.

## A ferramenta Keyword test

O painel **Keyword test** (teste de palavras-chave), no topo da aba **Entries**, permite conferir as palavras-chave sem começar um chat. Expanda o painel e cole na caixa um parágrafo de exemplo ou algumas mensagens.

As entradas cujas chaves corresponderiam ganham um destaque verde e uma etiqueta **Would activate**. Entradas **Constant** ganham a etiqueta **Always active**, porque são acionadas independentemente do que o texto diz. Uma linha de contagem mostra quantas das entradas ativas seriam acionadas.

Esse teste verifica só as regras de palavra-chave. Ele ignora o momento de acionar, a probabilidade, os filtros de personagem e a correspondência semântica, então o chat ao vivo ainda pode se comportar de forma diferente da prévia.

## Pastas de entradas

As pastas agrupam entradas dentro de um mesmo lorebook. Elas são independentes das pastas da biblioteca no painel principal **Lorebooks**.

- Clique em **Add Folder** para criar uma pasta e renomeie na própria linha.
- Arraste uma entrada para cima de uma pasta para guardá-la ali, ou use o seletor **Folder** da entrada.
- Arraste uma pasta para cima de outra para aninhá-la, ou arraste-a para a faixa do topo para tirá-la do aninhamento.
- Cada pasta tem um botão liga/desliga **Enabled** (ativada). Ao desativar uma pasta, todas as entradas dentro dela param de ser ativadas, mesmo que o botão da própria entrada esteja ligado.
- O cabeçalho da pasta também traz **Clone** (clonar) e **Delete**. O botão **Clone** faz uma cópia completa da pasta, com todas as entradas e subpastas. O botão **Delete** remove só a pasta em si. As entradas e subpastas dela sobem para o nível superior.

As pastas só aparecem como grupos quando a ordenação está em **Order** e não há busca ativa. Qualquer outra ordenação, ou uma busca, muda a exibição para uma lista simples e mostra o aviso "Folder view paused (clear search and sort by Order)".

## Guias relacionados

- [Visão geral dos lorebooks](overview.md)
- [Orçamento de tokens e recursão em lorebooks](token-budgets.md)
- [Busca semântica para lorebooks](semantic-search.md)
- [Fontes de conhecimento: agentes Retrieval e Router](../agents/knowledge-sources.md)
