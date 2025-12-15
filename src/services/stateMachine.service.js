const { Book, Member, Transaction, Fine, sequelize } = require('../models');
const { calculateFineAmount, isOverdue } = require('../utils/date.util');
const { AppError } = require('../utils/error.util');

class StateMachineService {
  // Book State Transitions
  static async canBorrowBook(bookId, memberId) {
    const book = await Book.findByPk(bookId);
    const member = await Member.findByPk(memberId);
    
    if (!book) {
      throw new AppError('Book not found', 404);
    }
    if (!member) {
      throw new AppError('Member not found', 404);
    }

    // Check book status
    if (book.status !== 'available') {
      throw new AppError(`Book is currently ${book.status}`, 400);
    }

    // Check available copies
    if (book.available_copies <= 0) {
      throw new AppError('No copies available for borrowing', 400);
    }

    // Check member status
    if (member.status === 'suspended') {
      throw new AppError('Member is suspended and cannot borrow books', 400);
    }

    // Check borrowing limit
    const activeTransactions = await Transaction.count({
      where: {
        member_id: memberId,
        status: 'active'
      }
    });

    if (activeTransactions >= parseInt(process.env.MAX_BOOKS_PER_MEMBER || 3)) {
      throw new AppError(`Member cannot borrow more than ${process.env.MAX_BOOKS_PER_MEMBER || 3} books`, 400);
    }

    // Check for unpaid fines
    const unpaidFines = await Fine.findOne({
      where: {
        member_id: memberId,
        paid_at: null
      }
    });

    if (unpaidFines) {
      throw new AppError('Member has unpaid fines and cannot borrow books', 400);
    }

    return true;
  }

  static async borrowBook(bookId, memberId) {
    await this.canBorrowBook(bookId, memberId);

    const dbTransaction = await sequelize.transaction();

    try {
      // Create borrowing transaction
      const borrowingTransaction = await Transaction.create({
        book_id: bookId,
        member_id: memberId,
        borrowed_at: new Date()
      }, { transaction: dbTransaction });

      // Update book status and copies
      const book = await Book.findByPk(bookId, { transaction: dbTransaction });
      await book.update({
        available_copies: book.available_copies - 1,
        status: book.available_copies - 1 === 0 ? 'borrowed' : 'available'
      }, { transaction: dbTransaction });

      await dbTransaction.commit();
      return borrowingTransaction;

    } catch (error) {
      await dbTransaction.rollback();
      throw error;
    }
  }

  static async canReturnBook(transactionId) {
    const transaction = await Transaction.findByPk(transactionId, {
      include: ['book', 'member']
    });

    if (!transaction) {
      throw new AppError('Transaction not found', 404);
    }

    if (transaction.status === 'returned') {
      throw new AppError('Book has already been returned', 400);
    }

    return transaction;
  }

  static async returnBook(transactionId) {
    const transaction = await this.canReturnBook(transactionId);
    const dbTransaction = await sequelize.transaction();

    try {
      // Update transaction
      transaction.returned_at = new Date();
      transaction.status = 'returned';
      await transaction.save({ transaction: dbTransaction });

      // Update book
      const book = await Book.findByPk(transaction.book_id, { transaction: dbTransaction });
      await book.update({
        available_copies: book.available_copies + 1,
        status: 'available'
      }, { transaction: dbTransaction });

      // Check for overdue and create fine if needed
      if (isOverdue(transaction.due_date)) {
        const fineAmount = calculateFineAmount(
          transaction.due_date,
          parseFloat(process.env.FINE_PER_DAY || 0.50)
        );

        await Fine.create({
          transaction_id: transactionId,
          member_id: transaction.member_id,
          amount: fineAmount
        }, { transaction: dbTransaction });
      }

      // Check member status for suspension
      await this.checkMemberSuspension(transaction.member_id, dbTransaction);

      await dbTransaction.commit();
      return transaction;

    } catch (error) {
      await dbTransaction.rollback();
      throw error;
    }
  }

  static async checkMemberSuspension(memberId, dbTransaction = null) {
    const overdueBooks = await Transaction.count({
      where: {
        member_id: memberId,
        status: 'overdue'
      },
      transaction: dbTransaction
    });

    const member = await Member.findByPk(memberId, { transaction: dbTransaction });
    
    if (overdueBooks >= parseInt(process.env.MAX_OVERDUE_FOR_SUSPENSION || 3)) {
      await member.update({ status: 'suspended' }, { transaction: dbTransaction });
    } else if (member.status === 'suspended' && overdueBooks < 3) {
      await member.update({ status: 'active' }, { transaction: dbTransaction });
    }
  }

  // Update overdue status for all active transactions
  static async updateOverdueStatus() {
    const activeTransactions = await Transaction.findAll({
      where: { status: 'active' },
      include: ['book', 'member']
    });

    const now = new Date();
    
    for (const transaction of activeTransactions) {
      if (new Date(transaction.due_date) < now) {
        await transaction.update({ status: 'overdue' });
        
        // Check for member suspension
        await this.checkMemberSuspension(transaction.member_id);
      }
    }
  }
}

module.exports = StateMachineService;