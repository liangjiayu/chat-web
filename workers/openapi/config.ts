export const openApiConfig = {
  openapi: '3.0.0' as const,
  info: {
    title: 'Chat Web API',
    version: '1.0.0',
    description: 'Chat Web 服务端 API',
  },
  servers: [{ url: '/api', description: '当前服务' }],
};
