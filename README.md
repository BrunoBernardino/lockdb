# LockDB

[![](https://github.com/BrunoBernardino/lockdb/workflows/Run%20Tests/badge.svg)](https://github.com/BrunoBernardino/lockdb/actions?workflow=Run+Tests) [![deno](https://shield.deno.dev/x/lockdb)](https://deno.land/x/lockdb) [![npm](https://img.shields.io/npm/v/lockdb.svg)](https://www.npmjs.com/package/lockdb)

LockDB is a cross-platform tool you can use to handle process/event [locking](https://en.wikipedia.org/wiki/Lock_(computer_science)) and avoid race conditions. It is sometimes also known as a [semaphore](https://en.wikipedia.org/wiki/Semaphore_(programming)).

There are packages for [Node.js/Browser/Bun/NPM](https://npmjs.org/package/lockdb), [Deno](https://deno.land/x/lockdb), and you can also use it as a [CLI](#cli).

It has no dependencies, and is very simple to use, with effectively 3 commands/actions/methods: `lock('name')`, `unlock('name')`, and `check('name')`.

You can get your `apiKey` at [lockdb.com](https://lockdb.com) or connect `LockDB` to your own server/API.

## Usage (package)

### Node / Browser / Bun / Npm

You don't need to install anything with Deno, but here's how you do it with all others:

```bash
npm install --save-exact lockdb
yarn add --exact lockdb
pnpm add --save-exact lockdb
```

```js
// import LockDB from 'lockdb';
// import LockDB from 'https://deno.land/x/lockdb@0.1.0/mod.ts';
const LockDB = require('lockdb');

const lockName = 'sales';
const locker = new LockDB('reports', { apiKey: 'api-key' });

// Check on a lock (optional)
const isReportLocked = await locker.check(lockName);
console.log(isReportLocked); // Outputs `false`

// Obtain a lock, waiting up to 30 seconds for it
try {
  await locker.lock(lockName);
} catch (error) {
  console.error(`Failed to obtain lock (${lockName}): ${error}`);
}

// Unlock a lock, returning if it was locked before
const wasReportLockedBeforeUnlock = await locker.unlock(lockName);
console.log(wasReportLockedBeforeUnlock); // Outputs `true`
```

### CLI

You can find binaries for your system in the [latest release](https://github.com/BrunoBernardino/lockdb/releases/latest).

Here's an example for Linux intel (x86_64), on downloading it with `curl` and moving it to `/usr/local/bin/` so it's available globally as `lockdb`:

```sh
# Download the binary from the latest release for your system and move it to `/usr/local/bin/`. Here's an example for most Linux OSes:
$ curl -L https://github.com/BrunoBernardino/lockdb/releases/latest/download/lockdb-linux-intel --output lockdb && chmod +x lockdb && sudo mv lockdb /usr/local/bin/
```

Then to use it, on any OS:

```sh
# Set ENV variables
export LOCKDB_SERVICE_ID="reports"
export LOCKDB_API_KEY="api-key"

# Check on a lock
lockdb check sales
# Outputs `false`

# Obtain a lock, waiting up to 30 seconds for it
lockdb lock sales
# Outputs `true`

# Unlock a lock, returning if it was locked before 
lockdb unlock sales
# Outputs `true`
```

## Development

Requires [`deno@1.36.0`](https://deno.land) (other versions will probably work).

```bash
$ make format
$ make test

# CLI
$ deno run --allow-net mock_server.ts
$ deno run --allow-net --allow-env=LOCKDB_SERVICE_ID,LOCKDB_API_KEY,LOCKDB_SERVER_URL main.ts check sales --server-url="http://127.0.0.1:5678" --service-id="reports" --api-key="api-key"
```

## Publishing

After committing and pushing, just run `make publish VERSION=x.y.z`. That will also trigger a new tag, build binaries, and a new draft release with them.
