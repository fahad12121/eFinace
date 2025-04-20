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
    uid: {
        type: DataTypes.STRING,
        allowNull: true,
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
}, {
    timestamps: true,  // Sequelize will automatically add createdAt and updatedAt
    underscored: true,  // Tells Sequelize to use snake_case for column names
    tableName: 'transactions', // Specify the table name
});

// Associations
Transaction.associate = (models) => {
    Transaction.belongsTo(models.SubAccount, { foreignKey: 'sender_sub_account_id' }); // Transaction has one sender SubAccount
    Transaction.belongsTo(models.SubAccount, { foreignKey: 'receiver_sub_account_id' }); // Transaction has one receiver SubAccount
    Transaction.hasMany(models.AccountStatement, { foreignKey: 'transaction_id' }); // Transaction has many AccountStatements
};


module.exports = Transaction;
