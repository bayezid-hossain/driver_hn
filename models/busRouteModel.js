const mongoose = require('mongoose');

const busRouteSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please enter Route Name'],
  },
  numberOfStations: {
    type: String,
    required: [true, 'Please enter number of Stations'],
  },
  stations: [
    {
      type: Object,
    },
  ],
  routePermitDoc: {
    type: String,
    default: 'none',
  },
});

module.exports = mongoose.model('BusRoute', busRouteSchema);
