// models/Company.js
const { DataTypes } = require('sequelize');
const sequelize = require('../db'); // Import the Sequelize instance
const Company = require('./Company');
const User = require('./UserModel');
const CompanyUser = sequelize.define('CompanyUser', {
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
        allowNull: false, // Ensure company_id is not null
    },
    user_id: {
        type: DataTypes.INTEGER,
        references: {
            model: User, // The target model to reference (Company)
            key: 'id', // The primary key in the Company table
        },
        allowNull: false, // Ensure company_id is not null
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
    tableName: 'company_users', // Specify the table name
});

module.exports = CompanyUser;
