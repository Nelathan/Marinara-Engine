# Importar e exportar lorebooks

Neste guia você aprende a trazer lorebooks para Marinara Engine e a salvá-los como arquivos. Aqui você vê como lidar com um arquivo, com vários de uma vez e com os dois formatos de exportação. Um lorebook é um conjunto de anotações acionadas por palavras-chave, que Marinara acrescenta ao prompt (o texto que Marinara envia para a IA) quando uma palavra correspondente aparece. Em outras ferramentas de roleplay, esse recurso se chama **World Info**.

## O que você pode importar

Marinara lê dois tipos de arquivo de lorebook e reconhece sozinha qual deles você forneceu:

- Um lorebook exportado da própria Marinara. Esse formato preserva todos os campos e todas as pastas.
- Um arquivo **World Info** de outra ferramenta. Entram aqui os arquivos World Info do SillyTavern e o formato "character-book" do card de personagem V2. Marinara converte os campos da outra ferramenta para os seus próprios.

Os dois tipos são arquivos `.json` comuns. Para importar um lorebook, você não precisa de conta nem de chave de API (um código secreto, parecido com uma senha).

## Importar um lorebook

Siga estes passos para importar um arquivo de lorebook:

1. Abra o painel **Lorebooks** no lado esquerdo do aplicativo.
2. Clique no ícone de seta para baixo na linha de ações do topo. A dica (o texto que aparece ao passar o mouse) diz **Import** (importar). Ele fica entre o ícone de mais (**New**) e o ícone de visto (**Select**). Esses três botões mostram só o ícone, então passe o mouse por cima para ver os nomes.
3. A janela **Import Lorebook** se abre. Você deve ver uma caixa com o texto **Drop one or more lorebook files here or click to browse**.
4. Arraste o arquivo `.json` para a caixa ou clique nela para escolher um arquivo.
5. Espere o resultado. Cada arquivo mostra um visto verde com **Imported lorebook** ou uma marca vermelha com uma mensagem de erro.
6. Clique em **Close**. O novo lorebook já aparece na lista do painel **Lorebooks**.

Marinara mantém a data original do arquivo importado como data de criação do lorebook, e não o momento da importação.

## Importar vários lorebooks de uma vez (importação em lote)

A janela **Import Lorebook** aceita mais de um arquivo na mesma operação.

1. Abra o painel **Lorebooks** e clique no ícone de seta para baixo. A dica diz **Import**.
2. Arraste vários arquivos `.json` para a caixa ao mesmo tempo, ou clique nela e selecione vários arquivos.
3. Marinara importa um arquivo depois do outro e mostra uma linha de resultado para cada um. Uma linha de resumo informa quantos deram certo e quantos falharam.

No mesmo lote você pode misturar arquivos da Marinara com arquivos **World Info**. Marinara analisa cada arquivo separadamente.

## Exportar um lorebook

A exportação salva um lorebook em um arquivo no seu dispositivo. É assim que você compartilha um lorebook ou o leva para outra instalação.

1. No painel **Lorebooks**, clique em um lorebook para abrir o editor dele.
2. Clique no ícone de exportar no cabeçalho do editor. A dica diz **Export lorebook**.
3. A janela **Export Lorebook** se abre com duas opções. Escolha uma:
   - **Marinara Native** preserva as pastas da Marinara e todos os campos das entradas. Use essa opção para levar um lorebook a outra instalação da Marinara sem perder nada. O nome do arquivo termina em `.marinara.json`.
   - **Compatible JSON** salva um arquivo **World Info** sem pastas, para outras ferramentas de roleplay. Alguns detalhes exclusivos da Marinara são descartados. O nome do arquivo termina em `.json`.
4. O navegador baixa o arquivo.

Escolha **Marinara Native** quando o arquivo for para Marinara. Escolha **Compatible JSON** quando o arquivo for para outra ferramenta.

## Exportar vários lorebooks de uma vez (exportação em lote)

Vários lorebooks podem ser salvos em um único arquivo zip.

1. No painel **Lorebooks**, clique no ícone de visto na linha de ações do topo. A dica diz **Select** (selecionar).
2. Marque a caixa de seleção de cada lorebook que você quer exportar.
3. Clique em **Export** na barra de seleção, na parte de baixo.
4. O navegador baixa um único zip chamado `marinara-lorebooks.zip`.

A exportação em lote sempre usa o formato **Marinara Native**, então o arquivo volta para Marinara sem perder nada.

## Importar uma pasta inteira do SillyTavern

Os passos acima importam arquivos de lorebook que você já tem. Também é possível puxar os lorebooks direto de uma pasta completa de instalação do SillyTavern. Esse caminho traz personagens, chats e presets ao mesmo tempo. Ele usa um assistente de configuração de importação de pasta separado. Veja [Importando do SillyTavern](../data/importing-from-sillytavern.md).

## Depois da importação

Um lorebook importado já funciona de imediato com os gatilhos por palavra-chave. Se você usa a busca semântica, que encontra entradas pelo sentido, os vetores dela precisam ser gerados de novo após a importação. Veja [Busca semântica para lorebooks](semantic-search.md).

## Guias relacionados

- [Visão geral dos lorebooks](overview.md)
- [Vincular lorebooks a personagens e personas](linking-to-characters.md)
- [Busca semântica para lorebooks](semantic-search.md)
- [Importando do SillyTavern](../data/importing-from-sillytavern.md)
