const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../db'); // Import your Sequelize instance (adjust as needed)
const User = require('./UserModel');

const Accessibility = sequelize.define('Accessibility', {
  viewable_accounts: {
    type: Sequelize.JSON,  // Use JSON to store an array of accounts (or handle this with a many-to-many relationship)
    defaultValue: [],
  },
  accounts: {
    type: Sequelize.JSON,  // Storing mixed data as a JSON field
    defaultValue: {
      view_only: false,
      edit: false,
      add: false,
    }
  },
  transactions: {
    type: Sequelize.JSON,  // Storing mixed data as a JSON field
    defaultValue: {
      view_only: false,
      edit: false,
      add: false,
    }
  },
  account_types: {
    type: Sequelize.JSON,  // Storing mixed data as a JSON field
    defaultValue: {
      view_only: false,
      add: false,
    }
  },
  balance_sheet: {
    type: Sequelize.JSON,  // Storing mixed data as a JSON field
    defaultValue: {
      view_only: false,
    }
  },
  import: {
    type: Sequelize.JSON,  // Storing mixed data as a JSON field
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
  timestamps: true,  // Sequelize will automatically add createdAt and updatedAt
  underscored: true,  // Tells Sequelize to use snake_case for column names
  tableName: 'accessibilities' // You can specify the table name explicitly if needed
});

// Define associations
Accessibility.belongsTo(User, { foreignKey: 'user_id' });  // Assuming one Accessibility per User

module.exports = Accessibility;
