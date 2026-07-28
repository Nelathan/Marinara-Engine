# Integração com o Home Assistant

Neste guia você aprende a conectar Marinara Engine ao Home Assistant. Com a conexão pronta, os personagens de IA controlam dispositivos reais da casa inteligente direto de um chat. Eles acionam luzes, climatização, persianas e reprodutores de mídia. A conexão também permite que automações do Home Assistant enviem mensagens para dentro do Marinara.

Home Assistant é uma plataforma gratuita e de código aberto para controlar dispositivos de casa inteligente. Quem não usa Home Assistant não precisa desta integração.

## O que esta integração faz

A integração é um pequeno programa que se instala dentro do Home Assistant. Ela liga um Home Assistant em funcionamento a um servidor Marinara Engine em funcionamento. Depois de instalada, ela cuida de três coisas sozinha:

- Cria ferramentas de casa inteligente dentro do Marinara. Elas aparecem na seção **Functions** (funções) do painel Presets. Marinara chama isso de "custom tools" ou "Functions". Veja [Ferramentas personalizadas](../extending/custom-tools.md) para entender como as Functions funcionam de modo geral.
- Cria um agente de IA dentro do Marinara chamado **Home Assistant**. Um agente é um ajudante de IA que roda junto com o chat. Veja [Agentes: ajudantes de IA para os seus chats](../agents/agents-overview.md).
- Cria várias entidades no Home Assistant, para que você acompanhe e controle Marinara pelo lado do Home Assistant. Uma entidade é um dispositivo, sensor ou controle no Home Assistant.

Você nunca copia endereços de ferramentas nem configura ferramentas na mão. A integração conecta tudo já na primeira configuração.

## Pré-requisitos

Antes de começar, confira se você tem tudo o que está na lista.

- Um Home Assistant em funcionamento, versão 2024.1.0 ou mais recente.
- HACS instalado no Home Assistant. HACS é a Home Assistant Community Store, uma ferramenta para instalar integrações personalizadas que não vêm de fábrica.
- Marinara Engine instalado, em funcionamento e acessível a partir da máquina do Home Assistant. O endereço padrão é `localhost:7860`. Se o Home Assistant roda em outro dispositivo, leia a observação sobre senhas mais abaixo.
- A configuração `WEBHOOK_LOCAL_URLS_ENABLED=true` acrescentada ao arquivo `.env` do Marinara.

O arquivo `.env` é o arquivo de configurações em texto simples do servidor Marinara. Veja [Configuração do servidor](../CONFIGURATION.md) para descobrir onde ele fica e como editá-lo.

Essa última configuração é necessária porque a integração usa um webhook. Um webhook é um endereço da web que permite a um aplicativo enviar dados a outro automaticamente. O endereço de webhook do Home Assistant é um endereço `http` local e simples. Por segurança, Marinara bloqueia chamadas para endereços `http` locais por padrão. A configuração `WEBHOOK_LOCAL_URLS_ENABLED=true` libera essas chamadas.

Acrescente esta linha ao arquivo `.env`:

```
WEBHOOK_LOCAL_URLS_ENABLED=true
```

Essa configuração vale em poucos segundos. Não é preciso reiniciar o servidor Marinara.

### Se o Home Assistant roda em outro dispositivo

A integração se conecta a Marinara sem usuário e sem senha. Não existe campo para isso no formulário de configuração. Por causa disso, o lugar onde o Home Assistant roda faz diferença:

- Se Home Assistant e Marinara rodam na mesma máquina, a conexão funciona de imediato.
- Se o Home Assistant roda em outro dispositivo, Marinara bloqueia a conexão por padrão. Você precisa liberar esse dispositivo para conectar sem senha. Um jeito é acrescentar o endereço IP dele à variável `IP_ALLOWLIST` no arquivo `.env` do Marinara. Um endereço IP é o número que identifica um dispositivo na rede. Em uma rede doméstica de total confiança, outra opção é definir `ALLOW_UNAUTHENTICATED_PRIVATE_NETWORK=true`.
- Se Marinara está protegido com `BASIC_AUTH_USER` e `BASIC_AUTH_PASS`, a integração não consegue entrar. Nesse caso, ela só funciona a partir da mesma máquina ou de um dispositivo listado em `IP_ALLOWLIST`.

