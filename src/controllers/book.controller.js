const BookService = require('../services/book.service');
const { AppError } = require('../utils/error.util');

class BookController {
  static async createBook(req, res, next) {
    try {
      console.log('📝 BookController.createBook called with data:', req.body);
      
      if (!req.body.isbn || !req.body.title || !req.body.author || !req.body.category) {
        throw new AppError('Missing required fields: isbn, title, author, category', 400);
      }

      const book = await BookService.createBook(req.body);
      
      console.log('✅ Book created:', book.id);
      res.status(201).json({
        success: true,
        data: book
      });
    } catch (error) {
      console.error('❌ Error in createBook:', error.message);
      next(error);
    }
  }

  static async getAllBooks(req, res, next) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      
      const result = await BookService.getAllBooks(page, limit);
      res.json({
        success: true,
        ...result
      });
    } catch (error) {
      next(error);
    }
  }

  static async getBookById(req, res, next) {
    try {
      const book = await BookService.getBookById(req.params.id);
      res.json({
        success: true,
        data: book
      });
    } catch (error) {
      next(error);
    }
  }

  static async updateBook(req, res, next) {
    try {
      const book = await BookService.updateBook(req.params.id, req.body);
      res.json({
        success: true,
        data: book
      });
    } catch (error) {
      next(error);
    }
  }

  static async deleteBook(req, res, next) {
    try {
      const result = await BookService.deleteBook(req.params.id);
      res.json({
        success: true,
        ...result
      });
    } catch (error) {
      next(error);
    }
  }

  static async getAvailableBooks(req, res, next) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      
      const result = await BookService.getAvailableBooks(page, limit);
      res.json({
        success: true,
        ...result
      });
    } catch (error) {
      next(error);
    }
  }

  static async updateBookStatus(req, res, next) {
    try {
      const { status } = req.body;
      
      if (!status) {
        throw new AppError('Status is required', 400);
      }

      const book = await BookService.updateBookStatus(req.params.id, status);
      res.json({
        success: true,
        data: book
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = BookController;