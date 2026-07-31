# Home Assistantとの連携

このガイドでは、Marinara EngineをHome Assistantにつなぐ方法を説明します。つなぐと、AIキャラクターがチャットの中から実際のスマートホームデバイスを操作できるようになります。照明、空調、カバー、メディアプレイヤーを動かせます。逆に、Home Assistantのオートメーションからメッセージを送り込むこともできます。

Home Assistantは、スマートホームデバイスを操作するための無料のオープンソースプラットフォームです。Home Assistantを使っていない場合、この連携は必要ありません。

## この連携でできること

この連携は、Home Assistantの中にインストールする小さなソフトウェアです。動作中のHome Assistantと、動作中のMarinara Engineサーバーを結び付けます。インストールすると、次の3つを自動で用意します。

- Marinaraの中にスマートホーム用のツールを作ります。これはPresetsパネルの**Functions**(関数)セクションに現れます。Marinaraではこれを「custom tools」または「Functions」と呼びます。Functionsの一般的な仕組みは[カスタムツールと関数呼び出し](../extending/custom-tools.md)を参照してください。
- Marinaraの中に**Home Assistant**という名前のAIエージェントを1つ作ります。エージェントとは、チャットと並行して動くAIのヘルパーです。[エージェント: チャットを支えるAIヘルパー](../agents/agents-overview.md)も参照してください。
- Home Assistant側からMarinaraを監視、操作できるように、Home Assistantのエンティティーをいくつか作ります。エンティティーとは、Home Assistant上のデバイス、センサー、コントロールのことです。

ツールのアドレスをコピーしたり、ツールを手作業で設定したりする必要はありません。初回セットアップで、連携がすべてを自動的に結線します。

## 事前に必要なもの

始める前に、次のものがすべてそろっているか確かめます。

- 動作中のHome Assistant(バージョン2024.1.0以降)。
- Home AssistantにインストールされたHACS。HACSはHome Assistant Community Storeの略で、標準では含まれないカスタム統合をインストールするためのツールです。
- インストール済みで動作中のMarinara Engine。Home Assistantを動かしているコンピューターから到達できる必要があります。デフォルトのアドレスは`localhost:7860`です。Home Assistantが別のデバイスで動いている場合は、後述のパスワードに関する注意も読んでください。
- Marinaraの`.env`ファイルに追加した`WEBHOOK_LOCAL_URLS_ENABLED=true`の設定。

`.env`ファイルは、Marinaraサーバーの設定を書いたプレーンテキストのファイルです。場所と編集方法は[サーバー設定リファレンス](../CONFIGURATION.md)で確認できます。

最後の設定が必要なのは、この連携がWebhookを使うからです。Webhookとは、あるアプリから別のアプリへ自動的にデータを送るためのWebアドレスです。Home AssistantのWebhookアドレスは、ローカルの平文`http`アドレスです。Marinaraは安全のため、ローカルの`http`アドレスへの呼び出しをデフォルトでブロックします。`WEBHOOK_LOCAL_URLS_ENABLED=true`を設定すると許可されます。

`.env`ファイルに次の行を追加します。

```
WEBHOOK_LOCAL_URLS_ENABLED=true
```

この設定は数秒で反映されます。Marinaraサーバーを再起動する必要はありません。

### Home Assistantが別のデバイスで動いている場合

この連携は、ユーザー名もパスワードも使わずにMarinaraへ接続します。セットアップの画面にも入力欄はありません。そのため、Home Assistantがどこで動いているかが重要になります。

- Home AssistantとMarinaraが同じコンピューターで動いていれば、そのままで接続できます。
- Home Assistantが別のデバイスで動いている場合、Marinaraはデフォルトで接続を拒否します。そのデバイスにはパスワードなしでの接続を許可する必要があります。1つの方法は、Marinaraの`.env`ファイルの`IP_ALLOWLIST`にそのデバイスのIPアドレスを追加することです。IPアドレスとは、ネットワーク上のデバイスを示す番号のアドレスです。完全に信頼できる家庭内ネットワークであれば、代わりに`ALLOW_UNAUTHENTICATED_PRIVATE_NETWORK=true`を設定してもかまいません。
- Marinaraを`BASIC_AUTH_USER`と`BASIC_AUTH_PASS`で保護している場合、連携はログインできません。この場合は同じコンピューターからか、`IP_ALLOWLIST`に載っているデバイスからしか動きません。

