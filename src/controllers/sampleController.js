// Sample Controller
const getStatus = (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Server is operational',
  });
};

module.exports = {
  getStatus,
};
