# しらたき

CeVIO AIを使用して音声を生成するREST APIです。Windows環境で動作し、CeVIO AIがインストールされている必要があります。

## 環境設定

1. CeVIO AIのインストールが必要です
2. Windows環境で動作します
3. Python、Visual Studio Communityから、C++開発によるデスクトップ開発をインストールしてください
4. 環境変数`OUTPUT_PATH`で音声ファイルの出力先を指定可能（未設定時は`./tmp`）

## 起動方法

1. 依存パッケージのインストール:
```bash
npm install && npm run build
```

2. サーバー起動:
```bash
npm start
```

デフォルトポートは3000です。`.env`ファイルで変更可能です。

## エンドポイント

POSTリクエストを行う場合は、JSON形式でbodyに値を設定してください。

### 1. サンプル音声生成

```
POST /voice/sample
```

指定したキャストのサンプル音声("こんにちは、[キャスト名]です。")を生成します。

exportTypeを0で指定すると、WAVEファイルを出力します。1を指定すると音声データをレスポンスで返します。

exportTypeを省略すると、WAVEファイルを出力します。

**リクエスト例:**
```json
{
    "cast": "花隈千冬",
    "exportType": 0
}
```

### 2. カスタム音声生成

```
POST /voice/create
```

指定したテキストとパラメータで音声を生成します。

exportTypeを0で指定すると、WAVEファイルを出力します。1を指定すると音声データをレスポンスで返します。

**リクエスト例:**
```json
{
    "cast": "花隈千冬",
    "text": "こんにちは、これはテスト音声です。",
    "voiceControl": {
        "volume": 50,
        "speed": 50,
        "tone": 50,
        "toneScale": 50,
        "alpha": 50
    },
    "emotions": [
        {
            "name": "嬉しい",
            "value": 50
        }
    ],
    "exportType": 0
}
```

#### voiceControlについて

以下のパラメータを設定できます

- volume(音量)
- speed（話す速さ）
- tone（音の高さ）
- toneScale（抑揚）
- Alpha（声質）

これらは省略することが可能です。省略時は、50として設定されます。

#### emotionsについて

CeVIO AIごとに用意された感情値を設定できます。感情値は0 ~ 100で設定可能です。

使用できる感情は、 `GET /voice/emotions` で取得できます。


### 3. 感情名取得

```
GET /voice/emotions
```

指定したキャストで利用可能な感情名の一覧を取得します。

**クエリパラメータ:**
- `cast`: キャスト名

**レスポンス例:**
```json
[
    "嬉しい",
    "普通",
    "怒り",
    "哀しみ",
    "落ち着き"
]
```

### 4. 使用可能なキャスト取得

```
GET /voice/casts
```

使用可能なキャストの一覧を取得します

**レスポンス例**
```json
[
    "花隈千冬",
    "夏色花梨"
]
```