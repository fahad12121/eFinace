// sync.js
const sequelize = require('./db');  // Import the Sequelize instance
const Company = require('./models/Company'); // Import the Company model
const AccountType = require('./models/AccountType'); // Import the Company model
const User = require('./models/UserModel'); // Import the Company model
const CompanyUser = require('./models/CompanyUsers'); // Import the Company model

async function syncDatabase() {
  try {
    // Sync the model to the database (create the table if it doesn't exist)
    await sequelize.sync({ force: true }); // Set `force: true` to drop and recreate the table
    console.log('Database synced successfully.');
  } catch (error) {
    console.error('Error syncing database:', error);
  }
}

syncDatabase();
