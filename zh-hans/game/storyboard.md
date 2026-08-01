# 分镜引擎指南

本指南介绍 Marinara Engine 里的分镜。分镜会把写完的故事文本变成一小组关键帧图像，还可以加上动画片段。Game Mode(游戏模式) 的分镜对应一个已完成的 GM 回合。Roleplay(角色扮演) 的分镜把几轮已完成的往来合成一段内嵌的剧集。Conversation(对话模式) 的聊天不使用分镜。

## 分镜是什么

Game Mode 是由 AI 游戏主持人（GM）主持、按回合推进冒险的聊天模式。GM 讲完一个叙述回合后，分镜引擎可以为这一个回合配图。在 Roleplay 里，Storyboard 智能体会读取上一次成功生成剧集之后所有已完成的用户消息和 Assistant 消息。

Marinara 会读取 GM 的叙述，把它切分成一小组有先后顺序的关键帧。每个关键帧是这个回合里某一瞬间的一张画面。一个分镜包含 1 到 6 个关键帧。默认是 3 个。

每个关键帧都绑定回合文本中的一段范围。这些文本范围叫作阅读分段。往下读这个回合时，一个小查看器会显示与当前阅读位置对应的关键帧。

规划图像之前，Marinara 会先去掉这个回合里的 GM 命令标记。GM 命令标记是 GM 消息里隐藏的指令标记，比如掷骰或游戏状态更新。去掉它们，画面里才不会出现这些内容。

关键帧静态图保存在 **Gallery**(图库) 的 **Images** 选项卡下。关键帧动画片段作为场景视频保存在 **Videos** 选项卡下。它们就是普通的 Gallery 条目，所以每个关键帧都可以单独预览、下载、置顶，或者复制它的提示词。

## Roleplay 分镜剧集

Roleplay 分镜和 Illustrator 是彼此独立的两套机制。Illustrator 照常生成它平时那种单张图像，同时 Storyboard 会从聊天中已完成的一段内容里规划出一个或多个有顺序的关键帧。

1. 在 **Agents > Download Agents**(智能体 > 下载智能体) 里安装 **Storyboard**。
2. 打开一个 Roleplay 聊天，然后在 **Chat Settings > Agents**(聊天设置 > 智能体) 里添加 **Storyboard**。
3. 在 Storyboard 卡片里选择 **Manual only**、**Still images** 或 **Animations**。
4. 选择提示词连接、图像连接，以及可选的视频连接。图像连接是必需的。
5. 手动生成剧集时，打开 **Gallery** 并选择 **Create storyboard**。自动剧集则要等设定数量的用户消息和 Assistant 消息累积够了，并且一条 Assistant 回复生成完成之后才会运行。

默认间隔是 1，所以每生成完一条新的 Assistant 回复，就可能出现一段自动剧集。把 **Messages per episode** 调大，可以让对白和你来我往先积累一段。用户消息和 Assistant 消息都会推进这个间隔计数。达到间隔时，Marinara 会把上一次成功生成分镜之后的消息合到一起，范围限定在最近的一个窗口内。打开一个已有的聊天不会回补旧消息；剧集生成失败也不会推进成功节奏的锚点。

Roleplay 的关键帧会内嵌显示在结束该剧集的那条 Assistant 回复之后。多关键帧的分镜上有箭头，用它在各帧之间切换。图像和片段同样会保存到 Gallery 里。

Roleplay 的规划分成四层，都可以在全局的 **Agents > Storyboard** 设置里编辑：

- **Episode contract** 负责从传入的消息里挑出已完成的故事节拍。
- **Visual style** 提供普通/动漫、NovelAI、美漫、彩色漫画和黑白漫画几种选择。
- **Animation addon** 只在生成动画分镜时才会加入。它把插图当作严格的 T=0 帧，然后描述简单的动作、镜头行为、原文对白、音效、环境音，以及结尾的定格。
- **Output contract** 定义规划模型返回的关键帧 JSON。