Veja [Acesso remoto](../REMOTE_ACCESS.md) para entender como essas configurações funcionam e qual escolher.

## Instalar a integração no Home Assistant

A instalação tem duas etapas. Primeiro você adiciona a integração ao HACS, depois faz a configuração.

### Adicionar ao HACS

1. No Home Assistant, abra o **HACS**.
2. Abra o menu de três pontos e clique em **Custom repositories** (repositórios personalizados).
3. No campo do repositório, informe este endereço:

```
https://github.com/Pasta-Devs/Marinara-Engine
```

4. Defina a categoria como **Integration**, depois clique em **Add**.
5. Busque por **Marinara Engine** e instale.
6. Reinicie o Home Assistant.

### Fazer a configuração

1. Vá em **Settings** (Configurações), depois **Devices & Services** (dispositivos e serviços), e clique em **Add Integration** (adicionar integração).
2. Busque por **Marinara Engine**.
3. Informe o **Host** e a **Port** (porta) onde Marinara está rodando. Os valores padrão são `localhost` e `7860`.
4. Clique em **Submit**.

Se Marinara não puder ser alcançado nesse endereço, o Home Assistant mostra um erro e não conclui. Veja a seção de solução de problemas mais abaixo.

## O que Marinara Engine cria sozinho

Quando a configuração dá certo, a integração monta tudo para você.

- Registra um webhook privado dentro do Home Assistant.
- Cria as ferramentas de casa inteligente na seção **Functions** do Marinara, cada uma já apontando para esse webhook.
- Cria o agente **Home Assistant** no Marinara, com todas as ferramentas ativas na lista.
- Cria as entidades do Home Assistant descritas mais adiante neste guia.

## Adicionar o agente Home Assistant a um chat

Criar o agente não o vincula a todos os chats. Você precisa adicioná-lo em cada chat onde quer o controle da casa inteligente.

1. Abra o chat desejado.
2. Abra **Chat Settings** (configurações do chat) e vá até a seção **Agents**.
3. Adicione o agente **Home Assistant** ao chat.

O agente Home Assistant funciona em chats de Roleplay, Conversation e Game. Depois de adicionado, as ferramentas de casa inteligente ficam disponíveis para a IA nesse chat automaticamente. Não é preciso ativar mais nada no chat.

## Conferir se está tudo funcionando

Teste a conexão com um pedido simples.

1. Adicione o agente **Home Assistant** a um chat, como mostrado acima.
2. Nesse chat, escreva um pedido comum, por exemplo: `Turn on the office lights`.
3. Envie a mensagem.

A IA deve chamar uma ferramenta de casa inteligente, como `ha_turn_on`, e as luzes correspondentes devem acender. Em seguida, a IA confirma o que fez. Se nada acontecer, verifique se `WEBHOOK_LOCAL_URLS_ENABLED=true` está definido e consulte a solução de problemas.

## Categorias de ferramentas expostas

A integração organiza as ferramentas de casa inteligente em oito categorias. Você escolhe quais categorias Marinara pode usar.

Para mudar as categorias, abra **Settings**, depois **Devices & Services**, clique em **Marinara Engine** e clique em **Configure**. Aparecem duas opções:

- **Primary Chat**: o chat padrão que os serviços do Home Assistant usam como alvo. Esses serviços estão descritos mais adiante neste guia.
- **Exposed Tool Categories**: a lista de categorias de ferramentas que Marinara pode usar.

Esta tabela traz cada categoria, o estado padrão e as ferramentas que ela contém.

