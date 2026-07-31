# 絵コンテエンジンガイド

このガイドでは、Marinara Engineの絵コンテについて説明します。絵コンテは、完成した物語の本文を数枚のキーフレーム画像に変換し、動画クリップを追加することもできる機能です。Game Modeの絵コンテは、終了したGMの1ターンを対象にします。Roleplayの絵コンテは、完了した複数のメッセージをまとめて1つのエピソードとしてチャット内に表示します。Conversationのチャットに絵コンテはありません。

## 絵コンテとは

Game Modeは、AIのゲームマスター(GM)がターン制の冒険を語るチャットモードです。GMが1ターン分の語りを終えると、絵コンテエンジンがそのターンだけを絵にします。Roleplayでは、Storyboardエージェントが、前回成功したエピソード以降の完了したユーザーのメッセージとAIの返信を読み取ります。

MarinaraはGMの語りを読み取り、順序の付いた数枚のキーフレームに分割します。キーフレームは、そのターンのある瞬間を描いた1枚の絵です。1つの絵コンテに入るキーフレームは1枚から6枚で、デフォルトは3枚です。

各キーフレームは、ターンの本文の一定の範囲と結び付いています。この本文の範囲をリーダーセクションと呼びます。ターンを読み進めると、小さなビューアーが今読んでいる位置に対応するキーフレームを表示します。

Marinaraは画像を計画する前に、ターンからGMコマンドタグを取り除きます。GMコマンドタグとは、ダイスロールや世界の状態の更新など、GMのメッセージに隠された指示用のタグです。絵に写り込まないように削除します。

キーフレームの静止画は**Gallery**(ギャラリー)の**Images**タブに保存します。キーフレームのクリップはシーン動画として**Videos**タブに保存します。通常の**Gallery**の項目と同じ扱いなので、キーフレーム1枚ごとにプレビュー、ダウンロード、ピン留め、プロンプトのコピーができます。

## Roleplayの絵コンテのエピソード

Roleplayの絵コンテはIllustratorとは別の機能です。Illustratorはこれまでどおり単体の画像を作り続け、Storyboardはチャットの完了した区間から順序の付いた1枚以上のキーフレームを計画します。

1. **Agents > Download Agents**から**Storyboard**をインストールします。
2. Roleplayのチャットを開き、**Chat Settings > Agents**で**Storyboard**を追加します。
3. **Storyboard**カードで**Manual only**、**Still images**、**Animations**のいずれかを選びます。
4. プロンプト、画像、そして必要なら動画の接続を選びます。画像の接続は必須です。
5. 手動でエピソードを作るときは、**Gallery**を開いて**Create storyboard**を選びます。自動のエピソードは、新しく完了したAIの返信が設定した件数に達すると実行します。

デフォルトの間隔は1なので、新しく完了したAIの返信ごとに自動のエピソードが現れることがあります。**Assistant messages per episode**の値を大きくすると、セリフや掛け合いがたまってからエピソードを作れます。間隔に達すると、Marinaraは前回成功した絵コンテ以降のメッセージを、直近の一定範囲にかぎってまとめます。既存のチャットを開いても、古いメッセージをさかのぼって処理することはありません。エピソードが失敗した場合も、成功を基準にした間隔の起点は進みません。

Roleplayのキーフレームは、エピソードの区切りとなったAIの返信の直後にそのまま表示します。キーフレームが複数ある絵コンテでは、矢印でフレームを切り替えます。画像とクリップは**Gallery**にも保存します。

Roleplayの計画には、全体設定の**Agents > Storyboard**にある編集できる4つの層があります。

- **Episode contract**は、渡されたメッセージから完了した物語の見せ場を選びます。
- **Visual style**は、通常とアニメ、NovelAI、漫画、カラー漫画、モノクロ漫画の選択肢を用意します。
- **Animation addon**は、アニメーション付きの絵コンテのときだけ含まれます。イラストをT=0のフレームそのものとして扱い、単純な動き、カメラの挙動、元になるセリフ、効果音、環境音、終わりの静止を記述します。
- **Output contract**は、計画するモデルが返すキーフレームのJSONを定義します。

