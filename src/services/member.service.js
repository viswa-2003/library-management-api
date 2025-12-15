const { Member, Transaction, Fine } = require('../models');
const { AppError } = require('../utils/error.util');

class MemberService {
  static async createMember(data) {
    // Generate membership number if not provided
    if (!data.membership_number) {
      data.membership_number = `M${Date.now()}`;
    }

    const member = await Member.create(data);
    return member;
  }

  static async getAllMembers(page = 1, limit = 10) {
    const offset = (page - 1) * limit;
    
    const { count, rows } = await Member.findAndCountAll({
      limit,
      offset,
      order: [['name', 'ASC']]
    });

    return {
      members: rows,
      pagination: {
        total: count,
        page,
        pages: Math.ceil(count / limit)
      }
    };
  }

  static async getMemberById(id) {
    const member = await Member.findByPk(id, {
      include: [
        {
          model: Transaction,
          as: 'transactions',
          include: ['book']
        },
        {
          model: Fine,
          as: 'fines'
        }
      ]
    });

    if (!member) {
      throw new AppError('Member not found', 404);
    }

    return member;
  }

  static async updateMember(id, data) {
    const member = await Member.findByPk(id);
    
    if (!member) {
      throw new AppError('Member not found', 404);
    }

    // Don't allow updating membership_number
    if (data.membership_number && data.membership_number !== member.membership_number) {
      throw new AppError('Membership number cannot be changed', 400);
    }

    await member.update(data);
    return member;
  }

  static async deleteMember(id) {
    const member = await Member.findByPk(id);
    
    if (!member) {
      throw new AppError('Member not found', 404);
    }

    // Check if member has active transactions
    const activeTransactions = await Transaction.count({
      where: {
        member_id: id,
        status: 'active'
      }
    });

    if (activeTransactions > 0) {
      throw new AppError('Cannot delete member with active borrowings', 400);
    }

    await member.destroy();
    return { message: 'Member deleted successfully' };
  }

  static async getBorrowedBooks(memberId) {
    const member = await Member.findByPk(memberId);
    
    if (!member) {
      throw new AppError('Member not found', 404);
    }

    const borrowedBooks = await Transaction.findAll({
      where: {
        member_id: memberId,
        status: 'active'
      },
      include: ['book'],
      order: [['due_date', 'ASC']]
    });

    return borrowedBooks;
  }

  static async getMemberFines(memberId) {
    const fines = await Fine.findAll({
      where: {
        member_id: memberId,
        paid_at: null
      },
      include: ['transaction']
    });

    const totalFines = fines.reduce((sum, fine) => sum + parseFloat(fine.amount), 0);

    return {
      fines,
      total: totalFines
    };
  }
}

module.exports = MemberService;