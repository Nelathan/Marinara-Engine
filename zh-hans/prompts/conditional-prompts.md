# 条件提示词（{{#if}}）

本指南介绍 Marinara Engine 里 `{{#if}}` 块的用法。条件块的作用是：只有当某个值符合你设定的规则时，才把一段提示词（Marinara Engine 发给 AI 的那段文字）放进去。条件块属于宏系统的一部分，因此凡是能用宏的地方都能用，包括角色卡、用户角色、世界书条目和提示词预设。

## 条件提示词能做什么

宏是形如 `{{double-brace}}` 的占位符，Marinara Engine 在拼装提示词时会把它替换成当前的真实值。条件块更进一步：先判断一个值，再从几段文字里留下一段，其余全部丢掉。

你写好一个条件、条件成立时使用的文字，以及（可选的）条件不成立时使用的文字。每次拼装提示词，Marinara 都会重新判断一次条件。也就是说，同一张卡、同一套预设，面对不同的角色、不同的用户角色、不同的聊天，表现可以完全不同。

常见用法之一，是在一套共用预设里写针对特定角色的指令。另一种常见用法，是只在某个字段有内容时才把它带上，免得给模型送去一个空标题。

## 基本写法

条件块以 `{{#if condition}}` 开头，以 `{{/if}}` 结尾。中间的所有文字，就是条件成立时使用的内容。

```
{{#if condition}}
Text used when the condition is true.
{{/if}}
```

需要处理不成立的情况时，可以加一个 `{{else}}` 分支：

```
{{#if condition}}
Text used when true.
{{else}}
Text used when false.
{{/if}}
```

还可以用 `{{else if}}` 串联更多条件。Marinara 从上往下逐个分支判断，保留第一个条件成立的分支，解析该分支内部的宏，其余分支一律丢弃。如果所有条件都不成立，又没有写 `{{else}}`，整个块就什么都不留下。

```
{{#if length == "short"}}
Keep your reply to one or two sentences.
{{else if length == "long"}}
Write a detailed, multi-paragraph reply.
{{else}}
Write a reply of normal length.
{{/if}}
```

一个块可以像上面那样分成好几行写，也可以写在一行里。条件块之间还能嵌套，把一个条件块放进另一个更大的条件块的某个分支里。

## 支持的运算符

条件通常由左值、运算符、右值三部分组成，例如 `char == "Alice"`。下表列出全部可用的运算符，一律以代码样式显示。

| 运算符 | 含义 |
| --- | --- |
| `==`、`=`、`is` | 相等。 |
| `!=`、`is not` | 不相等。 |
| `>` | 大于（仅限数字）。 |
| `<` | 小于（仅限数字）。 |
| `>=` | 大于或等于（仅限数字）。 |
| `<=` | 小于或等于（仅限数字）。 |
| `contains`、`includes` | 左值的文本里含有右值。 |
| `not contains`、`not includes` | 左值的文本里不含右值。 |

比较的具体行为遵循以下几条规则：

1. 用 `==`、`=`、`is`、`!=`、`is not` 时，如果两边看上去都是数字，Marinara 就按数字比较，所以 `5` 等于 `5.0`。否则按文本比较，且忽略大小写，所以 `Mari` 等于 `mari`。
2. 用 `>`、`<`、`>=`、`<=` 时，两边必须都是数字。只要有一边不是数字，条件就不成立。
3. 用 `contains`、`includes`、`not contains`、`not includes` 时，匹配忽略大小写，所以 `contains "dr"` 能匹配到文本 `Dr Smith`。

## 用 OR 和 AND 组合条件

任意一个条件成立即可，用 `||`；所有条件都必须成立，用 `&&`。

```
{{#if character == "Maukie" || character == "Pantalone"}}
Use the shared Maukie and Pantalone instructions.
{{/if}}

{{#if characters contains "Maukie" && characters contains "Pantalone"}}
Both characters are present in this chat.
{{/if}}
```

`&&` 先于 `||` 求值。想自己指定判断顺序时，加括号：

```
{{#if (character == "Maukie" || character == "Pantalone") && scenario contains "lake"}}
Use the lakeside instructions for either character.
{{/if}}
```

同一个值要和好几个选项比相等时，`||` 后面重复的左值可以省略：

```
{{#if character == "Maukie" || "Pantalone"}}
Use the shared instructions.
{{/if}}
```

