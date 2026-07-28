# Temas de CSS personalizados (Theme Library)

Este guia explica como mudar toda a aparência do Marinara Engine com um tema de CSS personalizado. Aqui você vê como criar, importar, exportar e ativar temas. Também vê quais variáveis de CSS pode alterar e como os temas convivem com o Card CSS.

## O que é um tema personalizado

Um tema personalizado é um bloco de CSS que repinta Marinara. CSS, sigla de Cascading Style Sheets, é o código que define cores, bordas e espaçamentos no aplicativo inteiro. Um tema pode mudar o plano de fundo da página, a cor de destaque, os cards, as bordas, o texto e muito mais.

Os temas personalizados ficam na seção **Theme Library** (biblioteca de temas). Marinara guarda esses temas no servidor, então eles aparecem em todos os dispositivos e navegadores conectados ao mesmo servidor. Isso é diferente da maioria das outras configurações de aparência, que ficam só em um dispositivo. Para as configurações por dispositivo, veja o guia [Configurações de aparência](appearance-settings.md).

Só um tema personalizado fica ativo por vez. Guarde quantos temas quiser na biblioteca e alterne entre eles quando precisar.

## Onde encontrar a Theme Library

1. Abra **Settings** (Configurações).
2. Abra a aba **Addons**.
3. Procure a seção **Theme Library**.

A seção se chama **Theme Library** e traz o texto "Create, import, activate, edit, export, or remove custom CSS themes."

## Criar um tema

1. Na seção **Theme Library**, clique em **Create Theme** (criar tema).
2. Digite um nome no campo **Theme name**.
3. Escreva ou cole o CSS na caixa de texto grande.
4. Deixe a opção **Preview** ativada para ver as mudanças no aplicativo enquanto digita. Desative **Preview** para parar a visualização ao vivo.
5. Clique em **Save**.

Todo tema novo começa a partir de um modelo. Esse modelo lista as variáveis mais comuns como exemplos comentados, então basta remover as marcas de comentário e colocar os seus valores. Ao salvar um tema recém-criado, Marinara já o ativa na hora. E ainda mostra uma confirmação com o nome do tema, mais ou menos assim: Theme "My Theme" saved and activated.

Para mudar um tema depois, encontre-o na lista **Installed Themes** (temas instalados). Clique no ícone de código (a dica dele diz **Edit theme CSS**), faça as edições e clique em **Save**. Editar um tema salvo atualiza o conteúdo dele, mas não muda qual tema está ativo.

## Importar e exportar temas

Os temas podem ser compartilhados como arquivos. Isso ajuda a levar um tema de um servidor para outro ou a passá-lo para um amigo.

Para importar um tema:

1. Clique em **Import File** (importar arquivo) na seção **Theme Library**.
2. Escolha um arquivo `.css` ou um arquivo `.json`.
3. Leia a mensagem de aviso. Ela informa quantos temas foram importados, ignorados ou falharam.

Um arquivo `.css` vira um tema só, com o nome do arquivo. Um arquivo `.json` pode conter um ou vários temas, e existem dois tipos dele.

O primeiro tipo é o arquivo exportado por Marinara. Ele envolve cada tema em campos extras que Marinara acrescenta na exportação. Você não precisa ler nem editar nada. Importe o arquivo do jeito que está.

O segundo tipo é um arquivo pequeno que você mesmo escreve. Para um único tema, isto basta:

```
{ "name": "My Theme", "css": "..." }
```

Os temas importados vão para o servidor, mas não se ativam sozinhos. Se um tema com o mesmo nome e o mesmo CSS já existir no servidor, ele é ignorado em vez de entrar duas vezes.

Para exportar um tema, encontre-o na lista **Installed Themes** e clique no ícone de upload (a dica dele diz **Export theme**). Marinara baixa um arquivo `.json` que pode ser importado em outro lugar.

## Ativar um tema

A lista **Installed Themes** mostra todos os temas, mais um item **Default Theme** no topo.

1. Clique no nome de um tema para ativá-lo. Uma marca de seleção indica o tema ativo.
2. Clique em **Default Theme** para desligar o tema personalizado e voltar à aparência original do Marinara.

O botão **Reset Appearance** (restaurar a aparência) fica no topo da seção **App Style**, em **Settings -> Appearance**. Ao usá-lo, o tema personalizado ativo também é desligado.

