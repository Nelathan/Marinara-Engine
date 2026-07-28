# Hierarchical Maps e contexto espacial V3

Status: proposta, pronta para implementação depois da aprovação do mantenedor

Público: produto, design e quem contribui com Marinara Engine

Substitui: `hierarchical-locations-prd-v2.md`

## Limite de arquitetura

Este plano trata a orientação espacial como um recurso de produto bem delimitado, com uma fronteira de estado estreita.

O recurso é um sistema de mapa hierárquico e orientação espacial, não um motor genérico de cenários no estilo Voxta. Ele pega emprestado um padrão útil do Voxta: um estado persistente seleciona um contexto de prompt pequeno e relevante. De início, ele não acrescenta flags, variáveis, eventos, scripts, temporizadores nem um modelo separado de inferência de ações.

Os modos proprietários compatíveis são Roleplay e Game. O valor legado `visual_novel` do enum é resíduo de compatibilidade e não é um modo de produto com suporte.

O plano tem cinco camadas bem definidas:

| Camada | Responsabilidade | Exemplo |
| --- | --- | --- |
| Definição do mapa | Verdade espacial estável | A Biblioteca fica dentro da Torre do Mago |
| Estado de execução | O local atual da cena | A cena está agora na Biblioteca |
| Projeção do prompt | Orientação delimitada para o modelo | Trilha de navegação, memória atual, saídas alcançáveis |
| Identidade visual | Referências de arte opcionais, específicas do lugar | A Biblioteca mantém seus arcos, janelas e materiais em todas as cenas |
| Transição | Mudança de estado validada | Ir da Biblioteca para o Observatório |

A máquina de estados é propositalmente pequena:

```text
current location + requested destination + definition revision
                              ↓
                  validate ownership and reachability
                       ↙ accepted       rejected ↘
              persist snapshot         preserve state
```

A movimentação manual entra primeiro. Depois, uma ferramenta restrita do modelo, como `change_location({ destinationId })`, pode pedir a mesma transição. Quem valida e aplica é o servidor, não o modelo. Uma chamada separada de inferência de ações fica adiada, a menos que evidências futuras mostrem que ela é necessária.

## Resumo

O plano acrescenta um recurso de Mapa Hierárquico compartilhado por Roleplay e Game. Ele oferece uma hierarquia de locais definida pelo autor, um local focal com autoridade única, um contexto de prompt delimitado sobre o local atual e movimentação validada no servidor.

Os lorebooks continuam sendo a fonte canônica de fatos reutilizáveis do mundo. A hierarquia pode referenciar entradas existentes de lorebook por ID estável, de modo que o local ativo selecione o lore relevante sem copiar nem reescrever nada. O rascunho de mapa feito por IA pode usar lorebooks explicitamente selecionados como material de origem embasado, e precisa distinguir os locais apoiados na fonte daqueles que foram inferidos ou inventados.

Um local também pode ter um kit opcional de identidade visual: uma âncora visual curta mais referências estáveis a imagens da galeria do perfil. O local continua sendo uma entidade espacial, não uma imagem. O perfil de estilo de imagem do chat controla o estilo geral de renderização, as referências de local preservam o lugar, e as referências de personagem ou persona preservam as pessoas que estão nele.

A Conversation conectada pode, mais adiante, ler uma projeção segura do local da história vinculada, mas nunca é dona do estado espacial nem o altera.

```text
authoritative hierarchy + current location
                    ↓
resolve breadcrumb, context, and valid destinations
                    ↓
build the mode-specific prompt
                    ↓
commit a validated move with the next owner turn
                    ↺
```

Isto não é um motor genérico de cenários. Não acrescenta flags, eventos, JavaScript de autor nem busca de caminhos. Acrescenta, sim, um navegador de mapas visual e aninhado, com apresentações em mapa, em camadas e em lista.

## Decisões de produto

Estas decisões resolvem as questões em aberto da V2:

1. A definição da hierarquia e o local atual ficam armazenados separadamente.
2. O local atual entra em um snapshot junto com o estado confirmado de mensagem e swipe, de modo que ramificações, regeneração e checkpoints restaurem a posição correta.
3. A movimentação manual é confirmada de forma atômica com o próximo turno do usuário no modo proprietário, antes da geração do prompt.
4. O Contexto Espacial tem autoridade quando está ativado. O local em texto livre legado do Game não pode virar uma segunda fonte da verdade.
5. Roleplay e Game usam um único contrato de projeção espacial compartilhado, com adaptadores de prompt finos e específicos de cada modo.
6. O campo `awarenessSummary` é escrito pelo autor. Quando ele não existe, a Conversation recebe apenas um trecho delimitado da descrição pública.
7. A Conversation usa uma redação em nível de cena, a menos que dados de presença com autoridade provem que o personagem conectado está presente.
8. Links diretos e o posicionamento visual dos filhos entram no MVP.
9. As grades e os mapas de nós existentes do Game podem ser vinculados explicitamente aos locais da hierarquia; nomes nunca são casados automaticamente.
10. Os lorebooks são donos dos fatos canônicos e reutilizáveis do mundo; o mapa é dono da identidade espacial, da contenção, da navegação e do estado do local atual. Os locais do mapa referenciam entradas de lorebook por ID estável e nunca copiam o conteúdo delas.
11. O anexo de um local é uma fonte de ativação explícita, com escopo de chat. Enquanto aquele local exato for o atual, suas entradas ativadas podem ser acionadas sem casar palavra-chave, mas livros e entradas desativados ou excluídos explicitamente continuam desativados.
12. O rascunho de mapa embasado em lorebook segue a interface de execução do modo proprietário e vem antes da Conversation conectada. Quando lorebooks de origem são selecionados, o rascunho precisa mostrar quais locais são apoiados na fonte, inferidos ou inventados, em vez de apresentar geografia sem respaldo como cânone.
13. Um local nunca é substituído por uma imagem. Ele pode referenciar recursos opcionais de identidade visual por ID estável de imagem, com uma referência principal de ambientação e referências de apoio delimitadas.
14. As referências visuais de local alimentam apenas os caminhos elegíveis de geração de imagens. A geração de texto, a ativação de lore e a Conversation conectada nunca recebem bytes de imagem nem notas exclusivas de imagem.
15. O storyboard é um consumidor a jusante do mesmo resolvedor visual. Cada storyboard congela um manifesto de referências ancorado em mensagem e swipe, de modo que uma regeneração posterior não adote silenciosamente arte mais nova de local ou de personagem.
16. A movimentação pedida pelo modelo continua sendo uma fase posterior.

## Escopo

| Modo | É dono da hierarquia | Move o local focal | Projeção da história | Projeção conectada |
| --- | ---: | ---: | ---: | ---: |
| Roleplay | Sim | Sim | Sim | N/A |
| Game | Sim | Sim | Sim | N/A |
| Conversation | Não | Não | Não | Fase posterior, somente leitura |

## Experiência do usuário

### Criação

A seção **Chat Settings** (configurações do chat) mostra uma seção compacta de Contexto Espacial com:

- Estado de ativação
- Trilha de navegação atual
- Contagem de locais e de avisos
- Ação de abrir o Editor de Locais

O editor é um espaço de trabalho de mapa carregado sob demanda, não um formulário estreito de configurações:

- No desktop há um painel de hierarquia, uma visão de mapa local ou de camadas e um painel de detalhes do local.
- No celular aparece um painel por vez, com navegação clara para voltar.
- A validação aparece ao lado do campo ou do nó afetado.
- O estado de salvamento e os conflitos de revisão ficam sempre visíveis.
- Arquivar é a ação principal de remoção; a exclusão definitiva é restrita.
- A seleção mostra uma prévia do local. Uma ação **Enter** separada leva até ele, então o clique nunca significa ao mesmo tempo inspecionar, editar e mover.
- Cada elemento pai apresenta os filhos como um mapa posicionado, camadas ordenadas ou uma lista acessível.
- Duplicar uma subárvore atende ao reaproveitamento pelo criador sem exigir modelos entre chats no MVP.
- Cada local tem uma seção progressiva `Linked lore`, que busca entradas de lorebook existentes, mostra referências desativadas ou ausentes e oferece Open entry e Detach sem copiar nem excluir conteúdo de lore.
- Cada local tem uma seção progressiva `Visual identity` com uma imagem principal, referências de apoio, notas de uso e ações explícitas de galeria, upload ou geração. As imagens nunca substituem o nome do local, o ícone ou o rótulo acessível de navegação.

### Rascunho embasado em lorebook

O construtor de mapas por IA oferece embasamento em lorebook quando o chat proprietário tem lorebooks selecionados ou ativos. O embasamento é explícito e inspecionável, não uma varredura comum de palavras-chave.

- A configuração do Game usa como fontes padrão do mapa os lorebooks selecionados na etapa **Lorebooks**.
- O Roleplay usa como padrão os lorebooks ativos do chat aberto e deixa o criador mudar a seleção de fontes dentro do construtor de mapas.
- O modo `Strict canon` cria cada nó nomeado a partir de pelo menos uma entrada de lore selecionada. Ele preserva várias raízes com fonte em vez de inventar lugares de ligação sem respaldo.
- O modo `Canon with expansion` preserva os nomes e as relações com fonte e ainda permite locais inferidos ou inventados, claramente rotulados, para preencher lacunas práticas.
- O modo `Setup only` preserva o comportamento atual e usa o contexto de configuração, visão geral do mundo, arco da história, cenário e personagens, sem embasamento em lorebook.
- Quando há lorebooks selecionados, `Canon with expansion` é o padrão mais acessível. O construtor mantém `Strict canon` a um controle de distância para criadores que trabalham muito com lorebooks.

Cada nó gerado na prévia do rascunho mostra `Lore-backed`, `Inferred` ou `Added by AI`. Os nós apoiados em lore listam suas entradas de origem e oferecem Open entry. O rótulo prova que existe uma referência de fonte válida, não que o modelo interpretou a prosa perfeitamente, então a revisão do criador continua sendo a autoridade semântica. Apply muda apenas a cópia de trabalho local, e Save continua sendo o limite de persistência.

### Identidade visual do local e arte de referência

As imagens de local devem melhorar a consistência das cenas sem transformar a hierarquia em uma galeria nem em mais uma fonte de verdade espacial.

- O criador pode fazer upload de uma imagem, escolher uma imagem existente na galeria do perfil, promover uma cena gerada ou gerar uma referência de ambientação a partir da trilha de navegação do local, da descrição pública, da âncora visual, do lore vinculado e do perfil de estilo de imagem selecionado.
- Anexar uma imagem da galeria do chat, um plano de fundo gerado no Game ou outra fonte temporária cria antes um recurso durável na galeria do perfil. O mapa guarda o ID estável da imagem na galeria, nunca um caminho de arquivo, uma URL externa ou uma carga base64.
- Uma imagem `identity` pode ser a principal. As imagens de apoio podem descrever um detalhe marcante, uma vista alternativa, um leiaute ou uma pista de estilo artístico herdável.
- As referências `layout` continuam sendo auxílios do editor, a não ser que um pedido específico de plano de fundo ou de planta baixa peça por elas. Elas não são enviadas automaticamente para a ilustração comum de cena, porque podem distorcer a composição.
- Só as referências `style` podem optar por herança para os descendentes. As imagens de identidade e de detalhe valem para o local exato, então o horizonte de uma cidade não vira silenciosamente a identidade visual de cada cômodo dentro dela.
- A arte de cena gerada nunca vira cânone automaticamente. `Set as location reference` é uma ação explícita de revisão, o que evita que gerações repetidas amplifiquem detalhes acidentais ou desvios de estilo.
- O inspetor do local selecionado mostra a imagem principal e os papéis de referência. As visões densas de hierarquia e de mapa continuam priorizando o nome; elas podem mostrar uma miniatura pequena quando há espaço, mas a navegação nunca depende de reconhecer imagens.
- A prévia de geração de imagens nomeia cada referência resolvida de local e de personagem, o papel de cada uma e qualquer referência omitida por limites do provedor. Ela nunca registra nem exibe base64 bruto nos diagnósticos.

A pilha de consistência pretendida é:

```text
chat image style profile  -> shared rendering language
current location refs     -> stable architecture and place identity
character/persona refs    -> stable people and appearance
scene prompt              -> current action, framing, weather, and lighting
```

