const validateRequiredFields = (requiredFields) => {
  return (req, res, next) => {
    const missingFields = [];

    for (const field of requiredFields) {
      if (req.body[field] === undefined || req.body[field] === null || req.body[field] === '') {
        missingFields.push(field);
      }
    }

    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        error: `Missing required fields: ${missingFields.join(', ')}`,
      });
    }

    next();
  };
};

const isPositiveInteger = (value) => {
  return Number.isInteger(value) && value > 0;
};

const isFutureDate = (dateString) => {
  const date = new Date(dateString);
  return !isNaN(date.getTime()) && date > new Date();
};

module.exports = {
  validateRequiredFields,
  isPositiveInteger,
  isFutureDate,
};