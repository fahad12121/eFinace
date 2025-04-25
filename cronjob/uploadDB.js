const cron = require('node-cron');
const backupDatabase = require('../google/mysqldump');
const uploadFileToDrive = require('../google/auth');
const { exec } = require('child_process');

// Database details
const dbHost = '69.62.122.99';  // Your host IP
const dbName = 'efinance_db';  // Your database name
const username = 'root';  // Your database name
const password = 'Precious@96';  // Your database name
// Cron job to run daily at 5 AM
cron.schedule('0 5 * * *', async () => {
  try {
    console.log('Starting MySQL Backup...');

    const date = new Date().toISOString().split('T')[0];  // Get current date in YYYY-MM-DD format
    const backupFilePath = `efinance_${date}.sql`;

    // Backup MySQL Database
    backupDatabase(dbHost, username, password, dbName, backupFilePath);

    console.log('Backup created, uploading to Google Drive...');

    // Upload to Google Drive
    uploadFileToDrive(backupFilePath, 'root');

    console.log('Backup uploaded successfully to Google Drive.');
  } catch (error) {
    console.error('Error during backup or upload:', error);
  }
});


// Trigger the cron job manually for testing
(async () => {
  try {
    console.log('Starting MySQL Backup...');

    const date = new Date().toISOString().split('T')[0];  // Get current date in YYYY-MM-DD format
    const backupFilePath = `efinance_${date}.sql`;

    // Backup MySQL Database
    backupDatabase(dbHost, username, password, dbName, backupFilePath);

    console.log('Backup created, uploading to Google Drive...');

    // Upload to Google Drive
    uploadFileToDrive(backupFilePath, 'root');

    console.log('Backup uploaded successfully to Google Drive.');
  } catch (error) {
    console.error('Error during backup or upload:', error);
  }
})();