A arte de referência é evidência visual, não lore automático. Acrescentar uma imagem nunca cria locais, muda a contenção nem escreve fatos de lorebook. A inferência de imagem para mapa continua sendo um fluxo futuro, revisado à parte.

### Continuidade de referências no Storyboard

O Storyboard deve consumir as identidades visuais já revisadas do turno concluído do GM sem tornar o recurso espacial dependente do Storyboard.

- A galeria do perfil e as galerias de entidades formam um banco de referências que pode conter várias imagens revisadas de um local, personagem ou persona. Um quadro-chave gerado recebe apenas uma carga de referências do tamanho aceito pelo provedor, escolhida dentro desse banco.
- Criar um storyboard resolve o snapshot espacial exato da mensagem e do swipe de origem. O local mais recente do chat nunca substitui o de um turno anterior.
- O storyboard congela o local resolvido, os IDs de imagem candidatos em ordem, as seleções por quadro-chave, as omissões e a capacidade do provedor em um manifesto de referências visuais. A regeneração reaproveita esse manifesto até o criador escolher `Refresh references` explicitamente.
- O mesmo candidato principal de local fica disponível para todos os quadros-chave. Os candidatos de personagem e persona variam conforme a lista de personagens visíveis do quadro, então quem está fora de cena não ocupa slots de referência.
- A primeira versão seleciona automaticamente uma imagem principal por entidade retratada e, no máximo, uma imagem de apoio do local. Bancos mais ricos continuam úteis para a seleção manual e para casamentos futuros de ângulo, roupa, expressão ou detalhe conforme o enquadramento, mas Marinara não envia todas as imagens guardadas em cada quadro.
- Se sobrar apenas um slot automático, um quadro-chave com personagens visíveis escolhe o personagem visível principal; um quadro-chave de ambientação sem personagens visíveis escolhe o local principal. Com dois ou mais slots, o local principal é escolhido antes de referências adicionais de personagens visíveis.
- Um provedor com mais capacidade não acrescenta referências silenciosamente a um storyboard existente. Um provedor com menos capacidade gera um conflito `Review references` embutido em vez de mudar a carga congelada sem avisar.
- Cada prévia de quadro-chave tem uma divulgação progressiva `Visual sources`, que lista o local resolvido, os personagens selecionados, os papéis das imagens, a ordenação e os motivos de omissão. `Refresh references` fica disponível ali, sem acrescentar um gerenciador de recursos separado no Storyboard nem uma janela bloqueante.
- Os quadros-chave gerados nunca viram referências de personagem ou de local automaticamente. As ações explícitas de promoção que já existem continuam sendo o único limite de persistência.

### Movimentação em tempo de execução

As telas de chat dos modos proprietários mostram:

- A trilha de navegação atual persistida
- Um seletor de destinos válidos
- O destino pendente, claramente identificado

Escolher um destino não muda na hora o estado com autoridade. Enviar a próxima mensagem submete o ID do destino e a revisão esperada separadamente do texto visível da mensagem. O servidor confirma a movimentação antes de montar o prompt de resposta.

Se a validação falhar, mensagem e movimentação não ficam parcialmente confirmadas. O cliente mantém o rascunho e explica o conflito.

## Modelo de dados

As definições ficam nos metadados do chat. A posição em tempo de execução fica no histórico de snapshots.

```ts
export type SpatialOwnerMode = "roleplay" | "game";

export type LocationVisualReferenceRole = "identity" | "detail" | "layout" | "style";

export interface LocationVisualReference {
  imageId: string;
  role: LocationVisualReferenceRole;
  primary?: boolean;
  usageNote?: string;
  inheritToDescendants?: boolean;
  sortOrder: number;
}

export interface ChatLocation {
  id: string;
  name: string;
  parentId: string | null;
  description: string;
  kind: "region" | "settlement" | "place" | "building" | "floor" | "room";
  modelMemory?: string;
  icon?: string;
  childPresentation: "map" | "layers" | "list";
  placement?: { x: number; y: number };
  layerOrder?: number;
  awarenessSummary?: string;
  visualIdentity?: string;
  visualReferences: LocationVisualReference[];
  lorebookEntryIds: string[];
  links: ChatLocationLink[];
  status: "active" | "archived";
  sortOrder: number;
}

export interface ChatLocationLink {
  targetId: string;
  label?: string;
  bidirectional: boolean;
  state: "available" | "hidden" | "blocked";
}

export interface SpatialContextDefinition {
  schemaVersion: 1;
  ownerMode: SpatialOwnerMode;
  enabled: boolean;
  locations: ChatLocation[];
  startingLocationId: string | null;
  revision: number;
}

export interface SpatialContextSnapshot {
  id: string;
  chatId: string;
  messageId: string;
  swipeIndex: number;
  currentLocationId: string | null;
  definitionRevision: number;
  createdAt: string;
}

export interface PendingSpatialTransition {
  destinationId: string;
  expectedDefinitionRevision: number;
  expectedCurrentLocationId: string | null;
  commandId: string;
}
```

Não guarde `ownerChatId` dentro de `SpatialContextDefinition`; o chat que contém a definição é o dono dela. IDs opacos e estáveis sobrevivem a renomeações e a mudanças de pai.

O primeiro MVP do modo proprietário trata um campo `lorebookEntryIds` ou `visualReferences` ausente como um array vazio, então pacotes futuros podem estender a versão 1 do schema sem reescrever de imediato as definições existentes. As referências de entrada e de imagem são apenas IDs estáveis. Nomes de lorebook, nomes de entrada, chaves, conteúdo, caminhos de imagem e bytes de imagem são resolvidos na hora do uso e nunca são copiados para a definição espacial. O campo `imageId` resolve pela galeria durável do perfil; anexar uma imagem temporária ou com escopo de chat cria antes uma cópia durável.

## Regras do grafo

Os destinos válidos são os que estão ativos:

- Filhos do local atual
- O pai do local atual
- Alvos de links diretos
- Alvos reversos de links bidirecionais

Locais irmãos não ficam adjacentes automaticamente.

Rejeite:

- IDs duplicados
- Pai ou alvos de link ausentes
- Local que é pai de si mesmo, ou ciclos de pai
- Mais de 500 locais
- Profundidade acima de 20
- Mais de 50 links por local
- Mais de 50 referências a entradas de lorebook por local
- Referências duplicadas a entradas de lorebook em um mesmo local
- Mais de 6 referências visuais por local
- Referências duplicadas a imagens visuais em um mesmo local
- Mais de uma referência visual principal, ou uma referência principal cujo papel não seja `identity`
- Herança para descendentes em um papel diferente de `style`
- Coordenadas de posicionamento fora do intervalo de 0 a 100
- Ordenação de camadas inválida ou duplicada dentro de um pai em camadas
- Movimentação para locais arquivados, ocultos, bloqueados ou inalcançáveis
- Revisões desatualizadas ou um local atual que mudou
- IDs de comando reutilizados com conteúdo diferente
- Tentativas de alteração vindas da Conversation

Limites de texto:

- Nome: 200 caracteres
- Descrição: 4.000 caracteres
- Resumo de percepção: 1.000 caracteres
- Memória privada do modelo: 8.000 caracteres
- Identidade visual: 800 caracteres
- Nota de uso da referência visual: 300 caracteres

Ciclos em links diretos são válidos. Ciclos de pai, não.

### Arquivar e excluir

- O local atual ou o local inicial precisa de uma substituição atômica antes de ser arquivado.
- Um local com filhos ativos não pode ser arquivado.
- A exclusão definitiva só é permitida para uma folha arquivada, sem links de entrada.
- Os descendentes nunca ganham um novo pai silenciosamente.
- Referências de lorebook ausentes aparecem como avisos, não como corrupção do grafo.
- Arquivar ou excluir um local nunca exclui as entradas de lorebook referenciadas por ele.
- Excluir um lorebook ou uma entrada nunca reescreve o mapa em silêncio. O local mantém uma referência quebrada e reparável até o criador desanexá-la ou substituí-la.
- Arquivar ou excluir um local nunca exclui uma imagem compartilhada da galeria do perfil.
- A exclusão de uma imagem da galeria ainda referenciada por um local ou por um manifesto congelado do Storyboard fica bloqueada até o criador desanexá-la ou atualizar todos os manifestos dependentes. Referências de imagem ausentes continuam sendo avisos reparáveis e nunca viram alternativas por caminho bruto.

## Persistência e histórico

### Definições

Guarde `SpatialContextDefinition` em `chat.metadata.spatialContext`. As atualizações de definição exigem `expectedRevision`; as atualizações aceitas incrementam a revisão.

### Posição em tempo de execução

Guarde a posição atual com snapshots endereçáveis por mensagem e swipe, seguindo o padrão de snapshot que já existe no Game State.

- Chats proprietários novos começam em `startingLocationId`.
- Um turno confirmado cria um snapshot depois de qualquer movimentação aceita.
- A regeneração associa a posição ao swipe resultante.
- Trocar de swipe resolve o snapshot correspondente.
- Criar uma ramificação em uma mensagem copia o snapshot em vigor naquele ponto, não a posição mais recente do chat de origem.
- Os checkpoints do Game referenciam ou incluem o snapshot espacial aplicável.
- Recarregar resolve o último snapshot confirmado.

A edição de definição não é revertida pela ramificação comum de mensagens no MVP. Uma ramificação recebe uma cópia da definição atual, com seu próprio histórico futuro de revisões. A posição em tempo de execução vem do ponto de ramificação.

## Projeções de prompt

Um serviço de projeção compartilhado no servidor resolve os dados estruturados da projeção. Adaptadores finos de modo transformam isso no texto final do prompt.

### Projeção da história no modo proprietário

Inclua:

- Os nomes da trilha de navegação
- O ID do local atual
- A descrição pública
- A memória privada do modelo para o local atual
- Nomes, IDs e rótulos de link dos destinos disponíveis
- Uma instrução de estado com autoridade

Exclua todas as descrições e memórias de locais sem relação, os destinos ocultos ou bloqueados, as coordenadas de tela e os metadados do editor.

### Ativação de lore do local atual

O resolvedor espacial do modo proprietário devolve os `lorebookEntryIds` do local atual exato ao lado da projeção espacial normal. O formatador não cola esses IDs nem o conteúdo das entradas dentro do bloco espacial. Em vez disso, a montagem do prompt passa os IDs para o processador de lorebook existente como candidatos forçados, com fonte de ativação `current_location`.

Regras:

- Só o local atual exato ativa o lore anexado na primeira versão. Pais e descendentes não herdam entradas de forma implícita.
- Um anexo explícito de local pode ativar uma entrada ativada mesmo quando o lorebook dela não é global, nem está vinculado a personagem ou persona, nem fixado ao chat.
- Um lorebook desativado globalmente, uma entrada desativada ou uma exclusão explícita no chat sempre vence o anexo.
- As macros de lorebook, as posições de inserção, a recursão, a ordenação e os limites de tokens e de entradas por livro já existentes são reaproveitados.
- O lore anexado a locais também tem um teto reservado total de 2.048 tokens por prompt do modo proprietário. O truncamento é determinístico e aparece no Active Context.
- Uma entrada ativada tanto pelo local quanto por regras comuns de palavra-chave, semântica, recursão ou constante é inserida uma única vez e informa todas as fontes de ativação.
- Uma movimentação confirmada resolve as entradas do destino antes de o prompt de resposta do modo proprietário ser montado. Movimentação pendente ou rejeitada não muda a ativação de lore.
- A redação do Game trata o local como a posição com autoridade da equipe. A redação do Roleplay trata o local como a cena focal e não deduz que todos os personagens estão presentes.

A interface do Active Context agrupa essas entradas em `Current location`, mostra o lorebook dono, as fontes de ativação, o uso de tokens ou o truncamento e oferece Open entry. Referências quebradas, desativadas e excluídas continuam visíveis no editor de mapas, mas nunca entram no prompt.

### Projeção da Conversation conectada

Acrescentada na Fase 3. Inclua apenas:

- O nome e o modo da história vinculada
- A trilha de navegação
- O campo `awarenessSummary` ou um trecho delimitado da descrição pública
- Uma instrução de somente leitura
- A presença de personagens apenas quando o estado com autoridade a comprovar

