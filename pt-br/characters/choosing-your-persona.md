# Escolhendo a persona de um chat

Neste guia você aprende a escolher qual persona representa você em um chat. Ele explica a persona ativa global, a persona definida para um chat específico e os seletores rápidos.

## A persona ativa e as personas por chat

A persona é o seu próprio card de personagem, a identidade que Marinara Engine usa para representar você – o personagem que você interpreta. Ela informa à IA o seu nome e os seus detalhes, para que a IA saiba com quem está falando. Para aprender a criar uma, veja [Personas do usuário](personas.md).

Marinara escolhe a persona em duas camadas:

- A **persona ativa** é o padrão global. Marinara usa essa persona em qualquer chat que não tenha uma persona própria.
- A persona definida em um chat substitui a persona ativa, mas só naquele chat.

Só uma persona fica ativa por vez. Também é possível não ter nenhuma.

## Como definir a persona ativa

Siga estes passos para definir a persona padrão global.

1. Abra o painel **Personas** pela barra lateral direita (o ícone de pessoa).
2. Passe o ponteiro sobre a persona que você quer na lista.
3. Clique em **Set as active** (definir como ativa), o ícone de visto naquela linha.

A persona ativa exibe um pequeno selo de visto sobre o avatar. Ao definir outra persona como ativa, o selo sai da anterior, então só uma persona fica ativa.

Para saber qual persona é a padrão, filtre a lista com os botões **Active** e **Inactive**.

Personas novas, duplicadas e importadas nunca ficam ativas sozinhas. Você mesmo precisa definir uma como ativa.

## Como escolher uma persona para um chat

Cada chat pode salvar a própria persona. Essa persona vale só para aquele chat e sempre vence a persona ativa.

### Pelo Chat Settings

1. Abra **Chat Settings** (configurações do chat), a engrenagem perto do chat.
2. Localize a seção **Persona**. O texto de ajuda começa com "Your persona defines who you are in this chat."
3. Quando não há persona definida, aparece "No persona selected."
4. Clique no botão **Choose Persona** (escolher a persona). Esse botão passa a mostrar **Change Persona** depois que uma persona é definida.
5. Pesquise no seletor (o campo mostra "Search personas...") e clique em uma persona.

Para remover a persona daquele chat, clique no botão de remover (X) ao lado dela ou escolha **None** no topo do seletor.

No Game Mode, essa seção aparece como a sua equipe dentro do jogo, mas continua usando a etiqueta **Persona**.

### Na criação de um chat

O assistente de configuração New Chat tem o campo **Your Persona**. Ele usa o mesmo seletor com busca e a opção **None**. Já no assistente de configuração New Game Setup, esse campo se chama **Player's Persona**.

## O Quick Persona Switcher

Com um chat aberto, um pequeno botão redondo de avatar fica perto da caixa de mensagem. Esse é o **Quick Persona Switcher** (troca rápida de persona). A dica dele – o texto que aparece ao passar o mouse – mostra esse nome quando nenhuma persona está definida.

1. Clique no botão de avatar.
2. Abre um menu chamado **Personas**.
3. Clique em qualquer persona para trocar na hora ou clique em **None** para não usar nenhuma persona.

As personas ficam agrupadas por pasta. As personas sem pasta aparecem em **Ungrouped**.

No celular, a troca de persona divide o mesmo menu com a troca de conexão. Toque na seta do **Quick Switcher** perto da caixa de mensagem e abra a aba **Personas**. A aba **Connections** fica nesse mesmo menu.

## Qual persona prevalece

Marinara escolhe a persona do chat nesta ordem:

1. A persona do próprio chat, se você definiu uma.
2. Se não houver, a persona ativa global.
3. Sem nenhuma das duas, a IA chama você de "User" e não envia detalhe nenhum de persona.

No Game Mode, você escolhe a persona uma única vez, no assistente de configuração New Game Setup. O chat mantém a persona escolhida ali. Na tela, um chat de Game Mode não muda para a persona ativa.

Trocar de persona no meio de um chat não reescreve as mensagens anteriores. Cada mensagem já enviada mantém a persona usada no envio.

## Guias relacionados

- [Personas do usuário: criar e editar](personas.md)
- [Visão geral do painel Chat Settings](../chats/chat-settings.md)
