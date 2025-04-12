const { DataTypes } = require('sequelize');
const sequelize = require('../db'); // Import the Sequelize instance
const User = require('./UserModel');
const Company = require('./Company');
const subAccount = require('./subAccounts');
const Transaction = require('./Transaction');

// Define subAccount model
const accountStatment = sequelize.define('accountStatment', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    user_id: {
        type: DataTypes.INTEGER,
        references: {
            model: User, // The target model to reference (AccountType)
            key: 'id', // The primary key in the AccountType table
        },
        allowNull: true, // Allow null if there's no account_type_id set
        onDelete: 'SET NULL', // Optionally handle deletion behavior for foreign key
    },
    other_user_id: {
        type: DataTypes.INTEGER,
        references: {
            model: User, // The target model to reference (AccountType)
            key: 'id', // The primary key in the AccountType table
        },
        allowNull: true, // Allow null if there's no account_type_id set
        onDelete: 'SET NULL', // Optionally handle deletion behavior for foreign key
    },
    transaction_id: {
        type: DataTypes.INTEGER,
        references: {
            model: Transaction, // The target model to reference (AccountType)
            key: 'id', // The primary key in the AccountType table
        },
        allowNull: true, // Allow null if there's no account_type_id set
        onDelete: 'SET NULL', // Optionally handle deletion behavior for foreign key
    },
    sub_account_id: {
        type: DataTypes.INTEGER,
        references: {
            model: subAccount, // The target model to reference (AccountType)
            key: 'id', // The primary key in the AccountType table
        },
        allowNull: true, // Allow null if there's no account_type_id set
        onDelete: 'SET NULL', // Optionally handle deletion behavior for foreign key
    },
    other_sub_account_id: {
        type: DataTypes.INTEGER,
        references: {
            model: subAccount, // The target model to reference (AccountType)
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
    balance: {
        type: DataTypes.DECIMAL,
        default: 0,
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
    tableName: 'account_statements', // Specify the table name
});

  // Associations
  accountStatment.associate = (models) => {
    accountStatment.belongsTo(models.SubAccount, { foreignKey: 'sub_account_id' });
    accountStatment.belongsTo(models.Transaction, { foreignKey: 'transaction_id' });
  };


module.exports = accountStatment;
