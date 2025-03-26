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

// Define associations
User.belongsTo(Company, { foreignKey: 'company_id', as: 'company' }); // User belongs to a Company
// Establish relationship: A user can have many subAccounts
User.hasMany(subAccount, { foreignKey: 'user_id' });

// Instance method to compare entered password with the hashed password
User.prototype.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

// sign JWT and return
// sign JWT and return
User.prototype.getSignedJwtToken = function () {
    return jwt.sign({ id: this.id, username: this.username }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE,
    });
};

// Hook to hash password before saving the user (Optional but recommended)
User.beforeCreate(async (user) => {
    if (user.password) {
        user.password = await bcrypt.hash(user.password, 10); // Hash the password before saving
    }
});


module.exports = User;