これらのRoleplay向けのプロンプトは、最適化されたGame Modeのプランナー一式を置き換えるものではありません。画像と動画のプロバイダー向けの整形プロンプトは共通のまま選べます。アニメーションの計画はプロバイダーを選ばないので、Google Gemini Omni、LTX/ComfyUI、あるいはimage-to-videoのリクエストに対応する設定済みのVideo Generationの接続でも使えます。ただしプロバイダーの機能と出力の品質には差があります。

## Game Modeの絵コンテ

この節では、Game Modeのターンに対する絵コンテの設定、生成、確認、アニメーション化のしかたを説明します。

## 始める前に

絵コンテを生成するには、いくつか準備が必要です。

1. Game Modeのチャット。以下の設定手順はGame Modeの流れに向けたものです。
2. ゲームのイラスト担当が使える画像の接続。次のどちらかで設定します。どちらか一方だけで十分です。
   - 既存のゲーム: **Chat Settings**(チャット設定)を開き、**Agents**(エージェント)から**Illustrator**カードへ進みます。**Game Illustrator**をオンにして**Image Connection**を選びます。
   - 新しいゲーム: 設定ウィザードで**Visual Generation**をオンにして、**Image Generation Connection**を選びます。
3. 性能の高い最近の画像モデルを推奨します。アプリは最新世代の画像モデル、またはGoogle Nano Banana 2 Lite相当のモデルを勧めます。

動画クリップを使う場合は、動画の接続も必要です。下のアニメーションの手順を参照してください。

画像の接続が未設定のまま絵コンテを要求すると、次のメッセージが出て失敗します: 「Choose an Illustrator image connection in Game Settings first.」

キーフレーム間でキャラクターの見た目をそろえたいときは、アバター付きのキャラクターカードを使い、**Illustrator**カードの**Send Avatar References**をオンにします。これで各キャラクターのアバターが参照画像として送られます。

## クイックスタート

1. Game Modeのチャットを開くか、新しく作成します。
2. 上の節のとおりに画像の接続を設定します。
3. GMが1ターン分の語りを終えるまでプレイします。
4. **Gallery**パネルを開きます。
5. **Create storyboard**をクリックします。実行中はボタンがスピナー付きの**Creating...**に変わります。
   - **Settings > Generation**で**Expose image prompts before sending**を有効にしている場合は、キーフレームごとに組み立て済みのプロンプトを確認して編集し、生成を確定します。
6. そのままターンを読み進めます。フローティングのビューアーが現れ、読んでいる位置に合わせてキーフレームが切り替わります。

ビューアーを閉じたあとで開き直すには、**Gallery**パネルの**View storyboard**をクリックします。

絵コンテの生成中、**Gallery**には次のバナーが出ます: 「Storyboard generation is running. Keyframes will appear in the game storyboard viewer when ready.」

## 自動生成と手動生成

絵コンテは手動で作ることも、Marinaraに任せることもできます。

手動での生成は、**Gallery**の**Create storyboard**ボタンです。クリックしたときだけ、直近の終了したGMの語りのターンに対して絵コンテを作ります。自動生成をオフにしていても、このボタンで現在のターンを作り直したり描き直したりできます。

自動生成の設定はチャットごとです。設定項目は次のどちらかにあります。

- 新しいゲーム: 設定ウィザードの**Visual Generation**にある**Storyboards**の小見出し。
- 既存のゲーム: **Chat Settings**の**Agents**にある**Storyboards**カード。

**Automatic Storyboard Illustrations**をオンにすると、GMのターンが終わるたびに静止画のキーフレームを自動で作ります。クリックは不要です。こちらのほうが費用を抑えられます。ウィザードから作った新しいゲームでは、**Visual Generation**を有効にすると自動的にオンになります。ただし**Game Illustrator**を設定するまでは何も起きません。

