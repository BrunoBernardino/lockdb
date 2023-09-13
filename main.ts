import { parse } from 'std/flags/mod.ts';
import LockDB from './mod.ts';

const LOCKDB_SERVICE_ID = Deno.env.get('LOCKDB_SERVICE_ID');
const LOCKDB_API_KEY = Deno.env.get('LOCKDB_API_KEY');
const LOCKDB_SERVER_URL = Deno.env.get('LOCKDB_SERVER_URL');

export function parseArguments(
  args: string[],
): {
  help: boolean;
  serviceId?: string;
  apiKey?: string;
  serverUrl?: string;
  unlockWebhookUrl?: string;
  waitTimeoutInMs?: number;
  lockExpirationInSeconds?: number;
  params: (string | number)[];
} {
  const parsedArgs = parse(args, {
    boolean: ['help'],
    string: [
      'service-id',
      'api-key',
      'server-url',
      'unlock-webhook-url',
      'wait-timeout-in-ms',
      'lock-expiration-in-s',
    ],
    alias: {
      'help': 'h',
      'service-id': 'i',
      'api-key': 'a',
      'server-url': 's',
      'unlock-webhook-url': 'u',
      'wait-timeout-in-ms': 'w',
      'lock-expiration-in-s': 'l',
    },
  });
  const params = parsedArgs._;

  const help = parsedArgs.help;
  const serviceId = parsedArgs['service-id'] || LOCKDB_SERVICE_ID;
  const apiKey = parsedArgs['api-key'] || LOCKDB_API_KEY;
  const serverUrl = parsedArgs['server-url'] || LOCKDB_SERVER_URL;
  const unlockWebhookUrl = parsedArgs['unlock-webhook-url'];
  let waitTimeoutInMs: string | undefined | number = parsedArgs['wait-timeout-in-ms'];
  let lockExpirationInSeconds: string | undefined | number = parsedArgs['lock-expiration-in-s'];

  if (typeof waitTimeoutInMs !== 'undefined') {
    waitTimeoutInMs = parseInt(waitTimeoutInMs, 10);

    if (Number.isNaN(waitTimeoutInMs)) {
      waitTimeoutInMs = undefined;
    }
  }

  if (typeof lockExpirationInSeconds !== 'undefined') {
    lockExpirationInSeconds = parseInt(lockExpirationInSeconds, 10);

    if (Number.isNaN(lockExpirationInSeconds)) {
      lockExpirationInSeconds = undefined;
    }
  }

  return { help, serviceId, apiKey, serverUrl, unlockWebhookUrl, waitTimeoutInMs, lockExpirationInSeconds, params };
}

function printHelp(): void {
  console.log(`Usage: lockdb [COMMAND] [OPTIONS...]`);
  console.log('\nCommands:');
  console.log('  lock   [LOCK_NAME]              Create a lock');
  console.log('  unlock [LOCK_NAME]              Delete a lock');
  console.log('  check  [LOCK_NAME]              Check a lock');
  console.log('\nOptional flags:');
  console.log('  -h, --help                      Display this help and exit');
  console.log(
    '  -i, --service-id                Your service identifier (required, alternatively set by ENV var `LOCKDB_SERVICE_ID`)',
  );
  console.log(
    '  -a, --api-key                   Your API Key (required, alternatively set by ENV var `LOCKDB_API_KEY`)',
  );
  console.log(
    '  -s, --server-url                Server URL (optional, alternatively set by ENV var `LOCKDB_SERVER_URL`)',
  );
  console.log(
    '  -w, --wait-timeout-in-ms        How long to wait for the command to finish (including waiting for a lock), in milliseconds (optional, defaults to 30 seconds for `lock` and to 5 seconds for the other commands)',
  );
  console.log(
    '  -u, --unlock-webhook-url        A URL which will receive a POST event (with `{ "lockName": "<lock name>" }` in the body) when the lock expires or is unlocked (optional, for `lock`)',
  );
  console.log(
    '  -l, --lock-expiration-in-s     A number of seconds after which the lock will automatically expire (optional, for `lock`, defaults to 300 seconds - 5 minutes)',
  );
}

async function main(args: string[]): Promise<void> {
  const { help, serviceId, apiKey, serverUrl, unlockWebhookUrl, waitTimeoutInMs, lockExpirationInSeconds, params } =
    parseArguments(args);

  // If help flag enabled, print help.
  if (help) {
    printHelp();
    Deno.exit(0);
  }

  if (!serviceId) {
    console.log('No serviceId set. Exiting.');
    Deno.exit(1);
  }

  if (!apiKey) {
    console.log('No apiKey set. Exiting.');
    Deno.exit(1);
  }

  if (!params || params.length < 2) {
    console.log('Invalid params. Exiting.');
    Deno.exit(1);
  }

  const command = params[0] as 'lock' | 'unlock' | 'check';

  if (!command || !['lock', 'unlock', 'check'].includes(command)) {
    console.log('Invalid command. Exiting.');
    Deno.exit(1);
  }

  const lockName = (params[1] as string).trim();

  if (!lockName) {
    console.log('Invalid lock name. Exiting.');
    Deno.exit(1);
  }

  const locker = new LockDB(serviceId, { apiKey, serverUrl });

  if (command === 'lock') {
    const gotTheLock = await locker.lock(lockName, {
      unlockWebhookUrl,
      waitTimeoutInMs,
      lockExpirationInSeconds,
    });
    console.log(gotTheLock);
  } else if (command === 'unlock') {
    const wasLocked = await locker.unlock(lockName, {
      waitTimeoutInMs,
    });
    console.log(wasLocked);
  } else if (command === 'check') {
    const isLocked = await locker.check(lockName, {
      waitTimeoutInMs,
    });
    console.log(isLocked);
  }

  Deno.exit(0);
}

if (import.meta.main) {
  await main(Deno.args);
}
