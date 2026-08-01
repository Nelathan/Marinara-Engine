# 自定义 CSS 主题（Theme Library）

本指南介绍如何用自定义 CSS 主题彻底改变 Marinara Engine 的外观，包括主题的创建、导入、导出和启用，还会说明哪些 CSS 变量可以改，以及主题和 Card CSS 之间是什么关系。

## 什么是自定义主题

自定义主题就是一段用来给 Marinara 重新上色的 CSS。CSS 全称 Cascading Style Sheets(层叠样式表)，是决定整个应用配色、边框和间距的代码。一个主题可以改页面背景、强调色、卡片、边框、文字等等。

自定义主题都放在 **Theme Library**(主题库) 里。它们保存在 Marinara 服务器上，因此会同步到连接同一台服务器的每台设备和每个浏览器。这一点和大多数外观设置不同，那些设置只留在本机。逐设备生效的设置见[外观设置](appearance-settings.md)。

同一时间只能有一个自定义主题处于启用状态。主题库里想存多少个主题都可以，随时切换。

## 在哪里找到 Theme Library

1. 打开 **Settings**(设置)。
2. 打开 **Addons**(附加组件) 选项卡。
3. 找到 **Theme Library** 区块。

这个区块的标题是 **Theme Library**，下方写着“Create, import, activate, edit, export, or remove custom CSS themes.”

## 创建主题

1. 在 **Theme Library** 区块里点击 **Create Theme**(创建主题)。
2. 在 **Theme name**(主题名称) 输入框里填一个名字。
3. 在下方的大文本框里写入或粘贴 CSS。
4. 保持 **Preview**(预览) 开启，边写边在应用里看到实时效果。关闭 **Preview** 就停止实时预览。
5. 点击 **Save**(保存)。

新建的主题会带一个模板。模板把常用变量以注释形式列了出来，去掉注释符号再填上自己的值即可。首次保存一个全新主题时，Marinara 会立刻启用它，并弹出一条带主题名的确认提示，例如：Theme "My Theme" saved and activated.

之后想改主题，在 **Installed Themes**(已安装主题) 列表里找到它，点击代码图标（提示文字是 **Edit theme CSS**），改完点击 **Save**。编辑一个已保存的主题只会更新内容，不会改变当前启用的是哪个主题。

## 导入和导出主题

主题可以做成文件分享出去，在不同服务器之间搬运主题或者发给朋友时很方便。

导入主题的步骤：

1. 在 **Theme Library** 区块里点击 **Import File**(导入文件)。
2. 选择一个 `.css` 文件或 `.json` 文件。
3. 看一下弹出的提示，上面会写明成功导入、跳过和失败的主题各有多少个。

一个 `.css` 文件会变成一个主题，名字取自文件名。一个 `.json` 文件可以装一个或多个主题，分两种形式。

第一种是从 Marinara 导出的文件。导出时 Marinara 会给每个主题包上一些额外字段，这些内容不用去读、也不用去改，直接原样导入就行。

第二种是自己手写的小文件。只放一个主题的话，这样就够了：

```
{ "name": "My Theme", "css": "..." }
```

导入的主题会同步到服务器，但不会自动启用。如果服务器上已经有一个同名、CSS 也完全相同的主题，这次导入会跳过它，不会重复添加。

导出主题时，在 **Installed Themes** 列表里找到它，点击上传图标（提示文字是 **Export theme**）。Marinara 会下载一个 `.json` 文件，可以拿到别处导入。

## 启用主题

**Installed Themes** 列表会列出所有主题，顶部还有一项 **Default Theme**(默认主题)。

1. 点击某个主题的名字即可启用，当前启用的主题带一个对勾。
2. 点击 **Default Theme** 就关闭自定义主题，回到 Marinara 自带的外观。

**Reset Appearance**(重置外观) 按钮位于 **Settings -> Appearance** 中 **App Style**(应用样式) 区块的顶部。用它同样会关闭当前启用的自定义主题。

