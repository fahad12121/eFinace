const cron = require('node-cron');
const backupDatabase = require('../google/mysqldump');
const uploadFileToDrive = require('../google/auth');
const cleanupOldBackups = require('../google/cleanupOldBackups');

const BACKUP_FOLDER_ID = '1w_6YIxrNWunnUkMRrqxnLJqH5qxOjDAP';
const BACKUP_WAIT_MS = 40000;

// Database details
const dbHost = '69.62.122.99';
const dbName = 'efinance_db';
const username = 'root';
const password = 'Precious@96';

function logWithTimestamp(tag, message) {
  const timestamp = new Date().toISOString();
  console.log(`${timestamp} ${tag} ${message}`);
}

async function runBackupProcess() {
  logWithTimestamp('[Backup]', 'Starting database backup...');

  const date = new Date().toISOString().split('T')[0];
  const backupFile = `efinance_${date}.sql`;

  logWithTimestamp('[Backup]', 'Creating SQL backup...');
  backupDatabase(dbHost, username, password, dbName, backupFile);
  await new Promise((resolve) => setTimeout(resolve, BACKUP_WAIT_MS));

  logWithTimestamp('[Cleanup]', 'Checking Google Drive backups...');
  try {
    const drive = await uploadFileToDrive.getAuthenticatedDrive();
    await cleanupOldBackups(drive, BACKUP_FOLDER_ID);
  } catch (err) {
    console.error('[Cleanup] Cleanup failed, continuing with upload:', err.message || err);
  }

  logWithTimestamp('[Upload]', 'Uploading today\'s backup...');
  await uploadFileToDrive(backupFile, BACKUP_FOLDER_ID);
  logWithTimestamp('[Upload]', 'Upload completed successfully.');

  logWithTimestamp('[Backup]', 'Process finished.');
}

// Cron job to run daily at 5 AM
cron.schedule('0 5 * * *', async () => {
  try {
    await runBackupProcess();
    console.log('Backup process completed successfully.');
  } catch (error) {
    console.error('Error during backup or upload:', error);
  }
});

// Trigger the cron job manually for testing
// (async () => {
//   try {
//     await runBackupProcess();
//     console.log('Backup process completed successfully.');
//   } catch (error) {
//     console.error('Error during backup or upload:', error);
//   }
// })();
