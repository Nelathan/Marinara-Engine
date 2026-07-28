# Localização da interface

Marinara Engine traduz o texto da interface do aplicativo. Ficam intactos os prompts enviados ao modelo, o conteúdo
criado por você, o conteúdo gerado no chat, os identificadores, os valores de protocolo, os caminhos de arquivo e os valores gravados para uso interno.

O inglês é o idioma canônico e também a alternativa usada em tempo de execução. Quando falta uma tradução da comunidade, a tela mostra o
texto em inglês, e não a chave de tradução nem um controle vazio.

O idioma da interface se escolhe na seção **Settings > General > App Behavior > Language** (Configurações). A escolha muda
os controles e as explicações do Marinara, não os prompts enviados ao modelo, o conteúdo criado por você nem as mensagens do chat.

## Idiomas de interface com suporte

| Idioma | Arquivo de locale | Direção |
| --- | --- | --- |
| Árabe | `ar.json` | Da direita para a esquerda |
| Chinês simplificado | `zh-Hans.json` | Da esquerda para a direita |
| Inglês | `en.json` | Da esquerda para a direita |
| Francês | `fr.json` | Da esquerda para a direita |
| Alemão | `de.json` | Da esquerda para a direita |
| Híndi | `hi.json` | Da esquerda para a direita |
| Japonês | `ja.json` | Da esquerda para a direita |
| Coreano | `ko.json` | Da esquerda para a direita |
| Polonês | `pl.json` | Da esquerda para a direita |
| Português do Brasil | `pt-BR.json` | Da esquerda para a direita |
| Russo | `ru.json` | Da esquerda para a direita |
| Espanhol | `es.json` | Da esquerda para a direita |

O catálogo em inglês é a fonte oficial, mantida pelo projeto. Os outros catálogos que já vêm no aplicativo nasceram de traduções feitas com ajuda de máquina e
aceitam correções de quem tem fluência no idioma. A extração do texto da interface ainda está em andamento, então o texto sem chave traduzida
continua aparecendo em inglês.

## Arquivos de locale

Os arquivos de locale do cliente ficam em:

```text
packages/client/src/localization/locales/
```

Cada locale BCP-47 usa um único arquivo JSON com o nome do locale canônico, como `pl.json`, `ko.json` ou
`pt-BR.json`. O Vite encontra esses arquivos sozinho, então adicionar um locale não exige editar nenhum registro.
O inglês carrega junto com o aplicativo; os demais locales só carregam quando são selecionados.

```json
{
  "_meta": {
    "locale": "pl",
    "direction": "ltr"
  },
  "chat.input.placeholder": "Napisz odpowiedź…",
  "common.actions.save": "Zapisz"
}
```

Use chaves semânticas, organizadas por área da interface. Não use uma frase em inglês como chave: qualquer ajuste comum de
redação invalidaria todas as traduções.

## Regras de tradução

- Traduza apenas os valores. Não renomeie as chaves semânticas.
- Preserve os marcadores de interpolação, como `{{name}}`, e as tags de texto formatado, como `<strong>`.
- Mantenha as chaves de tradução em ordem alfabética.
- Mantenha os nomes de produto, como Marinara Engine, sem tradução, a menos que o projeto adote um nome oficial traduzido.
- Acompanhe o sentido e o tom do arquivo `en.json`. Não acrescente comportamentos nem promessas que o texto em inglês não faz.
- Confira se as etiquetas traduzidas cabem na tela do computador e do celular.

Os locales da comunidade podem ficar temporariamente sem algumas chaves enquanto a tradução de uma área do aplicativo é preparada. As chaves que faltam
caem para o inglês. Chave desconhecida, tradução vazia, metadados malformados e marcador de interpolação alterado reprovam na verificação de
localização.

Um PR de funcionalidade precisa acrescentar ou atualizar a chave canônica em inglês, mas não precisa mexer em todos os locales da comunidade.
Traduza um valor da comunidade só quando quem contribui puder oferecer uma tradução útil. Não duplique o valor em inglês
nos arquivos de locale só para deixar as listas de chaves iguais: a alternativa em tempo de execução já entrega esse texto em
inglês, e deixar a chave ausente evita conflitos de merge desnecessários para quem traduz.

Traduções feitas por máquina são bem-vindas como rascunho inicial, desde que o PR diga que é esse o caso. Antes de descrever um locale como revisado,
alguém com fluência no idioma precisa revisar a terminologia, o tom, os textos cortados e o layout no celular.

## Enviar uma correção para uma tradução existente

Para uma pequena correção de redação, o editor web do GitHub já resolve:

1. Abra o locale em
   [`packages/client/src/localization/locales/`](../../packages/client/src/localization/locales/).
