// src/utils/apiResponse.js
const sendError = (res, message = "Lỗi server", status = 500) => {
  return res.status(status).json({
    success: false,
    message
  });
};

const sendSuccess = (res, data = null, message = "Thành công", status = 200) => {
  return res.status(status).json({
    success: true,
    message,
    data
  });
};

module.exports = { sendError, sendSuccess };