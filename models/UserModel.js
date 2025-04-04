// models/Company.js
const { DataTypes } = require('sequelize');
const sequelize = require('../db'); // Import the Sequelize instance
const bcrypt = require('bcryptjs');
const jwt = require("jsonwebtoken");
const Company = require('./Company');
const subAccount = require('./subAccounts');

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
    }
}, {
    timestamps: true,  // Sequelize will automatically add createdAt and updatedAt
    underscored: true,  // Tells Sequelize to use snake_case for column names
    tableName: 'users', // Specify the table name
});

// Define associations
User.belongsTo(Company, { foreignKey: 'company_id', as: 'company' }); // User belongs to a Company
// Establish relationship: A user can have many subAccounts
User.hasMany(subAccount, { foreignKey: 'user_id' });

// sign JWT and return
User.prototype.getSignedJwtToken = function () {
    return jwt.sign({ id: this.id, username: this.username }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE,
    });
};

module.exports = User;