Nunca inclua memória privada do modelo, IDs internos, destinos ocultos, a hierarquia completa, IDs ou conteúdo de lorebook anexados ao local, IDs de referência visual do local, notas de identidade visual, notas de uso, caminhos de imagem ou bytes de imagem.

O Game pode comprovar a presença pelo estado confirmado em `presentCharacters`. O Roleplay usa uma redação neutra, como "The linked story's current scene is...", até ganhar uma fonte explícita de presença. Nunca deduza presença pelo nome do personagem.

### Caminhos de prompt obrigatórios

O mesmo resolvedor de projeção precisa alimentar:

- A geração do Roleplay
- A geração do GM no Game
- A prévia de execução simulada
- A montagem do Peek Prompt ao vivo

O Peek Prompt em cache continua exibindo exatamente o prompt que foi enviado. O log de depuração inclui a projeção final, mas não pode registrar a memória privada do modelo nos níveis normais.

### Projeção visual do local atual para a geração de imagens

As referências visuais usam um resolvedor separado do prompt da história. Ele resolve o snapshot espacial aplicável ao alvo da imagem, não simplesmente o local mais recente do chat. A arte automática do Game usa o snapshot confirmado para aquela mensagem do assistente. Repetir a arte de um swipe anterior e chamar o Illustrator a partir de uma mensagem anterior usam o local resolvido daquela mensagem e daquele swipe.

Os caminhos elegíveis são a arte automática de cena do Game, a ilustração manual de cena do Game e a geração de cena ou de plano de fundo pelo Illustrator no Roleplay quando o controle de referências de local por chat está ativado. A geração de retratos, selfies, avatares e sprites não anexa referências de local automaticamente.

Dois controles nos metadados do chat espelham os controles de referência de avatar já existentes: `illustratorUseLocationReferences` e `gameImageUseLocationReferences`. Ausente ou falso continua significando desativado, por compatibilidade. Quando o criador define a primeira imagem principal de um local, o mesmo fluxo de Save oferece `Use this location in scene art`, marcado por padrão mas explícito, de modo que bytes de imagem nunca vão para um provedor só porque a imagem aparece no editor de mapas.

A ordem dos candidatos é determinística e considera o provedor:

1. Referências explícitas escolhidas para este pedido de imagem.
2. A referência `identity` principal do local exato resolvido.
3. Personagens e persona referenciados, na ordem da cena.
4. As referências `identity` e `detail` de apoio do local exato, em `sortOrder`.
5. A referência `style` herdável do ancestral mais próximo.

Nenhuma alternativa por local irmão ou por nome é permitida. No máximo duas imagens de local são candidatas em um pedido comum de cena, e o adaptador de provedor existente aplica seu limite total de imagens. As referências explícitas do pedido sempre ocupam os slots primeiro. Nos slots automáticos restantes, um pedido de plano de fundo prioriza a identidade do local sobre as referências de personagem, enquanto uma ilustração escolhe a referência principal de local antes de referências adicionais das pessoas retratadas. Se um provedor não conseguir aceitar ao mesmo tempo o lugar e todas as pessoas pedidas, a prévia informa a troca determinística e todos os motivos de omissão.

O compilador de prompt de imagem acrescenta a trilha de navegação do local, o campo `visualIdentity` delimitado e a `usageNote` delimitada de cada referência escolhida. O `ImageStyleProfile` selecionado no chat continua sendo a autoridade de estilo. As imagens de referência preservam a identidade do lugar ou do sujeito e não podem substituir silenciosamente o texto de estilo, as tags positivas, as tags negativas ou o modo de prompt do perfil.

Os papéis de referência expressam a intenção do criador e a prioridade de seleção; eles não garantem que todo provedor vá interpretar uma imagem como identidade, detalhe, leiaute ou estilo. As notas de capacidade do provedor e a prévia gerada mantêm o criador como autoridade visual.

Os pedidos ao modelo de texto não recebem nenhum desses bytes de imagem nem as notas de uso exclusivas de imagem. A Conversation conectada não recebe nem os IDs de referência visual nem o conteúdo deles. Os logs de depuração de imagem podem incluir IDs de imagem, IDs de local, papéis, motivos de seleção e omissões, mas nunca base64 nem caminhos do sistema de arquivos.

### Manifestos de referências visuais do Storyboard

O adaptador do Storyboard resolve os candidatos visuais uma única vez para o turno concluído do GM, depois que a mensagem e o swipe dele são confirmados. Ele guarda um banco congelado e a carga do tamanho aceito pelo provedor escolhida para cada quadro-chave. Isso separa a identidade durável das referências de um pedido ao provedor que talvez aceite só um subconjunto pequeno.

A seleção é determinística:

1. As referências explícitas do quadro-chave ocupam os slots primeiro.
2. Com um slot automático restante, um quadro de ambientação escolhe a principal do local, e um quadro com personagens visíveis escolhe o personagem visível principal.
3. Com dois ou mais slots automáticos restantes, escolha a principal do local exato e depois uma referência principal para cada personagem ou persona visível, na ordem da narrativa.
4. Use a capacidade restante para uma referência de apoio de identidade ou de detalhe do local exato, depois referências secundárias das entidades retratadas e depois o estilo herdável de local mais próximo.

O Storyboard nunca cria uma folha de contatos nem uma referência composta de forma implícita. Essas técnicas podem mudar a interpretação do provedor e continuam sendo uma otimização futura, específica de cada provedor. Imagens ausentes, uma troca de provedor ou um limite de provedor reduzido marcam o manifesto como `needs_review`; nada disso escolhe outra entidade em silêncio. Aumentar a capacidade também preserva a carga congelada até `Refresh references` ser confirmado.

O manifesto guarda IDs, rótulos, papéis, ordenação, motivos de seleção, omissões, mensagem e swipe de origem, ID do local resolvido, revisão da definição, identidade do provedor e o limite de referências usado. Ele não guarda bytes de imagem nem caminhos do sistema de arquivos. A saída de depuração pode descrever esse manifesto, mas segue as mesmas regras de não usar base64 nem caminhos que valem para a geração comum de imagens.

## Compatibilidade com o Game

As grades e os mapas de nós existentes do Game continuam sendo representações locais ou táticas. A hierarquia vira a camada de mundo e de contenção acima deles.

Quando o Contexto Espacial está ativado:

- O Contexto Espacial fornece aos prompts o local nomeado com autoridade.
- O tracker do Game exibe a trilha de navegação espacial como o local dele.
- Patches legados do modelo ou manuais não podem mudar o local em texto livre do Game por conta própria.
- `GameMap.spatialLocationId` pode vincular um mapa inteiro a um local da hierarquia.
- `GridCell.spatialLocationId` e `MapNode.spatialLocationId` podem vincular um destino em que se pode entrar.
- Os vínculos usam apenas IDs estáveis; nomes nunca são casados automaticamente.
- Escolher um destino vinculado cria a mesma transição pendente que o navegador de hierarquia.
- Mover entre células ou nós não vinculados muda apenas a posição tática da equipe.
- Entrar em um local pode selecionar o mapa local vinculado a ele; sair pode selecionar o mapa do ancestral vinculado mais próximo.

Quando está desativado, o comportamento de local do Game continua igual ao de hoje.

Esse limite preserva a interface de mapa e os saves atuais, evitando ao mesmo tempo duas fontes de verdade espacial nomeada.

## Formato da API

```text
GET  /api/chats/:chatId/spatial-context
PUT  /api/chats/:chatId/spatial-context
```

Atualização de definição:

```ts
interface UpdateSpatialContextRequest {
  expectedRevision: number;
  expectedCurrentLocationId: string | null;
  replacementCurrentLocationId?: string | null;
  definition: SpatialContextDefinition;
}
```

O campo `replacementCurrentLocationId` só é usado quando uma edição de definição arquiva o local atual em vigor. O servidor precisa validar e aplicar essa substituição na mesma escrita da revisão da definição. A movimentação comum continua passando pela submissão de turno do modo proprietário.

A movimentação pendente é enviada pelo pedido de turno do modo proprietário que já existe, e não por um endpoint separado de transição imediata.

O servidor valida a integridade da definição, o modo proprietário, a revisão esperada, o local atual esperado, a alcançabilidade e a idempotência do comando dentro da mesma transação da submissão da mensagem.

Devolva `409 Conflict` para estado desatualizado e `400 Bad Request` para grafos ou destinos inválidos. Os erros não podem revelar destinos ocultos.

## Plano de implementação

### Fase 0: núcleo compartilhado e fixtures de prova

- Acrescentar os tipos compartilhados e os schemas Zod.
- Acrescentar validação de grafo, trilha de navegação e utilitários de destino, todos puros.
- Acrescentar fixtures determinísticas para grafos válidos e inválidos.
- Confirmar os pontos de integração dos snapshots de mensagem e swipe no Roleplay e no Game.
- Medir projeções de prompt representativas.

Condição de saída: o schema, a semântica de movimentação e o comportamento dos snapshots estão comprovados sem interface.

### Fase 1: MVP do modo proprietário

1. Acrescentar a persistência da definição com concorrência otimista.
2. Acrescentar o armazenamento e a resolução dos snapshots espaciais.
3. Integrar a movimentação pendente atômica à submissão de turno do modo proprietário.
4. Tratar recarregamento, swipes, ramificações e checkpoints do Game.
5. Acrescentar o serviço de projeção compartilhado a todos os caminhos de prompt obrigatórios.
6. Acrescentar a seção compacta de configurações, o navegador de hierarquia, a tela de mapa local, o seletor de camadas e o espaço de trabalho do editor.
7. Acrescentar a trilha de navegação, o seletor de destinos, a prévia e o estado pendente às telas do modo proprietário.
8. Vincular os mapas, as células e os nós existentes do Game por IDs estáveis de local.
9. Conciliar o local do tracker do Game quando o recurso estiver ativado.

Condição de saída: Roleplay e Game conseguem criar, mover, persistir, restaurar e gerar prompts a partir do mesmo modelo espacial. A movimentação por mapa vinculado do Game e a movimentação tática não vinculada continuam distintas.

### Fase 2A: vínculos de lorebook por local e execução

- Acrescentar `lorebookEntryIds` aos locais, com array vazio como padrão de compatibilidade.
- Acrescentar ao Editor de Locais os estados embutidos de anexar, abrir, desanexar, desativado, excluído e referência quebrada.
- Resolver as referências do local atual exato como candidatos forçados no processador de lorebook existente.
- Reaproveitar as macros, a inserção, a recursão, a ordenação e os limites por livro normais; acrescentar deduplicação determinística e um teto total de 2.048 tokens para o lore de local.
- Informar `current_location` ao lado de qualquer fonte de ativação por palavra-chave, semântica, recursão ou constante no Active Context.
- Comprovar comportamento idêntico no Roleplay e no Game, incluindo movimentação, recarregamento, regeneração, swipes e ramificações.
- Comprovar que a Conversation conectada não recebe nem os IDs nem o conteúdo do lore de local.

Condição de saída: os criadores conseguem vincular explicitamente lore existente a locais, e só o local atual aceito ativa essas entradas nos prompts do modo proprietário.

### Fase 2B: rascunho de mapa embasado em lorebook

- Estender os pedidos de criação, substituição e expansão segura em relação ao histórico com o modo de embasamento e a seleção explícita de lorebooks ou entradas de origem.
- Ler diretamente as entradas de lore selecionadas e ativadas para esta operação de criação, em vez de depender da ativação por palavra-chave ou da visão geral do mundo gerada.
- Montar um catálogo de fontes delimitado e ciente da conexão, com contagens de omissão visíveis e ordenação determinística.
- Dar ao modelo chaves de origem temporárias, validar cada chave devolvida no servidor e persistir apenas IDs estáveis de entrada.
- Dar suporte ao comportamento de `setup_only`, `lore_strict` e `lore_expand`, com procedência na prévia.
- Vincular automaticamente as entradas de origem válidas aos locais gerados, mantendo Apply e Save como limites de revisão separados.
- Preservar cada ID de local e cada vínculo de lore existentes durante a expansão que só acrescenta.

Condição de saída: um criador que conhece lorebooks consegue gerar um mapa embasado diretamente no cânone selecionado, identificar cada acréscimo sem respaldo e recusá-lo ou editá-lo antes da persistência.

