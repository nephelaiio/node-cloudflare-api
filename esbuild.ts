import { build } from 'esbuild';

build({
  entryPoints: ['src/api.ts'],
  outdir: `dist/`,
  platform: 'node',
  format: 'esm',
  target: 'esnext',
  minify: false,
}).catch(() => process.exit(1));