| Categoria | Padrão | Ferramentas |
|---|---|---|
| Lights & Switches | On | ha_turn_on, ha_turn_off, ha_toggle, ha_set_brightness, ha_set_color, ha_set_color_temp |
| Climate | On | ha_set_temperature, ha_set_hvac_mode |
| Covers (Blinds & Garage) | On | ha_open_cover, ha_close_cover, ha_set_cover_position |
| Locks | Off | ha_lock, ha_unlock |
| Media Players | On | ha_media_play, ha_media_pause, ha_set_volume |
| Scenes & Scripts | On | ha_activate_scene, ha_run_script |
| Query | On | ha_get_state, ha_list_areas, ha_list_entities, ha_notify |
| Generic Service Calls (Advanced) | Off | ha_call_service |

As categorias **Locks** e **Generic Service Calls (Advanced)** vêm desativadas por padrão. Ative apenas se quiser mesmo usá-las. A categoria **Generic Service Calls (Advanced)** deixa a IA chamar qualquer serviço do Home Assistant, então use com cuidado.

A maioria das ferramentas aceita um dispositivo específico ou o nome de um cômodo. Com o nome de um cômodo, a ferramenta age em todos os dispositivos correspondentes daquele cômodo de uma vez.

Mudanças nas categorias só valem depois que você pressiona o botão **Marinara Sync HA Tools** ou reinicia o Home Assistant. Esse botão está descrito na próxima seção.

## Entidades no Home Assistant

A integração cria estas entidades dentro de um dispositivo do Home Assistant chamado **Marinara Engine**.

| Entidade | Tipo | O que faz |
|---|---|---|
| Marinara Chat Count | Sensor | Mostra o número total de chats no Marinara |
| Marinara Active Agent Count | Sensor | Mostra quantos agentes do Marinara estão ativos |
| Marinara Active Chat | Select | Escolhe qual chat os serviços do Home Assistant usam como alvo |
| Marinara Agent: (nome) | Switch | Ativa ou desativa um agente do Marinara. Há um botão liga/desliga por agente |
| Marinara Abort Generation | Button | Cancela qualquer resposta de IA que esteja sendo gerada |
| Marinara Sync HA Tools | Button | Reenvia todas as ferramentas e remonta o agente Home Assistant |

A integração consulta Marinara em busca de novos chats e agentes a cada 30 segundos. Um chat ou agente recém-criado no Marinara pode levar até 30 segundos para aparecer aqui.

## Controlar Marinara a partir de automações do Home Assistant

A integração acrescenta dois serviços ao Home Assistant. Eles são usados dentro das automações do Home Assistant, não dentro do Marinara. Os dois podem usar por padrão o chat definido em **Primary Chat**.

### Send Message (marinara_engine.send_message)

Envia uma mensagem para um chat do Marinara.

- `message`: o texto da mensagem. Este campo é obrigatório.
- `chat_id`: para qual chat enviar. Se ficar em branco, o Primary Chat é usado.
- `role`: de quem é a mensagem. Pode ser `user`, `assistant`, `system` ou `narrator`. O padrão é `user`.
- `trigger_generation`: quando verdadeiro, a IA também responde depois que a mensagem chega. O padrão é falso.

Veja uma automação que avisa a IA quando a porta da frente abre:

```yaml
automation:
  trigger:
    platform: state
    entity_id: binary_sensor.front_door
    to: "on"
  action:
    service: marinara_engine.send_message
    data:
      message: "Someone just arrived at the front door."
      trigger_generation: true
```

### Trigger Generation (marinara_engine.trigger_generation)

Inicia uma resposta da IA em um chat sem que você envie uma mensagem visível.

- `chat_id`: qual chat usar. Se ficar em branco, o Primary Chat é usado.
- `user_message`: uma mensagem opcional para acompanhar o turno da resposta.

## Sincronizar de novo depois de mudar as configurações

Quando você muda as categorias ativas, pressione **Marinara Sync HA Tools** para aplicar a mudança. Esse botão fica na página do dispositivo **Marinara Engine** dentro do Home Assistant.