自動生成では、ターン完了後の処理をプロンプト確認のために止めることはありません。**Expose image prompts before sending**を有効にしていて、最終的に組み立てられたキーフレームのプロンプトをすべて見て編集したいときは、手動の**Create storyboard**を使ってください。自動生成はウィンドウを出さずに進むので、チャットを離れていてもゲームが止まりません。

**Automatic Storyboard Animations**をオンにすると、キーフレームごとにMP4のクリップも作ります。デフォルトはオフです。静止画のイラストに加えて動画の接続が必要です。アニメーションをオンにするとイラストも自動でオンになり、イラストをオフにするとアニメーションもオフになります。

クリップを設定する手順は次のとおりです。

1. **Settings**の**Connections**で**Video Generation**の接続を作成します。
2. ウィザードの**Video Generation Connection**欄、または**Chat Settings**の**Agents**にある**Scene Videos**の**Video Connection**で選びます。
3. **Automatic Storyboard Animations**をオンにします。

動画の接続がないままアニメーションをオンにすると、ウィザードが次のように警告します: 「Choose a Video Generation connection below to save automatic storyboard animations.」

絵コンテは通常、キーフレーム1枚につき1件、合わせて3件の画像ジョブを作ります。アニメーションをオンにしていると、さらに最大3件の動画ジョブを作ります。件数は**Keyframes per Turn**に従うので、5を選べば画像ジョブが5件、動画ジョブが最大5件になります。動画ジョブは処理がずっと遅く、費用も高くなります。まずは静止画のイラストから始めて、待ち時間と費用が許容できるチャットにだけアニメーションを足してください。

## 絵コンテの設定

以下はすべて**Storyboards**カードにあります。**Chat Settings**を開き、**Agents**から**Storyboards**へ進みます。

| 設定 | デフォルト | 動作 |
| --- | --- | --- |
| **Automatic Storyboard Illustrations** | ウィザードでVisual Generationを有効にした新規ゲームはOn、それ以外はOff | GMのターンごとに静止画のキーフレームを作ります |
| **Automatic Storyboard Animations** | Off | キーフレームごとにMP4のクリップを追加します。動画の接続が必要です |
| **Keyframes per Turn** | 3(範囲は1から6) | 1ターンあたりに計画するキーフレームの枚数 |
| **Animation Clip Duration** | 6秒(範囲は1から15) | クリップ1本の長さ |
| **Viewer Display** | Floating | フローティングパネルか、画面全体の背景か |
| **Illustration Planner** | Still Keyframes | 完成した静止画のキーフレームと、その画像の説明を計画します |
| **Animation Planner** | Comic Page Animation | アニメーション向きの元画像と動きの指示を計画します |
| **Use Storyboard Template** | On | 計画したシーンを、選んだStoryboard Illustration Promptで整形します。NovelAI向けにタグをそのまま送りたいときはオフにします |
| **Storyboard Illustration Prompt** | Game Scene Illustration | 計画された各キーフレームを画像モデル向けに整形します |
| **Storyboard Video Prompt** | Game Video Promptと同じ | 絵コンテのキーフレームのクリップにだけ使う動きのプロンプト |

**Keyframes per Turn**はスライダーです。エンジンはこの枚数だけキーフレームを計画しようとします。ターンが短いと枚数が減ることがあります。6枚を超えることはありません。

**Animation Clip Duration**は秒数で指定します。**Automatic Storyboard Animations**がオフのあいだは操作できません。値を設定するまではデフォルトの6秒が使われ、**Storyboard default**のピルが表示されます。自分で値を設定すると、それを消すための**Use storyboard default**ボタンが現れます。動画プロバイダーによっては指定より短い上限に丸められるため、長さは厳密には保証されません。

ビューアーが**Background**モードのときは、そのシーンの見せ場に切り替わった時点で各アニメーションが音声付きで1回だけ再生されます。再生中も語りは表示できますが、語りの自動再生はクリップの再生終了を待ちます。アニメーションは最後のフレームで停止したままになります。デスクトップでもモバイルでも、ゲームのツールバーから再生し直し、再生と一時停止、ミュートを操作できます。フローティング表示の絵コンテ動画も1回だけ再生され、繰り返し再生ではなく手動で再生し直す形になります。

