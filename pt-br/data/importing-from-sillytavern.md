# Importando do SillyTavern

Neste guia você aprende a trazer os dados do SillyTavern para o Marinara Engine. Importe um arquivo por vez ou faça uma varredura em uma pasta inteira do SillyTavern e traga tudo de uma só vez.

## O que pode ser trazido

Marinara Engine importa estes tipos de dados do SillyTavern:

- Personagens (cards de personagem)
- Chats (registros de mensagens)
- Chats em grupo (chats com mais de um personagem)
- Presets (configurações de geração)
- Lorebooks (no SillyTavern o nome é "World Info")
- Planos de fundo (imagens de fundo do chat)
- Personas (os perfis de **{{user}}**)

Um lorebook é um conjunto de anotações que a IA lê quando certas palavras aparecem no chat. Um preset é um conjunto salvo de configurações de geração. Uma persona é o perfil que representa você dentro do chat.

Existem duas formas de importar. Para um arquivo só, use os botões de arquivo único. Para mover uma instalação inteira do SillyTavern de uma vez, use o assistente de configuração **Import from SillyTavern Folder** (importar de uma pasta do SillyTavern).

## Importações rápidas de arquivo único

Abra **Settings** (Configurações), depois a aba **Imports** (importações) e localize a seção **SillyTavern Import**. A descrição dela diz "Bring over characters, chats, presets, and lorebooks from SillyTavern files."

Essa seção tem quatro botões de arquivo único. Cada um abre um seletor de arquivos comum, sem opções extras:

- **Import Character (JSON/PNG)** aceita um card de personagem em `.json` ou `.png`.
- **Import Chat (JSONL)** aceita um registro de chat em `.jsonl`. Ele sempre cria um chat de **Roleplay** e leva você direto para lá.
- **Import Preset (JSON)** aceita um arquivo de preset em `.json`.
- **Import Lorebook (JSON)** aceita um arquivo de World Info em `.json`.

JSONL quer dizer um registro JSON por linha. É o formato que o SillyTavern usa para salvar um registro de chat.

Ao importar um personagem cujo card tem um lorebook embutido, o navegador pergunta se você também quer importar esse conteúdo como um lorebook independente dentro do Marinara. Clique em **OK** para manter a World Info como um lorebook próprio, reaproveitável. Clique em **Cancel** para pular essa etapa e importar só o personagem.

Esses botões rápidos usam valores padrão fixos, que não podem ser alterados aqui. Eles mantêm todas as tags de origem e limitam os scripts de regex ao personagem. Um script de regex é uma regra de busca e substituição que altera o texto antes ou depois de a IA vê-lo. Para escolher essas opções você mesmo, use o botão **Import** no painel de personagens. Veja [Importar e exportar cards de personagem](../characters/import-export.md).

### Importar um chat para um modo específico

O botão de arquivo único **Import Chat (JSONL)**, citado acima, sempre cria um chat de **Roleplay**. Para que o chat caia em outro modo, use o botão pequeno de importação no topo da lista de chats. A dica dele diz **Import SillyTavern or Marinara chat JSONL**. Esse botão importa o arquivo para a aba de modo que estiver aberta, como Conversation, Roleplay ou Game. Para saber mais sobre importação e exportação de chats, veja [Exportar e importar chats](../chats/export-import.md).

## Import from SillyTavern Folder

Esse assistente de configuração faz a varredura de uma pasta completa do SillyTavern e importa vários itens de uma vez. Ele lê personagens, chats, chats em grupo, presets, lorebooks, planos de fundo e personas em conjunto.

Para abrir, vá para **Settings**, depois **Imports**, depois a seção **SillyTavern Import**, e clique em **Import from SillyTavern Folder**. Abre-se a janela **Import from SillyTavern**.

### Etapa 1: indique a pasta do SillyTavern

1. No campo **SillyTavern Folder Path**, digite o caminho da pasta do SillyTavern. Um exemplo é `/path/to/SillyTavern`.
2. Ou clique em **Browse** para escolher a pasta pelo seletor de pastas do computador. Em um servidor remoto ou sem interface gráfica, onde não existe seletor de pastas, abre-se no lugar um navegador de pastas dentro do aplicativo, com o botão **Select This Folder**.
3. Aponte para a pasta principal do SillyTavern. A dica na janela avisa que, em geral, é a pasta que contém uma pasta `data/` ou `public/` dentro dela.
4. Clique em **Scan Folder**. Durante o processo, o botão mostra **Scanning...**.