これらの設定の仕組みと選び方は[リモートアクセス](../REMOTE_ACCESS.md)を参照してください。

## Home Assistantに連携をインストールする

インストールは2段階です。まずHACSに追加し、次にセットアップします。

### HACSに追加する

1. Home Assistantで**HACS**を開きます。
2. 三点メニューを開き、**Custom repositories**(カスタムリポジトリー)をクリックします。
3. リポジトリーの入力欄に次のアドレスを入力します。

```
https://github.com/Pasta-Devs/Marinara-Engine
```

4. カテゴリーに**Integration**を選び、**Add**をクリックします。
5. **Marinara Engine**を検索してインストールします。
6. Home Assistantを再起動します。

### セットアップする

1. **Settings**(設定)から**Devices & Services**(デバイスとサービス)へ進み、**Add Integration**(統合を追加)をクリックします。
2. **Marinara Engine**を検索します。
3. Marinaraが動いている**Host**と**Port**を入力します。デフォルトは`localhost`と`7860`です。
4. **Submit**をクリックします。

そのアドレスでMarinaraに到達できない場合、Home Assistantはエラーを表示し、セットアップは完了しません。後述のトラブルシューティングを参照してください。

## Marinara Engineが自動で作るもの

セットアップに成功すると、連携が必要なものをすべて組み立てます。

- Home Assistantの中に専用のWebhookを登録します。
- Marinaraの**Functions**セクションにスマートホーム用のツールを作り、それぞれにそのWebhookのアドレスをあらかじめ設定します。
- 有効なツールをすべて列挙した**Home Assistant**エージェントをMarinaraに作ります。
- このガイドの後半で説明するHome Assistantのエンティティーを作ります。

## Home Assistantエージェントをチャットに追加する

エージェントを作っても、すべてのチャットに自動で付くわけではありません。スマートホームを操作したいチャットごとに追加します。

1. 目的のチャットを開きます。
2. **Chat Settings**(チャット設定)を開き、**Agents**セクションへ進みます。
3. **Home Assistant**エージェントをそのチャットに追加します。

Home Assistantエージェントは、Roleplay、Conversation、Gameのいずれのチャットでも動きます。追加すると、そのチャットのAIはスマートホーム用のツールを自動的に使えるようになります。チャット側でほかに何かをオンにする必要はありません。

## 動作を確認する

簡単な依頼を1つ送って、接続を確かめます。

1. 前述の手順で**Home Assistant**エージェントをチャットに追加します。
2. そのチャットで、ふつうの文章で依頼を入力します。例: `Turn on the office lights`。
3. メッセージを送信します。

AIが`ha_turn_on`などのスマートホーム用ツールを呼び出し、対応する照明が点灯するはずです。そのあとAIが実行した内容を伝えます。何も起きない場合は、`WEBHOOK_LOCAL_URLS_ENABLED=true`が設定されているか確かめ、トラブルシューティングを参照してください。

## 公開するツールのカテゴリー

この連携は、スマートホーム用のツールを8つのカテゴリーに分けています。どのカテゴリーをMarinaraに使わせるかは選べます。

カテゴリーを変えるには、**Settings**から**Devices & Services**へ進み、**Marinara Engine**をクリックしてから**Configure**(設定)をクリックします。次の2つの項目が表示されます。

- **Primary Chat**: Home Assistantのサービスが対象にするデフォルトのチャットです。サービスについてはこのガイドの後半で説明します。
- **Exposed Tool Categories**: Marinaraに使用を許可するツールカテゴリーの一覧です。

次の表に、各カテゴリーとデフォルトの状態、含まれるツールをまとめます。