視覚的な構成を組み立てるのは2つのプランナーです。**Illustration Planner**は静止画の絵コンテに使います。**Animation Planner**は動画を生成するときに使い、アニメーション向きの画像の説明と、簡潔な動きの指示の両方を作ります。

続いて**Storyboard Illustration Prompt**が、プランナーの作った画像の説明を、画像モデルへ送る最終的なリクエストに整形します。既存のチャットのデフォルトは**Game Scene Illustration**です。**Storyboard Illustration**はプランナーの結果を主役に保ちながら、キャラクターの参照情報、外見の補足、キャンペーンのアートディレクション、画像への指示を加えます。

**Storyboard Video Prompt**は、**Scene Videos**カードにある全体向けの**Game Video Prompt**とは別の設定です。生成されたキーフレーム、Animation Plannerの動きの指示、現在のシーンの状況を組み合わせて、動画モデルへ送る最終的なリクエストを作ります。全体向けのプロンプトを流用するなら継承のままにし、手動生成のGalleryやGame Assetsの動画を変えずにキーフレームのクリップだけ変えたいときは**Anime Game Video**を選びます。

長さを考慮した漫画のページを元画像にするなら**Comic Page Animation**を選び、そのコマを1本のクリップ用の順序付き参考カットとして解釈させるために**Comic Page Video**を選びます。通常のイラスト用には従来どおり**Comic Page**も使えます。動画側を別に選んでも、継承された**Game Video Prompt**と、手動生成のGalleryやGame Assetsの動画には影響しません。

**Storyboard Optimized**の表示形式で作成した新しいゲームでは、**Storyboard Game Prompt**、**Comic Page Animation**プランナー、**Storyboard Illustration**、**Comic Page Video**が選ばれます。**Still Keyframe Animation**と**Anime Game Video**を選べば、いつでも1カット構成の組み合わせに切り替えられます。

### LTX 2.3のimage-to-video

ローカルのLTX 2.3 ComfyUIワークフローを使うときは、Animation Plannerに**LTX Simple Image-to-Video**、Storyboard Illustration Promptに**Storyboard First Frame**、Storyboard Video Promptに**LTX Director Video**を選ぶところから始めます。Animation Plannerは、自然言語によるT=0の画像プロンプトと、動きを記述した完全な段落の両方を作ります。Storyboard First FrameはT=0のシーンを最小限の装飾で自然言語の画像プロバイダーへ渡し、LTX Director Videoは動きの段落をワークフローの`%prompt%`入力へ送ります。**LTX Director Storyboard**はより詳細で、クリップの長さを考慮する代替案です。動画のプロンプトとワークフローの取り決めは同じものを使います。

モデルの選び方、ComfyUIのプレースホルダー、Game設定の全体像、確認手順、トラブルシューティングについては[Game ModeのLTX 2.3絵コンテ](ltx-2-3-storyboards.md)を参照してください。

## スタイルのプリセット

プランナーのプリセットは、各キーフレームの選び方と描写のしかたを決めます。選択欄は2つあります。

- **Illustration Planner**は、動画なしで静止画のキーフレームを作るときに使います。デフォルトは**Still Keyframes**です。
- **Animation Planner**は、**Automatic Storyboard Animations**がオンのときに使います。デフォルトは**Comic Page Animation**です。

2つの選択欄はそれぞれ別のプリセット一覧を持ちます。イラスト用のプリセットは完成した静止画を記述し、読者向けの漫画やマンガの文字入れを含められます。アニメーション用のプリセットは、安定した最初のフレームと、長さを考慮した動きの指示を記述します。イラスト用のプリセットがAnimation Plannerのメニューに出ることはなく、アニメーション用のプリセットがIllustration Plannerのメニューに出ることもありません。