### Fase 2C: identidade visual do local e referências de cena

- Acrescentar os campos delimitados `visualIdentity` e `visualReferences`, com padrões vazios de compatibilidade.
- Reaproveitar os IDs duráveis de imagem da galeria do perfil e os caminhos seguros já existentes de upload para a galeria, metadados e geração de imagens. Nunca persistir caminhos brutos, URLs externas ou base64 na definição.
- Acrescentar os controles paralelos, por chat, de referências de local no Illustrator e no Game. O fluxo de Save da primeira imagem principal obtém consentimento explícito antes de liberar o uso pelo provedor.
- Gerar uma referência de ambientação apenas a partir do contexto delimitado do local exato e do lore anexado e ativado. Não varrer lorebooks nem ramos da hierarquia sem relação.
- Acrescentar ao Editor de Locais os estados embutidos de principal, apoio, papel, nota de uso, seleção na galeria, upload, geração, desanexar, referência quebrada e retrolinks.
- Resolver o local exato da mensagem e do swipe nos pedidos elegíveis de arte de cena do Game e do Roleplay e, depois, mesclar referências de local, de personagem, de persona e explícitas dentro dos limites de cada provedor.
- Acrescentar a promoção explícita `Set as location reference` para a arte gerada. Nunca promover cenas geradas automaticamente.
- Preservar os IDs de referência visual em ramificações e na exportação de metadados JSONL, avisar sobre recursos ausentes no destino e incluir os recursos no backup e na restauração do perfil.
- Comprovar que os prompts de história e a Conversation conectada não recebem IDs, bytes, caminhos nem notas exclusivas de imagem dos locais.

Condição de saída: um criador consegue estabelecer um lugar visualmente, gerar várias cenas que reaproveitem a identidade já revisada dele, ver exatamente quais referências visuais foram enviadas e remover ou substituir essas referências sem mudar a verdade espacial ou de lore.

### Fase 2D: manifestos de referências visuais do Storyboard

- Acrescentar um adaptador do Storyboard a jusante do resolvedor visual da Fase 2C, em vez de acoplar a persistência espacial ao Storyboard.
- Resolver o snapshot espacial da mensagem e do swipe de origem e, depois, congelar o banco de referências de local e de entidades mais as cargas por quadro-chave do provedor.
- Reaproveitar a principal do local exato entre os quadros-chave quando a capacidade permitir, escolhendo as referências de personagem e persona a partir da lista de personagens visíveis de cada quadro.
- Persistir a identidade do provedor, a capacidade de referências, as seleções ordenadas e os motivos de omissão, de forma que a regeneração seja reproduzível.
- Acrescentar os estados embutidos `Visual sources`, `Review references` e `Refresh references` explícito à prévia e à regeneração do Storyboard.
- Rejeitar a reseleção silenciosa quando uma imagem estiver faltando ou a capacidade do provedor diminuir. Não preencher automaticamente a capacidade que ficou disponível.
- Preservar o manifesto ao longo do ciclo de vida já existente do Storyboard e comprovar que a conversão de quadro-chave em vídeo continua usando só o quadro-chave renderizado como primeiro quadro.

Condição de saída: cada quadro-chave do Storyboard consegue explicar e reproduzir suas entradas visuais, quadros repetidos compartilham a identidade histórica correta do lugar e as limitações do provedor nunca trocam o local ou as pessoas retratadas em silêncio.

### Fase 3: Conversation conectada

- Resolver o estado mais recente do modo proprietário por `connectedChatId` na hora da geração.
- Acrescentar uma projeção delimitada e de somente leitura.
- Usar uma redação conservadora sobre presença.
- Excluir IDs e conteúdo do lore anexado ao local, IDs e metadados de referências visuais, caminhos de imagem e bytes de imagem, mesmo quando a geração no modo proprietário usar tudo isso.
- Cobrir desvinculação, revinculação, proprietário excluído, links malformados, histórias concluídas e os controles negativos do lore de local.

### Fase 4: movimentação pedida pelo modelo

- Acrescentar um pedido tipado `change_location` para os modos proprietários.
- Aplicar a mesma validação de revisão, alcançabilidade e idempotência.
- Registrar os pedidos aceitos e rejeitados nos diagnósticos de depuração.
- A Conversation continua sem poder pedir transições.

### Fase 5: modelos do criador

- Salvar e importar subárvores de locais ou mapas inteiros reutilizáveis.
- Permitir que os criadores distribuam mapas iniciais junto com personagens, depois que a propriedade e o comportamento de mesclagem forem especificados.
- Preservar as referências internas gerando novos IDs ao copiar para outro chat.

## Plano de implementação no repositório

Base de planejamento: `hierarchical-locations` depois da mesclagem de `staging` em `4fd752ea`, em 13/07/2026. Nessa base, o branch contém apenas os documentos de planejamento V1, V2 e V3. Ainda não existe nenhum código de execução do Contexto Espacial.

### Restrições de integração confirmadas

| Assunto | Comportamento atual do repositório | Consequência para a implementação |
| --- | --- | --- |
| Armazenamento da definição | Os metadados do chat são JSON e as atualizações genéricas de metadados são mesclagens parciais. | As definições espaciais ficam em `chat.metadata.spatialContext`, mas usam um endpoint validado e dedicado, em vez da rota genérica de patch de metadados. |
| Histórico de execução | `game_state_snapshots` é o único histórico de estado do mundo endereçável por mensagem e swipe. | Acrescente uma tabela de snapshot espacial neutra em relação ao modo. Não acrescente colunas de Contexto Espacial aos snapshots exclusivos do Game. |
| Início do turno no modo proprietário | `/api/generate` confirma o estado visível do Game, cria a mensagem do usuário e depois atualiza anexos e dados de persona em chamadas separadas. | Acrescente um serviço pequeno de turno do modo proprietário, ligado a uma transação, de forma que a criação da mensagem do usuário e uma movimentação espacial aceita tenham sucesso ou falhem juntas. Mantenha as chamadas ao provedor fora da transação. |
| Swipes e ramificações | A exclusão de swipe desloca os índices dos snapshots do Game. A criação de ramificação copia todos os snapshots de Game e de turno-Game para novos IDs de mensagem. | Os snapshots espaciais precisam participar dos dois caminhos e precisam copiar o snapshot em vigor em um ponto de ramificação anterior. |
| Montagem do prompt | A geração ao vivo, a execução simulada, o Peek Prompt ao vivo, o Peek Prompt em cache e os prompts do GM no Game têm caminhos de montagem distintos. | Resolva os dados espaciais estruturados uma vez e depois chame um formatador/inseridor compartilhado a partir de cada caminho ao vivo. O Peek Prompt em cache continua lendo exatamente o pedido salvo do provedor. |
| Dados do cliente | Os dados do servidor usam React Query. Os rascunhos de entrada por chat sobrevivem à navegação e ao recarregamento. Os editores pesados são carregados sob demanda pelo `AppShell`. | Acrescente um hook dedicado de query/mutation, persista as transições pendentes ao lado dos rascunhos por chat e leve um Editor de Locais carregado sob demanda pelo modelo de visão de detalhe já existente. |
| Deslocamento no Game | Os mapas do Game já têm posições de grade e de nó, além de uma movimentação de mapa pendente que vira o texto visível `*moves to ...*`. | Acrescente vínculos opcionais por ID estável. Os destinos vinculados usam pedidos espaciais estruturados, sem prosa visível; a movimentação não vinculada mantém o fluxo tático atual. |
| Armazenamento | Os snapshots nativos em arquivo são o único backend de persistência. São usadas transações pequenas, e laços de transação grandes são evitados para manter as escritas responsivas. | Mantenha a transação do turno do modo proprietário com tamanho constante e comprove isso no armazenamento nativo em arquivo antes de expandir o recurso. |
| Processamento de lorebook | A ativação de lorebook já aceita IDs de chat explícitos, casamento por palavra-chave e semântico, macros, recursão, ordenação e marcadores de prompt. A configuração inicial do Game faz a varredura sem nenhuma mensagem de chat, então as entradas comuns por palavra-chave não embasam diretamente o rascunho de mapa posterior. | Acrescente candidatos forçados do local atual ao processador de lorebook compartilhado e dê ao rascunho de mapa um caminho separado, explícito e delimitado de catálogo de fontes. Não deduza o cânone do mapa apenas pela visão geral do mundo. |
| Consistência de imagem | Os perfis de estilo de imagem controlam o estilo do prompt, os avatares de personagem e persona já podem ser enviados como referências, e os provedores aceitam contagens máximas diferentes de referências. As galerias guardam IDs estáveis de imagem separados dos caminhos de arquivo. | Mantenha a identidade do lugar separada do estilo global e da identidade dos personagens. Resolva o snapshot espacial aplicável, anexe imagens estáveis da galeria apenas aos pedidos elegíveis de arte de cena e corte os candidatos de forma determinística pelos adaptadores de provedor já existentes. |
| Referências do Storyboard | O Storyboard já planeja os personagens visíveis por quadro-chave, resolve os limites de referência de cada provedor, envia imagens de personagem na prévia e na renderização, guarda a mensagem e o swipe de origem e usa cada quadro-chave renderizado como primeiro quadro do vídeo. | Acrescente um manifesto congelado de referências visuais que resolva o local histórico uma vez, varie os personagens por quadro-chave e preserve as seleções ordenadas ao longo das regenerações. Mantenha a entrada de imagem para vídeo sem mudanças. |

### Mapa dos módulos-alvo

Novos módulos compartilhados:

- `packages/shared/src/types/spatial-context.ts`: tipos públicos de definição, snapshot, transição, projeção, resposta, aviso e código de erro.
- `packages/shared/src/schemas/spatial-context.schema.ts`: schemas Zod e todos os limites de armazenamento e de pedido.
- `packages/shared/src/utils/spatial-context.ts`: indexação pura do grafo, validação, trilha de navegação, alcançabilidade, verificações de arquivamento e ordenação determinística de destinos.
- `packages/shared/src/index.ts`: exportações explícitas do novo contrato compartilhado.

Novos módulos do servidor:

- `packages/server/src/db/schema/spatial-context.ts`: schema de `spatial_context_snapshots`.
- `packages/server/src/services/storage/spatial-context.storage.ts`: leituras e escritas de snapshot, cópias de ramificação, deslocamentos de swipe, busca de comandos e limpeza.
- `packages/server/src/services/spatial-context/state-resolution.ts`: resolução do snapshot em vigor para inicialização, swipe visível, regeneração, ramificação e checkpoints.
- `packages/server/src/services/spatial-context/projection.ts`: projeções estruturadas do modo proprietário e do modo conectado, mais a formatação delimitada de texto.
- `packages/server/src/services/spatial-context/visual-reference-resolution.ts`: seleção visual de local ciente do snapshot, herança, candidatos do provedor e diagnósticos seguros.
- `packages/server/src/services/spatial-context/storyboard-reference-manifest.ts`: bancos congelados do Storyboard, seleção da carga por quadro-chave, revisão da capacidade do provedor, atualização e serialização segura.
- `packages/server/src/services/spatial-context/owner-turn.ts`: validação e movimentação atômica de tamanho constante, mais a confirmação da mensagem do usuário.
- `packages/server/src/services/spatial-context/game-map-binding.ts`: projeção da trilha de navegação com autoridade, mais a resolução explícita dos vínculos de mapa, célula e nó do Game.
- `packages/server/src/routes/spatial-context.routes.ts`: rotas dedicadas de GET e de PUT com revisão.

Novos módulos do cliente:

- `packages/client/src/hooks/use-spatial-context.ts`: chaves de query, GET, PUT de definição, tratamento de conflitos e invalidação de cache.
- `packages/client/src/features/spatial-context/SpatialContextSettingsSection.tsx`: resumo compacto em Chat Settings e ação de abrir o editor.
- `packages/client/src/features/spatial-context/SpatialMapWorkspace.tsx`: casca do editor de página inteira, carregada sob demanda.
- `packages/client/src/features/spatial-context/components/HierarchyNavigator.tsx`: navegação da hierarquia e interações de teclado.
- `packages/client/src/features/spatial-context/components/LocalMapCanvas.tsx`: mapa dos locais filhos posicionados.
- `packages/client/src/features/spatial-context/components/LayerSelector.tsx`: camadas ordenadas de andar, torre e masmorra.
- `packages/client/src/features/spatial-context/components/LocationInspector.tsx`: edição de campos, prévia, links, controles de arquivamento e validação embutida.
- `packages/client/src/features/spatial-context/components/SpatialContextRuntimeBar.tsx`: trilha de navegação, seletor de destinos, estado pendente e ação de limpar.
- `packages/client/src/features/spatial-context/lib/editor-state.ts`: operações sobre a cópia de trabalho e mapeamento de erros do servidor. Isso continua local ao cliente e não é exportado por um barrel.

