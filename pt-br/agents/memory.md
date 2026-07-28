# Memory Recall e resumos do chat

Este guia explica como Marinara Engine mantém um chat longo coerente depois que ele cresce além do que o modelo de IA consegue ler de uma vez. Aqui você vê o **Memory Recall** (recuperação de lembranças, uma busca semântica pelas mensagens antigas), o **Chat Summary** (resumo do chat) nos chats de Roleplay e a **Automatic Summarization** (resumo automático) nos chats de Conversation.

## Os dois sistemas de memória

Todo modelo de IA só consegue ler uma quantidade limitada de texto de cada vez. Esse limite é a janela de contexto. Quando o chat fica longo, as mensagens mais antigas saem dessa janela e a IA esquece o que aconteceu. Marinara Engine (chamado de Marinara daqui em diante) tem dois sistemas separados que resolvem isso.

- O **Memory Recall** procura, nas mensagens antigas, os trechos mais relacionados ao que você acabou de dizer e insere esses trechos de volta no prompt, sem chamar atenção. Funciona em todos os modos de chat.
- Os resumos comprimem as mensagens antigas em recapitulações curtas, que ocupam o lugar das mensagens originais no prompt. Os chats de Roleplay usam o **Chat Summary**. Os chats de Conversation usam a **Automatic Summarization**.

Os chats de Game Mode contam apenas com o **Memory Recall**. Nenhum dos dois recursos de resumo existe ali.

Os dois sistemas podem ser usados ao mesmo tempo. Eles fazem trabalhos diferentes e não entram em conflito.

## Configurar o Memory Recall

O **Memory Recall** encontra trechos relevantes do começo do chat e os insere no prompt como lembranças. Para isso, ele usa um embedding: uma impressão digital numérica do significado de uma mensagem. Marinara compara a impressão digital da nova mensagem com as impressões digitais guardadas das mensagens antigas e acrescenta as mais parecidas.

### Ativar o Memory Recall

1. Abra um chat e clique no botão **Chat Settings** (configurações do chat) no cabeçalho do chat.
2. Localize a seção **Memory Recall** (o ícone é um cérebro).
3. Ative o botão liga/desliga **Enable Memory Recall**.

A opção **Enable Memory Recall** vale para cada chat separadamente. O padrão depende do modo:

- Ativada por padrão nos chats de Conversation.
- Ativada por padrão nos chats de Roleplay ou Game que têm uma cena ativa.
- Desativada por padrão em todos os outros chats.

Ao desativar o botão liga/desliga, as lembranças recuperadas deixam de entrar no prompt. Nada do que já foi guardado é excluído.

### A fonte de embeddings

O Memory Recall precisa de uma fonte de embeddings para montar essas impressões digitais de significado. A definição fica na conexão, não nas configurações do chat. A conexão é um vínculo salvo com um provedor de IA.

1. Abra o painel **Connections** (Conexões) e edite uma conexão.
2. Localize a seção **Semantic Search (Embeddings)** (busca semântica).
3. Digite o nome de um modelo de embeddings no campo do modelo. Um valor de exemplo é `text-embedding-3-small`.
4. Se quiser, defina uma **Embedding Endpoint URL** para substituir o endereço.
5. Se quiser, use o menu suspenso **Embedding Connection** para aproveitar a chave e o endereço de outra conexão. Entre as opções estão **Same as this connection** e **Local Model (sidecar)**.

Alguns provedores não oferecem embeddings. Nesse caso, Marinara mostra um aviso pedindo que você escolha uma conexão dedicada a embeddings, como uma conexão compatível com OpenAI, a Google ou o Local Model.

Se nenhuma conexão de embeddings for definida, Marinara recorre a um modelo de embeddings local embutido. Ele baixa esse modelo uma única vez e o executa na sua própria máquina, sem precisar de chave de API. Para saber mais sobre o modelo embutido, veja [Como configurar o Local Model](../connections/local-model.md).

Essa mesma configuração **Semantic Search (Embeddings)** também alimenta a busca semântica dos lorebooks, então configurar uma vez já ajuda os dois recursos.

### Memories for This Chat

Para ver o que um chat guardou, abra **Chat Settings**, vá até a seção **Memory Recall** e clique em **Access memories for this chat**. Isso abre a janela **Memories for This Chat** (lembranças deste chat).

A janela mostra a quantidade de blocos de memória guardados e uma estimativa aproximada de tokens. Cada card de bloco mostra o período que ele cobre, a quantidade de mensagens, um status e a data de criação. O status é um destes:

- **Vectorized**: a impressão digital está pronta para a busca.
- **Waiting for vector**: a impressão digital ainda está sendo criada.
- **Embedding unavailable**: nenhuma fonte de embeddings conseguiu criá-la.

A barra de ferramentas tem ícones para exportar lembranças, importar lembranças, reconstruir as lembranças e limpar tudo. Cada bloco também tem o próprio ícone de lixeira, para esquecer só aquele bloco.