这几段 Roleplay 提示词不会取代针对 Game Mode 优化过的规划器库。图像和视频服务商的格式化器仍然是共用的，也可以自由选择。动画方案不绑定具体服务商，所以可以走 Google Gemini Omni、LTX/ComfyUI，或者任何一个已配置好、支持图生视频请求的 Video Generation 连接。不同服务商的能力和输出质量仍有差别。

## Game Mode 分镜

本节介绍如何为 Game Mode 的回合配置、生成、检查和动画化分镜。

## 开始之前

分镜能正常出图之前，有几样东西要先准备好。

1. 一个 Game Mode 聊天。下面的配置专门针对 Game Mode 的流程。
2. 一个可用的图像连接，给游戏的 Illustrator 使用。下面两个地方设一个就行：
   - 已有的游戏：打开 **Chat Settings**，进入 **Agents**，找到 **Illustrator** 卡片。开启 **Game Illustrator**，选一个 **Image Connection**。
   - 新游戏：在设置向导里开启 **Visual Generation**，选一个 **Image Generation Connection**。
3. 建议用一个够强的新图像模型。应用推荐使用当前最先进的图像模型，或者与 Google Nano Banana 2 Lite 相当的模型。

要生成动画片段，还需要一个视频连接。参见下面的动画配置步骤。

没有设置图像连接时，分镜请求会失败并给出这条提示：“Choose an Illustrator image connection in Game Settings first.”

想让角色形象在各个关键帧之间保持稳定，就用带头像的角色卡，并在 **Illustrator** 卡片里开启 **Send Avatar References**。这样每个角色的头像都会作为参考图一起发出去。

## 快速上手

1. 打开或新建一个 Game Mode 聊天。
2. 按上一节的说明配置好图像连接。
3. 一直玩到 GM 讲完一个叙述回合。
4. 打开 **Gallery** 面板。
5. 点击 **Create storyboard**。运行期间按钮会显示 **Creating...** 和一个转圈图标。
   - 如果 **Settings > Generation**(设置 > 生成) 里开启了 **Expose image prompts before sending**，就要先逐个检查并修改每个关键帧编译出来的提示词，然后确认生成。
6. 继续往下读这个回合。浮动查看器会出现，并随着阅读进度切换关键帧。

如果关掉了查看器，可以重新打开。在 **Gallery** 面板里点击 **View storyboard**。

分镜生成期间，**Gallery** 里会显示这条横幅：“Storyboard generation is running. Keyframes will appear in the game storyboard viewer when ready.”

## 自动分镜和手动分镜

分镜可以手动生成，也可以交给 Marinara 自动生成。

手动指的就是 **Gallery** 里的 **Create storyboard** 按钮。只有点它的时候，才会为最近一个已完成的 GM 叙述回合生成分镜。它也可以用来刷新当前回合或重新配图，自动分镜关着的时候一样能用。

自动分镜按聊天单独设置。控件在下面两个地方：

- 新游戏：设置向导里的 **Visual Generation**，再往下的 **Storyboards** 小节。
- 已有的游戏：**Chat Settings** 里的 **Agents**，然后是 **Storyboards** 卡片。

**Automatic Storyboard Illustrations** 会在每个 GM 回合结束后生成静态关键帧图像，不用点任何按钮。这条路成本更低。通过向导创建的新游戏，只要开启了 **Visual Generation**，它就默认开启。但在 **Game Illustrator** 配置好之前，它不起作用。

自动分镜不会为了让人审阅提示词而暂停回合结束后的流程。开启了 **Expose image prompts before sending** 时，要查看和修改每个关键帧最终编译出的提示词，就改用手动的 **Create storyboard**。自动运行不会弹出窗口，这样人不在的时候游戏也不会卡住。

**Automatic Storyboard Animations** 会额外为每个关键帧生成一段 MP4 片段。它默认关闭。它需要静态插图，再加一个视频连接。开启动画的同时也会自动开启插图。关闭插图则会同时关闭动画。

配置动画片段的步骤：

1. 在 **Settings** 里的 **Connections**(连接) 中创建一个 **Video Generation** 连接。
2. 在向导的 **Video Generation Connection** 输入框里选中它，或者在 **Chat Settings**、**Agents**、**Scene Videos** 里的 **Video Connection** 中选。
3. 开启 **Automatic Storyboard Animations**。

