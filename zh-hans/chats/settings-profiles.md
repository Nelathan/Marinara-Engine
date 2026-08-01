# 设置方案

设置方案就是一组起了名字、可以反复套用的聊天设置。它能保存一个聊天的连接、提示词预设、智能体、工具、翻译、记忆功能、高级参数以及其他按聊天保存的选项。想在另一个聊天里用同一套配置，直接套用方案就行，不必从头再设一遍。

方案的管理入口在 **Chat Settings**(聊天设置) 的最上方，适用于 Conversation(对话模式) 和 Roleplay(角色扮演)。Game Mode(游戏模式) 里不显示方案控件。

## 设置方案和提示词预设

在 Marinara 里，**预设**这个词只指提示词模板：

- **提示词预设**控制系统提示词的结构和生成参数，在 Presets(预设) 面板里编辑。参见[预设编辑器与提示词管理器](../prompts/presets.md)。
- **设置方案**是范围更大的一整套可复用配置，里面可以包含选中的提示词预设，还有连接、智能体和其他聊天设置。

所以提示词预设只是设置方案里的一项内容。

## 方案包含哪些内容

方案保存的是这个聊天与 AI 对接的方式：

- 连接
- 提示词预设（在 Conversation 模式里叫提示词来源）
- 智能体和工具
- 翻译
- Memory Recall
- Advanced Parameters
- 其他可复用的聊天选项

方案不会替换聊天自身的内容，比如角色、用户角色、世界书、立绘、摘要、标签和场景提示词。聊天记录也不在方案里。

## 套用方案

方案下拉菜单位于 **Chat Settings** 顶部，提示文字是 **Apply a settings profile to this chat**。

1. 打开要修改的聊天。
2. 打开 **Chat Settings**。
3. 打开 **Profile**(设置方案) 下拉菜单。
4. 按名称选择一个方案。

聊天会立即更新。当前设置和任何已保存的方案都对不上时，下拉菜单显示 **Custom settings profile**。之前套用过的方案已经不存在了，则显示 **Missing profile - choose a profile**。

## 保存方案

下拉菜单下面那排图标提供以下操作：

| 按钮 | 提示文字 | 效果 |
|---|---|---|
| Save | **Save current chat settings into this profile** | 用当前设置覆盖选中方案里保存的值 |
| Rename | **Rename profile** | 修改选中方案的名称 |
| Save As | **Save current chat settings as a new profile** | 用当前聊天再建一个新方案 |
| Import | **Import settings profile (.json)** | 载入一个方案文件 |
| Export | **Export settings profile (.json)** | 下载选中的方案 |
| Delete | **Delete profile** | 永久删除选中的方案 |

新建第一个方案的做法是：先把一个聊天配置好，然后选择 **Save current chat settings as a new profile**。之后想更新它，就先套用这个方案，改好聊天设置，再选择 **Save current chat settings into this profile**。

## 指定默认方案

下拉菜单旁边的星标用来标记该模式下新建聊天自动使用的方案。每种模式只能有一个默认方案。

星标的提示文字会说明当前状态：

- **Mark this profile as default for new chats in this mode**
- **This profile is the default for new chats in this mode**
- **Select a profile to mark it as default**

## 导入和导出方案

**Export settings profile (.json)** 会下载一个 `.marinara-settings-profile.json` 文件，可以留作备份，也可以分享给别人。**Import settings profile (.json)** 会用一个兼容的文件新建方案，不会覆盖已有方案。旧版本导出的方案文件同样可以导入。

方案里存的是设置，不包含服务商的密钥之类的机密信息。

## Default 方案

Conversation 和 Roleplay 各自内置了一个 **Default** 方案。套用它就会把该模式下受方案控制的设置全部恢复成 Marinara 的默认值。

Default 方案不能改名、覆盖，也不能删除。相应的控件是灰的，并给出说明：**Cannot save into the Default profile**、**Cannot rename the Default profile** 和 **Cannot delete the Default profile**。

## 相关指南

- [聊天设置总览](chat-settings.md)
- [预设编辑器与提示词管理器](../prompts/presets.md)
- [生成参数](../prompts/generation-parameters.md)