- Ao clicar no ícone de lixeira de um bloco, abre-se a caixa de diálogo **Forget Memory**. Confirme em **Forget**.
- O ícone de lixeira que limpa tudo abre a caixa de diálogo **Clear Memories**. Confirme em **Clear**. Isso remove as lembranças do Memory Recall, mas não exclui as mensagens do chat.
- O ícone de atualizar reconstrói todos os blocos de memória a partir das mensagens atuais do chat. Use esse ícone depois de trocar o modelo de embeddings.
- A exportação salva um arquivo `.marinara.json`. A importação aceita arquivos `.json` ou `.marinara` e os mescla com as lembranças existentes.

### Como o Memory Recall se comporta

Vale prestar atenção nestes pontos:

- Marinara guarda blocos de memória em segundo plano sempre que existe uma fonte de embeddings, mesmo com a opção **Enable Memory Recall** desativada. O botão liga/desliga só controla se as lembranças guardadas entram no prompt. Para parar de guardar lembranças, remova a fonte de embeddings ou limpe as lembranças de tempos em tempos.
- Um bloco só é criado a partir de 5 mensagens novas. Lotes menores esperam a próxima resposta.
- Os trechos recuperados precisam ser relacionados o bastante para passar em um teste de semelhança. Combinações fracas são ignoradas, então a recuperação pode não trazer nada mesmo com lembranças guardadas.
- Só uma pequena parte do prompt é reservada para as lembranças recuperadas, ou seja, apenas as poucas mais relevantes entram.
- Se você trocar o modelo de embeddings depois que já existem lembranças, os blocos antigos deixam de combinar. Use o ícone de reconstruir para refazê-los.
- Ao excluir as mensagens de um chat, os blocos de memória dele também são excluídos.

Algumas versões em contêiner do Marinara, conhecidas como Marinara Lite, desativam o Memory Recall por completo. Nessas versões, a seção **Memory Recall** nem aparece.

## Chat Summary (Roleplay)

O **Chat Summary** comprime as mensagens antigas em recapitulações narrativas curtas, chamadas de entradas de resumo. Cada entrada pode ser escrita pela IA ou por você, e cada uma é ativada ou desativada separadamente. Esse recurso existe apenas nos chats de Roleplay.

Para abrir, clique no botão **Chat Summary** (o ícone é um pergaminho) no cabeçalho do chat de Roleplay. Isso abre a janela **Chat Summary**.

### Criar uma entrada de resumo

1. Em **Summary Scope**, escolha **Last** para resumir as mensagens mais recentes ou **Range** para escolher um intervalo específico de mensagens.
2. Clique em **Generate** para que a IA escreva uma entrada a partir desse escopo.
3. Ou clique em **Write** para criar uma entrada em branco e digitar a recapitulação você mesmo.

Cada entrada da lista mostra um título, o intervalo de origem ou a quantidade de mensagens e um tamanho estimado em tokens. Uma entrada pode ser ativada ou desativada, expandida, alterada com o botão **Edit** ou excluída com **Delete**. Os botões de ação em massa permitem **Show Inactive** ou **Hide Inactive** e ainda **Activate All** ou **Deactivate All** de uma vez.

### Automatic Summaries

O painel **Automatic Summaries** (resumos automáticos) mantém os resumos atualizados enquanto a conversa continua. Ele aparece apenas nos chats de Roleplay.

- Ative o botão liga/desliga **Enabled** dentro do painel **Automatic Summaries**.
- Defina a frequência no campo **Every**, medida em mensagens do usuário. O padrão é 5, e a faixa vai de 1 a 200.
- Clique em **Backfill Summary** para colocar em dia um chat antigo que nunca teve resumos. O processo percorre o chat em lotes e mostra uma barra de progresso enquanto roda. Clique em **Stop** para encerrar antes do fim.

### Modelos de Summary Prompt

O painel **Summary Prompt** controla as instruções que a IA usa para escrever um resumo. Clique em **Edit** para alterar o prompt ativo. Clique em **Templates** para abrir o gerenciador de modelos. Ali, a opção **New template** permite salvar um prompt com nome. Cada modelo salvo tem os próprios controles **Duplicate**, **Edit** e **Delete**.

Os modelos salvos são uma configuração global, válida para o aplicativo inteiro. Editar ou escolher um modelo em um chat de Roleplay muda o prompt de resumo usado em todos os chats de Roleplay.

### Summary Connection e tamanho da saída

O painel **Summary Connection** escolhe qual conexão escreve os resumos. O padrão dele aparece como **Agent default (falls back to chat connection)**. Ou seja, ele usa primeiro a conexão padrão do agente e, em segundo lugar, a conexão do próprio chat.

O campo **Maximum output size** define o tamanho máximo de um resumo gerado. O padrão é 4096 tokens, e a faixa vai de 1 a 32768.