没有视频连接就开启动画，向导会警告：“Choose a Video Generation connection below to save automatic storyboard animations.”

一次分镜通常会产生 3 个图像任务，每个关键帧一个。开了动画之后，还会额外产生最多 3 个视频任务。数量跟着 **Keyframes per Turn** 走，选 5 就可能是 5 个图像任务加最多 5 个视频任务。视频任务慢得多，费用也更高。先从静态插图开始，只在能接受等待和费用的聊天里再加动画。

## 分镜设置

下面这些全都在 **Storyboards** 卡片里。打开 **Chat Settings**，进入 **Agents**，再找到 **Storyboards**。

| 设置 | 默认值 | 作用 |
| --- | --- | --- |
| **Automatic Storyboard Illustrations** | 向导创建且开启了 Visual Generation 的新游戏为 On，其他情况为 off | 每个 GM 回合结束后生成静态关键帧 |
| **Automatic Storyboard Animations** | Off | 每个关键帧额外加一段 MP4 片段，需要视频连接 |
| **Keyframes per Turn** | 3(范围 1 到 6) | 每个回合规划多少个关键帧 |
| **Animation Clip Duration** | 6 秒（范围 1 到 15） | 每段片段的时长 |
| **Viewer Display** | Floating | 浮动面板或整屏背景 |
| **Illustration Planner** | Still Keyframes | 规划成品静态关键帧及其图像描述 |
| **Animation Planner** | Comic Page Animation | 规划可用于动画的源图像和运动指示 |
| **Use Storyboard Template** | On | 用选中的 Storyboard Illustration Prompt 格式化规划好的场景。想直接用 NovelAI 标签提示词就关掉它 |
| **Storyboard Illustration Prompt** | Game Scene Illustration | 把每个规划好的关键帧格式化成图像模型能用的形式 |
| **Storyboard Video Prompt** | 与 Game Video Prompt 相同 | 只用于分镜关键帧片段的运动提示词 |

**Keyframes per Turn** 是一个滑块。引擎会尽量规划出这么多关键帧。回合太短时可能会少一些。但它绝不会规划超过 6 个。

**Animation Clip Duration** 填的是秒数。除非 **Automatic Storyboard Animations** 已开启，否则它是灰的。在没有自己填值之前，它按默认的 6 秒走，并显示一个 **Storyboard default** 标记。自己填了值之后，会出现一个 **Use storyboard default** 按钮用来清除。有些视频服务商会把这个值压到更低的上限，所以最终时长并不保证。

在 **Background** 查看器模式下，每段动画会在对应的故事节拍激活时带声音播放一次。播放期间叙述文本可以照常显示，但叙述的自动播放会等片段放完。片段结束后，动画停在最后一帧。游戏工具栏在电脑和手机上都提供重播、播放/暂停和静音控件。浮动模式下的分镜视频同样只播放一次，可以手动重播，不会无限循环。

视觉方案由这两个规划器生成。静态分镜用 **Illustration Planner**。生成视频时用 **Animation Planner**，它会同时给出一段可用于动画的图像描述和一段精简的运动指示。

接着由 **Storyboard Illustration Prompt** 把规划器给出的图像描述整理成发给图像模型的最终请求。已有的聊天默认用 **Game Scene Illustration**。**Storyboard Illustration** 则以规划器的结果为主，再补上角色参考、外观说明、战役美术指导和图像指令。

**Storyboard Video Prompt** 和 **Scene Videos** 卡片里通用的 **Game Video Prompt** 是两个独立的设置。它会把生成好的关键帧、Animation Planner 给出的运动指示和当前场景上下文合成发给视频模型的最终请求。想复用通用提示词，就保持继承来的选项不动；也可以选 **Anime Game Video**，只影响关键帧片段，手动的 Gallery 视频和 Game Assets 视频都不受影响。

想要按时长调整的美漫源页面，就选 **Comic Page Animation**，再选 **Comic Page Video**，把这些分格当作一段片段的有序视觉参考节拍来解读。原来的 **Comic Page** 仍然可以用于普通插图。单独选视频提示词不会改动继承来的 **Game Video Prompt**，手动的 Gallery 视频和 Game Assets 视频也保持原样。

