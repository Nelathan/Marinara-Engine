# Emojis personalizados, stickers e GIFs

Neste guia você aprende a usar as imagens extras de um chat no Conversation Mode: emojis personalizados, stickers personalizados (as figurinhas) e GIFs pesquisados. Ele também mostra como controlar quais emojis e stickers personalizados o personagem pode usar nas respostas.

Esses recursos funcionam só no Conversation Mode. Os modos Roleplay e Game têm apenas o seletor de emojis comum, sem emojis personalizados, sem stickers e sem busca de GIFs.

## Onde encontrar esses recursos

Em um chat no Conversation Mode, olhe a barra de digitação da mensagem. Ali fica um botão redondo com um ícone de carinha sorridente, chamado **Emoji, GIFs & stickers**. Clique nele para abrir um pequeno painel acima da barra de digitação.

O painel tem estas abas:

- **Emoji**: a grade de emojis padrão, mais uma aba com estrela chamada **Custom emojis** para as imagens que você fez upload.
- **GIFs**: busca de GIFs ao vivo.
- **Stickers**: os stickers que você fez upload.

A aba **Tools** também aparece quando outros recursos de digitação estão ativados. No celular, as mesmas abas abrem em uma folha acima do teclado.

## Emojis personalizados

O emoji personalizado é uma imagem pequena que você faz upload uma vez e reutiliza em qualquer chat no Conversation Mode. Na mensagem, ele é escrito como um shortcode, ou seja, o nome do emoji entre dois-pontos, assim: `:kekw:`.

Os emojis personalizados valem para o perfil inteiro. Você faz o upload uma única vez e usa em todo lugar.

### Como fazer upload de um emoji personalizado

1. Abra o painel **Emoji, GIFs & stickers** e vá até a aba **Emoji**.
2. Clique na aba com estrela chamada **Custom emojis** (emojis personalizados).
3. Clique em **Upload** e escolha um ou mais arquivos de imagem.
4. Na janela **Name this emoji**, digite um nome e clique em **Add**.

O novo emoji aparece na grade **Custom emojis**.

Os nomes de emoji seguem regras rígidas. O nome tem de 1 a 32 caracteres. Só valem letras minúsculas, números e sublinhados. Se você digitar espaços ou letras maiúsculas, o aplicativo limpa o nome sozinho. Ele converte as letras para minúsculas e troca os outros caracteres por sublinhados, por exemplo.

A imagem de um emoji personalizado não pode passar de 256 por 256 pixels. O aplicativo confere isso no upload. Cada nome precisa ser único entre todos os seus emojis personalizados. Se você escolher um nome já ocupado, aparece um erro assim: `An emoji named ":name:" already exists.`

Também é possível fazer upload de um arquivo GIF animado como emoji personalizado. Ele roda animado no chat. Isso não tem relação com a aba **GIFs** descrita adiante.

### Como usar um emoji personalizado

Clique em qualquer bloco da grade **Custom emojis** para colocar o shortcode dele na mensagem. Isso não envia a mensagem, apenas insere o texto. Você também pode digitar o shortcode na mão, por exemplo `:kekw:`. Digite o nome em minúsculas, exatamente como foi salvo.

### Renomear, excluir, exportar e importar

Clique em **Edit** no topo da aba **Custom emojis** para ativar o modo de edição.

No modo de edição:

- Clique em um bloco para abrir a janela **Rename emoji** e depois clique em **Rename**.
- Clique no pequeno selo de lixeira do bloco para excluir aquele emoji. A janela **Delete emoji** avisa que as mensagens que já usaram o emoji passam a mostrar o texto puro.
- Clique em **Export** para baixar todos os seus emojis personalizados em um arquivo chamado `marinara-custom-emojis.json`. Esse arquivo traz as imagens dentro dele, então é totalmente portátil.
- Clique em **Import** para importar um arquivo exportado antes. A importação pula os emojis que não passam nas regras de nome ou de tamanho, e também os que colidem com um nome existente.

## Stickers personalizados

O sticker personalizado funciona como o emoji personalizado, mas serve para imagens maiores. O sticker é escrito como `sticker:name:` e sempre aparece como uma imagem grande, em bloco, em uma linha só dele.

Abra a aba **Stickers** no mesmo painel. O upload, a nomeação, a renomeação, a exclusão, a exportação e a importação funcionam igual aos emojis, com estas diferenças:

- A janela de upload se chama **Name this sticker**.
- A imagem de um sticker não pode passar de 512 por 512 pixels.
- Os nomes de sticker são únicos entre todos os seus stickers. Um nome repetido mostra `A sticker named "sticker:name:" already exists.`
- A exportação baixa um arquivo chamado `marinara-custom-stickers.json`.

### Como enviar um sticker

Clique em um bloco de sticker na grade. A janela **Send sticker** pergunta como você quer usar o sticker, com duas opções:

- **Send & reply**: publica o sticker como mensagem própria na hora e deixa o personagem responder.
- **Add to message**: coloca o texto `sticker:name:` na sua mensagem, para você continuar digitando.

## Busca de GIFs (Giphy)

A aba **GIFs** pesquisa no Giphy, uma grande biblioteca de GIFs online. Digite na caixa de busca para achar GIFs ou navegue pela lista de tendências. Clique em um GIF para enviá-lo ao chat.

