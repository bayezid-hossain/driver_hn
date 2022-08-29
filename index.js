const app = require('./app');
const dotenv = require('dotenv');
const connectDatabase = require('./config/database');

//Handling Uncaught Exception

process.on('uncaughtException', (err) => {
  console.log(`Error ${err.message}`);
  console.log('Shutting down the server due to Uncaught Exception');
  process.exit(1);
});

// //config
// if (process.env.NODE_ENV === 'debug')
//   dotenv.config({ path: 'config/config.env' });

//Connecting to database
connectDatabase();

const server = app.listen(process.env.DRIVERPORT, () => {
  console.log(`driver is working on localhost:${process.env.DRIVERPORT}`);
});

// Unhandled Promise Rejection

process.on('unhandledRejection', (err) => {
  console.log(`Error: ${err.message}`);
  console.log('Shutting down the server due to unhandled promise rejection');
  server.close(() => {
    process.exit(1);
  });
});