用 **Storyboard Optimized** 呈现方式创建的新游戏，会自动选中 **Storyboard Game Prompt**、**Comic Page Animation** 规划器、**Storyboard Illustration** 和 **Comic Page Video**。随时可以选 **Still Keyframe Animation** 和 **Anime Game Video**，把这个聊天切换成单镜头组合。

### LTX 2.3 图生视频

跑本地 LTX 2.3 ComfyUI 工作流时，先这样配起步：Animation Planner 选 **LTX Simple Image-to-Video**，Storyboard Illustration Prompt 选 **Storyboard First Frame**，Storyboard Video Prompt 选 **LTX Director Video**。Animation Planner 会同时产出自然语言的 T=0 图像提示词和完整的运动段落。Storyboard First Frame 只做很轻的包装，把 T=0 场景交给自然语言图像服务商；LTX Director Video 则把运动段落送到工作流的 `%prompt%` 输入。**LTX Director Storyboard** 是更详细、会考虑时长的替代方案，它用的是同一套视频提示词和工作流约定。

模型选择、ComfyUI 占位符、完整的 Game 设置方案、验证步骤和排障方法，见 [Game Mode 中的 LTX 2.3 分镜](ltx-2-3-storyboards.md)。

## 风格预设

规划器预设决定每个关键帧怎么挑、怎么描述。有两个选择器分别指定它们：

- 分镜只出静态关键帧、不出视频时，用 **Illustration Planner**。默认：**Still Keyframes**。
- 开启了 **Automatic Storyboard Animations** 时，用 **Animation Planner**。默认：**Comic Page Animation**。

两个选择器各有各的预设列表。插图预设描述的是成品静态图，可以包含给读者看的美漫或漫画字体排版。动画预设描述的是稳定的首帧，外加按时长调整的运动指示。插图预设绝不会出现在 Animation Planner 的菜单里，动画预设也绝不会出现在 Illustration Planner 的菜单里。

| 通道 | 预设 | 适用场景 |
| --- | --- | --- |
| 插图 | **Still Keyframes** | 普通阅读。单场景关键帧，没有漫画分格、对话气泡、说明文字或音效字。 |
| 插图 | **NovelAI Keyframes** | 为 NovelAI V4 和 V4.5 调过的精简静态图标签提示词。想直接用标签提示词，就关掉 **Use Storyboard Template**。 |
| 插图 | **Comic Page** | 成品美漫页面插图，含 2 到 6 个分格、对话气泡、说明文字和字体排版。 |
| 插图 | **Colored Manga** | 成品彩色漫画构图，含赛璐璐上色、网点、对话气泡和音效字。 |
| 插图 | **B&W Manga** | 成品黑白漫画墨线、网点、大面积涂黑、对话气泡和音效字。 |
| 动画 | **Still Keyframe Animation** | 有序的单镜头，首帧严格固定，一个主要动作，简单的镜头行为，环境动态，以及结尾定格。 |
| 动画 | **Anime Episode Director** | TV 动画式的单镜头，首帧保持连贯，运动指示精简，构图对服务商友好。 |
| 动画 | **NovelAI Keyframe Animation** | NovelAI 标签式首帧，时间控制和运动放在单独的动画指示里。 |
| 动画 | **Comic Page Animation** | 按时长调整的美漫源页面，其中按时间顺序排列的分格作为一段片段的有序视觉参考。 |
| 动画 | **Colored Manga Animation** | 无文字的彩色漫画首帧，运动会保留线稿和赛璐璐上色。 |
| 动画 | **B&W Manga Animation** | 无文字的单色首帧，运动会保留墨线和网点。 |

**Still Keyframe Animation** 预设是 **Still Keyframes** 在运动侧的对应项，风格中立。**Anime Episode Director** 则是另一个专门的选项，想要 TV 动画式的镜头规划时，把它和 **Anime Game Video** 搭配使用。它会把激烈暴力处理得不那么直白，尽可能改用预兆、遮挡、反应或事后画面来呈现。这样既能减少服务商的安全拒绝，又不改动 GM 认定的故事内容。

