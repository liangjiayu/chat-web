# Chat Web

DeepSeek conversation web app built with React Router, Hono, Cloudflare Workers,
Cloudflare D1, Tailwind CSS, and shadcn/ui-style components.

## Setup

Install dependencies with pnpm:

```sh
pnpm install
```

Create a local env file from the example and set your DeepSeek key:

```sh
cp .dev.vars.example .dev.vars
```

`DEEPSEEK_API_KEY` must stay in `.dev.vars` locally or Wrangler secrets in
production. Do not commit real API keys.

Apply the local D1 migration:

```sh
pnpm run db:migrate:local
```

Start the dev server:

```sh
pnpm dev
```

## Scripts

- `pnpm dev` starts the React Router dev server.
- `pnpm run typecheck` regenerates Worker/React Router types and checks TS.
- `pnpm run db:migrate:local` applies D1 migrations locally.
- `pnpm run db:migrate:remote` applies D1 migrations in production.
- `pnpm run build` builds the app.
- `pnpm run deploy` deploys the Worker after a production build.

## Data Model

- `conversations` stores chat sessions: title, owner, model, timestamps, and
  soft-delete status.
- `messages` stores each user/assistant message with role, content, model,
  status, token placeholders, and creation time.

The first version is a single-user app using `local-user`.
