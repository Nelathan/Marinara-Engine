# Prompts condicionais ({{#if}})

Este guia explica como usar os blocos `{{#if}}` no Marinara Engine. Um prompt é o texto que Marinara envia para a IA, e um bloco condicional inclui um trecho desse texto só quando um valor combina com a regra que você definiu. Os condicionais fazem parte do sistema de macros, então funcionam em todo lugar onde as macros funcionam: cards de personagem, personas, entradas de lorebook e presets de prompt.

## Para que servem os prompts condicionais

Uma macro é um marcador escrito entre `{{chaves duplas}}` que Marinara Engine troca por um valor real na hora de montar o prompt. O bloco condicional vai um passo além. Ele analisa um valor, mantém um trecho de texto e descarta o resto.

Você escreve a condição, o texto usado quando ela é verdadeira e, se quiser, o texto usado quando ela é falsa. Marinara lê a condição toda vez que monta um prompt. Com isso, o mesmo card ou preset se comporta de um jeito diferente para cada personagem, persona ou chat.

Um uso comum são instruções específicas de personagem dentro de um único preset compartilhado. Outro uso comum é incluir um campo apenas quando ele tem conteúdo, para não mandar um rótulo vazio para o modelo.

## A sintaxe básica

O bloco condicional começa com `{{#if condition}}` e termina com `{{/if}}`. Tudo que estiver entre os dois é o texto usado quando a condição é verdadeira.

```
{{#if condition}}
Text used when the condition is true.
{{/if}}
```

Para o caso falso, acrescente um ramo `{{else}}`:

```
{{#if condition}}
Text used when true.
{{else}}
Text used when false.
{{/if}}
```

Outra opção: encadear condições extras com `{{else if}}`. Marinara analisa cada ramo em ordem, de cima para baixo. Ele mantém o primeiro ramo cuja condição é verdadeira, resolve as macros dentro dele e descarta todos os outros. Se nenhuma condição for verdadeira e não houver `{{else}}`, o bloco inteiro não gera texto nenhum.

```
{{#if length == "short"}}
Keep your reply to one or two sentences.
{{else if length == "long"}}
Write a detailed, multi-paragraph reply.
{{else}}
Write a reply of normal length.
{{/if}}
```

O bloco pode ocupar várias linhas, como nos exemplos acima, ou ficar em uma linha só. Você também pode aninhar um condicional dentro do ramo de outro condicional maior.

## Operadores disponíveis

Em geral, a condição tem um valor à esquerda, um operador e um valor à direita, como em `char == "Alice"`. A tabela abaixo lista todos os operadores disponíveis. Cada operador aparece em estilo de código.

| Operador | Significado |
| --- | --- |
| `==`, `=`, `is` | Igual. |
| `!=`, `is not` | Diferente. |
| `>` | Maior que (só com números). |
| `<` | Menor que (só com números). |
| `>=` | Maior ou igual (só com números). |
| `<=` | Menor ou igual (só com números). |
| `contains`, `includes` | O valor da esquerda contém o valor da direita como texto. |
| `not contains`, `not includes` | O valor da esquerda não contém o valor da direita. |

Algumas regras controlam como a comparação acontece:

1. Com `==`, `=`, `is`, `!=` e `is not`, se os dois lados parecem números, Marinara compara os dois como números. Ou seja, `5` é igual a `5.0`. Caso contrário, a comparação é feita como texto, sem diferenciar maiúsculas de minúsculas. Ou seja, `Mari` é igual a `mari`.
2. Com `>`, `<`, `>=` e `<=`, os dois lados precisam ser números. Se um dos lados não for número, a condição é falsa.
3. Com `contains`, `includes`, `not contains` e `not includes`, a comparação não diferencia maiúsculas de minúsculas. Ou seja, `contains "dr"` combina com o texto `Dr Smith`.

## Combinar condições com OR e AND

Use `||` quando qualquer uma das condições puder combinar. Use `&&` quando todas as condições precisarem combinar.

```
{{#if character == "Maukie" || character == "Pantalone"}}
Use the shared Maukie and Pantalone instructions.
{{/if}}

{{#if characters contains "Maukie" && characters contains "Pantalone"}}
Both characters are present in this chat.
{{/if}}
```

O operador `&&` é avaliado antes do `||`. Use parênteses quando quiser definir a ordem de forma explícita:

```
{{#if (character == "Maukie" || character == "Pantalone") && scenario contains "lake"}}
Use the lakeside instructions for either character.
{{/if}}
```

Quando houver várias opções de igualdade para o mesmo valor, o lado esquerdo repetido pode ser omitido depois do `||`:

```
{{#if character == "Maukie" || "Pantalone"}}
Use the shared instructions.
{{/if}}
```

Essa forma abreviada significa `character == "Maukie" || character == "Pantalone"`. Ela vale para os operadores de igualdade `==`, `=` e `is`. Já dos dois lados do `&&`, escreva condições completas, porque um valor raramente é igual a duas opções diferentes ao mesmo tempo.

### Verificação de valor preenchido (sem operador)

