const catchAsyncErrors = require('../middleware/catchAsyncErrors');
const ErrorHandler = require('../utils/errorhandler');
const Driver = require('../models/driverModel.js');
const path = require('path');
const sendToken = require('../utils/jwtToken');
const amqp = require('amqplib');
const logger = require('../logger/index');
let channel;

//register a driver
exports.registerDriver = catchAsyncErrors(async (req, res, next) => {
  const { name, driverLicense, phone, pin, licenseNumber, owner } = req.body;

  const driver = await Driver.create({
    name: name,
    driverLicense: driverLicense,
    owner: owner,
    licenseNumber: licenseNumber,
    phone: phone,
    pin: pin,
    role: 'Driver',
  });

  sendToken(driver, 201, res);

  logger.warning(
    `Driver ${user.name} : ${user.phone} (${user._id}) registered!`
  );
});

// async function connect() {
//   const amqpServer = 'amqp://admin:gobdrabbitadmin@localhost';
//   const connection = await amqp.connect(amqpServer);
//   channel = await connection.createChannel();
//   await channel.assertQueue('REGISTERDRIVER');
// }

// connect().then(() => {
//   channel.consume('REGISTERDRIVER', (data) => {
//     channel.ack(data);
//     console.log('Consuming REGISTERDRIVER service');
//     const { name, driverLicense, phone, pin, licenseNumber, owner } =
//       JSON.parse(data.content);
//     try {
//       registerDriver(name, driverLicense, phone, pin, licenseNumber, owner)
//         .then((value) => {
//           const { driverId, errorCode } = value;
//           channel.sendToQueue(
//             'ADDEDDRIVER',
//             Buffer.from(
//               JSON.stringify({ newDriver: driverId, errorCode: errorCode })
//             )
//           );
//         })
//         .catch((err) => {
//           console.log(err);
//         });
//     } catch (error) {
//       console.log(error);
//     }
//   });
// });