### A busca de GIFs precisa de uma chave

A busca de GIFs precisa de uma chave de API gratuita do Giphy. A chave de API é um código secreto, parecido com uma senha, que permite a Marinara Engine falar com o serviço do Giphy em seu nome. Sem a chave, a aba **GIFs** mostra um cartão de configuração no lugar dos resultados.

Para configurar a busca de GIFs:

1. Abra o Giphy Developer Dashboard em `https://developers.giphy.com/dashboard/`.
2. Crie uma chave de API gratuita para um aplicativo web.
3. Adicione a chave ao arquivo `.env`. Esse é o arquivo de configurações do servidor do Marinara.

Adicione uma linha assim ao arquivo `.env`:

```
GIPHY_API_KEY=your_key_here
```

Depois de adicionar a chave, reinicie Marinara. A explicação completa do arquivo `.env` está no guia de configuração do servidor, indicado no fim desta página.

### Classificação de conteúdo dos GIFs

Os resultados de GIF usam a classificação de conteúdo adulto do Giphy. Isso é fixo e não muda pelo aplicativo. Os resultados podem incluir GIFs sugestivos ou adultos, então pesquise com isso em mente. Não existe fonte de GIFs offline nem restrita a conteúdo seguro.

## Marcar uma imagem da galeria como emoji ou sticker

Qualquer imagem já salva na galeria de um personagem ou na galeria de uma persona pode virar emoji ou sticker personalizado. A imagem marcada fica restrita àquele personagem ou àquela persona. Ela funciona só nos chats que incluem esse personagem ou essa persona.

Para marcar uma imagem da galeria:

1. Abra o **Character Editor** (editor de personagem) ou o **Persona Editor** (editor de persona).
2. Vá até a aba **Gallery** e abra a sub-aba **Images**.
3. Passe o mouse sobre uma imagem e clique no pequeno botão de tag no canto superior esquerdo.
4. Escolha **Make emoji** ou **Make sticker**.
5. Na janela **Custom Emoji** ou **Custom Sticker**, digite um nome.

O botão de tag muda e passa a mostrar o nome atribuído.

Os mesmos limites de tamanho valem aqui. A opção **Make emoji** aceita até 256 por 256 pixels e a opção **Make sticker** aceita até 512 por 512 pixels. Se a imagem for grande demais para o tipo escolhido, aparece um aviso de erro em vermelho.

Para mudar uma imagem marcada depois, clique de novo no botão de tag dela. O menu oferece **Rename**, uma opção de troca como **Switch to sticker** e uma opção de remoção como **Remove emoji**. A marcação não move nem copia a imagem: ela continua sendo uma imagem normal da galeria.

## Preferências de seleção

Marinara informa ao personagem que vai responder quais dos seus emojis e stickers personalizados ele pode usar na resposta. Esse controle fica em **Selection preferences** (preferências de seleção).

Para abrir o painel, clique no ícone de engrenagem chamado **Selection preferences**. Ele fica no topo da aba **Custom emojis** e no topo da aba **Stickers**. Os dois abrem a mesma configuração. Essa configuração é salva por chat, então cada chat pode ter a sua.

O painel tem uma linha de modo com três opções:

- **Semantic** (o padrão): oferece os emojis e stickers que mais combinam com a conversa recente. O modo Semantic usa um embedder local, ou seja, um pequeno modelo de IA que roda na sua própria máquina. Se ele não estiver disponível, o modo recorre ao aleatório.
- **Random**: oferece um conjunto aleatório a cada resposta.
- **Tool-call**: uma chamada ao modelo escolhe os mais adequados a cada resposta. É preciso escolher uma conexão no menu suspenso que aparece. Se a conexão não estiver definida ou falhar, o modo recorre ao Semantic. Em um turno de chat em grupo com mais de um personagem respondendo, o modo Tool-call é ignorado naquele turno e a seleção recorre ao Semantic.

Abaixo dos modos fica o campo **Max offered (each)**. Ele define quantos nomes de emoji personalizado e quantos nomes de sticker são oferecidos ao personagem a cada turno. O padrão é 20. O valor vai de 1 a 100.

## Como os emojis e stickers personalizados aparecem

Em um chat no Conversation Mode, um shortcode de emoji como `:kekw:` aparece como uma imagem pequena, na mesma linha do texto. Se a mensagem tiver só shortcodes de emoji e mais nada, eles aparecem maiores.

Um sticker como `sticker:wave:` sempre aparece como uma imagem grande, em bloco, em uma linha só dele.

Quando o nome não é encontrado, por exemplo depois de você excluir aquele emoji, a mensagem mostra o texto puro do shortcode, assim: `:kekw:`.

## As reações usam só o conjunto global de emojis

Você pode reagir a uma mensagem com um emoji personalizado. As reações usam só os seus emojis personalizados principais, o conjunto global. Emojis marcados na galeria, stickers e GIFs não ficam disponíveis como reação. As reações de mensagem são explicadas no guia de primeiros passos do Conversation Mode.

## Guias relacionados

- [Conversation Mode: primeiros passos](getting-started.md)
- [Galerias de personagem e de persona](../characters/galleries.md)
- [Referência de configuração do servidor](../CONFIGURATION.md)
