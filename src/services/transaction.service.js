const { Transaction, Book, Member, Fine, sequelize } = require('../models');
const { AppError } = require('../utils/error.util');
const StateMachineService = require('./stateMachine.service');

class TransactionService {
  static async borrowBook(data) {
    const { book_id, member_id } = data;
    
    try {
      const transaction = await StateMachineService.borrowBook(book_id, member_id);
      return transaction;
    } catch (error) {
      throw error;
    }
  }

  static async returnBook(transactionId) {
    try {
      const transaction = await StateMachineService.returnBook(transactionId);
      return transaction;
    } catch (error) {
      throw error;
    }
  }

  static async getTransactionById(id) {
    const transaction = await Transaction.findByPk(id, {
      include: ['book', 'member', 'fine']
    });

    if (!transaction) {
      throw new AppError('Transaction not found', 404);
    }

    return transaction;
  }

  static async getAllTransactions(page = 1, limit = 10, filters = {}) {
    const offset = (page - 1) * limit;
    const whereClause = {};

    if (filters.status) {
      whereClause.status = filters.status;
    }
    if (filters.member_id) {
      whereClause.member_id = filters.member_id;
    }
    if (filters.book_id) {
      whereClause.book_id = filters.book_id;
    }

    const { count, rows } = await Transaction.findAndCountAll({
      where: whereClause,
      limit,
      offset,
      include: ['book', 'member'],
      order: [['borrowed_at', 'DESC']]
    });

    return {
      transactions: rows,
      pagination: {
        total: count,
        page,
        pages: Math.ceil(count / limit)
      }
    };
  }

  static async getOverdueTransactions(page = 1, limit = 10) {
    const offset = (page - 1) * limit;
    
    // First, update overdue status for all transactions
    await StateMachineService.updateOverdueStatus();

    const { count, rows } = await Transaction.findAndCountAll({
      where: { status: 'overdue' },
      limit,
      offset,
      include: ['book', 'member'],
      order: [['due_date', 'ASC']]
    });

    return {
      transactions: rows,
      pagination: {
        total: count,
        page,
        pages: Math.ceil(count / limit)
      }
    };
  }

  static async getMemberTransactions(memberId) {
    const transactions = await Transaction.findAll({
      where: { member_id: memberId },
      include: ['book'],
      order: [['borrowed_at', 'DESC']]
    });

    return transactions;
  }
}

module.exports = TransactionService;