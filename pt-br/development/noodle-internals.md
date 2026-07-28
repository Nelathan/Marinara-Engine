# Detalhes internos dos prompts do Noodle (desenvolvedores)

Referência para quem desenvolve: onde ficam no código os prompts de geração do Noodle, como personalizá-los e como depurar o prompt final. O prompt é o texto que Marinara envia para a IA. Quem usa o aplicativo configura o Noodle pelo painel **Settings** (Configurações); veja os guias do Noodle em `docs/noodle/`.

## Mapa das fontes dos prompts

Hoje o Noodle tem um prompt de geração de texto embutido no código, uma substituição de prompt de texto registrada e uma substituição de prompt de imagem registrada.

| Finalidade | Fonte | Símbolo principal | Como personalizar |
| ----------------------------------------------------------- | ------------------------------------------------------------------ | ----------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| Posts, respostas, seguidas, enquetes, votos e resumos da linha do tempo | `packages/server/src/routes/noodle.routes.ts` | `buildRefreshPrompt()` | Edite no código as mensagens de sistema e de contexto embutidas. A parte de tom e liberdade criativa fica a cargo da substituição **Noodle Timeline Voice & Tone**, descrita abaixo; o resto (as regras de formato de saída, críticas para o schema) não pode ser alterado pela interface. |
| Instruções de voz e tom da linha do tempo (parte do prompt de sistema) | `packages/server/src/services/prompt-overrides/registry/noodle.ts` | `NOODLE_TIMELINE_VOICE` (`noodle.timelineVoice`) | Edite em **Settings -> Generations -> Image Generation Prompt Overrides -> Noodle Timeline Voice & Tone** ou altere no código o padrão registrado (`noodleTimelineVoiceDefaultText(enhanced)`, em `noodle-prompt.ts`). O escopo foi limitado ao tom de propósito: os limites de ações estruturadas, as regras do campo de destino e as demais instruções críticas para o schema continuam fixas no código, fora dessa substituição, para que uma reescrita não quebre a leitura de `noodleGeneratedRefreshSchema`. Sem edição, o padrão acompanha a configuração `enableEnhancedTimelineWriting` do Noodle (`ctx.enhanced`; desativada, ela reproduz a instrução de tom original de uma linha só). Depois que o usuário salva o próprio texto de substituição, esse texto prevalece, independentemente da configuração. |
| Perfis das contas de personagem criados na primeira vez | `packages/server/src/routes/noodle.routes.ts` | `generateMissingNoodleProfiles()` | Edite no código as mensagens de sistema e de usuário embutidas. A seleção de participantes acontece antes, e só as contas de personagem selecionadas sem `profileGenerated` chegam a esse prompt. |
| Prompt da imagem gerada para o post | `packages/server/src/services/prompt-overrides/registry/noodle.ts` | `NOODLE_IMAGE_POST` (`noodle.imagePost`) | Edite em **Settings -> Generations -> Image Generation Prompt Overrides -> Noodle Post Image** ou altere no código o padrão registrado. |
| Instruções de imagem padrão específicas do Noodle | `packages/shared/src/schemas/noodle.schema.ts` | `DEFAULT_NOODLE_SETTINGS.imageGenerationPrompt` | Altere a configuração do Noodle pela interface ou o padrão do schema no código. |
| Contexto de chat autorizado que entra na geração da linha do tempo | `packages/server/src/routes/noodle.routes.ts` | `buildOptedInChatContext()` | Altere no código a montagem do contexto; a autorização continua nas configurações de cada chat. |
| Imagens de entrada dos posts e respostas da linha do tempo | `packages/server/src/services/noodle/noodle-vision.ts` | `prepareNoodleVisionAttachments()` | Altere no código a seleção de imagens, a normalização, os limites ou a alternativa somente texto para provedores incompatíveis. |
| Atividade do Noodle inserida nos prompts do chat | `packages/server/src/services/noodle/noodle-context.ts` | `buildRecentSocialMediaActivityBlock()` | Altere no código a filtragem ou a montagem do bloco; quem usa o aplicativo controla os modos de destino e o limite de itens nas configurações do Noodle, e o bloco montado tem um teto rígido de 8.192 tokens (o token é um pedacinho de texto). |
| Contrato do JSON gerado | `packages/shared/src/schemas/noodle.schema.ts` | `noodleGeneratedRefreshSchema` | Altere apenas junto com o prompt, o processamento da rota, os tipos compartilhados e a cobertura de regressão. |
| Contexto de mundo e lore do lorebook inserido na geração da linha do tempo | `packages/server/src/routes/noodle.routes.ts` | `buildRefreshPrompt()` (chama `processLorebooks()`) | Depende da configuração **Lorebook context** do Noodle (`enableLorebookContext`, desativada por padrão). Reaproveita o mesmo `processLorebooks()` multipersonagem usado pelos chats em grupo, com um orçamento de tokens específico do Noodle vindo de `noodleLorebookTokenBudget()`, em `noodle-prompt.ts`, ajustado pela quantidade de personagens ativos e limitado a 8.192 tokens. Roda com `previewOnly: true`, já que o Noodle não tem um espaço por chat para salvar o estado de tempo de fixação e recarga. |

Os prompts da linha do tempo e dos perfis ainda não aparecem na interface de substituições de prompt. O modelo **Noodle Post Image** é o único prompt de geração do Noodle exposto ali. O campo **Prompt instructions** (instruções do prompt), local do Noodle, entra nesse modelo de imagem; ele não altera o prompt de escrita da linha do tempo.

A rota de imagem carrega `NOODLE_IMAGE_POST` e passa o resultado por `compileImagePrompt()` antes de enviá-lo ao provedor de imagens. Ou seja, o perfil de estilo de imagem escolhido e os padrões da conexão também influenciam a requisição final.

## Como inspecionar o prompt final

Uma atualização manual feita com o **Debug Mode** (modo de depuração) ativado registra, pelo logger compartilhado do servidor, as mensagens finais de perfil e de linha do tempo enviadas ao modelo. Procure por:

```text
[debug/noodle] Profile prompt sent to model
[debug/noodle] Prompt sent to model
[debug/noodle] Attached N timeline image input(s) to the refresh prompt
```

As imagens da linha do tempo nunca vão em base64 para o log de depuração. O texto registrado traz as mesmas chaves de anexo de post e resposta enviadas ao modelo, mais a quantidade de imagens de entrada nativas. O Noodle normaliza e limita essas entradas em `noodle-vision.ts`. Se um provedor recusar explicitamente conteúdo de visão, a rota registra o fato e envia a alternativa somente texto já montada.

No caso das imagens, ative **Expose media prompts before sending** em **Settings -> Generations -> Image Generation** para inspecionar e editar os prompts positivo e negativo já compilados antes do envio.

## Como editar com segurança

A montagem do prompt é uma fronteira de compatibilidade de alto risco. Ao mexer nela, mantenha alinhados o prompt, `noodleGeneratedRefreshSchema`, o processamento da rota e as regressões de menção e de enquete do Noodle. Rode no mínimo:

```bash
pnpm check
pnpm regression:prompt
pnpm regression:noodle
```

## Guias relacionados

- [Noodle: a linha do tempo social dentro do aplicativo](../noodle/overview.md)
- [Configurações do Noodle e transferência para os chats](../noodle/settings.md)
- [Mapa da arquitetura (desenvolvedores)](architecture-map.md)