| 系統 | プリセット | 向いている用途 |
| --- | --- | --- |
| イラスト | **Still Keyframes** | 通常の読書向け。コマ割り、吹き出し、キャプション、効果音の文字を使わない単一シーンのキーフレーム。 |
| イラスト | **NovelAI Keyframes** | NovelAI V4およびV4.5に合わせた、静止画向けの簡潔なタグプロンプト。タグをそのまま送りたいときは**Use Storyboard Template**をオフにします。 |
| イラスト | **Comic Page** | 2から6コマ、吹き出し、キャプション、文字入れを備えた完成度の高い漫画ページ。 |
| イラスト | **Colored Manga** | セルシェーディング、スクリーントーン、吹き出し、効果音を使った完成度の高いカラー漫画の演出。 |
| イラスト | **B&W Manga** | 白黒のペン入れ、スクリーントーン、ベタ、吹き出し、効果音による完成度の高いモノクロ漫画。 |
| アニメーション | **Still Keyframe Animation** | 最初のフレームを厳密に指定した順序付きの単一カット。主となる動きは1つ、カメラの動きは単純、環境の動きと終わりの静止を伴います。 |
| アニメーション | **Anime Episode Director** | 放送アニメ風の単一カット。最初のフレームの連続性、簡潔な動きの指示、プロバイダーの制限に配慮した演出を行います。 |
| アニメーション | **NovelAI Keyframe Animation** | NovelAIのタグで書いた最初のフレーム。タイミングと動きは別のアニメーション指示に分けます。 |
| アニメーション | **Comic Page Animation** | 長さを考慮した漫画の元ページ。時系列に並んだコマが1本のクリップの順序付き参考カットになります。 |
| アニメーション | **Colored Manga Animation** | 文字を入れないカラー漫画の最初のフレーム。線画とセルシェーディングを保った動きを付けます。 |
| アニメーション | **B&W Manga Animation** | 文字を入れないモノクロの最初のフレーム。ペン入れとスクリーントーンを保った動きを付けます。 |

**Still Keyframe Animation**は、**Still Keyframes**に対応する画風を選ばない動き用のプリセットです。**Anime Episode Director**はこれとは別の専用の選択肢で、放送アニメ風のカット構成が欲しいときに**Anime Game Video**と組み合わせて使います。激しい暴力は直接的に描かず、可能な範囲で予兆、遮蔽、反応、事後の描写として演出するため、GMの本来の物語を変えずにプロバイダー側の安全機構による拒否を減らせます。

**Comic Page Animation**は、アニメーションのクリップの長さでページの密度を調整します。6から7秒のクリップではデフォルトで2コマになり、それぞれ約2秒の単純な見せ場が3つある場合にかぎり3コマを許します。8から10秒では2から3コマ、それより長いクリップでも4コマまでです。アニメーション用のページは漫画の文字入れよりも視覚的なタイミングを優先し、各コマの焦点を絞り、終わりに短い静止を残します。コマは読む順に原因と結果が並びます。**Comic Page Video**は通常すぐ1コマ目に入ります。全体を見せる導入は、後の展開を先に見せてしまわない場合にかぎり、ごく短くだけ許されます。

**NovelAI Keyframes**は簡潔なDanbooruタグを書きます。Danbooruタグとは、一部のアニメ系画像モデルが前提としている、カンマ区切りの短いキーワードのタグです。アニメーション用、漫画用、マンガ用のプリセットを選んでも、それだけでアニメーションがオンになるわけではありません。クリップを作るには**Automatic Storyboard Animations**と動画の接続が必要です。

## キャンペーンの画風と画像スタイルのプロファイル

ゲームの初期設定では、見た目を統一するためにキャンペーン全体の画風を生成します。既存のゲームでは**Chat Settings > Agents > Illustrator**を開くと、**Campaign art style**の下に表示されます。内容の編集、消去、初期設定で生成された文面への復元ができるほか、**Use Campaign Art Style**をオフにもできます。

