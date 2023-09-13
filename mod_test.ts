import { assertEquals } from 'std/assert/assert_equals.ts';

import LockDB from './mod.ts';
import { abortController, port } from './mock_server.ts';

export const VALID_TEST_AUTH = {
  serviceId: 'reports',
  apiKey: 'api-key',
};

Deno.test({
  name: 'LockDB basic usage',
  fn: async () => {
    const lockName = 'sales';
    const secondLockName = 'backup';

    const locker = new LockDB(VALID_TEST_AUTH.serviceId, {
      apiKey: VALID_TEST_AUTH.apiKey,
      serverUrl: `http://127.0.0.1:${port}`,
    });

    // Create a lock
    try {
      await locker.lock(lockName, { waitTimeoutInMs: 10 });
    } catch (error) {
      console.error(`Failed to obtain lock (${lockName}): ${error}`);
      assertEquals(true, false);
    }

    // Create another lock
    try {
      await locker.lock(secondLockName, { waitTimeoutInMs: 10 });
    } catch (error) {
      console.error(`Failed to obtain lock (${secondLockName}): ${error}`);
      assertEquals(true, false);
    }

    // Check lock
    let isReportLocked = await locker.check(lockName);
    assertEquals(isReportLocked, true);

    // Try creating the same lock again
    try {
      await locker.lock(lockName, { waitTimeoutInMs: 10 });
      console.error('Lock unexpectedly obtained');
      assertEquals(true, false);
    } catch (error) {
      if (!error.toString().includes('TimeoutError')) {
        console.error('Lock unexpectedly failed');
        console.error(error);
        assertEquals(true, false);
      }
    }

    // Unlock
    const wasReportLocked = await locker.unlock(lockName);
    assertEquals(wasReportLocked, true);

    // Check lock
    isReportLocked = await locker.check(lockName);
    assertEquals(isReportLocked, false);

    // Create the other lock
    const isBackupLocked = await locker.check(secondLockName);
    assertEquals(isBackupLocked, true);

    abortController.abort('Test finished');
  },
  sanitizeResources: false,
  sanitizeOps: false,
});
