# Voice Memo App (MVP)

Next.js(App Router) + TypeScript + Tailwind + Prisma で実装した録音メモMVPです。

## セットアップ

1. 依存インストール

```bash
npm install
```

2. Prismaクライアント生成

```bash
npm run prisma:generate
```

3. マイグレーション適用（SQLite）

```bash
npm run prisma:migrate -- --name init
```

※ 環境依存で Prisma の migrate が失敗する場合でも、API初回アクセス時に `Memo` テーブルは自動作成されます（MVPフォールバック）。

4. 開発サーバ起動

```bash
npm run dev
```

## API

- `GET /api/memos?limit=3`
- `POST /api/memos` (`multipart/form-data`, field: `audio`)

## 手動テスト手順

1. Homeを開く
2. マイクボタンを押して録音開始
3. ステータスが `recording` とタイマー表示になることを確認
4. もう一度押して録音停止
5. `processing` 表示後、最近のメモ3件が更新されることを確認
6. マイク権限拒否時にエラーメッセージが出ることを確認
7. 処理中にボタンが無効化され、二重作成されないことを確認

## 環境変数

- 必須: `DATABASE_URL`
- 任意: `OPENAI_API_KEY`（設定時は文字起こし/要約でOpenAI APIを使用。未設定時はスタブで動作）
