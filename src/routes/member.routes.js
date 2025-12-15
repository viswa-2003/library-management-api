const express = require('express');
const router = express.Router();
const MemberController = require('../controllers/member.controller');

// Member CRUD operations
router.post('/members', MemberController.createMember);
router.get('/members', MemberController.getAllMembers);
router.get('/members/:id', MemberController.getMemberById);
router.put('/members/:id', MemberController.updateMember);
router.delete('/members/:id', MemberController.deleteMember);

// Member specific operations
router.get('/members/:id/borrowed', MemberController.getBorrowedBooks);
router.get('/members/:id/fines', MemberController.getMemberFines);

module.exports = router;