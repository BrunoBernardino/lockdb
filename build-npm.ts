import { build, emptyDir } from 'https://deno.land/x/dnt@0.38.1/mod.ts';

await emptyDir('./npm');

await build({
  entryPoints: ['./mod.ts'],
  outDir: './npm',
  shims: {
    deno: true,
    timers: true,
  },
  typeCheck: false,
  test: false,
  package: {
    name: 'lockdb',
    version: Deno.args[0],
    description:
      'LockDB is a cross-platform tool you can use to handle process/event locking and avoid race conditions. It is sometimes also known as a semaphore.',
    license: 'AGPL-3.0',
    author: 'Bruno Bernardino <me@brunobernardino.com>',
    keywords: [
      'lockdb',
      'lock',
      'locks',
      'locking',
      'semaphore',
      'synchronization',
      'synchronisation',
      'sync',
    ],
    repository: {
      type: 'git',
      url: 'git+https://github.com/BrunoBernardino/lockdb.git',
    },
    bugs: {
      url: 'https://github.com/BrunoBernardino/lockdb/issues',
    },
    engines: {
      node: '>=18.0.0',
    },
  },
  postBuild() {
    // steps to run after building and before running the tests
    Deno.copyFileSync('LICENSE', 'npm/LICENSE');
    Deno.copyFileSync('README.md', 'npm/README.md');
  },
});
