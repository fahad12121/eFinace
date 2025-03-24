PORT = 4100

// db.js
const { Sequelize } = require('sequelize');

// Create a new Sequelize instance and connect to the MySQL database
const sequelize = new Sequelize('eFinance', 'root', '', {
    host: 'localhost',
    dialect: 'mysql',
    logging: false, // Disable logging for queries
});

async function testConnection() {
    try {
        await sequelize.authenticate();
        console.log('Connection has been established successfully.');
    } catch (error) {
        console.error('Unable to connect to the database:', error);
    }
}

testConnection();

module.exports = sequelize;