Se você escrever uma condição sem operador, Marinara faz uma verificação de valor preenchido. A pergunta é simples: esse valor tem conteúdo de verdade?

```
{{#if scenario}}
Current scene: {{scenario}}
{{else}}
No specific scene is set.
{{/if}}
```

A verificação de valor preenchido é verdadeira quando o valor não está vazio e não é uma destas palavras: `false`, `0`, `no`, `off`, `null` ou `undefined`. Essa comparação de palavras não diferencia maiúsculas de minúsculas. Use a verificação de valor preenchido quando quiser incluir o texto apenas se o campo estiver preenchido.

### O que pode ser comparado

O lado esquerdo ou direito da condição aceita qualquer um destes elementos:

1. Uma palavra-chave de campo ou de identidade, como `char`, `user`, `group`, `persona`, `description`, `personality`, `scenario`, `input` ou `model`. Elas leem os mesmos valores das macros correspondentes. A palavra `group` lista os outros personagens ativos do chat, sem contar quem está respondendo no momento.
2. Um valor literal entre aspas, como `"Alice"`.
3. O nome de uma variável de preset, como `length`. A variável de preset é um valor com nome que você define em um preset de prompt. Veja [Variáveis de preset](preset-variables.md).
4. Uma consulta explícita de variável, escrita como `var:name` ou `var.name`.
5. Outra macro, cujo valor é resolvido primeiro e só depois comparado.

Se você escrever uma palavra solta que não seja palavra-chave, Marinara a trata como nome de variável. Quando não existe variável com esse nome, a própria palavra vira texto simples. Colocar os valores literais entre aspas evita essa confusão, então use aspas sempre que tiver dúvida.

## Regras de aspas

Ao comparar com um texto fixo, coloque esse texto entre aspas. Assim Marinara o trata como um literal exato, e não como palavra-chave ou variável.

```
{{#if char == "Dottore"}}
Speak in a cold, clinical tone.
{{/if}}
```

Use aspas duplas retas ou aspas simples retas. Marinara também aceita aspas curvas (tipográficas), mas as aspas retas são mais seguras e combinam com todos os exemplos do aplicativo. Dentro de um valor entre aspas, escape uma aspa com barra invertida e escreva `\n` para quebrar a linha.

Sempre coloque entre aspas um literal que tenha espaço, como `"Dr Smith"`. Um valor de várias palavras sem aspas é lido como um único nome de variável, o que quase nunca é o que você quer.

## Blocos de grupo para vários personagens

Em um chat em grupo com dois ou mais personagens, o bloco de grupo repete o mesmo texto uma vez para cada personagem. Assim você escreve um único bloco que descreve todos os personagens da cena.

Para criar um bloco de grupo, coloque um `[` sozinho em uma linha, depois o texto e depois um `]` sozinho em outra linha. O bloco precisa conter uma macro de personagem, como `{{char}}` ou `{{description}}`, ou uma condição baseada em personagem, como `{{#if char == "Alice"}}`. Marinara então repete o bloco uma vez por personagem e resolve as macros de personagem para cada um deles.

```
[
{{char}}'s current attitude:
{{#if char == "Alice"}}cheerful and open{{else}}guarded and quiet{{/if}}
]
```

Em um chat em grupo com Alice e Bob, o bloco roda duas vezes. Na primeira passagem, entra o nome de Alice e o ramo dela é escolhido. Na segunda, entra o nome de Bob e o ramo dele é escolhido. Fora de um bloco de grupo, a macro de personagem se resolve apenas para o personagem atual ou principal.

Os blocos de grupo só se expandem em um chat com dois ou mais personagens. Em um chat individual, as linhas com `[` e `]` continuam como texto comum.

## Exemplos completos (antes e depois)

Veja três exemplos completos, com o resultado que chega ao modelo.

Tom específico de personagem dentro de um preset compartilhado:

```
{{#if char == "Dottore"}}
Speak in a cold, clinical tone.
{{else}}
Speak warmly and casually.
{{/if}}
```

Para um personagem chamado `Dottore`, o modelo recebe `Speak in a cold, clinical tone.` Para todos os outros personagens, ele recebe `Speak warmly and casually.`

Incluir um campo somente quando ele está preenchido:

```
{{#if backstory}}
Backstory to remember: {{backstory}}
{{/if}}
```

Se o personagem tem um campo **Backstory** (história de origem) preenchido, o modelo recebe essa linha com o texto correspondente. Se o campo **Backstory** estiver vazio, o bloco inteiro não gera texto nenhum, então nenhum rótulo vazio é enviado.

Combinar parte do nome do usuário:

```
{{#if user contains "Dr"}}
Address the user as Doctor.
{{/if}}
```

Se o nome da persona contém `Dr`, o modelo recebe a instrução de chamar você de Doutor. Se não contém, o bloco não gera texto nenhum.

## Guias relacionados

- [Macros de prompt](macros.md)
- [Variáveis de preset](preset-variables.md)
- [Chats em grupo e conversas em grupo](../chats/group-chats.md)
