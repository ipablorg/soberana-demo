import { defineConfig, mergeConfig } from 'vitest/config';
import viteConfig from './vite.config';

export default mergeConfig(
  viteConfig({ mode: 'test', command: 'serve' }),
  defineConfig({
    test: {
      environment: 'node',
    },
    resolve: {
      alias: {
        '@lingui/react/macro': '/src/test/lingui-react-macro-mock.tsx',
      },
    },
  }),
);
