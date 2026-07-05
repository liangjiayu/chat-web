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

## Agent 技能工作流

日常可以直接描述任务，Agent 会按情况选择技能；也可以手动指定 $skill-name。

- 明确的小改动：$implement
- Bug 或测试失败：$diagnosing-bugs
- 较大的新功能：$grill-with-docs → $to-prd → $to-issues → $implement
- 只想拷问一个方案，不需要写入项目文档：$grill-me
- 改完后复查：$code-review
- 想找代码库改进点：$improve-codebase-architecture

默认优先使用：小改动走 $implement，问题排查走 $diagnosing-bugs，大功能先澄清再拆分。