Arquivos de integração já existentes que devem mudar:

- Persistência: `packages/server/src/db/migrate.ts`, `packages/server/src/db/schema/index.ts`, `packages/server/src/db/file-backed-store.ts`, `packages/server/src/services/storage/chats.storage.ts` e `packages/server/src/routes/backup.routes.ts`, onde o registro da tabela exigir.
- Ciclo de vida do chat: `packages/server/src/routes/chats.routes.ts`, `packages/server/src/routes/generate.routes.ts` e `packages/shared/src/schemas/chat.schema.ts`.
- Caminhos de prompt: `packages/server/src/routes/generate/dry-run-route.ts`, `packages/server/src/services/generation/game-gm-prompt-runtime.ts` e a parte de prévia ao vivo de `packages/server/src/routes/chats.routes.ts`.
- Embasamento e ativação de lorebook: `packages/server/src/services/lorebook/`, `packages/server/src/routes/spatial-context.routes.ts`, `packages/client/src/features/spatial-context/components/LocationInspector.tsx`, o editor de lorebooks e a interface do Active Context.
- Arte de referência de local: `packages/server/src/db/schema/gallery.ts`, o armazenamento e as rotas da galeria, `packages/server/src/services/image/`, `packages/server/src/routes/generate/illustrator-references.ts`, a ilustração do Game e a montagem do Storyboard em `packages/server/src/routes/game.routes.ts`, `packages/server/src/services/storage/game-storyboards.storage.ts`, os contratos compartilhados de prompt do Storyboard, `packages/client/src/features/spatial-context/components/LocationInspector.tsx` e as interfaces de prévia da geração de imagens e do Storyboard.
- Roteamento do cliente e caminhos de envio: `packages/client/src/stores/ui.store.ts`, `packages/client/src/stores/chat.store.ts`, `packages/client/src/components/layout/AppShell.tsx`, `packages/client/src/components/chat/ChatSettingsDrawer.tsx`, `packages/client/src/components/chat/ChatArea.tsx`, `packages/client/src/components/chat/ChatRoleplaySurface.tsx`, `packages/client/src/components/chat/ChatInput.tsx`, `packages/client/src/components/game/GameSurface.tsx` e `packages/client/src/components/game/GameInput.tsx`.
- Portabilidade e prova: o código nativo de importação/exportação de chat em `packages/server/src/routes/chats.routes.ts` e `packages/server/src/services/import/`, `scripts/regressions/`, `e2e/core-flows.e2e.ts` e os scripts do `package.json` da raiz.

A lista de arquivos é um limite, não uma exigência de editar todos eles em um único pull request. Cada pacote de trabalho abaixo deve manter o diff focado.

### Contrato de persistência

As definições continuam dentro dos metadados do chat e são copiadas automaticamente quando uma ramificação copia os metadados do chat. O estado em tempo de execução usa uma tabela separada:

```ts
interface SpatialContextSnapshotRow {
  id: string;
  chatId: string;
  messageId: string;
  swipeIndex: number;
  currentLocationId: string | null;
  definitionRevision: number;
  source: "bootstrap" | "owner_turn" | "assistant_swipe" | "definition_repair" | "branch_copy";
  transitionCommandId: string | null;
  transitionPayloadHash: string | null;
  createdAt: string;
}
```

Índices e invariantes obrigatórios:

- Uma linha em vigor por `(chatId, messageId, swipeIndex)`.
- Um ID de comando de transição é único dentro do chat quando não é nulo.
- Um ID de comando repetido com destino, revisão esperada ou local atual esperado diferentes devolve `409 spatial_transition_command_mismatch`.
- Um ID de comando repetido com a mesma carga devolve `409 spatial_transition_already_applied`, inclui o snapshot confirmado e o ID da mensagem do usuário, e não faz uma segunda escrita. O cliente se reconcilia a partir da resposta em vez de reenviar o turno.
- As linhas de snapshot usam IDs estáveis de local. Renomeações e mudanças de pai não reescrevem os snapshots.
- Uma linha de inicialização usa `messageId: ""` e swipe `0` até existir uma âncora de mensagem confirmada.
- Excluir um chat, uma mensagem ou um swipe remove ou desloca as linhas espaciais correspondentes nos mesmos pontos que hoje mantêm os snapshots de Game e de turno-Game.

A nova tabela precisa ser registrada nas definições de tabela em arquivo, na lista de tabelas com backend em arquivo, no grafo de cascata, no backup e na restauração de perfil e nos metadados de integridade do Mari DB. O comportamento de busca precisa ser coberto por regressões nativas em arquivo.

### Regras de estado em vigor e de histórico

Use um único resolvedor para as APIs, os prompts, a ramificação e a resposta ao cliente:

1. Se uma mensagem e um swipe específicos forem pedidos, devolva aquele snapshot espacial.
2. Para a visão atual, examine a última mensagem visível do assistente e o swipe ativo dela.
3. Se esse swipe do assistente não tiver linha, volte para trás até o snapshot mais próximo de turno do usuário ou do assistente, na ordem das mensagens visíveis.
4. Recorra à linha de inicialização.
5. Se não existir snapshot algum e a definição ativada tiver um local inicial válido, devolva um estado inicial em memória e materialize-o no primeiro turno do modo proprietário.

Ancoragem do turno do modo proprietário:

- Antes da persistência, resolva o estado de origem a partir do histórico visível no momento, e não da linha mais nova só pelo carimbo de tempo.
- Na transação atômica do turno, crie a mensagem do usuário, o swipe inicial, os carimbos de tempo do chat e um snapshot espacial `owner_turn` ancorado nessa mensagem do usuário.
- Depois de a resposta do assistente ser salva, materialize o mesmo estado no `(messageId, swipeIndex)` dela como `assistant_swipe`.
- Uma chamada ao provedor que falha ou é abortada deixa confirmados o turno aceito do usuário e o snapshot espacial dele. Ao recarregar, portanto, aparecem a movimentação e a mensagem salva do usuário, sem inventar uma resposta do assistente.
- A regeneração resolve o estado imediatamente anterior à mensagem-alvo do assistente e escreve esse estado no novo swipe. A continuação mantém o estado do swipe-alvo.
- Escolher um swipe muda o estado em vigor pela linha de swipe ativo já existente. Isso não reescreve outros snapshots.
- A criação de ramificação copia a definição, refaz as chaves de cada snapshot espacial copiado para os novos IDs de mensagem e inclui a linha de inicialização. Uma ramificação em uma mensagem anterior para de copiar no corte escolhido.
- Os checkpoints do Game guardam o ID do snapshot espacial aplicável ou uma cópia estável do local atual e da revisão da definição. Carregar um checkpoint restaura tanto o estado do Game quanto o estado espacial.

A edição de definição não é histórica. Uma renomeação ou mudança de pai altera a trilha de navegação exibida para snapshots antigos, porque o ID estável do local é resolvido contra a definição atual da ramificação. Um snapshot antigo pode apontar para um local arquivado; ele continua legível, mas o próximo destino precisa ser um nó ativo e alcançável. Se o editor arquivar o local em vigor no momento, `replacementCurrentLocationId` passa a ser obrigatório e o servidor escreve um snapshot `definition_repair` na âncora visível atual, na mesma transação da nova revisão da definição.

### Sequência atômica do turno do modo proprietário

Estenda `generateRequestSchema` e o contrato de geração do cliente com o campo opcional `pendingSpatialTransition`. Ele só é aceito para chats proprietários de Roleplay e Game.

A sequência no servidor é:

1. Adquirir o bloqueio de geração por chat já existente.
2. Analisar o pedido e carregar o chat dentro do ciclo de vida do pedido.
3. Se não houver transição espacial, preservar o fluxo de mensagens atual.
4. Se houver uma transição, iniciar uma transação de banco de dados de tamanho constante.
5. Reler a definição e o estado visível dentro da transação.
6. Validar o modo proprietário, o estado de ativação, a revisão esperada da definição, o local atual esperado, o ID do comando, o status do destino e a alcançabilidade.
7. Criar a mensagem do usuário e o swipe inicial por uma instância de armazenamento de chat ligada à transação.
8. Inserir o snapshot espacial e atualizar os carimbos de tempo do chat.
9. No Game, confirmar o snapshot visível do Game na mesma transação sempre que for prático.
10. Confirmar a transação e depois seguir com o enriquecimento de anexos, o snapshot da persona, a montagem do prompt e o trabalho do provedor fora dela.

As falhas de validação acontecem antes de o estado otimista do cliente ser tratado como autoridade. Um erro `400` de grafo ou de destino e um erro `409` de estado desatualizado contêm códigos estáveis de máquina, texto seguro para o usuário, a revisão atual e a trilha de navegação atual. Eles nunca incluem nomes de destinos ocultos ou bloqueados.

O cliente mantém o texto enviado, os anexos e o destino pendente até o servidor aceitar o turno. Em caso de conflito, ele remove a mensagem otimista, atualiza a query de Contexto Espacial, restaura o rascunho e oferece `Review destinations`. Quando o turno é aceito, ele limpa as três coisas juntas.

### Contrato de projeção compartilhado

O resolvedor devolve dados estruturados antes de qualquer texto de prompt ser produzido:

```ts
interface ResolvedOwnerSpatialProjection {
  kind: "owner";
  chatId: string;
  ownerMode: SpatialOwnerMode;
  definitionRevision: number;
  currentLocationId: string;
  breadcrumb: Array<{ id: string; name: string }>;
  description: string;
  modelMemory: string | null;
  lorebookEntryIds: string[];
  destinations: Array<{ id: string; name: string; label?: string }>;
  omittedDestinationCount: number;
}

interface ResolvedLocationVisualProjection {
  chatId: string;
  messageId: string | null;
  swipeIndex: number | null;
  locationId: string;
  breadcrumb: Array<{ id: string; name: string }>;
  visualIdentity: string | null;
  references: Array<{
    imageId: string;
    role: LocationVisualReferenceRole;
    usageNote: string | null;
    sourceLocationId: string;
    inherited: boolean;
  }>;
}

interface StoryboardVisualReferenceCandidate {
  imageId: string;
  source: "explicit" | "location" | "character" | "persona" | "inherited_style";
  entityId?: string;
  label: string;
  role: string;
  order: number;
}

interface StoryboardKeyframeReferencePayload {
  keyframeIndex: number;
  imageIds: string[];
  omitted: Array<{
    imageId: string;
    reason: "provider_limit" | "not_visible" | "missing" | "setting_disabled";
  }>;
}

interface StoryboardVisualReferenceManifest {
  sourceMessageId: string;
  sourceSwipeIndex: number;
  locationId: string | null;
  definitionRevision: number | null;
  provider: string;
  model: string;
  providerReferenceLimit: number;
  status: "ready" | "needs_review";
  candidates: StoryboardVisualReferenceCandidate[];
  keyframes: StoryboardKeyframeReferencePayload[];
  createdAt: string;
}
```

Os limites de prompt são separados dos limites de armazenamento:

- No máximo 20 nós na trilha de navegação.
- No máximo 4.000 caracteres de descrição no modo proprietário.
- No máximo 8.000 caracteres de memória privada do modelo.
- No máximo 50 destinos, na ordem determinística de `sortOrder`, nome e depois ID, seguidos apenas de uma contagem de omitidos.
- No máximo 50 referências de lorebook do local atual antes de o processador de lorebook aplicar os orçamentos de entradas e de tokens.
- No máximo 6 referências visuais guardadas por local e, no máximo, 2 candidatas de referência de local em um pedido comum de cena, antes do limite total de referências do provedor.
- Um manifesto do Storyboard pode reter todos os IDs candidatos resolvidos para auditoria e atualização, mas a carga de cada quadro-chave é limitada pelo limite do provedor capturado quando o manifesto foi criado.
- No máximo 1.000 caracteres para um `awarenessSummary` conectado ou para o trecho alternativo da descrição pública.

