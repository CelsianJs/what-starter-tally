import { defineConfig } from '@celsian/vura-core';

export default defineConfig({
  pages: {
    defaultMode: 'static',
  },
  api: {
    defaultKind: 'serverless',
  },
  cache: {
    store: 'memory',
    maxEntries: 50,
  },
});
