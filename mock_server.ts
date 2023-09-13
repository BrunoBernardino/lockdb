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

  const apiKey = request.headers.get('authorization')?.replace('Bearer ', '');

  if (!apiKey || apiKey !== VALID_TEST_AUTH.apiKey) {
    return new Response('Unauthorized', { status: 401 });
  }

  const data: ClientSentEventData = await request.json();

  if (data.eventName === 'lock') {
    const timeLimitInMs = new Date().getTime() + (data.waitForLockInMs || 500);

    let isLocked = Boolean(IN_MEMORY_LOCKS.get(data.lockName));
    let nowInMs = new Date().getTime();

    // Wait for lock to become unlocked
    while (isLocked && nowInMs < timeLimitInMs) {
      // Wait another 50ms
      await new Promise((resolve) => setTimeout(() => resolve(true), 50));

      isLocked = Boolean(IN_MEMORY_LOCKS.get(data.lockName));
      nowInMs = new Date().getTime();
    }

    if (nowInMs >= timeLimitInMs) {
      return new Response('Request Timeout', { status: 408 });
    }

    IN_MEMORY_LOCKS.set(data.lockName, true);

    const result: ServerSentEventData = {
      eventName: 'lock',
      lockName: data.lockName,
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
