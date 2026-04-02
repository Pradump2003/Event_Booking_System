const { v4: uuidv4 } = require('uuid');

const generateBookingCode = () => {
  return uuidv4();
};

module.exports = generateBookingCode;