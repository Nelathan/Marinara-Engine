# Configuração do Haptic Feedback

Neste guia você aprende a deixar um personagem de IA controlar dispositivos táteis conectados no Marinara Engine. Aqui você vê como instalar o aplicativo auxiliar, adicionar o agente **Haptic Feedback** (feedback tátil) a um chat, conectar o dispositivo e ajustar as configurações de toque.

## O que é feedback tátil

Com o feedback tátil, um personagem de IA envia estímulos de toque para um dispositivo tátil conectado (um brinquedo íntimo) durante o chat. Marinara Engine não fala diretamente com o dispositivo. Em vez disso, envia comandos para um aplicativo companheiro gratuito chamado **Intiface Central**, e é esse aplicativo que fala com o dispositivo.

**Intiface Central** usa um protocolo de dispositivos chamado **Buttplug.io**. É o mesmo padrão aberto com suporte em muitos brinquedos e em outros aplicativos. Você instala **Intiface Central** uma vez, pareia o dispositivo com ele, e Marinara se conecta por um endereço de rede local.

O feedback tátil faz parte dos **Agents** (agentes) do chat, os ajudantes de IA que você adiciona a uma conversa. Ele funciona no Conversation Mode e no Roleplay Mode. Não está disponível no Game Mode.

## Antes de começar

Três coisas precisam estar prontas antes de ligar o feedback tátil.

1. Instale **Intiface Central** pelo site oficial. Abra este endereço no navegador.

```
https://intiface.com/central/
```

2. Abra **Intiface Central** e inicie o servidor dele. Procure o botão de iniciar o servidor dentro do aplicativo.
3. Pareie ou conecte o dispositivo dentro do **Intiface Central**, para que o aplicativo consiga enxergá-lo.

Se **Intiface Central** não estiver aberto com o servidor iniciado, Marinara não consegue enviar nenhum estímulo de toque.

## Adicione o agente Haptic Feedback

O feedback tátil se adiciona do mesmo jeito que qualquer outro agente, pelas configurações do chat.

1. Abra um chat de Conversation ou de Roleplay. O feedback tátil não aparece no Game Mode.
2. Abra **Chat Settings** (configurações do chat) para esse chat.
3. Vá até a seção **Agents**.
4. Adicione o agente **Haptic Feedback** ao chat.
5. Localize o card **Haptic Feedback** que passa a aparecer na lista **Agents**.

Ative o botão liga/desliga **Haptic Feedback** no topo do card. Desativado, a descrição diz "Allow this agent to send touch cues during the chat." Ativado, a descrição diz "Touch cues are enabled for this chat." Por padrão, o botão vem desativado.

Com o botão ativado, a IA envia estímulos de toque ocultos enquanto escreve. Esses estímulos não aparecem como texto no chat. Eles vão para todos os dispositivos conectados.

## Conectar, procurar e encontrar o dispositivo

Ao abrir o card **Haptic Feedback**, Marinara tenta se conectar sozinho ao **Intiface Central** usando o endereço salvo. A conexão também pode ser feita na mão.

O card mostra uma linha de status com um ponto colorido. Ponto verde significa conectado. Ponto vermelho significa desconectado. Ao lado fica um botão que diz **Connect** quando você está desconectado e **Disconnect** quando está conectado.

Para conectar na mão, clique em **Connect**. Se der certo, a linha mostra "Connected" com o endereço do servidor.

Se falhar, aparece uma mensagem avisando que o aplicativo não conseguiu se conectar. Ela pede que você confira se **Intiface Central** está aberto e com o servidor iniciado. A mensagem traz um link para o site do **Intiface Central**.

Uma vez conectado, o card mostra quantos dispositivos foram encontrados. Ele diz "No devices found" quando nenhum está ligado, ou o número de dispositivos quando há algum. Clique em **Scan for devices** (procurar dispositivos) para buscar de novo. Durante a busca, o botão diz "Scanning...". O card lista cada dispositivo com o nome e as ações compatíveis, como vibrar ou girar.

### O campo Intiface URL

O campo **Intiface URL** guarda o endereço de rede do servidor **Intiface Central**. É um endereço WebSocket, ou seja, um link local que os dois aplicativos usam para conversar. O padrão aparece abaixo.

