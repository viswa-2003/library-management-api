const MemberService = require('../services/member.service');

class MemberController {
  static async createMember(req, res, next) {
    try {
      const member = await MemberService.createMember(req.body);
      res.status(201).json({
        success: true,
        data: member
      });
    } catch (error) {
      next(error);
    }
  }

  static async getAllMembers(req, res, next) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      
      const result = await MemberService.getAllMembers(page, limit);
      res.json({
        success: true,
        ...result
      });
    } catch (error) {
      next(error);
    }
  }

  static async getMemberById(req, res, next) {
    try {
      const member = await MemberService.getMemberById(req.params.id);
      res.json({
        success: true,
        data: member
      });
    } catch (error) {
      next(error);
    }
  }

  static async updateMember(req, res, next) {
    try {
      const member = await MemberService.updateMember(req.params.id, req.body);
      res.json({
        success: true,
        data: member
      });
    } catch (error) {
      next(error);
    }
  }

  static async deleteMember(req, res, next) {
    try {
      const result = await MemberService.deleteMember(req.params.id);
      res.json({
        success: true,
        ...result
      });
    } catch (error) {
      next(error);
    }
  }

  static async getBorrowedBooks(req, res, next) {
    try {
      const books = await MemberService.getBorrowedBooks(req.params.id);
      res.json({
        success: true,
        data: books
      });
    } catch (error) {
      next(error);
    }
  }

  static async getMemberFines(req, res, next) {
    try {
      const fines = await MemberService.getMemberFines(req.params.id);
      res.json({
        success: true,
        ...fines
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = MemberController;