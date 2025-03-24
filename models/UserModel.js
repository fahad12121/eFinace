// models/Company.js
const { DataTypes } = require('sequelize');
const sequelize = require('../db'); // Import the Sequelize instance
const Company = require('./Company');
const User = sequelize.define('User', {
    // Define the columns and their data types
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    account_pk: {
        type: DataTypes.STRING,
        unique: true,
        default: null,
    },
    name: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    username: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    password: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    user_type: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: 'User',
    },
    balance: {
        type: DataTypes.DECIMAL,
        default: 0,
    },
    company_id: {
        type: DataTypes.INTEGER,
        references: {
            model: Company, // The target model to reference (Company)
            key: 'id', // The primary key in the Company table
        },
        allowNull: true, // Ensure company_id is not null
    },
    last_login: {
        type: DataTypes.DATE,
        defaultValue: null,
    },
    last_ip: {
        type: DataTypes.DATE,
        defaultValue: null,
    },
    notes: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: 'User',
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
    tableName: 'users', // Specify the table name
});

module.exports = User;