**Comic Page Animation** 预设会用动画片段时长来控制页面的分格密度。6 到 7 秒的片段默认 2 格，只有在三个简单节拍、每个约 2 秒时才允许出现第三格；8 到 10 秒用 2 到 3 格，更长的片段最多 4 格。动画页面优先保证视觉节奏，其次才是漫画字体排版，每一格都保持焦点集中，并留出一小段结尾定格。分格按阅读顺序遵循因果关系。**Comic Page Video** 通常一上来就进入第 1 格，只有在这样做不会提前泄露后续结果时，才允许用极短的整页交代镜头。

**NovelAI Keyframes** 预设写的是精简的 Danbooru 标签。Danbooru 标签是用逗号分隔的短关键词标签，一些动漫图像模型需要这种格式。选了动画、美漫或漫画预设，并不会因此开启动画。要生成片段，仍然需要开启 **Automatic Storyboard Animations** 并配好视频连接。

## 战役美术风格与图像风格方案

创建游戏时会生成一套战役级别的美术风格，用来保证视觉一致。已有的游戏可以打开 **Chat Settings > Agents > Illustrator**，在 **Campaign art style** 下面看到它。它可以修改、清空、恢复成创建时生成的原始描述，也可以直接关掉 **Use Campaign Art Style**。

战役美术风格和 **Image Style** 方案是两层独立的提示词。两个都开启时，Marinara 会把两层都带上。关掉或清空战役风格，选中的 Image Style 方案照样保留。这个设置对分镜关键帧和游戏生成的其他视觉素材都生效。

在 **Settings > Generation** 里开启 **Expose image prompts before sending** 之后，手动的 **Create storyboard** 请求会先把所有规划好的关键帧编译出的正面和负面提示词原样显示出来。在这个界面里做的修改只对这一次分镜生效，属于一次性覆盖，不会改动战役风格或 Image Style 方案的设置。

## 编辑分镜预设

内置预设是只读的。想做自己的预设，就在 **Storyboards** 卡片里打开 **Edit Illustration Planner Presets**、**Edit Animation Planner Presets**、**Edit Illustration Prompt Presets** 或 **Edit Video Prompt Presets**。每个部分只显示对应阶段的内置预设和自定义副本。

把内置预设复制成一份只属于当前聊天、可编辑的模板，再在对应的选择器里选中这份副本。Illustration Planner 的副本不能当作 Animation Planner 选，Animation Planner 的副本也不能当作 Illustration Planner 选。Storyboard Illustration Prompt 的副本只影响分镜图像。视频提示词的副本则和通用的 Game Video Prompt 共用，两个视频选择器都能选到。

每份自定义副本都有名称、一段简短说明，以及可以编辑的提示词正文。垃圾桶按钮会弹出确认窗口，确认后删除这份副本。这些副本只保存在那一个聊天里，不会在整个应用范围内共享。

## 分镜查看器

查看器会跟着阅读位置走。它显示的是阅读分段与当前回合文本位置对应的那个关键帧，而不是简单地拿“Gallery 里最新的一张图”。显示样式有两种，由 **Viewer Display** 决定。

**Floating** 是默认值。一个可拖动的小面板浮在游戏上方，标题栏写着 **Storyboard**。关键帧的视频就绪后它会播放视频；片段还在生成或生成失败时，就退回显示图像。

浮动查看器有这些控件：

- **Close storyboard viewer** 只在当前回合隐藏面板。下一个 GM 回合结束时它会重新出现。刷新页面同样会取消隐藏。
- **Drag storyboard viewer** 是标题栏上的拖动手柄。可以把面板拖到屏幕上任意位置。
- **Play storyboard video** 和 **Pause storyboard video** 控制片段的播放。片段开始时是静音的。
- **Mute storyboard video** 和 **Unmute storyboard video** 只在关键帧已经生成好片段时才显示。
- **Change storyboard viewer size** 在三种宽度之间循环：小、中（默认）、大。
- 角上的手柄可以自由缩放面板，并覆盖预设的尺寸档位。

