const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Transaction = sequelize.define('Transaction', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  borrowed_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  due_date: {
    type: DataTypes.DATE,
    allowNull: false
  },
  returned_at: {
    type: DataTypes.DATE,
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM('active', 'returned', 'overdue'),
    defaultValue: 'active',
    allowNull: false
  }
}, {
  tableName: 'transactions',
  timestamps: true,
  hooks: {
    beforeValidate: (transaction) => {
      // Set due date if not provided
      if (!transaction.due_date && transaction.borrowed_at) {
        const dueDate = new Date(transaction.borrowed_at);
        dueDate.setDate(dueDate.getDate() + parseInt(process.env.LOAN_PERIOD_DAYS || 14));
        transaction.due_date = dueDate;
      }
    }
  }
});

module.exports = Transaction;