| カテゴリー | デフォルト | ツール |
|---|---|---|
| Lights & Switches | On | ha_turn_on, ha_turn_off, ha_toggle, ha_set_brightness, ha_set_color, ha_set_color_temp |
| Climate | On | ha_set_temperature, ha_set_hvac_mode |
| Covers (Blinds & Garage) | On | ha_open_cover, ha_close_cover, ha_set_cover_position |
| Locks | Off | ha_lock, ha_unlock |
| Media Players | On | ha_media_play, ha_media_pause, ha_set_volume |
| Scenes & Scripts | On | ha_activate_scene, ha_run_script |
| Query | On | ha_get_state, ha_list_areas, ha_list_entities, ha_notify |
| Generic Service Calls (Advanced) | Off | ha_call_service |

**Locks**と**Generic Service Calls (Advanced)**はどちらもデフォルトでオフです。必要な場合だけオンにしてください。**Generic Service Calls (Advanced)**はAIにHome Assistantの任意のサービスを呼び出させるものなので、慎重に扱ってください。

ほとんどのツールは、特定のデバイス1つか、部屋の名前のどちらかを受け付けます。部屋の名前を指定すると、その部屋にある該当デバイスすべてに一度に作用します。

カテゴリーの変更は、**Marinara Sync HA Tools**を押すか、Home Assistantを再起動するまで反映されません。このボタンについては次のセクションで説明します。

## Home Assistantのエンティティー

この連携は、**Marinara Engine**という名前のHome Assistantデバイスの下に、次のエンティティーを作ります。

| エンティティー | 種類 | 動作 |
|---|---|---|
| Marinara Chat Count | センサー | Marinaraのチャットの総数を表示します |
| Marinara Active Agent Count | センサー | 有効になっているMarinaraのエージェント数を表示します |
| Marinara Active Chat | セレクト | Home Assistantのサービスが対象にするチャットを選びます |
| Marinara Agent: (name) | スイッチ | Marinaraのエージェントを1つオンまたはオフにします。エージェントごとに1つずつあります |
| Marinara Abort Generation | ボタン | 生成中のAIの返信を中止します |
| Marinara Sync HA Tools | ボタン | すべてのツールを送り直し、Home Assistantエージェントを作り直します |

この連携は、新しいチャットやエージェントがないかを30秒ごとにMarinaraへ確認します。Marinaraで作ったばかりのチャットやエージェントが、ここに現れるまで最大30秒かかることがあります。

## Home AssistantのオートメーションからMarinaraを操作する

この連携は、Home Assistantに2つのサービスを追加します。これらはMarinaraの中ではなく、Home Assistantのオートメーションの中で使います。どちらもデフォルトで**Primary Chat**を対象にできます。

### Send Message (marinara_engine.send_message)

Marinaraのチャットにメッセージを送ります。

- `message`: メッセージの本文です。この項目は必須です。
- `chat_id`: 送信先のチャットです。空欄にすると、Primary Chatが使われます。
- `role`: メッセージの送り主です。`user`、`assistant`、`system`、`narrator`のいずれかを指定できます。デフォルトは`user`です。
- `trigger_generation`: trueにすると、メッセージの送信後にAIが返信もします。デフォルトはfalseです。

玄関のドアが開いたことをAIに伝えるオートメーションの例です。

```yaml
automation:
  trigger:
    platform: state
    entity_id: binary_sensor.front_door
    to: "on"
  action:
    service: marinara_engine.send_message
    data:
      message: "Someone just arrived at the front door."
      trigger_generation: true
```

### Trigger Generation (marinara_engine.trigger_generation)

目に見えるメッセージを送らずに、チャットでAIの返信を始めます。

- `chat_id`: 使用するチャットです。空欄にすると、Primary Chatが使われます。
- `user_message`: 返信のターンに含める任意のメッセージです。

## 設定を変えたあとの再同期

有効なカテゴリーを変えたら、**Marinara Sync HA Tools**を押して変更を適用します。このボタンは、Home Assistantの**Marinara Engine**デバイスのページにあります。