**Background** 不用浮动卡片，而是让当前关键帧铺满整个游戏画面。图像或片段位于游戏控件的下层。它的阅读位置逻辑和浮动查看器完全一样。

背景模式有代价。它会关掉 Marinara 平时生成的场景地点背景。开着的时候，illustrator 弹出面板里的 **Generate background** 按钮是禁用状态，按钮上会显示这条说明：“Storyboard background display is active, so scene background generation is disabled.”

## 让效果更好

分镜的清晰程度取决于它读到的那个回合。好的回合会写清楚谁在动、什么发生了变化、关键时刻在哪里。像“战斗仍在继续”这样含糊的回合，能给引擎的作画依据远不如一个写明了具体动作和场景细节的回合。

想让效果更稳定：

- 创建游戏时，把设定、基调和美术风格写具体。
- 用带详细头像的角色卡，并开启 **Send Avatar References**。
- 叙述里把重要的服装、伤势、道具和地点交代清楚。
- 想要什么样的成品质感，就用图像风格方案去指定。
- 普通阅读用 **Still Keyframes**，开了动画片段就用美漫或漫画预设。

## NovelAI 选项

想发出精简的 NovelAI 请求，就在 **Storyboards** 卡片里选 **NovelAI Keyframes** 并关掉 **Use Storyboard Template**。这样规划好的场景提示词会直接发出去，同时外观、参考图、图像指令和风格这几项独立设置仍然可用。

**Use NovelAI Character Prompts** 会把每个出场角色通过 NovelAI 原生的 Add Character 说明文字和位置参数发送。它默认开启。注意：只有使用 novelai.net 上 V4 或 V4.5 模型的官方 NovelAI 连接才会生效。换成其他任何服务商或模型，这个开关都不起作用，Marinara 会改用共用的旧版提示词。

## 故障排查

**"Choose an Illustrator image connection in Game Settings first."** 打开 **Chat Settings**，进入 **Agents**，找到 **Illustrator** 卡片。开启 **Game Illustrator**，选一个 **Image Connection**。新游戏则在设置向导里开启 **Visual Generation**，选一个 **Image Generation Connection**。

**"Storyboards can only be generated from GM narration turns."** **Create storyboard** 只对已完成的 GM 叙述回合有效。它对玩家自己发的消息无效。等 GM 的回复生成完，再试一次。

**"This GM turn has no narration to storyboard."** 这个回合里没有可以作画的故事文本。当一个 GM 回合只包含隐藏的命令标记、没有叙述时，就会这样。继续玩下去，等 GM 写出带故事文本的回合，再给那个回合生成分镜。

**图像出来了，但没有视频。** 视频需要 **Automatic Storyboard Animations** 已开启，同时还要选好 **Video Generation** 连接。动画关着时，分镜只生成静态关键帧。

**自动分镜不运行。** 检查 **Automatic Storyboard Illustrations** 或 **Automatic Storyboard Animations** 是否已开启。再检查图像连接是否设置好，以及 GM 回合是否已经流式输出完毕。已经有分镜的回合，Marinara 不会再生成第二个。不过仍然可以在 **Gallery** 里用 **Create storyboard** 手动重做。

**分镜只出了一半或者卡住了。** 这通常意味着一个或多个图像、视频任务失败、超时，或者撞上了服务商的速率限制。违禁内容也会导致任务被拦下。服务商响应慢的话，可以在 `.env` 文件里调高图像和视频的生成超时时间，然后重启 Marinara。具体的变量名见[服务器配置参考](../CONFIGURATION.md)。

想进一步诊断，把日志级别设为 debug，然后观察服务器日志。分镜相关的日志行带有 `[debug/game/storyboard-illustrator]`、`[debug/game/storyboard-image-preview]`、`[debug/game/storyboard-image-assets]` 和 `[debug/game/storyboard-video]` 标记。

## 相关指南

- [场景视频生成](../media/scene-video.md)
- [图像生成服务商](../media/image-providers.md)
- [Game Mode：入门](getting-started.md)
- [Game Mode 中的 LTX 2.3 分镜](ltx-2-3-storyboards.md)