### Opções de exibição

Os controles de **Display** na janela decidem como as mensagens resumidas aparecem na tela:

- **Hide summarised messages**: esconde as mensagens originais assim que um resumo passa a cobri-las. Desativado por padrão.
- **Recent message tail**: mantém esta quantidade de mensagens mais recentes totalmente visível, mesmo com a ocultação ativada. O padrão é 10, e qualquer número inteiro não negativo é aceito. Com o valor 0, todo o lote resumido fica escondido. Valores mais altos aumentam o tamanho do prompt e o custo do modelo.
- **Collapse hidden messages**: controla a aparência das mensagens escondidas na transcrição.

Se o chat exigir aprovação de escrita do agente (uma configuração separada, em Agents), os resumos gerados por IA esperam a sua revisão antes de valer.

## Automatic Summarization (Conversation)

Os chats de Conversation usam outro sistema, a **Automatic Summarization**. Ela fecha cada dia do calendário em um resumo diário e depois junta as semanas concluídas de resumos diários em um resumo semanal. O prompt então envia só os resumos semanais, os resumos diários da semana atual e as mensagens de hoje. Assim cada requisição continua pequena.

Esse recurso funciona sozinho e não pode ser desativado nos chats de Conversation.

### Abrir o editor

1. Abra um chat de Conversation e clique em **Chat Settings**.
2. Localize a seção **Automatic Summarization** (o ícone é um calendário).
3. Clique em **Edit Summaries** para abrir a janela **Automatic Summarization**.

A janela lista primeiro as entradas de semana e depois os dias que ainda não entraram em uma semana. Expanda uma entrada para editar o texto de **Summary** e a lista de **Key Details**, onde você pode acrescentar ou remover linhas.

### Day Rollover Hour e Recent Message Tail

Duas configurações da seção **Automatic Summarization** definem como os dias são separados:

- **Day Rollover Hour**: a hora em que um novo dia começa para os resumos. O padrão é 4 AM, e você pode escolher qualquer hora entre 12 AM (meia-noite) e 11 AM. As mensagens enviadas antes desse horário contam como parte do dia anterior. Escolha um horário em que você nunca está conversando, para uma sessão de madrugada não ser cortada ao meio.
- **Recent Message Tail**: quantas das mensagens mais recentes de hoje continuam palavra por palavra mesmo depois de resumidas. O padrão é 10, e qualquer número inteiro não negativo é aceito. Valores mais altos aumentam o tamanho do prompt e o custo do modelo.

Se você alterar a opção **Day Rollover Hour** depois que já existem resumos, Marinara avisa que os resumos antigos usaram a configuração anterior.

### Preencher os dias que faltam

Às vezes um dia acaba ficando sem resumo, por exemplo depois da importação de um chat antigo. O painel **Missing Summaries** dentro da janela tem um botão **Backfill** que tenta de novo nos dias recentes sem resumo. Ele olha até 14 dias para trás de cada vez.

Trocar a conexão ou o modelo usado nos resumos não reescreve as entradas de dia ou de semana que já existem.

## Solução de problemas

### O Memory Recall não recupera nada

- Verifique se existe uma fonte de embeddings configurada. Se os blocos em **Memories for This Chat** mostram **Embedding unavailable**, configure a seção **Semantic Search (Embeddings)** de uma conexão ou conte com o modelo local embutido. Veja [Como configurar o Local Model](../connections/local-model.md).
- Se os blocos mostram **Waiting for vector**, dê tempo a eles. As impressões digitais são criadas depois das respostas.
- A recuperação só acrescenta lembranças bem relacionadas à sua última mensagem. Se nada parecer relacionado, nada é acrescentado. Isso é normal.
- Se você trocou o modelo de embeddings há pouco tempo, use o ícone de reconstruir em **Memories for This Chat** para os blocos antigos combinarem com o novo modelo.

### Os resumos não são gerados

- Verifique se o chat tem uma conexão de texto funcionando. O Chat Summary usa a **Summary Connection**, e a Automatic Summarization usa a conexão de resumo resolvida. Se nenhuma funcionar, a geração é pulada.
- Se o chat exigir aprovação de escrita do agente, os resumos de IA esperam pela sua aprovação.
- Um resumo que falha é repetido automaticamente depois de um intervalo. Se ele continuar travado, use **Backfill Summary** (Roleplay) ou **Backfill** (Conversation) para tentar de novo manualmente.

## Guias relacionados

- [Como configurar o Local Model](../connections/local-model.md)
- [Conectando a um provedor de IA](../connections/connecting-to-a-provider.md)
- [Conversation Mode: primeiros passos](../conversation/getting-started.md)
- [Roleplay Mode: primeiros passos](../roleplay/getting-started.md)
- [Solução de problemas do Marinara Engine](../TROUBLESHOOTING.md)
