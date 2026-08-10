import { defineConfig } from 'orval';
import dotenv from 'dotenv';

dotenv.config();

export default defineConfig({
  core: {
    input: process.env.CORE_API_DOC_URL,
    output: {
      mode: 'tags-split',
      target: 'src/api/core.ts',
      schemas: 'src/api/model',
      client: 'react-query',
      httpClient: 'axios',
      override: {
        mutator: {
          path: 'src/api/mutator/instance.ts',
          name: 'customInstance',
        },
      },
    },
  },
});