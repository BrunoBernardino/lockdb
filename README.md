# LockDB

[![](https://github.com/BrunoBernardino/lockdb/workflows/Run%20Tests/badge.svg)](https://github.com/BrunoBernardino/lockdb/actions?workflow=Run+Tests) [![deno](https://shield.deno.dev/x/lockdb)](https://deno.land/x/lockdb) [![npm](https://img.shields.io/npm/v/lockdb.svg)](https://www.npmjs.com/package/lockdb)

LockDB is a cross-platform tool you can use to handle process/event [locking](https://en.wikipedia.org/wiki/Lock_(computer_science)) and avoid race conditions. It is sometimes also known as a [semaphore](https://en.wikipedia.org/wiki/Semaphore_(programming)).

There are packages for [Node.js/Browser/Bun/NPM](https://npmjs.org/package/lockdb), [Deno](https://deno.land/x/lockdb), and you can also use it as a [CLI](#cli).

It has no dependencies, and is very simple to use, with effectively 3 commands/actions/methods: `lock('name')`, `unlock('name')`, and `check('name')`.

You can get your `apiKey` at [lockdb.com](https://lockdb.com) or connect `LockDB` to your own server/API.

## Usage (package)

### Node/Browser/Bun/NPM

```bash
npm install --save-exact lockdb
```

```js
const LockDB = require('lockdb'); // or import LockDB from 'lockdb';

const lock = new LockDB('service-id', { apiKey: 'api-key' });

// Check on a lock (optional)
const isReportLocked = await lock.check('report');
console.log(isReportLocked); // Outputs `false`

// Create a lock, returning if it was locked before
const wasReportLocked = await lock.lock('report');
console.log(isReportLocked); // Outputs `false`

// Unlock a lock, returning if it was locked before
const wasReportLockedBeforeUnlock = await lock.unlock('report');
console.log(wasReportLockedBeforeUnlock); // Outputs `true`
```

### Deno

```ts
import LockDB from 'https://deno.land/x/lockdb@1.0.0/mod.ts';

const lock = new LockDB('service-id', { apiKey: 'api-key' });

// Check on a lock (optional)
const isReportLocked = await lock.check('report');
console.log(isReportLocked); // Outputs `false`

// Create a lock, returning if it was locked before
const wasReportLocked = await lock.lock('report');
console.log(isReportLocked); // Outputs `false`

// Unlock a lock, returning if it was locked before
const wasReportLockedBeforeUnlock = await lock.unlock('report');
console.log(wasReportLockedBeforeUnlock); // Outputs `true`
```

### CLI

```sh
# Install it first:
$ deno install --allow-net --allow-env=LOCKDB_SERVICE_ID,LOCKDB_API_KEY,LOCKDB_SERVER_URL https://deno.land/x/lockdb@1.0.0/main.ts --name lockdb

# Set ENV variables
$ export LOCKDB_SERVICE_ID="service-id"
$ export LOCKDB_API_KEY="api-key"

# Check on a lock
$ lockdb check report
false

# Create a lock, returning if it was locked before
$ lockdb lock report
false

# Unlock a lock, returning if it was locked before 
$ lockdb unlock report
true
```

## Development

Requires [`deno@1.36.0`](https://deno.land) (other versions will probably work).

```bash
$ make format
$ make test
# Dev CLI:
$ deno run --allow-net mock_server.ts
$ deno run --allow-net --allow-env=LOCKDB_SERVICE_ID,LOCKDB_API_KEY main.ts check report --server-url="http://127.0.0.1:5678" --service-id="service-identifier" --api-key="api-key"
```

## Publishing

After committing and pushing, just run `make publish VERSION=x.y.z`.
