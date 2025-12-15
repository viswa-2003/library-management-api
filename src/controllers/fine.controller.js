const FineService = require('../services/fine.service');

class FineController {
  static async getAllFines(req, res, next) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const filters = {};
      
      if (req.query.paid) filters.paid = req.query.paid;
      if (req.query.member_id) filters.member_id = req.query.member_id;

      const result = await FineService.getAllFines(page, limit, filters);
      res.json({
        success: true,
        ...result
      });
    } catch (error) {
      next(error);
    }
  }

  static async getFineById(req, res, next) {
    try {
      const fine = await FineService.getFineById(req.params.id);
      res.json({
        success: true,
        data: fine
      });
    } catch (error) {
      next(error);
    }
  }

  static async payFine(req, res, next) {
    try {
      const fine = await FineService.payFine(req.params.id);
      res.json({
        success: true,
        data: fine,
        message: 'Fine paid successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  static async calculateMemberFines(req, res, next) {
    try {
      const fines = await FineService.calculateMemberFines(req.params.memberId);
      res.json({
        success: true,
        ...fines
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = FineController;