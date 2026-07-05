# Chatty

Chatty 是基于 React Router、Hono、Cloudflare Workers、Cloudflare D1 和 DeepSeek 的对话 Web 应用。

## 快速开始

确保本地已安装 Node.js 和 pnpm。

安装依赖：

```sh
pnpm install
```

创建本地环境变量文件：

```sh
cp .dev.vars.example .dev.vars
```

在 `.dev.vars` 中配置 DeepSeek API Key：

```sh
DEEPSEEK_API_KEY=sk-your-deepseek-api-key
```

初始化本地 D1 数据库：

```sh
pnpm run db:migrate:local
```

启动开发服务：

```sh
pnpm dev
```

启动后访问终端输出的本地地址即可开发调试。

## 常用脚本

- `pnpm dev`：启动本地开发服务。
- `pnpm run build`：构建生产产物。
- `pnpm run typecheck`：生成类型并执行 TypeScript 检查。
- `pnpm run lint`：执行代码检查。
- `pnpm run lint:fix`：自动修复可修复的代码检查问题。
- `pnpm run format`：格式化代码。
- `pnpm run db:migrate:local`：执行本地 D1 数据库迁移。
- `pnpm run db:migrate:remote`：执行远程 D1 数据库迁移。
- `pnpm run deploy`：构建并部署到 Cloudflare Workers。
