const { DataTypes } = require('sequelize');
const sequelize = require('../db'); // Import the Sequelize instance
const User = require('./UserModel');
const Company = require('./Company');
const subAccount = require('./subAccounts');

// Define subAccount model
const Transaction = sequelize.define('Transaction', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    sender_sub_account_id: {
        type: DataTypes.INTEGER,
        references: {
            model: subAccount, // The target model to reference (AccountType)
            key: 'id', // The primary key in the AccountType table
        },
        allowNull: true, // Allow null if there's no account_type_id set
        onDelete: 'SET NULL', // Optionally handle deletion behavior for foreign key
    },
    receiver_sub_account_id: {
        type: DataTypes.INTEGER,
        references: {
            model: subAccount, // The target model to reference (AccountType)
            key: 'id', // The primary key in the AccountType table
        },
        allowNull: true, // Allow null if there's no account_type_id set
        onDelete: 'SET NULL', // Optionally handle deletion behavior for foreign key
    },
    sender_id: {
        type: DataTypes.INTEGER,
        references: {
            model: User, // The target model to reference (AccountType)
            key: 'id', // The primary key in the AccountType table
        },
        allowNull: true, // Allow null if there's no account_type_id set
        onDelete: 'SET NULL', // Optionally handle deletion behavior for foreign key
    },
    receiver_id: {
        type: DataTypes.INTEGER,
        references: {
            model: User, // The target model to reference (AccountType)
            key: 'id', // The primary key in the AccountType table
        },
        allowNull: true, // Allow null if there's no account_type_id set
        onDelete: 'SET NULL', // Optionally handle deletion behavior for foreign key
    },
    transaction_date: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    amount: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    narration: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    notes: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    company_id: {
        type: DataTypes.INTEGER,
        references: {
            model: Company, // The target model to reference (AccountType)
            key: 'id', // The primary key in the AccountType table
        },
        allowNull: true, // Allow null if there's no account_type_id set
        onDelete: 'SET NULL', // Optionally handle deletion behavior for foreign key
    },
    is_deleted: {
        type: DataTypes.BOOLEAN,
        defaultValue: false, // Default to false (not deleted)
    },
    deleted_at: {
        type: DataTypes.DATE,
        defaultValue: null, // Default to null when not deleted
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
    tableName: 'transactions', // Specify the table name
});


module.exports = Transaction;
