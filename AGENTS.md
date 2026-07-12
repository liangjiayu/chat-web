## 技术栈

- 语言与类型：TypeScript
- 前端框架：React 19、React Router 7
- 构建工具：Vite 7
- 运行环境：Cloudflare Workers、Wrangler
- 服务端框架：Hono
- 数据库：Cloudflare D1、Drizzle ORM
- 数据请求与状态：TanStack Query、Zustand
- UI 与样式：shadcn、Radix UI、lucide-react、Tailwind CSS 4
- AI 服务：DeepSeek API
- 代码规范：oxlint、oxfmt、Husky、lint-staged
- 包管理器：pnpm

## 脚本运行策略

- 普通或小范围改动：运行 `pnpm lint:changed`
- 大范围改动：运行 `pnpm lint:changed` 和 `pnpm typecheck`
- 功能重构：运行 `pnpm lint:changed`、`pnpm typecheck` 和 `pnpm build`
- `lint:changed` 对已暂存、未暂存及未跟踪的改动文件执行 lint 修复和格式化，不更新暂存区

## 注释规范

- 默认不写注释：业务组件、页面、常规逻辑均无需注释，代码本身应做到自解释
- 仅以下两类建议写注释：
  - **辅助/工具函数**：说明其用途，让人无需读实现就能知道何时该用
  - **常量与枚举映射**：说明其用途与代表的业务含义
- 杜绝复述代码的废话注释；注释只解释「为什么」，不解释「做了什么」

## 提交规范

- 优先使用中文，标题用一句话概括改动重点
- 单文件且改动单一时，可以只写标题
- 涉及多文件或多个改动点时，必须使用列表描述主要改动
- 如果暂存区有内容，则优先提交暂存区的文件
- 除非用户明确要求提交，否则不要自动执行 commit/push
- 格式：`<type>: <简要说明>`
- type 取值如下：
  - **feat**: 新功能
  - **fix**: 修复 Bug
  - **refactor**: 重构（非新功能、非修复）
  - **style**: 样式调整（不影响逻辑）
  - **chore**: 构建、依赖、配置等杂项变更
  - **docs**: 文档变更
