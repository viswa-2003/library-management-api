const express = require('express');
const router = express.Router();
const FineController = require('../controllers/fine.controller');

// Fine operations
router.get('/fines', FineController.getAllFines);
router.get('/fines/:id', FineController.getFineById);
router.post('/fines/:id/pay', FineController.payFine);
router.get('/members/:memberId/fines/calculate', FineController.calculateMemberFines);
module.exports = router;