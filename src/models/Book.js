const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Book = sequelize.define('Book', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  isbn: {
    type: DataTypes.STRING(13),
    allowNull: false,
    unique: true,
    validate: {
      len: [10, 13]
    }
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  author: {
    type: DataTypes.STRING,
    allowNull: false
  },
  category: {
    type: DataTypes.STRING,
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('available', 'borrowed', 'reserved', 'maintenance'),
    defaultValue: 'available',
    allowNull: false
  },
  total_copies: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1,
    validate: {
      min: 1
    }
  },
  available_copies: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1,
    validate: {
      min: 0
    }
  }
}, {
  tableName: 'books',
  timestamps: true,
  hooks: {
    beforeValidate: (book) => {
      if (book.available_copies > book.total_copies) {
        book.available_copies = book.total_copies;
      }
    }
  }
});

module.exports = Book;