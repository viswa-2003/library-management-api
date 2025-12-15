const { Fine, Transaction, Member } = require('../models');
const { Op } = require('sequelize');
const { AppError } = require('../utils/error.util');

class FineService {
  static async getAllFines(page = 1, limit = 10, filters = {}) {
    const offset = (page - 1) * limit;
    const whereClause = {};

    if (filters.paid === 'true') {
      whereClause.paid_at = { [Op.ne]: null };
    } else if (filters.paid === 'false') {
      whereClause.paid_at = null;
    }

    if (filters.member_id) {
      whereClause.member_id = filters.member_id;
    }

    const { count, rows } = await Fine.findAndCountAll({
      where: whereClause,
      limit,
      offset,
      include: ['member', 'transaction'],
      order: [['createdAt', 'DESC']]
    });

    const totalUnpaid = await Fine.sum('amount', {
      where: { paid_at: null }
    });

    return {
      fines: rows,
      total_unpaid: totalUnpaid || 0,
      pagination: {
        total: count,
        page,
        pages: Math.ceil(count / limit)
      }
    };
  }

  static async getFineById(id) {
    const fine = await Fine.findByPk(id, {
      include: ['member', 'transaction']
    });

    if (!fine) {
      throw new AppError('Fine not found', 404);
    }

    return fine;
  }

  static async payFine(fineId) {
    const fine = await Fine.findByPk(fineId, {
      include: ['member']
    });

    if (!fine) {
      throw new AppError('Fine not found', 404);
    }

    if (fine.paid_at) {
      throw new AppError('Fine has already been paid', 400);
    }

    fine.paid_at = new Date();
    await fine.save();

    // Check if member can be reactivated
    if (fine.member.status === 'suspended') {
      const unpaidFines = await Fine.count({
        where: {
          member_id: fine.member_id,
          paid_at: null
        }
      });

      if (unpaidFines === 0) {
        await fine.member.update({ status: 'active' });
      }
    }

    return fine;
  }

  static async calculateMemberFines(memberId) {
    const fines = await Fine.findAll({
      where: {
        member_id: memberId,
        paid_at: null
      }
    });

    const totalAmount = fines.reduce((sum, fine) => sum + parseFloat(fine.amount), 0);

    return {
      fines: fines.length,
      total_amount: totalAmount,
      details: fines
    };
  }
}

module.exports = FineService;