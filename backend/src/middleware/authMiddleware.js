const { verifyToken } = require('../utils/jwtHelper');
const User = require('../models/User');
const { sendError } = require('../utils/responseHelper');

const authenticate = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return sendError(res, 401, 'Vui lòng đăng nhập để truy cập');
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return sendError(res, 401, 'Token không hợp lệ hoặc đã hết hạn');
    }

    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      return sendError(res, 401, 'Người dùng không tồn tại');
    }

    req.user = user;
    next();
  } catch (error) {
    sendError(res, 401, 'Không có quyền truy cập');
  }
};

module.exports = authenticate;