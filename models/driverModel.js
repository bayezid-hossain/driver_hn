const mongoose = require('mongoose');
const validator = require('validator');
const baseUserModel = require('./userBaseModel');
const cryptPassword = require('../utils/cryptPass');
const extendSchema = require('mongoose-extend-schema');

const driverSchema = extendSchema(baseUserModel.schema, {
  driverLicense: {
    type: String,
    require: [true, 'Please enter Driver License'],
  },
  NIDBack: {
    type: String,
    require: [
      true,
      "Please provide picture of Front side of your Driver\\'s NID",
    ],
  },
  driverImage: {
    type: String,
    require: [true, 'Please provide picture of yourself (driver)'],
  },
  NIDFront: {
    type: String,
    require: [
      true,
      "Please provide picture of Back side of your Driver\\'s NID",
    ],
  },
  licenseNumber: {
    type: String,
    require: [true, 'Please provide License Number'],
    unique: true,
  },
  NIDNumber: {
    type: String,
    require: [true, 'Please provide NID Number'],
  },
  owner: {
    type: mongoose.Schema.ObjectId,
    ref: 'busOwner',
  },
});
Object.assign(driverSchema.methods, baseUserModel.schema.methods);

driverSchema.pre('save', cryptPassword);

module.exports = mongoose.model('Driver', driverSchema);