2. Clique no ícone de lápis para editar o arquivo. Se precisar, o GitHub oferece a criação de um fork.
3. Mude apenas o valor traduzido. Preserve a chave, os marcadores sensíveis à pontuação, como `{{name}}`, e a sintaxe
   JSON.
4. Faça o commit da mudança em uma branch focada dentro do seu fork.
5. Abra um pull request para a branch **`staging`** do Marinara Engine, não para `main`.
6. Na descrição do PR, diga qual é o idioma, explique o sentido corrigido e informe se você tem fluência no idioma
   ou usou ajuda de máquina.

Use um título como `Improve French UI translation`. Várias correções relacionadas ao mesmo locale podem ir em um só PR.
Deixe mudanças de código não relacionadas em outro lugar.

## Enviar uma localização nova

Para um idioma novo, parta da versão mais recente da branch `staging`:

```bash
git clone https://github.com/YOUR-NAME/Marinara-Engine.git
cd Marinara-Engine
git checkout staging
git pull
git checkout -b translation/LOCALE
pnpm install
```

Depois:

1. Copie o arquivo `en.json` para um arquivo de locale BCP-47 com nome canônico, como `it.json` ou `pt-PT.json`.
2. Mantenha o campo `_meta.locale` igual ao nome do arquivo sem o `.json`.
3. Defina o campo `_meta.direction` como `ltr` ou `rtl`.
4. Traduza os valores seguindo as regras acima. Para um locale novo, o melhor é copiar o catálogo completo em inglês,
   mesmo que um catálogo incompleto possa cair para o inglês.
5. Rode o validador de locale e a verificação básica do repositório:

   ```bash
   pnpm localization:check
   pnpm check
   ```

6. Selecione o idioma na seção **Settings > General** e revise no computador e no celular. Confira as etiquetas longas,
   as dicas, os estados de carregamento e de erro, e a direção do texto.
7. Envie a branch para o seu fork e
   [abra um pull request](https://github.com/Pasta-Devs/Marinara-Engine/compare), escolhendo
   `Pasta-Devs/Marinara-Engine:staging` como base.

A descrição do PR deve identificar o locale, a origem da tradução, o nível de fluência ou revisão, os comandos de validação e
qualquer parte que ainda precise da revisão de um falante nativo. Preencha o template do PR com honestidade e marque apenas os itens manuais que
você mesmo verificou.

## Usar as traduções no código do cliente

Os componentes React usam `useTranslation`:

```tsx
import { useTranslation } from "react-i18next";

const { t } = useTranslation();
return <button>{t("common.actions.save")}</button>;
```

Na configuração de interface no nível do módulo, guarde as chaves de tradução, não os valores já traduzidos. Assim a troca de idioma acontece
na hora, sem recarregar a página. Os auxiliares de cliente fora do React podem usar a função `translate` exportada por
`packages/client/src/localization/i18n.ts`.

Traduza todo texto visível, incluindo etiquetas, textos de exemplo, dicas, nomes de acessibilidade, texto alternativo, estados de carregamento e
de vazio, avisos, confirmações e tutoriais estáticos. Não passe prompts nem conteúdo criado por você pelo tradutor da interface.

Alguns componentes antigos compartilhados, como os controles de Settings, as dicas de ajuda e os títulos de janela, também reconhecem valores
exatos do catálogo canônico em inglês, enquanto os pontos de chamada mais antigos são migrados. Isso é uma ponte de compatibilidade, e não a
API preferida: componentes novos ou bastante editados ainda precisam usar chaves semânticas `t("area.control.label")`
diretamente. Uma frase em inglês que não está no arquivo `en.json` não é traduzível.

A verificação de localização do repositório também audita o TSX do cliente em busca de texto de interface sem tradução:

```bash
pnpm localization:ui-check
```

Ela cobre o JSX visível, as etiquetas e os avisos interpolados diretamente, os nomes acessíveis, os textos de exemplo, os estados de carregamento e de
vazio, os avisos e as confirmações. O conteúdo literal dentro dos elementos `code`, `pre`, `script` e `style` fica de fora de
propósito, para que comandos, configuração, URLs, macros e outros exemplos voltados à máquina continuem exatos.
Valores dinâmicos criados por você, gerados, gravados, de prompt e de protocolo também precisam ficar fora do
tradutor da interface.

## Interfaces de Agentes que você baixa

As telas de Agente que pertencem ao Engine usam os arquivos de locale do Engine. Os clientes de capacidade que você baixa mantêm o próprio texto traduzido no
repositório Marinara-Agents.

Todo elemento personalizado de capacidade recebe o locale selecionado pelos atributos `lang` e `dir` e também por:

```ts
capabilityProps.localization = {
  locale: "pl",
  direction: "ltr",
};
```

O evento `marinara-capability-props`, que já existe, dispara quando o locale muda. A interface do pacote deve selecionar o locale
que vem embutido nele, cair para o inglês do pacote e renderizar de novo depois desse evento.
