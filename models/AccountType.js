// models/Company.js
const { DataTypes } = require('sequelize');
const sequelize = require('../db'); // Import the Sequelize instance
const Company = require("../models/Company");
const AccountType = sequelize.define('AccountType', {
    // Define the columns and their data types
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    company_id: {
        type: DataTypes.INTEGER,
        references: {
            model: Company, // The target model to reference (Company)
            key: 'id', // The primary key in the Company table
        },
        allowNull: true, // Ensure company_id is not null
    },
    name: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    status: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 0, // Default value of 0 (active)
        comment: "0 active, 1 not active", // Comment to explain the field behavior
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
    tableName: 'account_types', // Specify the table name
});

module.exports = AccountType;
