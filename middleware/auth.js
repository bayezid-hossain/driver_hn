const ErrorHandler = require('../utils/errorhandler');
const catchAsyncErrors = require('./catchAsyncErrors');
const jwt = require('jsonwebtoken');

const busOwner = require('../models/busOwnerModel');
const passenger = require('../models/userBaseModel');
const driver = require('../models/driverModel');

async function getValidUser(decodedData) {
  let user;
  user = await busOwner.findById(decodedData.id);
  if (!user) user = await driver.findById(decodedData.id);
  if (!user) user = await passenger.findById(decodedData.id);
  return user;
}

exports.isAuthenticatedUser = catchAsyncErrors(async (req, res, next) => {
  const { token } = req.cookies;
  if (!token) {
    return next(new ErrorHandler('Please login to access this resource', 401));
  }

  const decodedData = jwt.verify(token, process.env.JWT_SECRET);

  req.user = await getValidUser(decodedData);

  next();
});
exports.isLoggedInUser = catchAsyncErrors(async (req, res, next) => {
  const { token } = req.cookies;
  if (!token) {
    return next(new ErrorHandler('Please login to access this resource', 401));
  }

  const decodedData = jwt.verify(token, process.env.JWT_SECRET);

  req.user = await getValidUser(decodedData);
  try {
    if (!req.user.loggedIn) {
      return next(
        new ErrorHandler('Please login to access this resource', 401)
      );
    }
  } catch (error) {
    return next(new ErrorHandler('Please login to access this resource', 401));
  }
  next();
});
exports.authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!roles[0].includes(req.user.role)) {
      return next(
        new ErrorHandler(
          `Role : ${req.user.role} is not allowed to access the resource!`,
          403
        )
      );
    }

    next();
  };
};
exports.approvalStatus = (...approvalStatus) => {
  return (req, res, next) => {
    if (!approvalStatus.includes(req.user.approvalStatus)) {
      return next(
        new ErrorHandler(
          `Approval Status ${req.user.approvalStatus} is not allowed to access the resource!`,
          403
        )
      );
    }

    next();
  };
};
