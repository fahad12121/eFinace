const cron = require('node-cron');
const backupDatabase = require('../google/mysqldump');
const uploadFileToDrive = require('../google/auth');
const fs = require('fs');
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
    let backupFilePath = `efinance_${date}.sql`;

    // Backup MySQL Database
    backupDatabase(dbHost, username, password, dbName, backupFilePath);
    // Path to your existing backup file

    backupFilePath = `../efinance_2025-04-25.sql`;

    // Upload to Google Drive
    setTimeout(function () {
      uploadFileToDrive(backupFilePath, '1w_6YIxrNWunnUkMRrqxnLJqH5qxOjDAP');
      console.log('Backup uploaded successfully to Google Drive.');

    }, 50000);

  } catch (error) {
    console.error('Error during backup or upload:', error);
  }
});



// // Trigger the cron job manually for testing
(async () => {
  try {
    console.log('Starting MySQL Backup...');

    const date = new Date().toISOString().split('T')[0];  // Get current date in YYYY-MM-DD format
    let backupFile = `efinance_${date}.sql`;


    // Backup MySQL Database
    backupDatabase(dbHost, username, password, dbName, backupFile);

    console.log('Backup created, uploading to Google Drive...');

    // Upload to Google Drive
    setTimeout(function () {
      uploadFileToDrive(backupFile, '1w_6YIxrNWunnUkMRrqxnLJqH5qxOjDAP');

      console.log('Backup uploaded successfully to Google Drive.');
    }, 30000);
  } catch (error) {
    console.error('Error during backup or upload:', error);
  }
})();