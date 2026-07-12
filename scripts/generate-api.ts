import { mkdir, readFile, writeFile } from 'node:fs/promises';

import openapiTS, { astToString } from 'openapi-typescript';
import { format, type FormatConfig } from 'oxfmt';

import { api } from '../workers/api';
import { openApiConfig } from '../workers/openapi/config';

const outputPath = 'app/types/api-generated.ts';
const formatConfig: FormatConfig = JSON.parse(
  await readFile(new URL('../.oxfmtrc.json', import.meta.url), 'utf8'),
);
const source = astToString(
  await openapiTS(JSON.stringify(api.getOpenAPIDocument(openApiConfig)), {
    rootTypes: true,
    rootTypesNoSchemaPrefix: true,
  }),
);
const { code, errors } = await format(outputPath, source, formatConfig);

if (errors.length) {
  throw new Error('OpenAPI 生成结果格式化失败');
}

await mkdir('app/types', { recursive: true });
await writeFile(outputPath, code);
