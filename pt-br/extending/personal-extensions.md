# Extensões pessoais

As extensões pessoais são rascunhos de código privados que a Professor Mari cria para você. Abra a seção **Settings** (Configurações) > **Addons** > **Personal Extensions**.

A mensagem padrão é:

> Ask Professor Mari to create an extension for you. Nothing runs until you enable it and approve the exact code hash.

Nesta seção não existe a ação New Draft nem controles de importação. Peça à Professor Mari para criar ou revisar um rascunho. Ela consegue salvar o código, mas não consegue aprová-lo nem ativá-lo.

## Revisar e ativar

Todo rascunho começa desativado. Marinara gera uma impressão digital SHA-256 do código executável exato. Abra o rascunho, examine o código, compare o hash exibido e só então escolha **Review and Run** (revisar e executar), se você aceitar aquela versão exata. Qualquer alteração no código executável, ou a restauração de uma revisão, desativa a extensão e exige uma nova aprovação.

O sandbox reduz os poderes do código, mas não torna confiável um código qualquer. Uma extensão maliciosa ainda pode consumir CPU até o watchdog interrompê-la, encher o próprio armazenamento dentro dos limites impostos ou agir de forma enganosa nos logs. Revise o código sempre antes de ativar.

## Isolamento em execução

Uma Browser Extension roda em um Worker dedicado, dentro de um iframe em sandbox com origem opaca. Ela não tem acesso à página do Marinara, ao DOM, aos cookies, ao armazenamento do navegador, às APIs da origem nem à rede. Os recursos dela são: armazenamento privado da extensão, logs, temporizadores gerenciados, registro de limpeza, janelas restritas e pontos seguros de contribuição para a interface.

As extensões podem acrescentar ações na barra superior, itens no menu Extensions e painéis fixos do lado direito com `marinara.ui.registerContribution(...)`. Marinara desenha essas superfícies com o tema ativo e um conjunto fixo de controles: títulos, texto, saída pré-formatada, botões, campos de texto, listas de seleção, botões liga/desliga, controles deslizantes, controles de cor e espaçadores. A extensão fornece conteúdo e estado, nunca HTML, CSS, URLs, componentes React ou manipuladores de evento do aplicativo.

Esses recursos e regras de interface são idênticos para toda Browser Extension, venha ela de onde vier. Uma External Extension importada de terceiros ganha a mesma API de contribuição depois de passar pelas autorizações no arquivo `.env` e na seção **Danger Zone**, mais a aprovação por hash exato. Mesmo assim, ela continua sem alcançar o DOM nem as APIs do Marinara.

### Adicionar um painel desenhado por Marinara

```js
const panel = marinara.ui.registerContribution({
  id: "weather-settings",
  kind: "panel",
  label: "Weather controls",
  description: "Tune a weather scene without leaving Marinara.",
  icon: "sparkles",
  elements: [
    { kind: "heading", text: "Atmosphere" },
    {
      kind: "select",
      id: "weather",
      label: "Weather",
      value: "rain",
      options: [
        { value: "rain", label: "Rain" },
        { value: "snow", label: "Snow" },
        { value: "aurora", label: "Aurora" },
      ],
    },
    { kind: "slider", id: "intensity", label: "Intensity", min: 0, max: 100, value: 60 },
    { kind: "toggle", id: "lightning", label: "Lightning", checked: false },
    { kind: "color", id: "tint", label: "Tint", value: "#6d8cff" },
    { kind: "button", id: "apply", label: "Apply" },
  ],
  onActivate: async () => {
    const settings = await marinara.storage.get();
    // Update the panel when stored state should be reflected in the controls.
  },
  onEvent: async ({ elementId, values }) => {
    if (elementId !== "apply") return;
    await marinara.storage.patch(values);
  },
});

marinara.onCleanup(() => panel.remove());
```

Use `kind: "button"` para uma ação compacta na barra superior ou no menu Extensions, e `kind: "menu-item"` para uma ação que só aparece no menu. Os dois chamam `onActivate`. Um `panel` chama `onActivate` ao ser aberto; os botões dele chamam `onEvent` com os valores atuais de todos os controles do painel. O identificador retornado aceita `update({ label?, description?, icon?, elements? })` e `remove()`. Os IDs podem conter letras, números, `.`, `_` e `-`.

Ferramentas complexas montam interfaces de várias etapas atualizando os elementos do painel depois de um evento. Mantenha o estado da aplicação em `marinara.storage`; não o codifique na marcação.

### Portes de extensões antigas

Controladores de clima, editores de prompt e outros fluxos de trabalho robustos são casos de uso válidos para contribuições. Os portes seguros deles podem usar um item de menu ou um botão na barra superior, mais painéis atualizados aos poucos. Pacotes existentes que inserem sobreposições no DOM, consultam seletores CSS do Marinara, percorrem as entranhas do React ou chamam rotas `/api` da mesma origem não podem ser importados sem alteração para o ambiente seguro.