```
ws://127.0.0.1:12345
```

O endereço `127.0.0.1` significa "este mesmo computador". Se você deixar o campo em branco, Marinara usa o padrão do servidor. Marinara também memoriza o endereço no navegador, então ele é reaproveitado entre chats e dispositivos.

Se você roda Marinara no Docker, ou abre Marinara no navegador de outro dispositivo, o endereço `127.0.0.1` não chega até o **Intiface Central**. Nesse caso, informe o endereço do computador que roda **Intiface Central**. Ele se parece com o exemplo abaixo, em que você troca os números pelo endereço real desse computador.

```
ws://192.168.1.50:12345
```

## Sensibilidade ao toque

Em um chat de Roleplay, o card **Haptic Feedback** mostra o controle **Touch sensitivity** (sensibilidade ao toque) com três opções. Ao lado dele fica um pequeno aviso "Roleplay only". Esse controle só afeta os chats de Roleplay. Nos outros modos, a configuração de sensibilidade é ignorada, e os estímulos não ficam limitados por esses presets.

As três opções definem a força e a duração máxima de cada estímulo.

| Opção | Sensação | Observações |
|---|---|---|
| **Subtle** | Intensidade menor e feedback mais curto | A opção mais suave |
| **Standard** | Feedback equilibrado para a maioria das cenas | O padrão |
| **Intense** | Feedback mais forte, com limite mais alto | A opção mais forte |

A opção **Standard** vem selecionada por padrão. Escolha a que combina com a cena. Nos chats de Roleplay, Marinara limita cada estímulo à faixa definida pela sua escolha. A IA não passa desse limite.

## Contato incidental

Abaixo do controle de sensibilidade, os chats de Roleplay também mostram o botão liga/desliga **Incidental contact** (contato incidental). Ele diz "Tiny taps for accidental brushes and bumps." Por padrão, esse botão vem desativado.

Desativado, a IA ignora pequenos toques acidentais da história. Ela só envia estímulos para contatos deliberados ou firmes. Ative-o se você também quiser toques leves para roçadas e esbarrões. Assim como a sensibilidade ao toque, esse controle só aparece nos chats de Roleplay.

## Usar de outro dispositivo

Por padrão, Marinara só aceita comandos táteis do mesmo computador que roda o servidor Marinara. Assim o controle do dispositivo continua local e privado.

Por causa disso, o feedback tátil não funciona quando você abre Marinara pelo celular ou por outro dispositivo. Isso vale quando esse dispositivo acessa um servidor Marinara que roda em outro lugar. As ações de conectar, procurar e comandar são recusadas, a não ser que você mude as configurações do servidor.

Para liberar o controle tátil a partir de outro dispositivo, ative a configuração de servidor `HAPTICS_ALLOW_REMOTE`. Você também precisa configurar uma proteção de acesso, como Basic Auth ou um segredo de administrador. Veja a [Referência de configuração do servidor](../CONFIGURATION.md) para essa configuração. Veja o guia [Acesso remoto](../REMOTE_ACCESS.md) para a proteção de acesso. O acesso de administrador é informado em **Settings** (Configurações), na área **Advanced**, dentro da seção **Admin Access**.

## Se algo não estiver funcionando

Se a IA nunca aciona o dispositivo, confira estes pontos nesta ordem.

1. Confira se **Intiface Central** está aberto e com o servidor iniciado.
2. Confira se o dispositivo está pareado e aparece na lista de dispositivos depois que você clica em **Scan for devices**.
3. Confira se o ponto de status está verde e se o botão liga/desliga **Haptic Feedback** está ativado.
4. Se você estiver no celular ou em um dispositivo remoto, releia as observações sobre acesso remoto acima.

Quando **Intiface Central** não está conectado, ou nenhum dispositivo está ligado, Marinara descarta o estímulo de toque da IA em silêncio. Nenhum erro aparece no chat.

## Guias relacionados

- [Agentes: ajudantes de IA para os seus chats](../agents/agents-overview.md)
- [Referência dos agentes para download](../agents/built-in-agents.md)
- [Acesso remoto: Basic Auth e lista de IPs permitidos](../REMOTE_ACCESS.md)
