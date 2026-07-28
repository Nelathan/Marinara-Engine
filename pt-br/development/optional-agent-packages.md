# Pacotes opcionais de agentes e capacidades

Status: implementado no ciclo de desenvolvimento da v2.3.0, na issue #3612.

## Objetivo

A distribuição base do Marinara Engine não pode compilar nem incluir implementações opcionais de agentes e capacidades. Uma instalação nova começa sem nenhum pacote opcional. As atualizações preservam as capacidades que já existiam antes deste sistema de pacotes.

O catálogo oficial, o código dos pacotes, os artefatos reproduzíveis, os scripts de validação e o fluxo de contribuição ficam em [Pasta-Devs/Marinara-Agents](https://github.com/Pasta-Devs/Marinara-Agents). Os artefatos instalados ficam dentro da pasta de dados configurada do Marinara, para que uma atualização do aplicativo não sobrescreva nada.

## Modelo de pacote

Um pacote de agente pode entregar um ou mais agentes declarativos e, opcionalmente, capacidades executáveis confiáveis:

- pontos de entrada no servidor para rotas, hooks de ciclo de vida, provedores de prompt, tratadores de resultado e migrações de armazenamento;
- pontos de entrada no cliente para painéis, superfícies de chat, seções de configuração, escolhas de instalação e telas em tempo de execução;
- esquemas JSON compartilhados e contratos de comunicação estáveis;
- recursos, documentação e fragmentos de conhecimento da Professor Mari pertencentes ao pacote.

Cada pacote é feito para uma versão específica da API de capacidades do Marinara. Nenhum pacote pode importar caminhos internos do código do Engine.

Os elementos de capacidade do cliente recebem o idioma de interface escolhido no Engine pelos atributos `lang` e `dir` e pelo
objeto `capabilityProps.localization`. As interfaces do pacote mantêm os próprios arquivos de idioma e recorrem ao inglês
do pacote quando falta uma tradução; o Engine não traduz os prompts do pacote nem os valores de máquina definidos por ele. A troca de idioma reaproveita
o evento `marinara-capability-props` que já existe, então a interface instalada é redesenhada sem reiniciar o Engine.

A API de capacidades 1.1 acrescenta uma fachada genérica de tempo de execução ao contexto
de ativação do servidor. O pacote consegue ler o estado efetivo de depuração do agente e
escrever pelo logger Pino do Engine, inclusive forçando o modo de depuração, sem importar
os módulos internos de logger e de configuração de execução. A fachada expõe operações,
não os objetos internos do Engine.

A API de capacidades 1.2 acrescenta operações de chat e mensagem com escopo de transação,
escritas restritas de metadados do chat, leituras de existência de entradas de lorebook e o
armazenamento de compatibilidade de snapshots espaciais. O pacote consegue validar mudanças de
domínio dentro de uma transação do Engine e salvar os metadados de forma atômica junto com a
mensagem de origem, o swipe ou o snapshot espacial, sem receber uma conexão de banco de dados
nem um objeto de tabela. O Engine continua responsável pelo rollback e pela compatibilidade com o
armazenamento histórico; o pacote continua responsável pela validação e pelas regras de domínio.
Essa mesma API expõe registros normalizados de chat e de personagem, a seleção de
entradas de lorebook elegíveis, a leitura de respostas em formato JSON ou parecido e chamadas resolvidas ao modelo de linguagem.
As credenciais de conexão, as implementações de provedor, as conexões de banco de dados e os objetos de armazenamento continuam internos ao Engine.

## Pacotes iniciais

- todos os agentes hoje embutidos;
- mapas espaciais hierárquicos para Roleplay e Game;
- chamadas de áudio e vídeo no Conversation Mode;
- UNO;
- Chess;
- Poker;
- 8-Ball Pool;
- Tic-Tac-Toe;
- Rock-Paper-Scissors.

A base guarda o gerenciador de pacotes, o cliente do catálogo, os contratos genéricos do pipeline de agentes, os contratos genéricos de hospedagem de jogos por turno e as interfaces de hospedagem inertes. As implementações concretas pertencem aos pacotes.

## Confiança e instalação

O catálogo oficial é um documento JSON versionado e validado por esquema, obtido por HTTPS. Cada entrada de versão traz URLs de artefato imutáveis, digests SHA-256, tamanho em bytes, compatibilidade com o Engine, permissões e a informação de que o tempo de execução exige ou não reiniciar.

Quando o servidor inicia e há pelo menos um pacote oficial instalado, o host busca o catálogo uma vez, seleciona apenas as versões mais novas compatíveis com o Engine e com a API de capacidades em uso, verifica cada uma pelo fluxo normal de instalação e as instala antes de os pacotes entrarem em execução. Uma falha afeta só o pacote em que aconteceu. Os arquivos existentes e o estado do registro continuam utilizáveis se o catálogo estiver fora do ar ou se a verificação falhar, e falhas de prontidão do servidor usam o caminho de rollback para a versão anterior.

O instalador precisa:

1. exigir acesso privilegiado por loopback ou de administrador;
2. impor HTTPS, limites de download e tempo limite;
3. verificar a confiança do catálogo e o SHA-256 do artefato antes de extrair;
4. rejeitar caminhos absolutos, travessia de caminho, links, arquivos de dispositivo e arquivos não declarados;
5. validar o manifesto e a compatibilidade com o Engine;
6. extrair em uma pasta temporária vizinha;
7. ativar de forma atômica só depois que a validação passar;
8. manter a versão anterior até que o novo tempo de execução inicie sem erro;
9. desfazer a ativação em caso de falha;
10. nunca executar scripts de instalação, atualização ou desinstalação.

O catálogo oficial só habilita pacotes executáveis confiáveis produzidos pelo próprio projeto. Um fluxo futuro para pacotes de terceiros exige um modelo de confiança separado e explícito.

## Execução e comportamento de reinício

O servidor é dono do registro de pacotes instalados e informa aos clientes quais capacidades estão disponíveis. Os módulos declarativos e recarregáveis entram em uso na hora. A interface invalida as consultas de catálogo, de agentes, de capacidades de modo e do chat ativo depois da ativação.

O manifesto só pode declarar `restartRequired` quando o host não consegue recarregar aquele ponto de entrada com segurança. A ativação a quente bem-sucedida mostra `Agent installed. It is ready to use.` A ativação que exige reinício mostra `Agent installed. Restart Marinara Engine to finish setup.`

Os pacotes de jogo por turno são recarregáveis a quente: a instalação registra na hora o motor no servidor e o lançador manual por comando de barra, e a desinstalação desconecta o tempo de execução sem reiniciar o Engine. As configurações de Conversation Commands de cada chat controlam apenas se os personagens podem emitir o comando oculto do pacote; elas não bloqueiam o lançador por comando de barra do usuário. Os manifestos oficiais de jogo por turno ainda trazem a marca conservadora de reinício, herdada, por compatibilidade com o Engine 2.x; o Engine 3.x reconhece o tipo `turn-game`, faz a ativação a quente com segurança e devolve o pacote como ativo e pronto.

## Migração de compatibilidade

Na primeira vez que o aplicativo abre depois da atualização:

- os agentes personalizados ficam intactos;
- todo agente embutido antigo visível naquela instalação é registrado como instalado;
- os mapas, as chamadas do Conversation Mode e os jogos do Conversation Mode continuam disponíveis como antes;
- a configuração de cada chat, os snapshots, o estado do jogo, o histórico de chamadas e a memória dos agentes continuam onde estavam;
- a migração é idempotente e só registra sua conclusão depois que todas as entradas de disponibilidade antigas estão gravadas em disco.

Os artefatos dos pacotes antigos continuam no catálogo oficial como origem para a migração. Uma instalação nova não exibe nem ativa esses pacotes até o usuário instalá-los.

## Desinstalação

A desinstalação tira o pacote das seleções dos chats ativos, exclui a configuração do agente e os arquivos executáveis baixados, e desconecta o tempo de execução no próximo reinício, quando necessário. Os chats antigos, as mensagens, os snapshots de mapa, os resumos de chamadas e os registros de partidas concluídas continuam legíveis, então remover um pacote nunca destrói o trabalho do usuário. A remoção destrutiva dos dados históricos é uma ação separada e explícita do usuário.

Toda desinstalação pede confirmação. Os chats afetados voltam às telas comuns da base, sem corromper o histórico.

## Interface do catálogo

O painel **Agents** (agentes) tem um controle `Download Agents` equivalente ao `Download Cards` do painel **Card Browser** (navegador de cards). Ele abre uma biblioteca responsiva em tela cheia com busca, tipos de pacote, informações de compatibilidade, estado de instalação e atualização, permissões, espaço ocupado, documentação e controles de desinstalação.

No computador, aparece uma lista de navegação com uma área de detalhes ao lado. No celular, aparece um painel só, com navegação explícita para voltar e ações grandes o bastante para o toque. Os estados de lista vazia, sem conexão, incompatível, download corrompido, instalação interrompida, atualização, rollback e reinício necessário são tratados como estados de primeira classe.

## Critério de extração

Uma extração só está completa quando os bundles de produção do cliente e do servidor da base não contêm mais a implementação do pacote, quando uma instalação nova não consegue ativá-lo sem baixar o pacote, quando uma instalação atualizada continua com ele e quando instalar, atualizar e desinstalar o pacote funciona em computador, celular e sistemas de arquivos compatíveis com Termux.
