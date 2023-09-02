import { assertEquals } from 'https://deno.land/std@0.197.0/assert/assert_equals.ts';

import LockDB from './mod.ts';
import { abortController, port } from './mock_server.ts';

export const VALID_TEST_AUTH = {
  serviceId: 'service-identifier',
  apiKey: 'api-key',
};

Deno.test({
  name: 'LockDB basic usage',
  fn: async () => {
    const lock = new LockDB(VALID_TEST_AUTH.serviceId, {
      apiKey: VALID_TEST_AUTH.apiKey,
      serverUrl: `http://127.0.0.1:${port}`,
    });

    // Create a lock
    let wasReportLocked = await lock.lock('report', { waitTimeoutInMs: 5 });
    assertEquals(wasReportLocked, false);

    // Create another lock
    const wasBackupLocked = await lock.lock('backup');
    assertEquals(wasBackupLocked, false);

    // Check lock
    let isReportLocked = await lock.check('report');
    assertEquals(isReportLocked, true);

    // Try creating the same lock again
    isReportLocked = await lock.lock('report');
    assertEquals(isReportLocked, true);

    // Unlock
    wasReportLocked = await lock.unlock('report');
    assertEquals(wasReportLocked, true);

    // Check lock
    isReportLocked = await lock.check('report');
    assertEquals(isReportLocked, false);

    // Create the other lock
    const isBackupLocked = await lock.check('backup');
    assertEquals(isBackupLocked, true);

    abortController.abort('Test finished');
  },
  sanitizeResources: false,
  sanitizeOps: false,
});