这种简写等同于 `character == "Maukie" || character == "Pantalone"`，只对相等运算符 `==`、`=`、`is` 有效。`&&` 两边则要写完整的条件，毕竟一个值通常不可能同时等于两个不同的选项。

### 真值判断（不写运算符）

条件里不写运算符时，Marinara 做的是真值判断，也就是问一个很简单的问题：这个值里到底有没有实际内容？

```
{{#if scenario}}
Current scene: {{scenario}}
{{else}}
No specific scene is set.
{{/if}}
```

值不为空，并且不是 `false`、`0`、`no`、`off`、`null`、`undefined` 这几个词中的任何一个，真值判断才成立。词的比对忽略大小写。只想在某个字段填了内容时才带上一段文字，就用真值判断。

### 可以拿来比较的东西

条件的左边或右边可以是下面这几种：

1. 字段或身份关键词，例如 `char`、`user`、`group`、`persona`、`description`、`personality`、`scenario`、`input`、`model`。它们读取的值和同名的宏完全一致。`group` 列出的是当前聊天中除本次回复者以外的其他在场角色。
2. 带引号的字面值，例如 `"Alice"`。
3. 预设变量名，例如 `length`。预设变量是在 Prompt Preset 里自己定义的具名值，详见[预设变量](preset-variables.md)。
4. 写成 `var:name` 或 `var.name` 的显式变量查找。
5. 另一个宏，它的值会先解析出来，再参与比较。

如果写了一个光秃秃的词，而它又不是关键词，Marinara 会把它当成变量名。要是找不到同名变量，就把这个词本身当作纯文本。给字面值加引号可以避免这种混淆，拿不准的时候就加上引号。

## 引号规则

要和一段固定的文字做比较，就给它加引号。这等于告诉 Marinara：把它当作确切的字面值，不是关键词，也不是变量。

```
{{#if char == "Dottore"}}
Speak in a cold, clinical tone.
{{/if}}
```

直双引号和直单引号都可以。Marinara 也接受弯引号，但直引号最稳妥，也和应用内的所有示例一致。引号内部可以用反斜杠转义引号，还可以用 `\n` 表示换行。

字面值里带空格时一定要加引号，例如 `"Dr Smith"`。不加引号的多词值会被当成一个变量名，这几乎肯定不是你想要的结果。

## 面向多角色的分组块

在有两个或更多角色的群聊里，分组块会把同一段文字按角色逐个重复一遍。这样只写一个块，就能描述场景中的每一个角色。

写分组块的方法是：单独一行只写一个 `[`，接着写正文，最后单独一行只写一个 `]`。块里必须包含角色宏，例如 `{{char}}` 或 `{{description}}`，或者包含基于角色的条件，例如 `{{#if char == "Alice"}}`。Marinara 会按角色数量重复这个块，并依次针对每个角色解析里面的角色宏。

```
[
{{char}}'s current attitude:
{{#if char == "Alice"}}cheerful and open{{else}}guarded and quiet{{/if}}
]
```

在 Alice 和 Bob 的群聊里，这个块会跑两遍。第一遍填入 Alice 的名字并选中属于她的分支，第二遍填入 Bob 的名字并选中属于他的分支。在分组块之外，角色宏只针对当前角色或主角色解析。

分组块只在有两个或更多角色的聊天里展开。单人聊天中，`[` 和 `]` 所在的行会原样保留为普通文本。

## 实例演示（处理前后对照）

下面是三个完整示例，同时给出模型最终收到的内容。

在共用预设里给特定角色定制语气：

```
{{#if char == "Dottore"}}
Speak in a cold, clinical tone.
{{else}}
Speak warmly and casually.
{{/if}}
```

角色名为 `Dottore` 时，模型收到的是 `Speak in a cold, clinical tone.`；换成其他任何角色，模型收到的都是 `Speak warmly and casually.`

只在字段填了内容时才带上它：

```
{{#if backstory}}
Backstory to remember: {{backstory}}
{{/if}}
```

角色填了 **Backstory**(背景故事)，模型就会收到这一行以及背景故事的正文。**Backstory** 输入框为空时，整个块什么都不留下，也就不会送出一个空标题。

匹配用户名的一部分：

```
{{#if user contains "Dr"}}
Address the user as Doctor.
{{/if}}
```

用户角色的名字里含有 `Dr`，模型就会被要求称呼你为 Doctor；没有的话，这个块什么都不留下。

## 相关指南

- [提示词宏](macros.md)
- [预设变量](preset-variables.md)
- [群聊与 Conversation 模式群聊](../chats/group-chats.md)
