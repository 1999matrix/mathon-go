exports.handleError = (message, statusCode, next, err = null) => {
    const error = new Error(message);
    error.statusCode = statusCode;
    if (err) {
      error.stack = err.stack;
    }
    next(error);
  };