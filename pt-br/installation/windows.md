# Guia de instalação no Windows

Neste guia você aprende a instalar Marinara Engine no Windows. Escolha o instalador de um clique, que é o caminho mais fácil, ou faça a instalação a partir do código-fonte. O guia também traz os requisitos do sistema, os recursos opcionais e como atualizar depois.

## Requisitos do sistema

Marinara Engine roda no seu próprio PC com Windows. Você precisa do seguinte:

- Windows 10 ou Windows 11 (64 bits).
- Alguns gigabytes livres no disco, para o aplicativo e as dependências dele.
- Conexão com a internet durante a instalação, para baixar o código e os pacotes.

Os dois métodos de instalação precisam de duas ferramentas. O instalador consegue buscar as duas para você. No método pelo código-fonte, você mesmo instala:

- **Node.js** versão 24, 25 ou 26. É o Node.js que executa o aplicativo. A versão 24 é a versão LTS recomendada. LTS quer dizer Long Term Support, ou seja, uma versão estável e com suporte longo.
- **Git**. O Git baixa o código e permite que o aplicativo se atualize sozinho depois.

pnpm é o gerenciador de pacotes que instala as partes do aplicativo. Com o instalador ou com o inicializador **start.bat**, não é preciso instalar pnpm por conta própria. Os dois buscam a versão correta do pnpm pelo Corepack, um auxiliar do pnpm que vem junto com o Node.js, ou por um download temporário. Só a instalação manual sem o inicializador exige o comando `pnpm` no sistema. Essa seção inclui a etapa de instalação.

## Método 1: instalador do Windows (recomendado)

O instalador é o jeito mais fácil de começar. Ele verifica se Node.js e Git estão presentes, ajuda a instalar o que estiver faltando, baixa o aplicativo, compila tudo e cria os atalhos.

Siga estes passos:

1. Abra a página de versões do Marinara Engine no navegador.

```text
https://github.com/Pasta-Devs/Marinara-Engine/releases
```

2. Baixe o arquivo do instalador para Windows mais recente dessa página.
3. Execute o instalador e siga as instruções na tela. Se Node.js ou Git estiverem faltando, deixe o instalador cuidar disso.
4. Escolha a pasta de instalação quando o instalador perguntar, ou aceite a pasta padrão.
5. Espere o instalador baixar e compilar o aplicativo. Isso leva alguns minutos.
6. Ao terminar, clique duas vezes no novo atalho da área de trabalho para abrir Marinara Engine.

O navegador abre o aplicativo depois de um instante. Se ele não abrir sozinho, abra o navegador e vá para este endereço:

```text
http://127.0.0.1:7860
```

O instalador prepara uma cópia do aplicativo baseada em Git. Com isso, o aplicativo consegue se atualizar sozinho na próxima vez que você abrir. Veja a seção sobre atualização mais adiante.

Se o antivírus avisar alguma coisa sobre o instalador, é um alarme falso conhecido. O instalador baixa Node.js e Git, e alguns antivírus marcam esse comportamento como suspeito. Só execute o instalador se você baixou o arquivo da página oficial de versões indicada acima.

## Método 2: instalar a partir do código-fonte

Use este método se você prefere rodar os comandos por conta própria, ou se quer a versão de teste (staging).

### Etapa 1: instalar Node.js e Git

1. Baixe o instalador do Node.js no site oficial e execute o arquivo.

```text
https://nodejs.org/en/download
```

2. Baixe o instalador do Git no site oficial e execute o arquivo.

```text
https://git-scm.com/download/win
```

3. Abra uma nova janela do Prompt de Comando. Verifique se o Node.js está na versão 24, 25 ou 26:

```bat
node -v
```

4. Verifique se o Git está instalado:

```bat
git --version
```

Cada comando mostra um número de versão. Se algum comando não for encontrado, feche e abra o Prompt de Comando de novo, ou reinstale a ferramenta que está faltando.

### Etapa 2: baixar o código e abrir o aplicativo

O script inicializador chamado **start.bat** faz a preparação para você. Ele escolhe a versão correta do pnpm, instala as dependências, compila o aplicativo e abre o navegador.

