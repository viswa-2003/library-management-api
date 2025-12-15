const express = require('express');
const router = express.Router();
const TransactionController = require('../controllers/transaction.controller');

// Transaction operations
router.post('/transactions/borrow', TransactionController.borrowBook);
router.post('/transactions/:id/return', TransactionController.returnBook);
router.get('/transactions', TransactionController.getAllTransactions);
router.get('/transactions/overdue', TransactionController.getOverdueTransactions);
router.get('/transactions/:id', TransactionController.getTransactionById);
router.get('/members/:memberId/transactions', TransactionController.getMemberTransactions);

module.exports = router;