const TransactionService = require('../services/transaction.service');

class TransactionController {
  static async borrowBook(req, res, next) {
    try {
      const transaction = await TransactionService.borrowBook(req.body);
      res.status(201).json({
        success: true,
        data: transaction
      });
    } catch (error) {
      next(error);
    }
  }

  static async returnBook(req, res, next) {
    try {
      const transaction = await TransactionService.returnBook(req.params.id);
      res.json({
        success: true,
        data: transaction
      });
    } catch (error) {
      next(error);
    }
  }

  static async getTransactionById(req, res, next) {
    try {
      const transaction = await TransactionService.getTransactionById(req.params.id);
      res.json({
        success: true,
        data: transaction
      });
    } catch (error) {
      next(error);
    }
  }

  static async getAllTransactions(req, res, next) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const filters = {};
      
      if (req.query.status) filters.status = req.query.status;
      if (req.query.member_id) filters.member_id = req.query.member_id;
      if (req.query.book_id) filters.book_id = req.query.book_id;

      const result = await TransactionService.getAllTransactions(page, limit, filters);
      res.json({
        success: true,
        ...result
      });
    } catch (error) {
      next(error);
    }
  }

  static async getOverdueTransactions(req, res, next) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      
      const result = await TransactionService.getOverdueTransactions(page, limit);
      res.json({
        success: true,
        ...result
      });
    } catch (error) {
      next(error);
    }
  }

  static async getMemberTransactions(req, res, next) {
    try {
      const transactions = await TransactionService.getMemberTransactions(req.params.memberId);
      res.json({
        success: true,
        data: transactions
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = TransactionController;