1. Baixe o código com o Git:

```bat
git clone https://github.com/Pasta-Devs/Marinara-Engine.git
```

2. Entre na nova pasta:

```bat
cd Marinara-Engine
```

3. Opcional: mudar para a versão de teste. O download começa na versão estável. Se você prefere a versão de teste (staging), rode este comando antes da primeira abertura. Pule esta etapa se você quer a versão estável. Faça backup dos dados antes de usar as versões de teste.

```bat
git checkout staging
```

Depois dessa troca, o inicializador mantém você na versão de teste a cada atualização.

4. Execute o inicializador:

```bat
start.bat
```

A primeira abertura leva alguns minutos, porque tudo é instalado e compilado. Quando estiver pronto, o navegador abre o aplicativo em `http://127.0.0.1:7860`. Para abrir o aplicativo de novo depois, execute o arquivo **start.bat** na mesma pasta.

Por padrão, o inicializador deixa o aplicativo aberto na rede local, então outros dispositivos da rede conseguem acessar. Veja a seção sobre acesso de outro dispositivo mais adiante.

### Instalação manual sem o inicializador

Se você quer rodar cada comando por conta própria em vez de usar o arquivo **start.bat**, faça o seguinte de dentro da pasta `Marinara-Engine`.

1. Instale pnpm. Este caminho não usa o inicializador, então o comando `pnpm` precisa existir no sistema. O comando `npm` já vem com o Node.js. Rode isto uma vez:

```bat
npm install -g pnpm
```

2. Instale as dependências:

```bat
pnpm install --force
```

3. Compile o aplicativo:

```bat
pnpm build
```

4. Inicie o servidor:

```bat
pnpm start
```

5. Abra o aplicativo no navegador:

```text
http://127.0.0.1:7860
```

Tudo roda no seu próprio computador. Com este método manual, o aplicativo escuta em `127.0.0.1`, ou seja, só este computador consegue acessar. Para liberar o acesso a outros dispositivos da rede, crie um arquivo chamado `.env` na pasta `Marinara-Engine`. Adicione esta linha nele e reinicie o servidor:

```env
HOST=0.0.0.0
```

## Opcional: remoção de plano de fundo dos sprites com IA

Marinara Engine pede transparência nativa para os sprites estáticos gerados (o sprite é a imagem do personagem no palco) e traz uma limpeza adaptativa de recorte para chroma liso e para os planos de fundo brancos mais antigos. Você também pode instalar uma ferramenta opcional chamada `backgroundremover`, como alternativa para cenários detalhados e outros planos de fundo que não são lisos. Ela é opcional porque baixa arquivos grandes de aprendizado de máquina.

Para usar essa ferramenta, primeiro é preciso ter Python. Instale o Python 3.11 pelo site oficial e depois rode o comando de instalação a partir da pasta `Marinara-Engine`:

```text
https://www.python.org/downloads/windows/
```

Execute a etapa de instalação:

```bat
pnpm backgroundremover:install
```

Isso cria uma pasta privada do Python (um venv) dentro da pasta de dados. Marinara Engine passa a usar essa pasta automaticamente na limpeza dos sprites. Um venv é uma instalação isolada do Python, que não mexe no resto do sistema.

Outra opção: deixe o arquivo **start.bat** instalar a ferramenta na próxima abertura. Adicione esta linha ao arquivo `.env`:

```env
BACKGROUNDREMOVER_AUTO_INSTALL=true
```

## Acesso de outro dispositivo

Marinara Engine pode ser aberto no celular, no tablet ou em outro computador da mesma rede. Para ver os passos da configuração e as opções de segurança, consulte o guia [Perguntas frequentes](../FAQ.md).

## Como atualizar Marinara Engine

Os chats, os personagens e as configurações continuam no lugar depois da atualização. Marinara Engine oferece três formas de atualizar no Windows.

### Atualização automática pelo inicializador

