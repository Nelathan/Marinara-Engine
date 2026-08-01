# Peek Prompt：查看 AI 收到的内容

Peek Prompt(查看提示词) 会原样显示 Marinara Engine 为了生成一条回复而发给 AI 模型的那段文字，也可以在发送之前先看一遍实时预览。本指南介绍这个查看窗口里都有什么、怎么打开它、怎么读 Stored guidance(已保存的引导)，以及怎么用它排查回复问题。

提示词就是 Marinara 拼装好并发给模型的一整块内容，里面既有各种指令，也有聊天记录。模型读完这段文字，再写出回复。Peek Prompt 让你看到拼装完成后的成品，回复为什么是这样就不再是谜。

## Peek Prompt 里有什么

打开 Peek Prompt 后会弹出一个标题为 **Assembled Prompt**(拼装后的提示词) 的窗口，它分三部分。

标题旁边是一个来源角标，它说明当前看到的是哪个版本的提示词：

- **Exact Text Model Request**：真正发给模型的那份原始请求。
- **Live Preview**：当场重新生成的预览。
- **Raw Messages**：未经处理的消息列表。
- **Prompt Preview**：一般的预览。

角标下面是生成信息面板。这里可以显示服务商和模型名、估算的 Token 数，回复生成完毕后还会显示真实的提示词 Token 数。Token 是一小段文本，模型统计长度时数的是 Token，不是单词。面板上还会用小标签列出这次用到的取值，比如 **Temperature**(温度)、**Max Output Tokens**(最大输出 Token 数)、**Thinking**(思考)、**Reasoning**(推理)、**Verbosity**(详细度)、**Service Tier**(服务层级)、**Assistant Prefill**(助手预填)。**Top P**、**Top K**、**Min P** 这类采样取值也可能出现在这里。

窗口余下的部分就是提示词本身，按可折叠的区块分段。每个区块都有一个标签，并各自给出粗略的 Token 估算。聊天消息统一归在 **Chat History**(聊天记录) 区块下。如果看的是已保存的真实请求，服务商有可能把好几轮聊天合并进了同一个块。逐个展开，就能看到块里模型可见的全部文字。点击任意区块标题即可展开或收起。

## 打开 Peek Prompt

打开这个查看窗口有两种方式。

第一种是消息操作栏。步骤如下：

1. 把鼠标移到聊天里最新的那条 AI 消息上。
2. 找到 **Peek prompt**(查看提示词) 操作，它的图标是一个放大镜。
3. 点击它，**Assembled Prompt** 窗口就会打开。

**Peek prompt** 操作只出现在聊天里最后一条 AI 消息上，更早的消息没有。

第二种是输入一段快捷文本。这种方式在还没有任何 AI 回复时也能用，所以可以先预览提示词。步骤如下：

1. 点击消息输入框。
2. 输入下面这段文字：

```
{{prompt}}
```

3. 按 Enter 或点击 Send。

Marinara 不会把它当成消息发出去，而是清空输入框并打开 Peek Prompt 查看窗口。快捷文本 `{{prompt_preview}}` 和 `{{preview_prompt}}` 效果相同。

## 读懂 Stored guidance

引导生成可以用一条戏外指令左右回复的走向。如果一条消息是带着保存下来的引导指令生成的，它就会多出一个 **Stored guidance** 操作，图标是一小卷卷轴。用 `/impersonate` 命令生成的消息上也有这个操作。

点击 **Stored guidance** 会打开一个窗口，显示这条消息当时用的引导指令。如果是引导生成的消息，窗口还会按来源给这条指令加上标注：

- **/guided**：来自 `/guided` 斜杠命令。
- **Guided regenerate**：重新生成时手动输入的方向。
- **Game start**：来自 Game Mode(游戏模式) 的初始设置。

只有 **/guided** 和 **Guided regenerate** 这两类才会出现 **Copy /guided** 按钮，它把这条指令转回一条 `/guided` 命令复制出来。之后随时粘贴，就能复用同一个引导。**Game start** 类型没有这个按钮。

如果这条消息是用 `/impersonate` 代你发言生成的，窗口显示的就不是单条指令，而是这次代写的详细信息。引导生成和 `/impersonate` 的完整用法见下方链接的指南。

## 用 Peek Prompt 排查回复问题

回复不符合预期时，Peek Prompt 是最好用的工具。角色忘事、无视规则、行为跑偏，都可以拿它来查。

打开 **Assembled Prompt** 窗口，重点看这几项：

- 找找有没有信息缺失。世界书条目、记忆或者用户角色的设定如果在任何区块里都找不到，说明模型根本没看到。
- 看参数标签。**Temperature** 过高会让回复变得随机，**Max Output Tokens** 太小则会把回复截断。
- 展开 **Chat History** 区块，确认该有的消息都在，顺序也对。
- 回复结束后看一眼真实的 Token 数。提示词太大，较早的消息会被挤出模型的上限。

知道了模型实际收到什么，就能对症下药：改角色卡、调世界书条目，或者改一个生成参数的取值。

## 相关指南

- [生成参数](../prompts/generation-parameters.md)
- [预设编辑器与提示词管理器](../prompts/presets.md)
- [引导生成与 Impersonate](guided-and-impersonate.md)
- [消息操作：编辑、删除、备选回复、重新生成](messages.md)
