const catchAsyncErrors = require('../middleware/catchAsyncErrors');
const ErrorHandler = require('../utils/errorhandler');
const Driver = require('../models/driverModel.js');
const { deleteFile } = require('../utils/fileOperations');
const { uploadFile } = require('../utils/awsS3');
const logger = require('../logger/index');
const path = require('path');
const { v4: uuid } = require('uuid');
const formidable = require('formidable');
const axios = require('axios');
let channel;

//register a driver

exports.registerDriver = catchAsyncErrors(async (req, res, next) => {
  const profiler = logger.startTimer();
  var form = new formidable.IncomingForm();
  form.multiples = true;
  form.maxFileSize = 5 * 1024 * 1024; // 5MB
  form
    .parse(req, async (err, fields, files) => {
      const { driverName, phoneNumber, owner, licenseNumber, NIDNumber } =
        fields;
      const { drivingLicense, NIDBack, NIDFront, driverImage } = files;

      try {
        isDriverAdded = await driverAlreadyExists(
          driverName,
          NIDNumber,
          licenseNumber
        );
        if (isDriverAdded) {
          profiler.done({
            message:
              'Driver ' +
              driverName +
              ' with License number ' +
              licenseNumber +
              ' and NID number ' +
              NIDNumber +
              ' already Added ',
            level: 'error',
            actionBy: owner,
          });
          return next(
            new ErrorHandler('Driver with this information already added')
          );
        }
        const validDriverPayload = {
          driverName: driverName,
          licenseNumber: licenseNumber,
        };

        const driverValidity = await axios
          .post(
            'http://localhost:8006/api/v1/crosscheck/driver',
            validDriverPayload
          )
          .catch(function (error) {
            profiler.done({
              message: error,
              level: 'error',
              actionBy: owner.id,
            });
            return next(new ErrorHandler('Validation Service not Responding'));
          });
        if (driverValidity.data.result == true) {
          const newDriver = await Driver.create({
            name: driverName,
            owner: owner,
            licenseNumber: licenseNumber,
            phone: phoneNumber,
            NIDNumber: NIDNumber,
            role: 'driver',
            driverLicense: 'tempURL',
            NIDBack: 'tempURL',
            NIDFront: 'tempURL',
            driverImage: 'tempURL',
          });
          if (newDriver) {
            logger.warning(
              `Driver ${newDriver.name} : ${newDriver.phone} (${newDriver._id}) registered!`
            );
            const resultofDriverLicenseUpload = await uploadFile(
              drivingLicense
            );

            const resultOfDriverNIDBackUpload = await uploadFile(NIDBack);
            const resultOfDriverNIDFrontUpload = await uploadFile(NIDFront);
            const resultOfDriverImageUpload = await uploadFile(driverImage);
            newDriver.driverLicense = resultofDriverLicenseUpload.Key;
            newDriver.NIDBack = resultOfDriverNIDBackUpload.Key;
            newDriver.NIDFront = resultOfDriverNIDFrontUpload.Key;
            newDriver.driverImage = resultOfDriverImageUpload.Key;
            await newDriver.save({ validateBeforeSave: false });

            res.status(200).json({
              success: true,
              message: 'Driver Account created successfully',
              driver: newDriver,
            });
            profiler.done({
              message: `Created Driver ${newDriver.id} by Authority ${owner}`,
            });
          }
        } else {
          profiler.done({
            message: driverValidity.data.message,
            level: 'error',
            actionBy: owner.id,
          });
          res.status(400).json({
            msg: driverValidity.data.message,
          });
        }
      } catch (error) {
        profiler.done({
          message: error,
          level: 'error',
          actionBy: owner.id,
        });
        return next(
          new ErrorHandler('Please provide all Informations correctly')
        );
      } finally {
        try {
          deleteFile(drivingLicense.filepath);
          deleteFile(NIDBack.filepath);
          deleteFile(NIDFront.filepath);
          deleteFile(driverImage.filepath);
        } catch (error) {}
      }
    })
    .on('fileBegin', function (name, file) {
      file.newFilename = uuid();
      file.filepath =
        path.join(__dirname, '../') +
        Date.now() +
        file.newFilename +
        '.' +
        file.mimetype.split('/').pop();
    })
    .on('file', function (name, file) {});
});

const driverAlreadyExists = async (driverName, NIDNumber, licenseNumber) => {
  let driver;
  try {
    driver = await Driver.findOne({
      name: driverName,
      NIDNumber: NIDNumber,
      licenseNumber: licenseNumber,
    });
  } catch (error) {
    return false;
  }

  if (driver) return true;
  else return false;
};
