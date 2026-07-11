import { mkdir, writeFile } from 'node:fs/promises';

import openapiTS, { astToString } from 'openapi-typescript';
import { format } from 'oxfmt';

import { api } from '../workers/api';
import { openApiConfig } from '../workers/openapi/config';

const document = api.getOpenAPIDocument(openApiConfig);
const generatedTypes = astToString(
  await openapiTS(JSON.stringify(document), {
    rootTypes: true,
    rootTypesNoSchemaPrefix: true,
  }),
);
const formattedTypes = await format('app/types/api.generated.ts', generatedTypes);

if (formattedTypes.errors.length) {
  throw new Error('OpenAPI 生成结果格式化失败');
}

await mkdir('app/types', { recursive: true });
await writeFile('app/types/api.generated.ts', formattedTypes.code);
