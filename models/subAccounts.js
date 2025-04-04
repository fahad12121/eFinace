const { DataTypes } = require('sequelize');
const sequelize = require('../db'); // Import the Sequelize instance
const User = require('./UserModel');
const AccountType = require('./AccountType');
const Company = require('./Company');

// Define subAccount model
const subAccount = sequelize.define('subAccount', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    sub_account_pk: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: true,  // Ensure it's not null
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
    user_id: {
        type: DataTypes.INTEGER,
        references: {
            model: User, // The target model to reference (User)
            key: 'id', // The primary key in the User table
        },
        allowNull: true, // Allow null if there's no user_id set
        onDelete: 'SET NULL', // Optionally handle deletion behavior for foreign key
    },
    account_type_id: {
        type: DataTypes.INTEGER,
        references: {
            model: AccountType, // The target model to reference (AccountType)
            key: 'id', // The primary key in the AccountType table
        },
        allowNull: true, // Allow null if there's no account_type_id set
        onDelete: 'SET NULL', // Optionally handle deletion behavior for foreign key
    },
    account_username: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    balance: {
        type: DataTypes.DECIMAL,
        defaultValue: 0, // Default balance to 0
    },
    notes: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    is_default: {
        type: DataTypes.BOOLEAN,
        defaultValue: false, // Default to false
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
    tableName: 'sub_accounts', // Specify the table name
});

// Optional: Set up associations (if needed)
// subAccount.belongsTo(User, { foreignKey: 'user_id' });
subAccount.belongsTo(AccountType, { foreignKey: 'account_type_id' });

module.exports = subAccount;
