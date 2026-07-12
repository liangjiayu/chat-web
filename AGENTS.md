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

- 普通修改或小范围改动完成后，大部分情况下运行 `pnpm lint:changed` 即可，它只检查当前改动文件，包含未暂存和未跟踪文件，且不会操作暂存区
- 大范围改动完成后，运行 `pnpm lint:changed` 和 `pnpm typecheck`；功能重构需要额外运行 `pnpm build`
- 提交代码前不需要额外运行脚本，交给已有的 Husky pre-commit hook 执行 `lint-staged`

## 开发规范

### 注释规范

- 默认不写注释：业务组件、页面、常规逻辑均无需注释，代码本身应做到自解释
- 仅以下两类建议写注释：
  - **辅助/工具函数**：说明其用途，让人无需读实现就能知道何时该用
  - **常量与枚举映射**：说明其用途与代表的业务含义
- 杜绝复述代码的废话注释；注释只解释「为什么」，不解释「做了什么」

### 提交规范

- 优先使用中文，标题用一句话概括改动重点
- 根据实际改动范围决定是否补充描述：简单改动只写标题，改动较多时使用列表说明主要内容
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
