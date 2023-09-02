/**
 * This test file exists to help with testing in node
 */
const LockDB = require('./npm/script/mod').default;

const lock = new LockDB('service-identifier', {
  apiKey: 'api-key',
  serverUrl: `http://127.0.0.1:5678`,
});

(async () => {
  // Create a lock
  let wasReportLocked = await lock.lock('report');
  if (wasReportLocked !== false) {
    console.error('Lock failed');
    process.exit(1);
  }

  // Create another lock
  const wasBackupLocked = await lock.lock('backup');
  if (wasBackupLocked !== false) {
    console.error('Lock failed');
    process.exit(1);
  }

  // Check lock
  let isReportLocked = await lock.check('report');
  if (isReportLocked !== true) {
    console.error('Lock failed');
    process.exit(1);
  }

  // Try creating the same lock again
  isReportLocked = await lock.lock('report');
  if (isReportLocked !== true) {
    console.error('Lock failed');
    process.exit(1);
  }

  // Unlock
  wasReportLocked = await lock.unlock('report');
  if (wasReportLocked !== true) {
    console.error('Lock failed');
    process.exit(1);
  }

  // Check lock
  isReportLocked = await lock.check('report');
  if (isReportLocked !== false) {
    console.error('Lock failed');
    process.exit(1);
  }

  // Create the other lock
  const isBackupLocked = await lock.check('backup');
  if (isBackupLocked !== true) {
    console.error('Lock failed');
    process.exit(1);
  }

  console.info('Success!');

  process.exit(0);
})();
