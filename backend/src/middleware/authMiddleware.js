const { verifyToken } = require('../utils/jwtHelper');
const User = require('../models/User');
const { sendError } = require('../utils/responseHelper');

const authenticate = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
      console.log('[auth] Authorization header present, token length:', token ? token.length : 0);
    }

    if (!token) {
      return sendError(res, 'Vui lòng đăng nhập để truy cập', 401);
    }

    const decoded = verifyToken(token);
    console.log('[auth] verifyToken result:', decoded ? `id=${decoded.id}` : 'null');
    if (!decoded) {
      return sendError(res, 'Token không hợp lệ hoặc đã hết hạn', 401);
    }

    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      return sendError(res, 'Người dùng không tồn tại', 401);
    }

    req.user = user;
    next();
  } catch (error) {
    sendError(res, 'Không có quyền truy cập', 401);
  }
};

module.exports = authenticate;