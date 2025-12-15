const express = require('express');
const router = express.Router();
const BookController = require('../controllers/book.controller');

// Book CRUD operations
router.post('/books', BookController.createBook);
router.get('/books', BookController.getAllBooks);
router.get('/books/available', BookController.getAvailableBooks);
router.get('/books/:id', BookController.getBookById);
router.put('/books/:id', BookController.updateBook);
router.delete('/books/:id', BookController.deleteBook);
router.patch('/books/:id/status', BookController.updateBookStatus);

module.exports = router;