var mongoose = require('mongoose');

var CommuteSchema = new mongoose.Schema({
  personelID: Number,
  date: Date,
  j_date: Object,
  time: Object,
  deviceID: Number,
  Enter: Boolean,
  accepted: Boolean,
});

var Commute = mongoose.model('Commute', CommuteSchema);

module.exports = Commute;


