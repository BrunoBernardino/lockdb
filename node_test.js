/**
 * This test file exists to help with testing in node
 */
const LockDB = require('./npm/script/mod').default;

const lockName = 'sales';
const secondLockName = 'backup';
const locker = new LockDB('reports', {
  apiKey: 'api-key',
  serverUrl: `http://127.0.0.1:5678`,
});

(async () => {
  // Obtain a lock
  try {
    await locker.lock(lockName);
  } catch (error) {
    console.error(`Failed to obtain lock (${lockName}): ${error}`);
  }

  // Obtain another lock
  try {
    await locker.lock(secondLockName);
  } catch (error) {
    console.error(`Failed to obtain lock (${lockName}): ${error}`);
  }

  // Check lock
  let isReportLocked = await locker.check(lockName);
  if (isReportLocked !== true) {
    console.error('Lock failed');
    process.exit(1);
  }

  // Try obtaining the same lock again (shorter timeout, to force failing)
  try {
    await locker.lock(lockName, { waitTimeoutInMs: 10 });
    console.error('Lock unexpectedly obtained');
    process.exit(1);
  } catch (error) {
    if (!error.toString().includes('TimeoutError')) {
      console.error('Lock unexpectedly failed');
      console.error(error);
      process.exit(1);
    }
  }

  // Unlock
  wasReportLocked = await locker.unlock(lockName);
  if (wasReportLocked !== true) {
    console.error('Lock failed');
    process.exit(1);
  }

  // Check lock
  isReportLocked = await locker.check(lockName);
  if (isReportLocked !== false) {
    console.error('Lock failed');
    process.exit(1);
  }

  // Check the other lock
  const isBackupLocked = await locker.check(secondLockName);
  if (isBackupLocked !== true) {
    console.error('Lock failed');
    process.exit(1);
  }

  console.info('Success!');

  process.exit(0);
})();
