# Marinara Engineのインストール

このガイドでは、使っているデバイスに合ったMarinara Engineのインストール方法を選べるように案内します。Marinaraは手元のコンピューターで動くので、チャットもデータも外に出ません。プラットフォームごとの手順書は下の表からたどれます。

## プラットフォームを選ぶ

Marinaraを動かしたいデバイスに合ったガイドを選んでください。

| プラットフォーム | インストールガイド |
|---|---|
| Windows | [Windowsインストールガイド](installation/windows.md) |
| macOSまたはLinux | [macOS / Linuxインストールガイド](installation/macos-linux.md) |
| DockerまたはPodman | [コンテナーでの実行(Docker / Podman)](installation/containers.md) |
| Androidのスマートフォンやタブレット | [Android(Termux)インストールガイド](installation/android-termux.md) |
| iPhoneやiPad | [iOS / iPadOS](installation/ios-pwa.md) |

選ぶ前に知っておきたい点がいくつかあります。

- **iPhoneやiPad**では、Marinara自体はサーバーを動かしません。サーバーはコンピューター、家庭内のサーバー、Androidデバイスのいずれかで動かし、iPhoneやiPadのSafariから開きます。詳しい手順はiOSのガイドにあります。
- **Android**では、Marinaraは**Termux**の中で動きます。Termuxは、Androidに小さなLinux環境を用意してくれる無料のアプリです。リリースされているAPKは、そのTermuxの準備を助けるだけのものです。

## どれを選べばよいか

はじめてで、できるだけ準備の手間を減らしたい場合は、次のどちらかを選んでください。

- **Windows**なら、**Windows installer**(Windowsインストーラー)を使います。必要なものをダウンロードして自動で設定し、デスクトップにショートカットも作ります。
- **macOS**、**Linux**、または家庭内のサーバーなら、**Docker**を使います。コマンド1つでアプリが起動します。イメージにはNode.js、依存関係一式、ビルド済みのアプリが最初から入っているので、Node.jsのインストールもアプリのビルドも自分で行う必要はありません。

ターミナルの操作に慣れていて、コードに手を入れたいかもしれない場合は、ソースから実行してください。「ソースから実行する」とは、コードをダウンロードして手元のコンピューターでアプリをビルドすることです。**Windows**、**macOS / Linux**、**Android (Termux)**の各ガイドは、いずれもこの方法も扱っています。

## 最低限のシステム要件

- サーバーを動かせるコンピューターかデバイスが必要です。対応するのはWindows、macOS、Linux、Androidです。
- ソースから実行するには、**Node.js**のバージョン24と**Git**が必要です。Node.jsはアプリを動かすため、Gitはコードのダウンロードとアップデートのために使います。ダウンロード先へのリンクは、プラットフォームごとのガイドにあります。
- **Docker**と**Podman**でインストールする場合、Node.jsは不要です。推奨しているCompose構成では、プロジェクトのファイルを取得するのにGitを使います。詳しくはコンテナーのガイドを参照してください。
- デフォルトでは、アプリは手元のコンピューター上の次のアドレスで動きます。

```text
http://127.0.0.1:7860
```

- アドレスの`127.0.0.1`は自分のコンピューターを指し、`7860`がデフォルトのポートです。同じネットワーク上のスマートフォンや別のデバイスからMarinaraにアクセスしたいときは、LANアクセスについて[よくある質問](FAQ.md)を参照してください。

## インストールが終わったら

Marinaraが起動してブラウザーで開けたら、[Marinara Engineをはじめる](home/welcome.md)を読んでください。接続の追加、キャラクターの作成やインポート、チャットの開始という最初の手順を順番に案内します。

インストールしたものを後からアップデートする方法は、[Marinara Engineのアップデート](UPGRADING.md)にあります。

## 関連ガイド

- [Windowsインストールガイド](installation/windows.md)
- [macOS / Linuxインストールガイド](installation/macos-linux.md)
- [コンテナーでの実行(Docker / Podman)](installation/containers.md)
- [Android(Termux)インストールガイド](installation/android-termux.md)
- [iOS / iPadOS](installation/ios-pwa.md)
- [Marinara Engineのアップデート](UPGRADING.md)
- [Marinara Engineをはじめる](home/welcome.md)
