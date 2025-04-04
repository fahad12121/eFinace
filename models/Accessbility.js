const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../db'); // Import your Sequelize instance (adjust as needed)
const User = require('./UserModel');

const Accessibility = sequelize.define('Accessibility', {
  viewable_accounts: {
    type: DataTypes.JSONB,  // Use JSONB to store an array of accounts (or handle this with a many-to-many relationship)
    defaultValue: [],
  },
  accounts: {
    type: Sequelize.JSONB,  // Storing mixed data as a JSONB field
    defaultValue: {
      view_only: false,
      edit: false,
      add: false,
    }
  },
  transactions: {
    type: Sequelize.JSONB,  // Storing mixed data as a JSONB field
    defaultValue: {
      view_only: false,
      edit: false,
      add: false,
    }
  },
  account_types: {
    type: Sequelize.JSONB,  // Storing mixed data as a JSONB field
    defaultValue: {
      view_only: false,
      add: false,
    }
  },
  balance_sheet: {
    type: Sequelize.JSONB,  // Storing mixed data as a JSONB field
    defaultValue: {
      view_only: false,
    }
  },
  import: {
    type: Sequelize.JSONB,  // Storing mixed data as a JSONB field
    defaultValue: {
      add: false,
    }
  },
  user_id: {
    type: DataTypes.INTEGER,
    references: {
      model: User,  // Reference the User model
      key: 'id'
    },
    allowNull: false
  }
}, {
  timestamps: true,  // Automatically adds createdAt and updatedAt
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  tableName: 'accessibilities' // You can specify the table name explicitly if needed
});

// Define associations
Accessibility.belongsTo(User, { foreignKey: 'user_id' });  // Assuming one Accessibility per User

module.exports = Accessibility;