Um único formatador produz o bloco estruturado compartilhado do modo proprietário. Roleplay e Game usam adaptadores finos em volta desse bloco. O formatador nunca serializa `lorebookEntryIds`; o pipeline de prompt do modo proprietário consome esses IDs pelo processador de lorebook. Um segundo formatador, introduzido só na Fase 3, produz o bloco da Conversation com privacidade reduzida e não recebe nenhum campo de lore de local.

Cada caminho ao vivo chama o mesmo resolvedor e o mesmo formatador imediatamente antes do preparo final do pedido ao modelo:

- Geração padrão do Roleplay.
- Geração do GM no Game.
- `/api/generate/dryRun`.
- Montagem do Peek Prompt ao vivo quando não existe um pedido salvo exato.
- Caminhos de repetição e de continuação que remontam um prompt.

O Peek Prompt exato em cache não precisa de montagem nova. Ele exibe o pedido do provedor já salvo, que precisa conter o bloco espacial usado naquele swipe. A cobertura de regressão precisa comparar blocos espaciais normalizados entre a geração ao vivo, a execução simulada e o Peek Prompt ao vivo para a mesma fixture.

### Contrato do rascunho embasado em lorebook

O embasamento do mapa é uma entrada explícita de criação:

```ts
interface SpatialMapGroundingRequest {
  mode: "setup_only" | "lore_strict" | "lore_expand";
  lorebookIds: string[];
  entryIds?: string[];
}
```

A configuração do Game preenche `lorebookIds` a partir de `GameSetupConfig.activeLorebookIds`. O Roleplay preenche a partir dos livros globais, vinculados e fixados ativos do chat. O criador pode mudar a seleção antes da geração. Livros e entradas desativados ou excluídos explicitamente nunca são enviados.

Isto não é uma varredura de ativação de lorebook. O servidor lê as fontes selecionadas diretamente, resolve as macros com suporte contra o contexto de configuração do modo proprietário sem persistir o texto resolvido e monta um catálogo com:

- Uma chave de origem temporária
- Os nomes da entrada e do lorebook
- As chaves de ativação e as tags
- A descrição da entrada, quando existir
- Caso contrário, um trecho delimitado do conteúdo

O catálogo é limitado pelo menor entre 100 entradas, 16.000 caracteres e o contexto de conexão que sobra depois de reservar espaço para a configuração, o sistema e a saída pedida. A prioridade é determinística:

1. Os `entryIds` escolhidos explicitamente.
2. Entradas com tags, nomes ou chaves que remetem a locais.
3. Entradas com descrições escritas pelo autor.
4. As entradas restantes, na ordem estável de lorebook e de entrada.

Se houver entradas omitidas, a prévia informa a contagem e oferece Refine sources. Ela nunca dá a entender que o lorebook inteiro foi considerado.

O plano simplificado do modelo acrescenta chaves de origem temporárias a cada local proposto. O servidor rejeita as chaves desconhecidas, mapeia as chaves válidas para IDs estáveis de entrada, remove duplicatas e calcula a procedência mostrada na prévia:

- `Lore-backed`: pelo menos uma entrada de origem validada.
- `Inferred`: uma relação ou um contêiner derivado do material de origem, mas sem uma entrada de origem própria.
- `Added by AI`: nenhuma entrada de origem sustenta o nó.

O modo `lore_strict` rejeita todo nó sem uma chave de origem validada. O modo `lore_expand` aceita nós inferidos e acrescentados, mas os rotula de forma visível. Uma chave de origem válida prova a procedência, não a fidelidade semântica; a prévia precisa mostrar trechos da fonte para o criador pegar uma relação ou um nome mal interpretados antes de Apply.

O endpoint de geração devolve a definição normalizada do rascunho mais um mapa transitório de procedência, indexado pelo ID do local gerado. Só `lorebookEntryIds` persiste depois de Save. Substituir e expandir mantêm as proteções de histórico já existentes; a expansão pode acrescentar vínculos a nós novos, mas não pode reescrever locais nem vínculos existentes.

### Limite de compatibilidade com o Game

Quando o Contexto Espacial está ativado em um chat do Game:

- `SpatialContextSnapshot.currentLocationId` tem autoridade.
- O campo `location` do estado do Game é apenas uma projeção de compatibilidade.
- As respostas GET do estado do Game e a interface do tracker recebem a trilha de navegação resolvida como local exibido.
- Os patches do agente World State e os patches manuais do tracker do Game não podem escrever `location` por conta própria; o servidor descarta esse campo com um diagnóstico de depuração ou devolve um conflito no nível do campo para edições manuais explícitas.
- Os novos snapshots do Game espelham a trilha de navegação no valor legado `location` deles, de modo que o histórico da sessão e a interface existente continuem legíveis, mas o código de prompt continua lendo a projeção espacial.
- Um mapa, uma célula de grade ou um nó do Game pode ser vinculado explicitamente a um ID estável de local da hierarquia.
- Escolher um destino vinculado cria uma transição espacial pendente estruturada e não insere prosa de movimentação.
- A movimentação em células e nós não vinculados continua tática e muda apenas a posição da equipe.
- Entrar em um local vinculado seleciona o mapa local dele quando existe; sair seleciona o mapa do ancestral vinculado mais próximo quando existe.
- A interface identifica os dois sistemas de forma distinta, como `Story location` e `Map position`, quando ambos estão visíveis.
- Desativar o Contexto Espacial restaura na hora o comportamento legado de local do Game, sem excluir definições nem snapshots espaciais.

Os controles negativos precisam comprovar que um patch de local do Game emitido pelo modelo, uma edição manual no tracker e um clique em mapa não vinculado não conseguem mudar `currentLocationId`. Os controles positivos comprovam que um clique válido em elemento vinculado usa o validador normal de transição.

### Contrato de interface do modo proprietário

Chat Settings ganha uma seção compacta `Hierarchical Map`, só para Roleplay e Game. Ela mostra o estado de ativação, a trilha de navegação atual, as contagens de ativos e arquivados, a contagem de avisos e `Open Map Editor`. Ela não embute o editor completo no painel lateral.

O Editor de Locais segue a rota de editor de página inteira já existente:

- No desktop há um navegador de hierarquia, uma visão de mapa local ou de camadas e o inspetor do local selecionado.
- No celular aparece primeiro a hierarquia e depois os detalhes, com uma ação visível de voltar aos locais. Nenhuma operação depende de passar o mouse ou arrastar.
- As linhas expõem, por controles rotulados, as ações de acrescentar filho, acrescentar irmão, mudar o pai, duplicar a subárvore, arquivar e vincular.
- A visão local desenha os filhos como nós de mapa posicionados, camadas ordenadas ou uma lista acessível.
- Selecionar mostra a prévia de um local; uma ação **Enter** separada leva até ele.
- O inspetor contém nome, tipo, descrição pública, memória privada do modelo, ícone, apresentação, posicionamento ou ordem de camada, status, pai, links diretos e lore vinculado.
- A identidade visual é uma seção embutida no inspetor, não uma janela bloqueante. Ela mostra primeiro a prévia da imagem principal e depois as referências de apoio, o papel, a nota de uso, o estado de herança, o estado quebrado e os metadados da origem da imagem.
- A seleção na galeria e o upload reaproveitam os controles de imagem existentes. `Generate establishing reference` abre uma prévia; aceitar a imagem e defini-la como principal são ações explícitas.
- Uma cena gerada oferece `Set as location reference` entre as ações de imagem que ela já tem. Ela nunca altera o local só porque a cena foi gerada ali.
- O lore vinculado usa uma divulgação embutida e pesquisável, em vez de uma janela bloqueante. Os resultados agrupam as entradas por lorebook e mostram o estado desativado ou excluído antes do anexo.
- As linhas anexadas oferecem Open entry e Detach. Detach nunca exclui lore, e duplicar a subárvore copia os vínculos.
- O editor de lorebooks mostra os retrolinks do mapa do chat atual, então o criador consegue achar todos os locais que usam uma entrada.
- Os controles do rascunho por IA mostram os livros de origem, o modo de embasamento, as contagens de entradas consideradas e omitidas e a procedência, sem exigir conhecimento técnico de prompts.
- A validação é embutida e também resumida perto de Save. Escolher um item do resumo põe o foco no nó e no campo afetados.
- O editor usa uma cópia de trabalho local e uma única ação Save com revisão. O sinal `editorDirty` protege a navegação. Conflitos no servidor preservam a cópia de trabalho e oferecem Reload server version ou Review differences; não existe sobrescrita às cegas.
- O estado vazio ensina a primeira ação: `Create a starting location`. A ativação fica indisponível até existir um local inicial ativo e válido.
- O carregamento usa o vocabulário de esqueleto de editor já existente. Os estados de salvamento, conflito, arquivado, oculto, bloqueado e inválido usam texto ou ícones além da cor.

As telas de chat do modo proprietário compartilham a `SpatialContextRuntimeBar`:

- A trilha de navegação persistida fica visível acima ou ao lado do campo de entrada, sem cobrir o conteúdo da história.
- O seletor de destinos lista o pai, os filhos e os links diretos em grupos rotulados, preservando a ordem determinística.
- Escolher um destino cria um chip pendente claramente identificado. Isso não move o estado na hora.
- O chip pode ser limpo e sobrevive à troca de chat ou ao recarregamento junto com o rascunho de texto.
- O envio pode conter texto, anexos ou apenas um destino pendente. A transição é dado do pedido e não é acrescentada ao texto visível da mensagem.
- Um destino pendente desatualizado continua visível depois do conflito, marcado como `Needs review`, até o usuário escolher um substituto válido ou limpá-lo.
- Em telas estreitas, a trilha de navegação é truncada no meio, mantém o nome do local atual e expõe o caminho completo por uma divulgação acessível.

O editor e os controles de execução usam os tokens semânticos de tema já existentes, funcionam nos temas escuro, claro e SillyTavern, mantêm alvos de toque de 44px nas ações principais em celular e incluem estados de foco visíveis. A animação fica limitada a transições de estado de 150 a 250 ms e nunca move o leiaute apenas por enfeite.

### Cobertura de portabilidade e ciclo de vida

A exportação nativa de chat do Marinara precisa levar:

- A definição atual em `marinara_metadata`.
- Os snapshots espaciais indexados pelo ordinal da mensagem exportada e pelo índice do swipe, não por nomes de exibição.
- O snapshot de inicialização, quando existir.

A importação cria novos IDs de chat, mensagem e snapshot, preservando os IDs de local dentro da definição. Grafos importados malformados desativam o Contexto Espacial, preservam a definição bruta para reparo e devolvem avisos. Eles nunca são casados por nome nem ativados parcialmente em silêncio.

A exportação JSONL do chat preserva os IDs de local para entrada, porque eles fazem parte da definição, mas não empacota conteúdo de lorebook em silêncio. A importação resolve as referências contra o perfil de destino e informa as entradas ausentes como avisos reparáveis, sem casamento por nome. O backup e a restauração de perfil preservam as referências funcionando, porque levam tanto as definições espaciais quanto as tabelas de lorebook. Um pacote explícito de campanha, no futuro, pode empacotar os lorebooks referenciados para portabilidade entre perfis.

O JSONL do chat também preserva os IDs de local para imagem, os papéis, as notas de uso e a ordenação, mas não embute bytes de imagem. A importação resolve esses IDs contra o perfil de destino e informa as imagens ausentes como avisos reparáveis, sem casamento por caminho ou por nome de arquivo. O backup e a restauração de perfil incluem os registros e os arquivos da galeria do perfil. Um pacote explícito de campanha, no futuro, pode oferecer `Include location images`, com contagem de recursos, tamanho total e um lembrete de licenciamento antes da exportação.

Quando o ciclo de vida já existente do Storyboard é exportado ou copiado, o manifesto visual dele preserva o ordinal e o swipe da mensagem de origem, o ID do local resolvido, os IDs de imagem candidatos e a ordenação dos quadros-chave, sem embutir bytes. A importação remapeia os IDs de mensagem e de storyboard, resolve os IDs de imagem da galeria no perfil de destino e marca os recursos ausentes como `needs_review`. Storyboards legados sem manifesto resolvem um a partir da mensagem e do swipe de origem salvos na primeira regeneração; eles nunca recorrem a casamento por nome nem ao local mais recente do chat.