Terminada a varredura, Marinara informa quantos itens encontrou em cada categoria. Se não conseguir ler a pasta, aparece um erro como "Could not find SillyTavern data directory."

### Etapa 2: escolha o que importar

A tela seguinte se chama **Choose exactly what to import**. Ela mostra uma lista de seleção para cada categoria: **Characters**, **Chats**, **Group Chats**, **Presets**, **Lorebooks**, **Backgrounds** e **Personas**. Um contador mostra quantos itens estão selecionados.

Cada categoria tem os botões **All** e **None** e um botão liga/desliga **Show** ou **Hide**, para você ver os itens individuais e as datas deles.

Quase tudo já vem pré-selecionado. A exceção são os presets que já vêm com o SillyTavern. Marinara identifica esses presets e deixa a caixa de seleção desmarcada, e um aviso explica o motivo. São os presets de fábrica, como `default`, `deterministic`, `neutral` e os presets `universal-*`. Deixe todos desmarcados, a não ser que você realmente queira cópias.

Se a varredura encontrar algum personagem, aparecem dois controles extras:

- **Imported character tags** define o modo de importação das tags. Escolha **All tags** para manter as tags de origem, **No tags** para ignorá-las ou **Existing only** para manter só as tags que já existem no Marinara. O padrão é **All tags**.
- **Imported regex scripts** define para onde vão os scripts de regex. Escolha **Character only** para que os scripts valham para cada personagem, ou **Global** para adicioná-los em **Presets -> Regexes** e valerem para todos os chats. O padrão é **Character only**.

Quando a seleção estiver do jeito que você quer, clique em **Import Selected**. Clique em **Back** para voltar à etapa da pasta.

### Etapa 3: acompanhe o progresso

Marinara importa os itens um a um. Você vê um indicador de carregamento, a categoria e o nome do item atual, uma barra de progresso e a contagem parcial de cada categoria.

### Etapa 4: leia o resultado

A última etapa mostra o aviso **Import complete!** quando a importação dá certo, ou um aviso de erro quando falha. Em caso de sucesso, um card de cada categoria mostra a contagem final. Se algum item isolado falhou, uma lista de avisos mostra uma linha por falha, como `Character "Foo": error message`. Clique em **Done** para fechar a janela.

### Como o assistente de configuração trata os dados

- A importação é feita item a item, no melhor esforço. Se um personagem, chat, preset, lorebook, plano de fundo ou persona falhar, Marinara pula o item, registra um aviso e segue com o resto.
- Vários arquivos de chat que pertencem a um mesmo personagem são importados como ramificações de um único chat, e não como chats separados.
- Chats em grupo são sempre importados como chats de **Roleplay**.
- Os itens importados mantêm como data no Marinara a data da última alteração do arquivo de origem. Eles não usam o momento em que você fez a importação.

## Regras de acesso e de pasta

Os botões de importação de arquivo único funcionam para todo mundo, sem configuração extra.

O assistente de configuração **Import from SillyTavern Folder** lê arquivos do disco, então precisa de acesso privilegiado. Na mesma máquina do servidor (loopback), ele funciona sem configuração extra. De outro dispositivo ou navegador, é preciso definir um segredo de administrador no servidor. Depois, salve o mesmo valor em **Settings -> Advanced -> Admin Access**. Veja [Referência de configuração do servidor](../CONFIGURATION.md) para saber como definir o segredo de administrador.

Se o servidor definir a variável `IMPORT_ALLOWED_ROOTS`, Marinara recusa caminhos digitados fora dessas pastas. Os caminhos escolhidos pelo botão **Browse** ou pelo navegador de pastas dentro do aplicativo sempre funcionam, mesmo com essa configuração ativa.

## O que não é transferido

O assistente de configuração de pasta faz a varredura apenas das sete categorias listadas acima. Outros dados do SillyTavern, como as configurações gerais do aplicativo e as respostas rápidas, não são lidos nem importados.

Os presets que já vêm com o SillyTavern ficam desmarcados por padrão, então não são trazidos, a menos que você marque a caixa de seleção.

Marinara pula qualquer item isolado que não consiga converter. Consulte a lista de avisos na última etapa do assistente de configuração para ver exatamente o que ficou de fora.

## Guias relacionados

- [Importar e exportar cards de personagem](../characters/import-export.md)
- [Importar e exportar lorebooks](../lorebooks/import-export.md)
- [Exportar e importar chats](../chats/export-import.md)
- [Scripts de regex](../extending/regex-scripts.md)
