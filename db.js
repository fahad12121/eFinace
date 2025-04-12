PORT = 4100
const config = require('./config/config.json');
// db.js
const { Sequelize } = require('sequelize'); 

const dbConfig = config['production'];

// Create a new Sequelize instance and connect to the MySQL database
<<<<<<< HEAD
const sequelize = new Sequelize('efinance_db', 'root', 'Precious@96', {
=======
const sequelize = new Sequelize(dbConfig.database, dbConfig.username, dbConfig.password, {
>>>>>>> origin/main
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