Para excluir um tema de vez, clique no ícone de lixeira na linha dele (a dica diz **Remove theme**) e confirme na janela **Delete Theme**. Isso exclui em definitivo o CSS do tema no servidor.

## Referência das variáveis de CSS

O editor de temas tem uma seção retrátil chamada **CSS Variable Reference**. Clique nela para ver as variáveis mais úteis que podem ser substituídas. Um tema muda o aplicativo definindo essas variáveis em um bloco `:root`. A referência lista estas variáveis:

| Variável | O que ela controla |
| --- | --- |
| `--background` | Plano de fundo da página |
| `--foreground` | Texto principal |
| `--primary` | Destaque e botões |
| `--primary-foreground` | Texto sobre a cor primária |
| `--secondary` | Cards e campos |
| `--card` | Plano de fundo do card |
| `--border` | Bordas |
| `--muted-foreground` | Texto esmaecido |
| `--sidebar` | Plano de fundo da barra lateral |
| `--sidebar-border` | Borda da barra lateral |
| `--marinara-shell-edge-border` | Borda esquerda e direita da moldura |
| `--destructive` | Erro e exclusão |
| `--popover` | Plano de fundo do menu suspenso |
| `--accent` | Realce ao passar o mouse |

Essa lista não é um limite. Um tema pode definir qualquer variável de CSS que Marinara usa e ainda acrescentar outros estilos personalizados.

Alguns efeitos visuais têm variáveis próprias. Um tema pode pedir a animação de pulso do destaque, por exemplo, definindo `--marinara-theme-accent-pulse: enabled`.

Por segurança, Marinara limpa o CSS do tema personalizado antes de executá-lo. Estilos que carregam um arquivo de outro site não funcionam. Para usar uma imagem ou uma fonte dentro de um tema, incorpore o conteúdo como URI `data:` em vez de um link da web. Uma URI `data:` guarda o conteúdo do arquivo direto dentro do CSS.

## Limites de tamanho e de nome

O nome do tema aceita até 200 caracteres. O CSS aceita até 256 KiB, medidos em bytes UTF-8, e não em caracteres. Um tema maior que isso é recusado na hora de salvar ou importar.

## Admin Access em instalações remotas

Criar, editar, importar, ativar e excluir um tema são ações protegidas. Isso só importa quando você abre Marinara pela rede.

Se você abre Marinara no mesmo computador que roda o servidor, por loopback (também chamado de localhost), essas ações funcionam sem mais nada. Se você abre Marinara em outro dispositivo, como um celular ou um computador da mesma rede, o servidor precisa antes de um segredo de administrador.

Para gerenciar temas pela rede:

1. No servidor, defina a variável `ADMIN_SECRET` no arquivo `.env`.
2. No aplicativo, abra **Settings -> Advanced -> Admin Access** e informe o mesmo valor.

Sem isso, as mudanças de tema feitas pela rede falham. Para a configuração completa, veja a [Referência de configuração do servidor](../CONFIGURATION.md) e o guia [Acesso remoto](../REMOTE_ACCESS.md).

## Como os temas e o Card CSS funcionam juntos

Marinara tem duas formas de adicionar CSS personalizado. São recursos separados e os dois podem ficar ativos ao mesmo tempo.

Um tema personalizado repinta o aplicativo inteiro. Ele pode substituir as variáveis centrais do Marinara, usar `!important` e usar `position: fixed`. É exatamente para isso que serve um tema.

O Card CSS é outra coisa. Quem cria um personagem ou uma persona pode embutir CSS no card, e você ativa esse CSS por chat. A limpeza do Card CSS é bem mais rígida. Ele não pode substituir as variáveis centrais do aplicativo, o `!important` é removido e `position: fixed` vira `position: absolute`. Ele estiliza as mensagens do chat, não o aplicativo inteiro. Veja o [guia de temas com Card CSS](card-css-theming.md).

Se o aplicativo estiver com a aparência estranha, vale conferir tanto o tema ativo quanto o Card CSS. Qualquer um dos dois pode ser a causa.

## Guias relacionados

- [Guia de temas com Card CSS](card-css-theming.md)
- [Configurações de aparência](appearance-settings.md)
- [Referência de configuração do servidor](../CONFIGURATION.md)
- [Acesso remoto: Basic Auth e lista de IPs permitidos](../REMOTE_ACCESS.md)