Ao abrir o aplicativo pelo atalho da área de trabalho ou pelo arquivo **start.bat**, a partir de uma cópia baseada em Git, o inicializador procura atualizações antes de tudo. Se existir uma versão mais nova, ele baixa as mudanças, reinstala as dependências, compila o aplicativo de novo e só então inicia. Isso funciona tanto nas instalações pelo instalador quanto nas cópias feitas à mão.

Rode `start.bat --skip-update` para pular uma verificação. Para manter a versão instalada do Engine a cada abertura, adicione `AUTO_UPDATE_ENABLED=false` ao arquivo `.env`. A verificação manual, a aplicação dentro do aplicativo e a atualização manual pelo Git continuam disponíveis.

Se você tem mudanças locais não salvas no código, o inicializador tenta guardá-las com segurança. Depois da atualização, ele devolve tudo para o lugar. Se não conseguir, ele mantém a versão atual e mostra um aviso.

### Atualização dentro do aplicativo

Também é possível procurar atualizações dentro do aplicativo.

1. Abra **Settings** (Configurações).
2. Vá para a aba **Advanced**.
3. Encontre a seção **Updates**.
4. Escolha um canal no menu suspenso **Release Channel**. Escolha **Latest Stable** para a versão normal, ou **Staging/UAT** para as versões de teste antecipadas. Faça backup dos dados antes de usar as versões de teste.
5. Clique em **Check for Updates**. O aplicativo avisa se existe uma versão mais nova.

Por segurança, o botão **Apply Update** vem desativado por padrão. Aplicar a atualização de dentro do aplicativo exige uma configuração a mais. No arquivo `.env`, defina os seguintes valores:

```env
UPDATES_APPLY_ENABLED=true
ADMIN_SECRET=your-own-secret-value
```

Depois abra **Settings**, vá para a aba **Advanced**, encontre a seção **Admin Access** e cole ali o mesmo valor secreto. Feito isso, o botão **Apply Update** fica disponível.

Se você abre o aplicativo em um iPhone ou iPad conectado a este PC com Windows, o botão **Apply Update** atualiza este servidor Windows. A aplicação remota também exige mais um valor no arquivo `.env`:

```env
UPDATES_ALLOW_REMOTE_APPLY=true
```

Se você não ativar a aplicação dentro do aplicativo, basta abrir o aplicativo de novo pelo atalho ou pelo arquivo **start.bat** para atualizar.

### Atualização manual

Se você usa uma cópia de Git sem o inicializador, é possível atualizar à mão. Rode estes comandos a partir da pasta `Marinara-Engine`.

1. Busque o código estável mais recente:

```bat
git fetch origin +refs/heads/main:refs/remotes/origin/main
```

2. Vá para a versão estável mais recente:

```bat
git merge --ff-only origin/main || git checkout --detach origin/main
```

3. Reinstale as dependências:

```bat
pnpm install --force
```

4. Compile o aplicativo de novo:

```bat
pnpm build
```

5. Inicie o servidor outra vez:

```bat
pnpm start
```

Para as versões de teste, use a branch staging. Rode estes dois comandos no lugar das etapas 1 e 2 acima. Depois siga com as etapas de instalação e compilação:

```bat
git fetch origin +refs/heads/staging:refs/remotes/origin/staging
```

```bat
git checkout -B staging origin/staging
```

## Se alguma coisa der errado

Se a instalação ou a abertura falhar, verifique primeiro se o Node.js está na versão 24, 25 ou 26 e se o Git está instalado. Se o antivírus bloquear o instalador ou o download, é o alarme falso conhecido citado acima.

Para mais soluções, consulte o guia [Solução de problemas do Marinara Engine](../TROUBLESHOOTING.md).

## Guias relacionados

- [Instalação do Marinara Engine](../INSTALLATION.md): escolha o método de instalação certo para o seu dispositivo.
- [Atualizando Marinara Engine](../UPGRADING.md): mais detalhes sobre como manter o aplicativo em dia.
- [Solução de problemas do Marinara Engine](../TROUBLESHOOTING.md): soluções para os problemas mais comuns.
- [Perguntas frequentes](../FAQ.md): respostas rápidas, inclusive sobre acesso pela rede.