キャンペーンの画風と**Image Style**のプロファイルは、別々のプロンプトの層です。両方を有効にすると、Marinaraは両方を含めます。キャンペーンの画風をオフにしたり消したりしても、選んだImage Styleのプロファイルはそのまま残ります。この設定は絵コンテのキーフレームだけでなく、ゲームが生成する他の画像素材にも適用されます。

**Settings > Generation**で**Expose image prompts before sending**を有効にしていると、手動の**Create storyboard**では、計画されたすべてのキーフレームについて、組み立て済みのポジティブプロンプトとネガティブプロンプトがそのまま先に表示されます。この確認画面での変更はその絵コンテだけの一時的な上書きで、キャンペーンの画風やImage Styleのプロファイルの設定を置き換えるものではありません。

## 絵コンテのプリセットを編集する

組み込みのプリセットは読み取り専用です。自分用のものを作るには、**Storyboards**カード内の**Edit Illustration Planner Presets**、**Edit Animation Planner Presets**、**Edit Illustration Prompt Presets**、**Edit Video Prompt Presets**のいずれかを開きます。各セクションには、その段階の組み込みプリセットと自作のコピーだけが並びます。

組み込みのプリセットを、そのチャットの中だけで編集できるテンプレートとしてコピーし、対応する選択欄でそのコピーを選びます。Illustration Plannerのコピーは、Animation Plannerとしては選べません。Animation Plannerのコピーも、Illustration Plannerとしては選べません。Storyboard Illustration Promptのコピーは絵コンテの画像にだけ影響します。動画のプロンプトのコピーは全体向けのGame Video Promptと共有されるため、どちらの動画の選択欄からも使えます。

自作のコピーには、名前、短い説明、編集できるプロンプト本文があります。ゴミ箱ボタンを押すと確認のウィンドウが出て、コピーを削除できます。これらのコピーはそのチャット1つに保存され、アプリ全体には共有されません。

## 絵コンテのビューアー

ビューアーは読んでいる位置を追いかけます。ターンの本文の現在位置に対応するリーダーセクションを持つキーフレームを表示する仕組みで、単に「Galleryの最新の画像」を出しているわけではありません。表示のしかたは2種類あり、**Viewer Display**で選びます。

デフォルトは**Floating**です。ゲームの上に、ドラッグできる小さなパネルが浮かびます。見出しは**Storyboard**です。キーフレームの動画が用意できていれば再生し、クリップが生成中か失敗している場合は画像を表示します。

フローティングのビューアーには次の操作があります。

- **Close storyboard viewer**は、現在のターンのあいだだけパネルを隠します。次のGMのターンが終わると再び表示されます。ページを再読み込みしても隠した状態は解除されます。
- **Drag storyboard viewer**は見出し部分のつまみです。パネルを画面のどこへでもドラッグできます。
- **Play storyboard video**と**Pause storyboard video**でクリップの再生を操作します。クリップはミュートの状態で始まります。
- **Mute storyboard video**と**Unmute storyboard video**は、そのキーフレームのクリップが生成済みのときだけ表示されます。
- **Change storyboard viewer size**は、小、中(デフォルト)、大の3段階の幅を順に切り替えます。
- 隅のつまみをドラッグするとパネルを自由にリサイズでき、サイズの段階指定より優先されます。

**Background**は、浮かぶカードではなく、ゲームの画面全体を現在のキーフレームで埋めます。画像やクリップはゲームの操作要素の後ろに表示されます。読んでいる位置に追従する仕組みはフローティングのビューアーと同じです。

Backgroundモードには引き換えの制約があります。Marinaraが通常生成するシーンの場所の背景がオフになります。このモードのあいだ、イラスト担当のポップオーバーにある**Generate background**ボタンは使えません。ボタンには次の注記が出ます: 「Storyboard background display is active, so scene background generation is disabled.」

## 結果を良くするために

絵コンテの分かりやすさは、読み取ったターンの分かりやすさで決まります。良いターンは、誰が動き、何が変わり、どこが山場なのかを明示します。「the fight continues」のような漠然としたターンは、具体的な動きや場所の描写があるターンに比べて、エンジンが描ける材料が少なくなります。