O backup e a restauração de perfil incluem a nova tabela por `FILE_BACKED_TABLES`. A exclusão de chat, a exclusão em massa, o expurgo, a exclusão de ramificação, a exclusão de swipe e a exclusão de mensagem seguem os caminhos de cascata e de limpeza de aplicação já existentes. Os chats existentes não precisam de migração antecipada, porque a ausência de metadados significa Contexto Espacial desativado.

### Pacotes de trabalho e ordem de mesclagem

#### Pacote A: contrato central e prova de conceito

- Acrescentar os tipos compartilhados, os schemas, os utilitários puros de grafo, os limites, as fixtures e os códigos de erro estáveis.
- Acrescentar um arcabouço temporário de prova para transações de tamanho constante contra o armazenamento nativo em arquivo. Não manter arquivos `.test.ts`.
- Comprovar o resolvedor de estado com fixtures de inicialização, swipe visível, ponto de ramificação anterior, local atual histórico arquivado e definição desatualizada.
- Medir os tamanhos de projeção para grafos rasos, de profundidade 20, largos de 500 nós, com textos longos e com links.

Critério de liberação: a semântica do grafo, os limites da projeção, as âncoras dos snapshots e a viabilidade da transação estão demonstrados antes de o trabalho de interface começar.

#### Pacote B: API de definição e armazenamento

- Acrescentar o schema, a migração, o registro com backend em arquivo, o adaptador de armazenamento, o GET e o PUT com revisão.
- Acrescentar a substituição do local atual nas operações de arquivamento.
- Ligar a exclusão, o deslocamento de swipe e o backup/restauração de perfil.
- Acrescentar cobertura de regressão no servidor para conflitos de revisão, grafos inválidos, erros ocultos e reutilização de comando.

Critério de liberação: definições e snapshots fazem o ciclo completo nos dois backends de armazenamento, e escritas inválidas não deixam estado parcial.

#### Pacote C: integração do turno do modo proprietário com o histórico

- Estender o pedido de geração com `pendingSpatialTransition`.
- Acrescentar a persistência atômica do turno do modo proprietário e a materialização no swipe do assistente.
- Integrar regeneração, continuação, swipes ativos, ramificações e checkpoints do Game.
- Acrescentar a exportação/importação nativa de chat com definições e snapshots.

Critério de liberação: recarregamento, falha do provedor, troca de swipe, ramificação em mensagem anterior, importação/exportação e restauração de checkpoint resolvem o local esperado.

#### Pacote D: projeção de prompt e autoridade do Game

- Acrescentar a projeção estruturada e os formatadores delimitados.
- Integrar a geração ao vivo, o GM do Game, a execução simulada, o Peek Prompt ao vivo, as repetições e as continuações.
- Aplicar o limite de compatibilidade com o Game e a exibição da trilha de navegação no tracker.
- Acrescentar os controles negativos de privacidade e de locais inativos.

Critério de liberação: todos os caminhos de prompt contêm o mesmo bloco espacial, nenhum texto de local sem relação vaza, e o Game não consegue manter um local concorrente com autoridade.

#### Pacote E: navegador e editor de mapas

- Acrescentar os hooks do React Query, o mapeamento de conflitos, o resumo nas configurações e a rota do editor carregada sob demanda.
- Acrescentar os fluxos de hierarquia, mapa local, camadas, lista, prévia, inspetor e duplicação de subárvore.
- Acrescentar estados acessíveis para desktop e celular.
- Preservar as edições não salvas em conflitos de revisão.

Critério de liberação: os criadores conseguem construir e reparar mapas aninhados sem arrastar, passar o mouse ou usar entrada de precisão.

#### Pacote E.1: rascunho de mapa assistido por IA

- Acrescentar um gerador sob demanda, no momento da configuração, que use o contexto delimitado de configuração do Game ou do Roleplay, nunca alteração implícita no meio do turno.
- Gerar um plano de mapa simplificado e com chaves, depois atribuir IDs estáveis, reparar omissões seguras de leiaute e validar a definição completa no servidor.
- Mostrar a prévia da hierarquia gerada como um rascunho local, antes de substituir o estado do editor.
- Exigir ações explícitas de Apply e Save; a geração nunca ativa o Contexto Espacial nem escreve uma definição por conta própria.
- Manter o histórico de conversa comum fora do prompt de geração e expor os prompts finais no log de depuração.

Critério de liberação: um criador sem conhecimento técnico consegue descrever um mundo, receber um mapa aninhado válido, inspecioná-lo e recusá-lo ou aplicá-lo sem mudar o estado persistido até Save.

#### Pacote E.1.1: expansão de mapa por IA segura em relação ao histórico

- Tratar a criação de mapa inteiro por IA como um fluxo de pré-campanha. Assim que existir histórico espacial ligado a mensagens, preservar cada ID de local existente no servidor.
- Substituir o gerador de campanha ativa por um fluxo de expansão que só acrescenta, com escopo em um local ativo selecionado.
- Preservar o local atual, o local inicial, as descrições existentes, os links, o leiaute, os nós arquivados e os vínculos futuros do Game. Atribuir novos IDs estáveis apenas aos locais acrescentados.
- Manter a expansão baseada no contexto delimitado de configuração e do local selecionado, e não no histórico comum de turnos.
- Mostrar a prévia dos locais novos como um rascunho local e manter o limite já existente entre Apply e Save.
- Permitir a substituição do mapa inteiro só antes de existir histórico espacial confirmado, tendo a expansão como padrão mais seguro quando já há um mapa.

Critério de liberação: a IA consegue fazer crescer o mapa de uma campanha ativa sem deixar snapshots de turno órfãos, sem mudar o local atual e sem substituir IDs existentes.

#### Pacote E.2: opção de mapa no assistente de configuração do Game

- Acrescentar uma escolha opcional `Draft a hierarchical world map` à etapa **Features** já existente, com uma seleção simples de tamanho.
- Rodar a geração do mapa só depois de `/game/setup` persistir a visão geral do mundo e o arco da história. Não é preciso um turno de jogo.
- Manter a configuração visivelmente ocupada enquanto o rascunho seguinte é gerado, inclusive depois de aplicar uma carga de configuração reparada.
- Abrir a prévia normal da IA e o editor de mapas depois da geração. Skip volta para o jogo, Apply muda só a cópia de trabalho e Save continua sendo o limite de persistência.
- Se a geração do mapa falhar, preservar o jogo criado com sucesso, explicar a falha e deixar o criador montar um mapa depois pelo Chat Settings.
- Não embutir o editor de mapas completo no assistente de configuração estreito, nem ativar e persistir uma definição gerada em silêncio.

Critério de liberação: um criador consegue pedir um mapa inicial mais rico durante a configuração, sem gerar a partir de um estado local incompleto do assistente e sem pular a revisão.

#### Pacote F: interface de execução do Roleplay e do Game

- Acrescentar a barra de execução compartilhada e a persistência da transição pendente por chat.
- Integrar os caminhos de envio do Roleplay e do Game sem alterar o texto visível da mensagem.
- Acrescentar controles explícitos de vínculo de mapa, célula e nó do Game.
- Selecionar os mapas vinculados depois das transições aceitas, preservando a movimentação tática não vinculada.

Critério de liberação: Roleplay e Game conseguem mover, se recuperar de estado desatualizado, recarregar, trocar de chat e usar o recurso com teclado e toque.

#### Pacote F.1: vínculos de lorebook por local e ativação em execução

- Estender o schema compartilhado e a cópia de trabalho do editor com `lorebookEntryIds` delimitado.
- Acrescentar controles embutidos de anexo no mapa, retrolinks de lorebook e avisos de referência quebrada.
- Estender o processamento compartilhado de lorebook com IDs de candidatos forçados, deduplicação por fonte de ativação, exclusões e o teto reservado de lore de local.
- Integrar o mesmo resolvedor aos caminhos de Roleplay, GM do Game, execução simulada e Peek Prompt ao vivo.
- Acrescentar o relato de fonte e de truncamento ao Active Context.
- Preservar os IDs de referência nos fluxos de ramificação e de exportação/importação JSONL, e avisar quando faltar lore no destino.

Critério de liberação: mover entre locais ativa apenas o lore anexado e ativado do destino em todos os caminhos de prompt do modo proprietário, sem inserção duplicada nem vazamento para a Conversation.

#### Pacote F.2: rascunho de mapa embasado em lorebook

- Acrescentar o modo de embasamento e a seleção explícita de fontes aos pedidos de criar, substituir e expandir.
- Montar o catálogo de fontes delimitado a partir dos lorebooks selecionados, e não de uma varredura comum do chat.
- Validar as chaves de origem temporárias e vincular automaticamente as entradas válidas aos nós gerados.
- Mostrar a procedência Lore-backed, Inferred e Added by AI, com inspeção da fonte na prévia do rascunho.
- Exigir nós apoiados na fonte no Strict canon e acréscimos sem respaldo visíveis no Canon with expansion.
- Preservar a expansão que só acrescenta, segura em relação ao histórico, e o limite de revisão já existente entre Apply e Save.

Critério de liberação: os fatos dos lorebooks selecionados embasam diretamente a hierarquia gerada, cada local sem respaldo fica visível antes de Save, e o modo estrito não consegue persistir um nó gerado sem referência.

#### Pacote F.3: identidade visual do local e referências de arte de cena

- Acrescentar o texto delimitado de identidade visual e os vínculos estáveis com a galeria do perfil ao schema de local e à cópia de trabalho do editor.
- Acrescentar o editor embutido de identidade visual, os papéis principal e de apoio, a herança explícita de estilo, os retrolinks da galeria e o reparo de referências quebradas.
- Acrescentar os controles paralelos, por chat, de uso pelo provedor no Illustrator e no Game, com consentimento na primeira imagem principal e padrões desativados por compatibilidade.
- Acrescentar a geração sob demanda de referências de ambientação e a promoção explícita de cenas geradas já revisadas.
- Resolver o local aplicável da mensagem e do swipe nos pedidos de arte de cena do Illustrator no Roleplay e do Game.
- Mesclar de forma determinística os candidatos explícitos, de local, de personagem, de persona e de estilo herdado dentro do limite já existente de cada provedor, com motivos de omissão visíveis.
- Preservar os IDs e os metadados em ramificações e no JSONL, incluir os binários no backup e na restauração de perfil e acrescentar controles negativos para os prompts de história e para a Conversation.

Critério de liberação: arte repetida em um mesmo local consegue reaproveitar uma identidade de lugar já revisada, com trocas determinísticas e visíveis em relação às referências de personagem; a arte de mensagens antigas resolve o local histórico dela; e nenhum dado exclusivo de imagem vaza para prompts de texto.

#### Pacote F.3.1: manifestos de referências visuais do Storyboard

- Manter o F.3.1 como consumidor a jusante do F.3 e como uma mudança revisável em separado; ele não amplia o critério de persistência do F.3.
- Acrescentar aos metadados do Storyboard um banco de referências congelado e um manifesto ordenado de carga por quadro-chave.
- Ancorar a resolução do local na mensagem e no swipe de origem do Storyboard e depois reaproveitar o mesmo candidato de lugar entre os quadros dele.
- Escolher as referências de personagem e persona a partir da lista de personagens visíveis de cada quadro-chave e nunca gastar capacidade com quem está fora de cena.
- Aplicar de forma determinística as prioridades explícita, de slot único, de múltiplos slots, de apoio e de estilo herdado pelo resolvedor de capacidade do provedor já existente.
- Acrescentar Visual sources progressivo, motivos de omissão, conflitos de revisão necessária e Refresh references explícito à prévia e à regeneração.
- Preservar o comportamento legado do Storyboard quando o Contexto Espacial estiver desativado ou quando não existir referência de local elegível.

Critério de liberação: regenerar um quadro-chave reaproveita a carga congelada dele, as seleções de local e de personagem são historicamente corretas e inspecionáveis, e mudar a capacidade do provedor não altera um storyboard existente em silêncio.

#### Pacote G: Conversation conectada