想彻底删掉一个主题，点击它那一行的垃圾桶图标（提示文字是 **Remove theme**），然后在 **Delete Theme**(删除主题) 窗口里确认。这会把该主题的 CSS 从服务器上永久删除。

## CSS 变量参考

主题编辑器里有一个可折叠的 **CSS Variable Reference**(CSS 变量参考)，点开就能看到最常用的可覆盖变量。主题正是通过在 `:root` 块里设置这些变量来改变应用外观的。参考里列出的变量如下：

| 变量 | 控制的内容 |
| --- | --- |
| `--background` | 页面背景 |
| `--foreground` | 正文文字 |
| `--primary` | 强调色和按钮 |
| `--primary-foreground` | 强调色上的文字 |
| `--secondary` | 卡片和输入框 |
| `--card` | 卡片背景 |
| `--border` | 边框 |
| `--muted-foreground` | 淡化的文字 |
| `--sidebar` | 侧边栏背景 |
| `--sidebar-border` | 侧边栏边框 |
| `--marinara-shell-edge-border` | 左右两侧的外框边缘 |
| `--destructive` | 报错和删除 |
| `--popover` | 下拉菜单背景 |
| `--accent` | 悬停高亮 |

能改的不止这些。Marinara 用到的任何 CSS 变量，主题都可以设置，也可以另外加自定义样式。

有些视觉效果有专属变量。比如设置 `--marinara-theme-accent-pulse: enabled` 就能让主题启用强调色脉冲动画。

出于安全考虑，自定义主题的 CSS 会先经过清理再生效。从其他网站加载文件的样式不会生效。想在主题里用图片或字体，把它嵌成 `data:` URI，不要写网址。`data:` URI 会把文件内容直接装进 CSS 里。

## 大小和名称限制

主题名最长 200 个字符。CSS 内容最大 256 KiB，按 UTF-8 字节计算，不是按字符数。超过这个大小的主题在保存或导入时会被拒绝。

## 远程访问需要 Admin Access

创建、编辑、导入、启用和删除主题都属于受保护操作。只有通过网络访问 Marinara 时才需要留意这一点。

如果在运行服务器的那台电脑上打开 Marinara，也就是走环回地址（loopback，又叫 localhost），这些操作直接就能用。如果从另一台设备打开，比如手机或局域网里的另一台电脑，服务器需要先有一个管理员密钥。

通过网络管理主题的做法：

1. 在服务器上，于 `.env` 文件中设置 `ADMIN_SECRET`。
2. 在应用里打开 **Settings -> Advanced -> Admin Access**，填入同一个值。

不这么做，通过网络修改主题就会失败。完整配置方法见[服务器配置参考](../CONFIGURATION.md)和[远程访问：Basic Auth 与 IP 允许列表](../REMOTE_ACCESS.md)。

## 主题和 Card CSS 如何配合

Marinara 有两套添加自定义 CSS 的机制。它们是相互独立的功能，可以同时生效。

自定义主题作用于整个应用。它可以覆盖 Marinara 的核心变量，可以用 `!important`，也可以用 `position: fixed`，这本来就是主题该干的事。

Card CSS(角色卡 CSS) 不一样。角色或用户角色的作者可以把 CSS 嵌进卡里，由你在每个聊天里单独开启。Card CSS 的清理严格得多：不能覆盖应用的核心变量，`!important` 会被剥掉，`position: fixed` 会被改成 `position: absolute`。它只作用于聊天消息，不作用于整个应用。详见[角色卡 CSS 主题指南](card-css-theming.md)。

界面显示不正常时，当前启用的主题和 Card CSS 都值得查一查，两者都有可能是原因。

## 相关指南

- [角色卡 CSS 主题指南](card-css-theming.md)
- [外观设置](appearance-settings.md)
- [服务器配置参考](../CONFIGURATION.md)
- [远程访问：Basic Auth 与 IP 允许列表](../REMOTE_ACCESS.md)
