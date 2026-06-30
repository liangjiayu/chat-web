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
pnpm run db:migrate
```

Insert demo data for database verification:

```sh
pnpm run db:seed
```

Start the dev server:

```sh
pnpm dev
```

## Scripts

- `pnpm dev` starts the React Router dev server.
- `pnpm run db:migrate` applies D1 migrations locally.
- `pnpm run db:seed` inserts one demo conversation and message locally.
- `pnpm run typecheck` regenerates Worker/React Router types and checks TS.
- `pnpm run build` builds the app.

## Data Model

- `conversations` stores chat sessions: title, owner, model, timestamps, and
  soft-delete status.
- `messages` stores each user/assistant message with role, content, model,
  status, token placeholders, and creation time.

The first version is a single-user app using `local-user`.
