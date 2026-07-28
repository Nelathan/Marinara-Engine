# Vincular lorebooks a personagens e personas

Neste guia você aprende a vincular lorebooks a um personagem ou a uma persona (o personagem que você interpreta) para que eles sejam ativados sozinhos nos chats certos. O guia também explica como embutir um lorebook dentro de um card de personagem e mostra os controles da seção **Lorebooks** de cada chat. Um lorebook é um conjunto de fatos do seu mundo, organizado em entradas que são acionadas por palavras-chave. Se você ainda não conhece o recurso, veja [Visão geral dos lorebooks](overview.md).

## Duas formas de anexar um lorebook

Existem duas formas diferentes de anexar um lorebook a um personagem. Elas funcionam de jeitos distintos, então escolha a que atende ao seu caso.

- **Vincular (atribuir)**: o lorebook continua na sua biblioteca e o personagem ou a persona apenas aponta para ele. O lorebook é ativado sozinho nos chats que incluem esse personagem ou que usam essa persona. Um lorebook vinculado NÃO acompanha o card de personagem exportado.
- **Embutir**: o lorebook é escrito dentro do próprio card de personagem. Ele acompanha o card quando você exporta ou compartilha o personagem. Embutir funciona só com personagens, nunca com personas.

Na maioria das vezes, vincular é a melhor escolha. Embuta apenas quando a ideia for compartilhar o card de personagem já com o lorebook dentro.

## A aba Lorebook no editor

Tanto o editor de personagens quanto o editor de personas têm uma aba **Lorebook**.

1. Abra um personagem ou uma persona para editar.
2. Clique na aba **Lorebook**.
3. Aparece uma seção **Lorebooks** com dois botões: **New** (novo) e **Assign Lorebook** (atribuir um lorebook).

O botão **New** cria um lorebook em branco já vinculado ao personagem ou à persona que você está editando. Ele abre a janela **Create Lorebook** com o campo **Category** definido como **Character**.

O botão **Assign Lorebook** vincula um lorebook que já existe na sua biblioteca. A janela de seleção mostra apenas os lorebooks da categoria **Character**. Veja os detalhes a seguir.

## Atribuir um lorebook existente

A janela de seleção do **Assign Lorebook** mostra apenas os lorebooks cujo campo **Category** é **Character**. Isso vale também na edição de uma persona. Um lorebook de outra categoria, como World ou NPC, não aparece nem na seleção nem na lista de atribuídos. Para que ele apareça, abra o lorebook e defina o campo **Category** como **Character** na aba **Overview**. O botão **New** evita esse problema, porque já cria o lorebook na categoria Character.

1. Na aba **Lorebook**, clique em **Assign Lorebook**.
2. No campo de busca, digite parte do nome do lorebook para encontrá-lo.
3. Clique no lorebook desejado. Uma marca de seleção aparece ao lado dele.
4. À direita, escolha um **Scope** (escopo), explicado na próxima seção.
5. Clique em **Assign**.

O lorebook passa a aparecer na lista de atribuídos. Cada linha dessa lista traz um botão **Scope**, para mudar o escopo depois, e um ícone de lixeira, para remover o vínculo. Clique no nome do lorebook para abri-lo no editor completo.

Um lorebook definido como Global fica ativo em todos os chats e, por isso, não pode ser vinculado a um personagem ou a uma persona ao mesmo tempo. A opção Global está explicada em [Visão geral dos lorebooks](overview.md).

## Scope: quais chats podem usar o lorebook vinculado

O campo **Scope** controla onde um lorebook vinculado pode ser ativado. Ele não abrange todos os chats do Marinara, e sim os chats que incluem este personagem ou que usam esta persona. São três modos de escopo.

- **All chats with [name]**: o padrão. O lorebook é ativado em todos os chats que incluem este personagem ou usam esta persona.
- **Disabled for all chats**: o vínculo continua, mas o lorebook nunca é ativado. Use essa opção para pausar um lorebook sem desfazer o vínculo.
- **Specific chats**: você escolhe os chats exatos em uma lista de seleção. Só os chats marcados podem usar o lorebook. A lista mostra os chats que já incluem este personagem ou usam esta persona.

Ao escolher **Specific chats**, marque pelo menos um chat, senão não é possível salvar.

Para mudar o escopo depois, clique no botão **Scope** na linha do lorebook atribuído, faça o ajuste e clique em **Assign** de novo.