As contribuições de interface dão a interface, não poderes gerais. Recursos que precisam de chats, presets, lorebooks, personagens, personas ou efeitos visuais de cena também precisam de um intermediário dedicado, exposto por Marinara e aprovado explicitamente pelo usuário. Enquanto esse recurso não existir, a extensão não pode simulá-lo com acesso ao DOM do aplicativo nem com requisições de rede sem restrição.

A API mais antiga `marinara.ui.showWindow(...)` continua disponível para abrir uma janela temporária dentro do iframe de origem opaca. Ela usa os mesmos controles fixos e devolve os identificadores `update(...)` e `close()`. Prefira as contribuições quando a ferramenta precisar estar ao alcance da navegação normal do Marinara.

Uma Server Extension roda em um processo Node separado, com permissões restritas, dentro do Seatbelt no macOS ou do Bubblewrap no Linux. Ela não tem acesso aos arquivos do Marinara, aos arquivos do usuário, aos segredos herdados do servidor, à rede, a processos filhos, a workers nem a addons nativos. Se Marinara não conseguir estabelecer um sandbox de sistema compatível, as Server Extensions ficam desativadas.

### Plataformas compatíveis

As Browser Extensions são isoladas pelo próprio navegador, então funcionam em qualquer lugar. As Server Extensions precisam de um sandbox de sistema compatível; onde não houver um, elas ficam desativadas e não podem ser ativadas – Marinara nunca recorre a executá-las fora do sandbox.

| Plataforma              | Browser Extensions | Server Extensions                     |
| ----------------------- | ------------------ | ------------------------------------- |
| macOS                   | ✅ Em sandbox       | ✅ Em sandbox (Seatbelt)               |
| Linux (com Bubblewrap) | ✅ Em sandbox       | ✅ Em sandbox (Bubblewrap)             |
| Linux (sem `bwrap`) | ✅ Em sandbox       | ⛔ Desativadas – instale o `bwrap`         |
| Windows                 | ✅ Em sandbox       | ⛔ Desativadas – use uma Browser Extension |
| Android                 | ✅ Em sandbox       | ⛔ Desativadas – use uma Browser Extension |

No Windows e no Android não existe sandbox de processo compatível no sistema, então as Server Extensions ficam indisponíveis por decisão de projeto. Use uma Browser Extension no lugar delas, ou rode o servidor do Marinara no macOS ou no Linux (com `bwrap`) se você precisar de uma Server Extension.

## External Extensions

As importações de terceiros ficam bloqueadas e ocultas por padrão. São necessários dois passos:

1. No computador que hospeda Marinara, defina `ENABLE_EXTERNAL_EXTENSIONS=true` no arquivo `.env`.
2. Abra a seção **Settings** > **Advanced** > **Danger Zone**, role para baixo dos controles de exclusão de dados, leia o aviso e ative a opção **Allow third-party extension imports** (permitir a importação de extensões de terceiros).

Só então a seção **Settings** > **Addons** mostra **External Extensions** com os controles de importação de arquivo e de pasta. Os formatos compatíveis sempre são expandidos:

- `.personal-extension.zip` e pacotes `.zip` compatíveis;
- manifestos `.json`;
- `.css`;
- `.js`, `.mjs` e `.cjs`;
- `.server.js`, `.server.mjs` e `.server.cjs`.

Uma importação nunca traz aprovação junto e não consegue se ativar sozinha. Registros antigos, importados de um perfil, guardados manualmente ou de origem desconhecida também contam como externos. Eles ficam ocultos, não podem ser aprovados e ficam de fora dos dois ambientes de execução até que as duas travas sejam abertas.

Ao desligar qualquer uma das travas, Marinara encerra os processos externos ativos no servidor, remove os workers do navegador e desativa os registros externos guardados. Reabrir as travas não faz tudo voltar a rodar automaticamente.

Extensões de terceiros podem conter código malicioso ou perigoso. Examine cada linha antes de baixar, importar ou ativar. A responsabilidade é inteiramente sua.

## Exportação, revisões e recuperação

Use a ação de exportação da extensão para baixar um pacote portátil. Pacotes exportados e restaurados continuam desativados. Restaurar uma revisão também devolve a extensão à condição de rascunho desativado.

Se uma extensão se comportar mal, escolha **Disable** (desativar). Se a interface não estiver disponível, pare Marinara e mude o valor de `enabled` do registro correspondente em `installed_extensions` para `"false"`. Nunca defina `approvedHash` na mão.

## Guias relacionados

- [Professor Mari](../home/professor-mari.md)
- [Configuração do servidor](../CONFIGURATION.md)
- [Fazer backup e restaurar Marinara](../data/backup-and-restore.md)
- [Acesso remoto](../REMOTE_ACCESS.md)
