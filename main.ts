import { parse } from 'https://deno.land/std@0.197.0/flags/mod.ts';
import LockDB from './mod.ts';

const LOCKDB_SERVICE_ID = Deno.env.get('LOCKDB_SERVICE_ID');
const LOCKDB_API_KEY = Deno.env.get('LOCKDB_API_KEY');
const LOCKDB_SERVER_URL = Deno.env.get('LOCKDB_SERVER_URL');

async function main(args: string[]) {
  const parsedArgs = parse(args);
  const params = parsedArgs._;

  const serviceId = parsedArgs['service-id'] || LOCKDB_SERVICE_ID;
  const apiKey = parsedArgs['api-key'] || LOCKDB_API_KEY;
  const serverUrl = parsedArgs['server-url'] || LOCKDB_SERVER_URL;
  const unlockWebhookUrl = parsedArgs['unlock-webhook-url'];
  const waitTimeoutInMs = parsedArgs['wait-timeout-in-ms'];
  const lockExpirationInMs = parsedArgs['lock-expiration-in-ms'];

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

  const lock = new LockDB(serviceId, { apiKey, serverUrl });

  if (command === 'lock') {
    const wasLocked = await lock.lock(lockName, { unlockWebhookUrl, waitTimeoutInMs, lockExpirationInMs });
    console.log(wasLocked);
  } else if (command === 'unlock') {
    const wasLocked = await lock.unlock(lockName, { waitTimeoutInMs });
    console.log(wasLocked);
  } else if (command === 'check') {
    const isLocked = await lock.check(lockName, { waitTimeoutInMs });
    console.log(isLocked);
  }

  Deno.exit(0);
}

await main(Deno.args);
