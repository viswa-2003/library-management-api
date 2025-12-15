const { Book, Transaction } = require('../models');
const { Op } = require('sequelize');
const { AppError } = require('../utils/error.util');

class BookService {
  static async createBook(data) {
    if (data.available_copies > data.total_copies) {
      throw new AppError('Available copies cannot exceed total copies', 400);
    }
    
    const book = await Book.create(data);
    return book;
  }

  static async getAllBooks(page = 1, limit = 10) {
    const offset = (page - 1) * limit;
    
    const { count, rows } = await Book.findAndCountAll({
      limit,
      offset,
      order: [['createdAt', 'DESC']]
    });

    return {
      books: rows,
      pagination: {
        total: count,
        page,
        pages: Math.ceil(count / limit)
      }
    };
  }

  static async getBookById(id) {
    const book = await Book.findByPk(id, {
      include: [{
        model: Transaction,
        as: 'transactions',
        include: ['member']
      }]
    });

    if (!book) {
      throw new AppError('Book not found', 404);
    }

    return book;
  }

  static async updateBook(id, data) {
    const book = await Book.findByPk(id);
    
    if (!book) {
      throw new AppError('Book not found', 404);
    }

    // Prevent updating available_copies directly
    if (data.available_copies !== undefined) {
      throw new AppError('Available copies are managed by the system', 400);
    }

    await book.update(data);
    return book;
  }

  static async deleteBook(id) {
    const book = await Book.findByPk(id);
    
    if (!book) {
      throw new AppError('Book not found', 404);
    }

    // Check if book has active transactions
    const activeTransactions = await Transaction.count({
      where: {
        book_id: id,
        status: 'active'
      }
    });

    if (activeTransactions > 0) {
      throw new AppError('Cannot delete book with active borrowings', 400);
    }

    await book.destroy();
    return { message: 'Book deleted successfully' };
  }

  static async getAvailableBooks(page = 1, limit = 10) {
    const offset = (page - 1) * limit;
    
    const { count, rows } = await Book.findAndCountAll({
      where: {
        status: 'available',
        available_copies: { [Op.gt]: 0 }
      },
      limit,
      offset,
      order: [['title', 'ASC']]
    });

    return {
      books: rows,
      pagination: {
        total: count,
        page,
        pages: Math.ceil(count / limit)
      }
    };
  }

  static async updateBookStatus(id, status) {
    const validStatuses = ['available', 'borrowed', 'reserved', 'maintenance'];
    
    if (!validStatuses.includes(status)) {
      throw new AppError('Invalid status', 400);
    }

    const book = await Book.findByPk(id);
    
    if (!book) {
      throw new AppError('Book not found', 404);
    }

    // Additional validation based on current state
    if (status === 'available' && book.available_copies <= 0) {
      throw new AppError('Cannot set status to available when no copies are available', 400);
    }

    await book.update({ status });
    return book;
  }
}

module.exports = BookService;