Ao pressionar **Marinara Sync HA Tools**, acontece o seguinte:

- As ferramentas existentes são atualizadas no lugar, então qualquer mudança chega a Marinara.
- O agente **Home Assistant** é remontado, caso você o tenha excluído no Marinara.
- Toda ferramenta de uma categoria desativada também fica desativada. Essas ferramentas não são excluídas.

Não edite na mão as ferramentas do Home Assistant dentro do Marinara. A próxima sincronização sobrescreve as edições e reativa as ferramentas.

## Solução de problemas

### O formulário de configuração diz que não consegue conectar

Verifique se Marinara Engine está em funcionamento. Confira se o **Host** e a **Port** informados são mesmo onde ele está escutando. O padrão é `localhost` e `7860`.

Se o Home Assistant roda em um dispositivo diferente do Marinara, Marinara o bloqueia por padrão. A integração não consegue enviar senha, então Marinara precisa aceitar esse dispositivo sem senha. Acrescente o endereço IP do dispositivo do Home Assistant à variável `IP_ALLOWLIST` no arquivo `.env` do Marinara. Veja [Acesso remoto](../REMOTE_ACCESS.md) para essa e outras opções. Um Marinara protegido com `BASIC_AUTH_USER` e `BASIC_AUTH_PASS` também recusa a integração, a não ser que o dispositivo esteja listado em `IP_ALLOWLIST`.

Essas regras continuam valendo depois da configuração. Se Marinara passar a bloquear o dispositivo do Home Assistant, os sensores e a lista de chats param de atualizar em silêncio.

### A IA tenta usar uma ferramenta de dispositivo e nada acontece

O mais provável é que a chamada do webhook esteja bloqueada. Acrescente `WEBHOOK_LOCAL_URLS_ENABLED=true` ao arquivo `.env` do Marinara e salve. Isso vale em poucos segundos. Sem essa configuração, as chamadas de ferramenta podem falhar com um aviso de que `http` não é permitido ou de que um endereço privado foi recusado.

Se Marinara e Home Assistant rodam na mesma máquina, a integração usa o endereço interno para o webhook automaticamente. Se Marinara roda em outro dispositivo, verifique se o endereço de rede local do Home Assistant é alcançável a partir desse dispositivo.

### As ferramentas não aparecem na lista Functions

Pressione **Marinara Sync HA Tools** ou reinicie o Home Assistant. Depois confira a seção **Functions** do painel Presets no Marinara.

### O agente Home Assistant não está no meu chat

Primeiro confirme se o agente **Home Assistant** existe no Marinara, na seção Agents. Se ele sumiu, pressione **Marinara Sync HA Tools** para remontá-lo. Depois abra **Chat Settings**, vá até a seção **Agents** e adicione o agente **Home Assistant** àquele chat.

### Encontrar o endereço do webhook na mão

Raramente você precisa disso, já que cada ferramenta já vem com o endereço configurado. Para encontrá-lo, abra **Settings**, depois **Devices & Services** e então **Marinara Engine** no Home Assistant. O webhook segue este padrão, em que 8123 é a porta padrão do Home Assistant:

```
http://<homeassistant-ip>:8123/api/webhook/<webhook-id>
```

## Desinstalar

Para remover a integração, exclua-a em **Settings**, depois **Devices & Services** e então **Marinara Engine** no Home Assistant. Isso remove as entidades do Home Assistant. As ferramentas criadas na seção **Functions** do Marinara continuam lá. O agente **Home Assistant** também. Exclua os dois na mão no Marinara se não quiser mais usá-los.

## Guias relacionados

- [Ferramentas personalizadas](../extending/custom-tools.md)
- [Agentes: ajudantes de IA para os seus chats](../agents/agents-overview.md)
- [Configuração do servidor](../CONFIGURATION.md)
- [Acesso remoto](../REMOTE_ACCESS.md)