## Embutir um lorebook em um card de personagem

Ao embutir, Marinara escreve o lorebook dentro do card de personagem, e assim ele é exportado junto com o personagem. Isso vale só para personagens. Use quando quiser compartilhar um personagem que já leva as informações do mundo dele.

1. Abra o personagem no editor de personagens.
2. Vá para a aba **Lorebook**.
3. Verifique se o lorebook desejado já está atribuído, conforme explicado acima.
4. Na linha desse lorebook, clique em **Embed into card** (embutir no card).

Um selo **Embedded** aparece na linha. A partir daí, as entradas do lorebook ficam dentro do card e são exportadas com ele.

Um card de personagem comporta um lorebook embutido por vez. Se o card já tiver um, o botão **Embed into card** fica desativado, com o aviso "Remove the current embedded lorebook first". Remova a cópia embutida atual antes de embutir outro lorebook.

Se você editar o lorebook vinculado depois de embuti-lo, clique em **Refresh** na linha dele. Isso regrava a cópia embutida a partir das entradas atuais do lorebook, mantendo a cópia interna em dia.

## Gerenciar um lorebook embutido

Quando o card de personagem já tem um lorebook embutido, controles extras aparecem abaixo da lista de atribuídos, junto com uma lista somente leitura das entradas embutidas.

- **Import Embedded Lorebook** (importar o lorebook embutido): transforma as entradas gravadas no card em um lorebook normal e editável na sua biblioteca. O novo lorebook fica vinculado de volta ao personagem. Quando já existe uma cópia vinculada, o botão passa a mostrar **Reimport Embedded Lorebook**.
- **Edit Embedded Lorebook** (editar o lorebook embutido): abre esse lorebook vinculado no editor completo. As edições feitas ali são sincronizadas automaticamente com a cópia embutida no card.
- **Remove from card** (remover do card): exclui a cópia embutida do card. Um lorebook vinculado à parte na sua biblioteca continua intacto.

Esse recurso ajuda bastante com cards importados de outras ferramentas. Muitos cards importados chegam com um lorebook embutido. Clique em **Import Embedded Lorebook** para ter uma versão totalmente editável no Marinara.

## A seção Lorebooks em Chat Settings

Cada chat tem os próprios controles de **Lorebooks**. É ali que você vê quais lorebooks estão ativos no chat atual e faz ajustes válidos só para ele.

1. Abra um chat.
2. Abra **Chat Settings** (configurações do chat).
3. Encontre a seção **Lorebooks**. O selo de contagem mostra quantos lorebooks estão ativos.

Cada lorebook ativo exibe um ou mais selos que indicam o motivo de estar ligado:

- **Chat**: você fixou o lorebook neste chat manualmente.
- **Global**: é um lorebook global.
- **Character**: está vinculado a um personagem deste chat.
- **Persona**: está vinculado à persona deste chat.

Você pode mudar o que fica ativo apenas neste chat.

- **Add Lorebook** (adicionar um lorebook): fixa um lorebook neste chat. Lorebooks fixados exibem o selo **Chat**.
- Ícone de lixeira (**Remove from chat**): desafixa um lorebook que você adicionou manualmente.
- Ícone de olho cortado (**Disable in this chat**): esconde temporariamente um lorebook ativado automaticamente, só neste chat, sem desfazer o vínculo. Lorebooks desativados aparecem com o nome riscado e o selo **Disabled**.
- Ícone de olho (**Enable in this chat**): religa neste chat um lorebook desativado.

### Lorebook Token Budget

O campo **Lorebook Token Budget** é numérico e fica nesta seção. Ele limita quanto texto de lorebook pode ser inserido neste chat, medido em tokens (pedacinhos de texto). O padrão é **8192**. Defina **0** para não ter limite. Esse orçamento de tokens válido para o chat inteiro é separado do orçamento de cada lorebook. Os dois limites valem ao mesmo tempo. Veja [Orçamento de tokens e recursão em lorebooks](token-budgets.md) para entender como eles se combinam.

## Guias relacionados

- [Visão geral dos lorebooks](overview.md)
- [Orçamento de tokens e recursão em lorebooks](token-budgets.md)
- [Importar e exportar lorebooks](import-export.md)
- [Criando e editando personagens](../characters/creating-and-editing-characters.md)
- [Visão geral do painel Chat Settings](../chats/chat-settings.md)
