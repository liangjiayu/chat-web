# 服务端 API 文档

本文档面向项目开发者，用于快速了解服务端接口的用途、请求参数和响应结果。

普通 HTTP 接口的实时参数和响应结构可通过 `/api/docs` 查看，机器可读规范位于
`/api/openapi.json`。本文档继续补充业务调用流程和 SSE 事件说明。

## 接口速览

- `GET /api/conversations`：获取会话列表
- `POST /api/conversations`：创建空会话
- `GET /api/conversations/:id`：获取会话详情和消息
- `PATCH /api/conversations/:id`：重命名会话
- `DELETE /api/conversations/:id`：删除会话
- `PATCH /api/conversations/:conversationId/messages/:messageId`：编辑最后一条用户消息
- `POST /api/chat/completion`：发送消息并流式生成回复

## 通用约定

- 普通接口返回 JSON。
- 聊天补全接口返回 SSE 流。
- 时间字段是毫秒时间戳，例如 `1760000000000`。
- `metadata` 是对象，当前通常为空对象 `{}`。

错误响应统一长这样：

```json
{
  "error": "会话不存在",
  "code": 404
}
```

## 会话接口

### 获取会话列表

`GET /api/conversations`

获取所有未删除的会话，用于侧边栏会话列表。

请求参数：无。

响应示例：

```json
[
  {
    "id": "conversation-id",
    "title": "新的会话",
    "model": "deepseek-chat",
    "metadata": {},
    "created_at": 1760000000000,
    "updated_at": 1760000000000
  }
]
```

### 创建会话

`POST /api/conversations`

创建一个空会话。未传标题时，服务端使用默认标题；未传模型时，服务端使用环境变量或默认模型。

请求参数：

- `title`：可选，会话标题。
- `model`：可选，模型名称。

请求示例：

```json
{
  "title": "新的会话",
  "model": "deepseek-chat"
}
```

响应示例：

```json
{
  "conversation": {
    "id": "conversation-id",
    "title": "新的会话",
    "model": "deepseek-chat",
    "metadata": {},
    "created_at": 1760000000000,
    "updated_at": 1760000000000
  }
}
```

### 获取会话详情和消息

`GET /api/conversations/:id`

获取指定会话及其消息列表，用于进入会话详情页。

路径参数：

- `id`：必填，会话 ID。

响应示例：

```json
{
  "conversation": {
    "id": "conversation-id",
    "title": "新的会话",
    "model": "deepseek-chat",
    "metadata": {},
    "created_at": 1760000000000,
    "updated_at": 1760000000000
  },
  "messages": [
    {
      "id": "user-message-id",
      "conversation_id": "conversation-id",
      "role": "user",
      "content": "你好",
      "model": "deepseek-chat",
      "status": "done",
      "metadata": {},
      "created_at": 1760000000000,
      "updated_at": 1760000000000
    },
    {
      "id": "assistant-message-id",
      "conversation_id": "conversation-id",
      "role": "assistant",
      "content": "你好，有什么可以帮你？",
      "model": "deepseek-chat",
      "status": "done",
      "metadata": {},
      "created_at": 1760000001000,
      "updated_at": 1760000001000
    }
  ]
}
```

### 重命名会话

`PATCH /api/conversations/:id`

修改会话标题。

路径参数：

- `id`：必填，会话 ID。

请求参数：

- `title`：必填，新标题。服务端会去掉首尾空格，空字符串会报错。

请求示例：

```json
{
  "title": "产品讨论"
}
```

响应示例：

```json
{
  "id": "conversation-id",
  "title": "产品讨论",
  "model": "deepseek-chat",
  "metadata": {},
  "created_at": 1760000000000,
  "updated_at": 1760000100000
}
```

### 删除会话

`DELETE /api/conversations/:id`

删除指定会话。

路径参数：

- `id`：必填，会话 ID。

响应示例：

```json
{
  "success": true
}
```

## 消息接口

### 编辑最后一条用户消息

`PATCH /api/conversations/:conversationId/messages/:messageId`

编辑指定会话中的最后一条用户消息，并删除该消息之后的助手回复。这个接口只负责保存编辑结果；如果要重新生成助手回复，需要再调用 `POST /api/chat/completion` 并传入 `message_id`。

路径参数：

- `conversationId`：必填，会话 ID。
- `messageId`：必填，消息 ID。

请求参数：

- `content`：必填，编辑后的消息内容。服务端会去掉首尾空格，空字符串会报错。

请求示例：

```json
{
  "content": "帮我用更简洁的方式解释 React Query"
}
```

响应示例：

```json
{
  "success": true
}
```

## 聊天接口

### 发起聊天补全

`POST /api/chat/completion`

发送用户消息并流式生成助手回复；也可以基于已编辑的最后一条用户消息重新生成回复。

请求参数：

- `conversation_id`：必填，会话 ID。
- `prompt`：可选，新发送的用户消息。
- `message_id`：可选，已编辑的用户消息 ID，用于重新生成助手回复。

调用规则：

- 新发送消息时传 `conversation_id` 和 `prompt`。
- 重新生成回复时传 `conversation_id` 和 `message_id`。
- `prompt` 和 `message_id` 不能同时传。
- 如果新发送消息时会话不存在，服务端会自动创建会话。

新发送消息请求示例：

```json
{
  "conversation_id": "conversation-id",
  "prompt": "你好"
}
```

重新生成回复请求示例：

```json
{
  "conversation_id": "conversation-id",
  "message_id": "user-message-id"
}
```

响应说明：该接口返回 SSE 流，不是一次性 JSON。

响应头：

```http
Content-Type: text/event-stream; charset=utf-8
Cache-Control: no-cache
Connection: keep-alive
```

SSE 示例：

```text
event: message
data: {"message":{"v":"你好"}}

event: message
data: {"message":{"v":"，有什么可以帮你？"}}

event: title
data: {"content":"新的会话标题"}

event: done
data: {"message":{"id":"assistant-message-id","metadata":{},"created_at":1760000001000,"updated_at":1760000001000}}
```

SSE 事件：

- `message`：每次收到助手回复增量内容，示例 `{"message":{"v":"你好"}}`。
- `title`：新会话生成标题后返回，示例 `{"content":"新的会话标题"}`。
- `done`：助手消息保存完成后返回，示例 `{"message":{"id":"assistant-message-id","metadata":{},"created_at":1760000001000,"updated_at":1760000001000}}`。
- `error`：流式生成或解析过程中发生错误，示例 `{"message":"流式响应解析失败"}`。

## 错误说明

文档不逐个接口列出所有异常分支。开发时只需要记住两点：

- 普通接口失败时返回 `{ "error": "...", "code": 状态码 }`。
- 聊天接口在建连前失败时返回普通错误 JSON；建连后失败时返回 `error` SSE 事件。

常见错误包括参数为空、资源不存在、只能编辑最后一条用户消息、缺少 `DEEPSEEK_API_KEY`、DeepSeek 上游请求失败。
