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
  name: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
  updatedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
}, {
  timestamps: true, // Enable automatic timestamps for `createdAt` and `updatedAt`
  tableName: 'companies', // Specify the table name
});

module.exports = Company;
