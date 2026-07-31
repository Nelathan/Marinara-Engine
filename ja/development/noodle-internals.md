# Noodleプロンプトの内部構造(開発者向け)

Noodleの生成プロンプトがコードのどこにあるか、どうカスタマイズするか、最終的なプロンプトをどう調べるかをまとめた開発者向けの資料です。エンドユーザーはNoodleの**Settings**(設定)パネルから設定します。使い方は`docs/noodle/`のNoodleガイドを参照してください。

## プロンプトの所在マップ

現在のNoodleには、コードに直接書かれたテキスト生成プロンプトが1つ、登録済みのテキストプロンプトの上書きが1つ、登録済みの画像プロンプトの上書きが1つあります。

| 用途 | 所在 | 主なシンボル | カスタマイズの方法 |
| ----------------------------------------------------------- | ------------------------------------------------------------------ | ----------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| タイムラインの投稿、返信、フォロー、アンケート、投票、ダイジェスト | `packages/server/src/routes/noodle.routes.ts` | `buildRefreshPrompt()` | コード内のシステムメッセージとコンテキストメッセージを直接編集します。文体と創作の自由度に関する部分は、下の**Noodle Timeline Voice & Tone**の上書きに委ねています。残り(スキーマに直結する出力形式の規則)はUIからは変更できません。 |
| タイムラインの文体に関する指示(システムプロンプトの一部) | `packages/server/src/services/prompt-overrides/registry/noodle.ts` | `NOODLE_TIMELINE_VOICE` (`noodle.timelineVoice`) | **Settings -> Generations -> Image Generation Prompt Overrides -> Noodle Timeline Voice & Tone**で編集するか、登録されているデフォルト(`noodle-prompt.ts`の`noodleTimelineVoiceDefaultText(enhanced)`)をコード側で変更します。対象は意図的に文体だけに絞ってあります。構造化アクションの上限、target項目の規則など、スキーマに直結する指示はこの上書きの外にハードコードしてあり、文章を書き換えても`noodleGeneratedRefreshSchema`の解析が壊れないようにしてあります。編集していないデフォルトはNoodleの設定`enableEnhancedTimelineWriting`(`ctx.enhanced`)に従い、オフのときは元の1行の文体指示になります。独自の上書きテキストを保存すると、この設定に関係なくそちらが優先されます。 |
| 初回に作られるキャラクターアカウントのプロフィール | `packages/server/src/routes/noodle.routes.ts` | `generateMissingNoodleProfiles()` | コード内のシステムメッセージとユーザーメッセージを直接編集します。先に参加者の選定が走り、選ばれたキャラクターアカウントのうち`profileGenerated`がないものだけがこのプロンプトに渡ります。 |
| 生成した投稿の画像プロンプト | `packages/server/src/services/prompt-overrides/registry/noodle.ts` | `NOODLE_IMAGE_POST` (`noodle.imagePost`) | **Settings -> Generations -> Image Generation Prompt Overrides -> Noodle Post Image**で編集するか、登録されているデフォルトをコード側で変更します。 |
| Noodle専用の画像指示のデフォルト | `packages/shared/src/schemas/noodle.schema.ts` | `DEFAULT_NOODLE_SETTINGS.imageGenerationPrompt` | UIでNoodleの設定を変更するか、コード側でスキーマのデフォルトを変更します。 |
| タイムライン生成に挿入する、同意済みチャットのコンテキスト | `packages/server/src/routes/noodle.routes.ts` | `buildOptedInChatContext()` | コンテキストの組み立てをコード側で変更します。参加の同意は各チャットの設定のままです。 |
| タイムラインの投稿と返信に渡す画像入力 | `packages/server/src/services/noodle/noodle-vision.ts` | `prepareNoodleVisionAttachments()` | 画像の選択、正規化、上限、テキストのみへのフォールバックをコード側で変更します。 |
| チャットのプロンプトに挿入するNoodleの活動 | `packages/server/src/services/noodle/noodle-context.ts` | `buildRecentSocialMediaActivityBlock()` | 絞り込みやブロックの組み立てをコード側で変更します。対象モードと件数の上限はNoodle Settingsから操作でき、生成されるブロック全体には8,192トークンの上限があります。 |
| 生成JSONの取り決め | `packages/shared/src/schemas/noodle.schema.ts` | `noodleGeneratedRefreshSchema` | プロンプト、ルートの処理、共有の型、回帰テストと必ずまとめて変更します。 |
| タイムライン生成に挿入するロアブックの世界設定 | `packages/server/src/routes/noodle.routes.ts` | `buildRefreshPrompt()`(`processLorebooks()`を呼び出す) | Noodleの設定**Lorebook context**(`enableLorebookContext`、デフォルトはオフ)で制御します。グループチャットと同じ複数キャラクター対応の`processLorebooks()`を再利用し、`noodle-prompt.ts`の`noodleLorebookTokenBudget()`が返すNoodle専用のトークン枠を使います。この枠は有効なキャラクター数に応じて増減し、8,192トークンで頭打ちになります。Noodleにはsticky/cooldownのタイミングを保持するチャットごとの領域がないため、`previewOnly: true`で動きます。 |

タイムラインとプロフィールのプロンプトは、現時点ではPrompt OverridesのUIに並んでいません。そこに現れるNoodleの生成プロンプトは**Noodle Post Image**テンプレートだけです。Noodle側の**Prompt instructions**欄の内容はこの画像テンプレートに渡ります。タイムラインの文章を書くプロンプトには影響しません。

画像のルートは`NOODLE_IMAGE_POST`を読み込み、その結果を`compileImagePrompt()`に通してから画像のプロバイダーへ送ります。そのため、最終的なリクエストは選択中の画像スタイルプロファイルや接続のデフォルトからも影響を受けます。

## 最終的なプロンプトを調べる

**Debug Mode**(デバッグモード)をオンにして手動で更新すると、モデルへ送られた最終的なプロフィールとタイムラインのメッセージが共有のサーバーロガーに記録されます。次の行を探してください。

```text
[debug/noodle] Profile prompt sent to model
[debug/noodle] Prompt sent to model
[debug/noodle] Attached N timeline image input(s) to the refresh prompt
```

タイムラインの画像データがbase64のままデバッグログに書き出されることはありません。記録されるテキストには、モデルへ送ったものと同じ投稿と返信の添付キー、そしてネイティブの画像入力の数だけが含まれます。Noodleはこれらの入力を`noodle-vision.ts`で正規化し、件数を制限します。プロバイダーが画像入力を明確に拒否した場合、ルートはその旨を記録し、代わりに組み立て済みのテキストのみのプロンプトを送ります。

画像については、**Settings -> Generations -> Image Generation**の**Expose media prompts before sending**をオンにすると、リクエストを送る前に、最終的に組み立てられた肯定プロンプトと否定プロンプトを確認して編集できます。

## 安全に編集するために

プロンプトの組み立ては互換性を壊しやすい境界です。編集するときは、プロンプト、`noodleGeneratedRefreshSchema`、ルートの処理、そしてNoodleのメンションとアンケートの回帰テストを揃えて保ってください。最低限、次を実行します。

```bash
pnpm check
pnpm regression:prompt
pnpm regression:noodle
```

## 関連ガイド

- [Noodle: アプリ内のソーシャルタイムライン](../noodle/overview.md)
- [Noodleの設定とチャットへの引き継ぎ](../noodle/settings.md)
- [アーキテクチャマップ(開発者向け)](architecture-map.md)
