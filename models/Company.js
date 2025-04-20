// models/Company.js
const { DataTypes } = require('sequelize');
const sequelize = require('../db'); // Import the Sequelize instance

const Company = sequelize.define('Company', {
  // Define the columns and their data types
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  uid: {
    type: DataTypes.STRING,
    allowNull: true,
},
  name: {
    type: DataTypes.STRING,
    allowNull: true,
  },
}, {
  timestamps: true,  // Sequelize will automatically add createdAt and updatedAt
  underscored: true,  // Tells Sequelize to use snake_case for column names
  tableName: 'companies', // Specify the table name
});

module.exports = Company;