安定した結果を得るには次の点に気を付けます。

- 初期設定の段階で、ゲームの舞台、雰囲気、画風を具体的に決めておきます。
- 細部まで描いたアバター付きのキャラクターカードを使い、**Send Avatar References**をオンにします。
- 重要な衣装、傷、小道具、場所は語りの中ではっきり書きます。
- 仕上がりの好みに合わせて画像スタイルのプロファイルを使います。
- 通常の読書には**Still Keyframes**を使い、クリップをオンにするときは漫画かマンガのプリセットを使います。

## NovelAI向けの設定

NovelAIへ簡潔なリクエストを送りたいときは、**Storyboards**カードで**NovelAI Keyframes**を選び、**Use Storyboard Template**をオフにします。これで計画されたシーンのプロンプトがそのまま送られ、外見、参照画像、画像への指示、スタイルの各設定は別に使えるまま残ります。

**Use NovelAI Character Prompts**をオンにすると、画面に登場する各キャラクターをNovelAI本来のAdd Characterのキャプションと配置として送ります。デフォルトはオンです。注意点として、これが効くのはnovelai.netの公式NovelAI接続でV4またはV4.5のモデルを使う場合だけです。それ以外のプロバイダーやモデルではトグルは何もせず、Marinaraは共通の従来型プロンプトを使います。

## トラブルシューティング

**「Choose an Illustrator image connection in Game Settings first.」** **Chat Settings**を開き、**Agents**から**Illustrator**カードへ進みます。**Game Illustrator**をオンにして**Image Connection**を選びます。新しいゲームなら、設定ウィザードで**Visual Generation**を有効にして**Image Generation Connection**を選びます。

**「Storyboards can only be generated from GM narration turns.」** **Create storyboard**が動くのは、終了したGMの語りのターンに対してだけです。自分のプレイヤー側のメッセージには使えません。GMの返信が終わるのを待ってから、もう一度試してください。

**「This GM turn has no narration to storyboard.」** そのターンには絵にできる物語の本文がありません。GMのターンが隠しコマンドタグだけで、語りを含まない場合に起こります。GMが物語の本文を書くターンまで進めてから、そのターンで絵コンテを作ってください。

**画像は出るが動画が出ない。** 動画には**Automatic Storyboard Animations**がオンであることと、**Video Generation**の接続が選ばれていることの両方が必要です。アニメーションがオフのあいだ、絵コンテは静止画のキーフレームだけを作ります。

**自動生成が動かない。** **Automatic Storyboard Illustrations**か**Automatic Storyboard Animations**がオンになっているか確かめます。画像の接続が設定されていること、GMのターンのストリーミングが終わっていることも確認します。Marinaraは、すでに絵コンテのあるターンに対して2つ目の絵コンテを作ることはありません。作り直したいときは、**Gallery**の**Create storyboard**から手動で実行できます。

**絵コンテが途中までしかない、または止まったままになる。** たいていは画像か動画のジョブが1件以上、失敗するかタイムアウトするか、プロバイダーのレート制限に当たっています。禁止されている内容が原因でジョブが止まることもあります。プロバイダーの処理が遅い場合は、`.env`ファイルで画像生成と動画生成のタイムアウトを長くしてから、Marinaraを再起動してください。正確な変数名は[サーバー設定リファレンス](../CONFIGURATION.md)を参照してください。

さらに詳しく調べるには、ログレベルをdebugにしてサーバーのログを見てください。絵コンテのログ行には`[debug/game/storyboard-illustrator]`、`[debug/game/storyboard-image-preview]`、`[debug/game/storyboard-image-assets]`、`[debug/game/storyboard-video]`のタグが付きます。

## 関連ガイド

- [シーン動画の生成](../media/scene-video.md)
- [画像生成プロバイダー](../media/image-providers.md)
- [Game Mode: はじめに](getting-started.md)
- [Game ModeのLTX 2.3絵コンテ](ltx-2-3-storyboards.md)
