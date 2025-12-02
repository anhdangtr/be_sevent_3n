const sendSuccess = (res, statusCode, data, message) => {
  res.status(statusCode).json({
    success: true,
    message,
    data,
  });
};

const sendError = (res, statusCode, message) => {
  res.status(statusCode).json({
    success: false,
    message,
  });
};

module.exports = { sendSuccess, sendError };