- Implementar só depois de os pacotes A até F.3.1 estarem estáveis.
- Resolver o chat proprietário vinculado na hora da geração e usar o formatador de projeção reduzida.
- Acrescentar a redação conservadora de presença e a interface de somente leitura.
- Comprovar o comportamento de desvinculação, revinculação, proprietário excluído, links recíprocos malformados, ciclos e histórias concluídas.

Critério de liberação: a Conversation nunca recebe memória privada do modelo, IDs internos, destinos ocultos, IDs ou conteúdo do lore anexado ao local, IDs ou conteúdo das referências visuais do local, nem qualquer capacidade de alteração.

A movimentação pedida pelo modelo, os modelos do criador, os pacotes portáteis de campanha, a inferência de imagem para mapa, a geração em massa de arte de local, a seleção automática de referências de personagem em várias vistas e as posições por personagem continuam sendo pacotes separados e posteriores, depois de o trabalho de embasamento no modo proprietário, de identidade visual e de manifesto do Storyboard entrar no ar.

### Limites de issues e pull requests

Este é um recurso grande dentro do fluxo do repositório. Antes de começar a implementação do Pacote A:

1. Confirme ou abra a issue única de acompanhamento e deixe a titularidade visível ali.
2. Verifique se já existe um branch ligado à issue, um pull request em rascunho ou um item no quadro do projeto.
3. Abra um pull request em rascunho contra `staging` assim que a implementação começar.
4. Use os pacotes de trabalho como limites de PR revisáveis sempre que for prático; não junte o MVP do modo proprietário e a Conversation conectada só para reduzir a quantidade de PRs.

Divisão de issues sugerida:

1. Núcleo compartilhado, persistência e API de definição do Contexto Espacial.
2. Snapshots de turno do modo proprietário, swipes, ramificações, checkpoints e portabilidade.
3. Projeção de prompt no modo proprietário e compatibilidade com o Game.
4. Editor do modo proprietário e interface de movimentação em execução.
5. Vínculos de lorebook por local e ativação em execução no modo proprietário.
6. Rascunho de mapa embasado em lorebook.
7. Identidade visual do local e resolução de referências para arte de cena.
8. Manifestos congelados de referências visuais do Storyboard.
9. Projeção de somente leitura da Conversation conectada.
10. Movimentação pedida pelo modelo.

### Matriz de provas

| Afirmação | Prova automatizada | Prova manual |
| --- | --- | --- |
| A ativação de lore por local é exata e delimitada | As fixtures cobrem movimentação aceita, movimentação pendente e rejeitada, entradas desativadas e excluídas, fontes de ativação duplicadas, truncamento de tokens, recarregamento, swipes e ramificações | Mova entre dois locais com lore diferente no Roleplay e no Game e depois inspecione o Active Context e o Peek Prompt |
| O embasamento em lorebook é inspecionável | As fixtures do modo estrito rejeitam nós sem referência; as fixtures de expansão preservam as chaves de origem validadas e rotulam os nós sem respaldo; os tetos do catálogo e as contagens de omissão são determinísticos | Faça um rascunho a partir de um lorebook grande, abra os trechos de origem, compare Strict canon e Canon with expansion e recuse um local inventado |
| A arte de local se mantém consistente e delimitada | As fixtures cobrem seleção do local exato, resolução em swipe histórico, herança explícita de estilo, imagens ausentes, limites do provedor, tipos de pedido e motivos determinísticos de omissão | Defina uma referência principal, gere várias cenas de Game e de Roleplay no mesmo lugar, vá para outro local, repita a arte em um swipe antigo e inspecione a prévia de fontes visuais |
| As referências do Storyboard são reproduzíveis | As fixtures cobrem ancoragem no swipe de origem, bancos congelados, seleção por personagem visível, provedores de slot único e de múltiplos slots, recursos ausentes, capacidade de substituição menor e maior, manifestos legados e atualização explícita | Gere um storyboard de vários quadros, mude de local, troque um personagem e a imagem principal do local, regenere antes e depois de Refresh references e inspecione Visual sources em todos os quadros |
| A validação do grafo é determinística | Script dedicado de regressão espacial com fixtures positivas e negativas | Inspecione os erros embutidos do editor para nós inválidos representativos |
| A movimentação e a mensagem do usuário são atômicas | Falha de armazenamento injetada antes e depois de cada escrita da transação, nos dois backends | Force uma revisão desatualizada com um rascunho e um destino pendentes |
| O histórico restaura o local certo | Regressão de snapshot cobrindo recarregamento, swipes, regeneração, corte de ramificação e checkpoint | Percorra cada fluxo no Roleplay e no Game |
| Os caminhos de prompt concordam entre si | Compare os blocos normalizados do utilitário de geração, da execução simulada e do Peek Prompt ao vivo | Inspecione o Peek Prompt e a saída de depuração de um chat por modo proprietário |
| O contexto se mantém delimitado | Fixtures largas e com textos longos verificam os tetos de caracteres e de destinos | Inspecione uma hierarquia profunda e larga no editor e no seletor de destinos |
| A privacidade se mantém | Verificações negativas para memória privada, links ocultos, nós inativos, descrições sem relação, IDs e conteúdo do lore anexado ao local e todos os campos e bytes de referência visual do local | Vincule um chat de Conversation e inspecione as prévias de pedido de texto e de imagem dele na Fase 3 |
| O Game tem uma única autoridade de local | Rejeite os patches legados; valide as transições vinculadas; preserve a movimentação não vinculada | Tente editar o tracker, mover em mapas vinculados e não vinculados, carregar um checkpoint, ativar e desativar |
| A interface é resiliente | Fluxo Playwright de criação, edição, movimentação pendente, conflito e navegação no celular | Verifique os temas escuro, claro e SillyTavern, teclado, toque, nomes longos e estados vazios |
| A portabilidade preserva IDs e estado | Os ciclos de exportação/importação nativa e de backup/restauração de perfil cobrem os vínculos espaciais, de lore, de imagem e de manifesto do Storyboard; lore ou imagens ausentes no destino produzem avisos | Exporte um chat ramificado com um storyboard, importe-o com e sem os lorebooks e os recursos da galeria e inspecione a trilha de navegação, o histórico, os vínculos, as fontes congeladas dos quadros-chave e os avisos |

Acrescente `scripts/regressions/spatial-context.regression.ts` e um script `regression:spatial` no pacote, e depois inclua-o em `pnpm regression`. Não acrescente arquivos `.test.ts` permanentes. Cada PR de implementação ainda roda a regressão espacial estreita mais as verificações do repositório adequadas ao escopo dela.

## Critérios de aceitação

- Um local do mapa guarda referências a entradas de lorebook, nunca conteúdo de lore copiado.
- Um local guarda metadados opcionais de identidade visual e referências estáveis a imagens da galeria, nunca caminhos brutos, URLs externas ou bytes de imagem.
- Os perfis de estilo de imagem controlam o estilo de renderização, as referências de local controlam a identidade do lugar, e as referências de personagem ou persona controlam a identidade do sujeito.
- Os pedidos elegíveis de arte de cena resolvem o local exato da mensagem e do swipe deles, inclusive em repetições históricas, e nunca casam um local por aproximação de nome.
- A arte gerada só vira referência de local depois de uma ação explícita do criador.
- As referências de leiaute nunca entram automaticamente na geração comum de cenas, e só as referências de estilo podem ser herdadas pelos descendentes.
- Os prompts de texto e a Conversation conectada não recebem IDs, bytes, caminhos nem notas exclusivas de imagem das referências visuais de local.
- O Storyboard resolve o local pela mensagem e pelo swipe de origem dele, congela o banco de referências e as cargas ordenadas por quadro-chave e reaproveita tudo isso na regeneração, até uma atualização explícita.
- Cada quadro-chave do Storyboard escolhe referências apenas para o local resolvido e para as pessoas visíveis dele; quem está fora de cena nunca consome capacidade.
- O comportamento de provedores de slot único e de múltiplos slots é determinístico e visível, e trocas de provedor nunca acrescentam, removem ou substituem referências congeladas em silêncio.
- Os manifestos do Storyboard guardam IDs estáveis e metadados, nunca bytes de imagem ou caminhos do sistema de arquivos.
- Storyboards legados sem manifesto nunca usam casamento por nome de local nem o local mais recente do chat como reparo implícito.
- Só o local atual exato e aceito força a ativação do lore anexado, sujeito às regras de desativação, exclusão, deduplicação, ordenação, limite de entradas e orçamento de tokens.
- O Active Context identifica a ativação pelo local atual, as fontes de ativação combinadas e o truncamento determinístico.
- O rascunho embasado lê diretamente as entradas de lore escolhidas explicitamente, em vez de depender de varreduras por palavra-chave ou de resumos gerados da visão geral do mundo.
- O Strict canon produz apenas locais apoiados na fonte; o Canon with expansion rotula todo acréscimo inferido ou sem respaldo antes de Save.
- A Conversation conectada não recebe IDs nem conteúdo do lore anexado ao local.
- As operações de renomear e mudar de pai preservam a identidade do local.
- Grafos inválidos e escritas desatualizadas nunca alteram o estado.
- A movimentação é confirmada junto com um turno do usuário, ou não é confirmada.
- Recarregar, escolher um swipe, ramificar em uma mensagem anterior e restaurar um checkpoint do Game resolvem o local correto.
- Os prompts do modo proprietário contêm apenas o contexto do local ativo e os destinos válidos.
- O Game não exibe nem usa em prompts um local em texto livre concorrente quando o recurso está ativado.
- Os mapas existentes do Game conseguem ser vinculados explicitamente a locais da hierarquia sem quebrar a movimentação tática.
- Roleplay e Game usam a mesma hierarquia e as mesmas regras de transição.
- A execução simulada e o Peek Prompt usam o mesmo comportamento de projeção da geração.
- Os chats existentes e o Contexto Espacial desativado mantêm o comportamento atual.
- A Conversation não pode ser dona do estado espacial nem alterá-lo.
- A memória privada do modelo nunca entra na projeção da Conversation.

## Validação

A cobertura determinística precisa incluir limites do grafo, ciclos, direções de navegação, links ocultos e bloqueados, revisões desatualizadas, idempotência, pontos de ramificação, swipes, checkpoints, limites de referência de lorebook, ativação forçada, exclusões, deduplicação, truncamento de tokens, tetos do catálogo de embasamento, validação de chaves de origem, rejeição no modo estrito, procedência, limites de referências visuais, regras de imagem principal e de herança, resolução visual histórica, corte pelo provedor, avisos de imagem ausente, exclusões por tipo de pedido, ancoragem na origem do Storyboard, regeneração com manifesto congelado, filtragem por personagem visível, seleção de slot único e de múltiplos slots, mudanças de capacidade do provedor, atualização explícita, comportamento alternativo para manifestos legados, limites de privacidade e controles negativos de locais inativos.

Verificações do repositório:

```bash
pnpm check
pnpm regression:prompt
pnpm smoke:ui
```

A verificação manual cobre a criação em desktop e celular, trilhas de navegação profundas, camadas, mapas posicionados, nomes longos, recuperação de conflito, proteções de arquivamento, Roleplay, Game, movimentação em mapas vinculados e não vinculados, recarregamento, ramificação, restauração de checkpoint, anexo de lore vinculado e retrolinks, lore desativado e quebrado, avisos de omissão em fontes grandes, prévias de Strict canon e Canon with expansion, upload visual e seleção na galeria, referências principais e de apoio, promoção explícita de cena, estilo herdado, imagens quebradas, relato de omissão do provedor, arte em swipe histórico, Visual sources do Storyboard, provedores de slot único e de múltiplos slots, regeneração congelada, revisão por mudança de provedor, atualização explícita, Storyboards legados, Active Context e Peek Prompt. As caixas de validação do PR continuam desmarcadas para a verificação humana.

## Adiado

- Movimentação imediata sem um turno de chat
- Posições independentes por personagem
- Flags, eventos ou scripts genéricos
- Modelos de local e pacotes de cenário
- Conhecimento espacial por personagem
- Lore de local compartilhável na Conversation
- Inferência automática de imagem para mapa
- Promoção automática de cenas geradas ao cânone do local
- Geração em massa de arte de referência para todos os locais
- Seleção automática, ciente do enquadramento, entre várias roupas, ângulos, expressões e referências de detalhe dos personagens
- Geração de referências compostas ou em folha de contatos específicas de cada provedor