**Marinara Sync HA Tools**を押すと、次の処理が行われます。

- 既存のツールをその場で更新し、変更をMarinaraに反映します。
- Marinaraで削除してしまった場合は、**Home Assistant**エージェントを作り直します。
- オフにしたカテゴリーのツールを無効にします。ツール自体は削除しません。

Marinaraの中でHome Assistantのツールを手作業で編集しないでください。次の同期で編集内容は上書きされ、ツールも再びオンに戻ります。

## トラブルシューティング

### セットアップ画面に接続できないと表示される

Marinara Engineが動いているか確かめます。入力した**Host**と**Port**が、実際に待ち受けているアドレスと一致しているかも確認します。デフォルトは`localhost`と`7860`です。

Home AssistantがMarinaraとは別のデバイスで動いている場合、Marinaraはデフォルトでそれをブロックします。連携はパスワードを送れないので、Marinara側でパスワードなしのそのデバイスを受け入れる必要があります。Marinaraの`.env`ファイルの`IP_ALLOWLIST`に、Home AssistantのデバイスのIPアドレスを追加してください。この方法とほかの選択肢は[リモートアクセス](../REMOTE_ACCESS.md)を参照してください。`BASIC_AUTH_USER`と`BASIC_AUTH_PASS`で保護されたMarinaraも、そのデバイスが`IP_ALLOWLIST`に載っていないかぎり連携を拒否します。

これらの条件はセットアップ後も同じです。あとからMarinaraがHome Assistantのデバイスをブロックすると、センサーとチャットの一覧は何の表示もないまま更新されなくなります。

### AIがデバイスのツールを使おうとするが何も起きない

Webhookの呼び出しがブロックされている可能性が高いです。Marinaraの`.env`ファイルに`WEBHOOK_LOCAL_URLS_ENABLED=true`を追加して保存します。これは数秒で反映されます。設定していないと、`http`が許可されていない、またはプライベートアドレスが拒否された、といった内容でツールの呼び出しが失敗することがあります。

MarinaraとHome Assistantが同じコンピューターで動いている場合、連携はWebhookに内部アドレスを自動で使います。Marinaraが別のデバイスで動いている場合は、Home Assistantのローカルネットワークアドレスにそのデバイスから到達できるか確かめてください。

### ツールがFunctionsの一覧に出てこない

**Marinara Sync HA Tools**を押すか、Home Assistantを再起動します。そのあとMarinaraのPresetsパネルにある**Functions**セクションを確認します。

### Home Assistantエージェントがチャットに出てこない

まず、MarinaraのAgentsに**Home Assistant**エージェントがあるか確認します。見当たらない場合は、**Marinara Sync HA Tools**を押して作り直します。そのあと**Chat Settings**を開き、**Agents**セクションから**Home Assistant**エージェントをそのチャットに追加します。

### Webhookのアドレスを手動で調べる

各ツールにはアドレスが設定済みなので、これが必要になることはほとんどありません。調べるには、Home Assistantで**Settings**から**Devices & Services**へ進み、**Marinara Engine**を開きます。Webhookのアドレスは次の形式です(8123はHome Assistantのデフォルトのポート番号)。

```
http://<homeassistant-ip>:8123/api/webhook/<webhook-id>
```

## アンインストール

連携を削除するには、Home Assistantで**Settings**から**Devices & Services**へ進み、**Marinara Engine**を開いて削除します。これでHome Assistantのエンティティーは消えます。連携がMarinaraの**Functions**セクションに作ったツールはMarinaraに残ります。**Home Assistant**エージェントも残ります。不要であれば、どちらもMarinaraで手動で削除してください。

## 関連ガイド

- [カスタムツールと関数呼び出し](../extending/custom-tools.md)
- [エージェント: チャットを支えるAIヘルパー](../agents/agents-overview.md)
- [サーバー設定リファレンス](../CONFIGURATION.md)
- [リモートアクセス](../REMOTE_ACCESS.md)
