/**
 * This mock server exists to help with tests
 */

import { ClientSentEventData, ServerSentEventData } from './mod.ts';
import { VALID_TEST_AUTH } from './mod_test.ts';

export const abortController = new AbortController();

export const port = 5678;

const IN_MEMORY_LOCKS = new Map<string, boolean>();

Deno.serve({ port, signal: abortController.signal }, async (request) => {
  if (request.method !== 'POST') {
    return new Response('Not Implemented', { status: 501 });
  }

  const authorization = request.headers.get('authorization')?.replace('Bearer ', '');

  if (!authorization || authorization !== VALID_TEST_AUTH.apiKey) {
    return new Response('Unauthorized', { status: 401 });
  }

  const data: ClientSentEventData = await request.json();

  if (data.eventName === 'lock') {
    const wasLocked = Boolean(IN_MEMORY_LOCKS.get(data.lockName));

    IN_MEMORY_LOCKS.set(data.lockName, true);

    const result: ServerSentEventData = {
      eventName: 'lock',
      lockName: data.lockName,
      wasLocked,
    };

    return new Response(JSON.stringify(result));
  } else if (data.eventName === 'unlock') {
    const wasLocked = Boolean(IN_MEMORY_LOCKS.get(data.lockName));

    IN_MEMORY_LOCKS.set(data.lockName, false);

    const result: ServerSentEventData = {
      eventName: 'unlock',
      lockName: data.lockName,
      wasLocked,
    };

    return new Response(JSON.stringify(result));
  } else if (data.eventName === 'check') {
    const isLocked = Boolean(IN_MEMORY_LOCKS.get(data.lockName));

    const result: ServerSentEventData = {
      eventName: 'check',
      lockName: data.lockName,
      isLocked,
    };

    return new Response(JSON.stringify(result));
  }

  return new Response('Not Found', { status: 404 });
});
