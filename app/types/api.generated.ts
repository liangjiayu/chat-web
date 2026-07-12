export interface paths {
  '/conversations': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** 获取会话列表 */
    get: {
      parameters: {
        query?: never;
        header?: never;
        path?: never;
        cookie?: never;
      };
      requestBody?: never;
      responses: {
        /** @description 会话列表 */
        200: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/json': components['schemas']['ConversationListResponse'];
          };
        };
      };
    };
    put?: never;
    /** 创建空会话 */
    post: {
      parameters: {
        query?: never;
        header?: never;
        path?: never;
        cookie?: never;
      };
      requestBody: {
        content: {
          'application/json': components['schemas']['CreateConversationRequest'];
        };
      };
      responses: {
        /** @description 创建成功 */
        200: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/json': components['schemas']['CreateConversationResponse'];
          };
        };
      };
    };
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/conversations/{id}': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** 获取会话详情和消息 */
    get: {
      parameters: {
        query?: never;
        header?: never;
        path: {
          id: string;
        };
        cookie?: never;
      };
      requestBody?: never;
      responses: {
        /** @description 会话详情和消息 */
        200: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/json': components['schemas']['ConversationMessagesResponse'];
          };
        };
      };
    };
    put?: never;
    post?: never;
    /** 删除会话 */
    delete: {
      parameters: {
        query?: never;
        header?: never;
        path: {
          id: string;
        };
        cookie?: never;
      };
      requestBody?: never;
      responses: {
        /** @description 删除成功 */
        200: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/json': components['schemas']['DeleteConversationResponse'];
          };
        };
      };
    };
    options?: never;
    head?: never;
    /** 重命名会话 */
    patch: {
      parameters: {
        query?: never;
        header?: never;
        path: {
          id: string;
        };
        cookie?: never;
      };
      requestBody: {
        content: {
          'application/json': components['schemas']['RenameConversationRequest'];
        };
      };
      responses: {
        /** @description 重命名后的会话 */
        200: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/json': components['schemas']['ConversationResponse'];
          };
        };
      };
    };
    trace?: never;
  };
  '/conversations/{conversationId}/messages/{messageId}': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    /** 编辑最后一条用户消息 */
    patch: {
      parameters: {
        query?: never;
        header?: never;
        path: {
          conversationId: string;
          messageId: string;
        };
        cookie?: never;
      };
      requestBody: {
        content: {
          'application/json': components['schemas']['EditMessageRequest'];
        };
      };
      responses: {
        /** @description 编辑成功 */
        200: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/json': components['schemas']['EditMessageResponse'];
          };
        };
      };
    };
    trace?: never;
  };
  '/chat/completion': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    /**
     * 发起聊天补全
     * @description 返回 SSE 流，事件结构和调用流程参见 docs/server-api.md。
     */
    post: {
      parameters: {
        query?: never;
        header?: never;
        path?: never;
        cookie?: never;
      };
      requestBody: {
        content: {
          'application/json': components['schemas']['ChatRequest'];
        };
      };
      responses: {
        /** @description 聊天补全 SSE 流 */
        200: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'text/event-stream': string;
          };
        };
      };
    };
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
}
export type webhooks = Record<string, never>;
export interface components {
  schemas: {
    ConversationListResponse: components['schemas']['Conversation'][];
    Conversation: {
      id: string;
      title: string;
      model: string;
      metadata: components['schemas']['Metadata'];
      created_at: number;
      updated_at: number;
    };
    Metadata: {
      [key: string]: unknown;
    };
    CreateConversationResponse: {
      conversation: components['schemas']['Conversation'];
    };
    CreateConversationRequest: {
      title?: string;
    };
    ConversationResponse: {
      id: string;
      title: string;
      model: string;
      metadata: components['schemas']['Metadata'];
      created_at: number;
      updated_at: number;
    };
    RenameConversationRequest: {
      title: string;
    };
    DeleteConversationResponse: {
      /** @enum {boolean} */
      success: true;
    };
    EditMessageResponse: {
      /** @enum {boolean} */
      success: true;
    };
    EditMessageRequest: {
      content: string;
    };
    ConversationMessagesResponse: {
      conversation: components['schemas']['Conversation'];
      messages: components['schemas']['Message'][];
    };
    Message: {
      id: string;
      conversation_id: string;
      /** @enum {string} */
      role: 'system' | 'user' | 'assistant';
      content: string;
      model: string | null;
      status: string;
      metadata: components['schemas']['Metadata'];
      created_at: number;
      updated_at: number;
    };
    ChatRequest: {
      conversation_id: string;
      prompt?: string;
      message_id?: string;
    };
  };
  responses: never;
  parameters: never;
  requestBodies: never;
  headers: never;
  pathItems: never;
}
export type ConversationListResponse = components['schemas']['ConversationListResponse'];
export type Conversation = components['schemas']['Conversation'];
export type Metadata = components['schemas']['Metadata'];
export type CreateConversationResponse = components['schemas']['CreateConversationResponse'];
export type CreateConversationRequest = components['schemas']['CreateConversationRequest'];
export type ConversationResponse = components['schemas']['ConversationResponse'];
export type RenameConversationRequest = components['schemas']['RenameConversationRequest'];
export type DeleteConversationResponse = components['schemas']['DeleteConversationResponse'];
export type EditMessageResponse = components['schemas']['EditMessageResponse'];
export type EditMessageRequest = components['schemas']['EditMessageRequest'];
export type ConversationMessagesResponse = components['schemas']['ConversationMessagesResponse'];
export type Message = components['schemas']['Message'];
export type ChatRequest = components['schemas']['ChatRequest'];
export type $defs = Record<string, never>;
export type operations = Record<string, never>;
