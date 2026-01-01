// backend/src/middleware/errorHandler.js
const errorHandler = (err, req, res, next) => {
  console.error(err);

  if (res.headersSent) {
    return next(err);
  }

  const status = err.statusCode || 500;
  const message = err.message || 'Internal server error';

  return res.status(status).json({
    success: false,
    message,
    data: null,
  });
};

module.exports = errorHandler;
