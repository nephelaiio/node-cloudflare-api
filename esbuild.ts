import { build } from 'esbuild';

build({
  entryPoints: ['src/api.ts'],
  outdir: `dist/`,
  platform: 'node',
  format: 'esm',
  target: 'esnext',
  minify: false,
  bundle: true,
  external: ['@nephelaiio/logger']
}).catch(() => process.exit(1));
