var mongoose = require('mongoose');

var LogSchema = new mongoose.Schema({
  title: String,
  date: Date,
  j_date: Object,
  log1: [],
  log2: [],
  log3: [],
  log4: [],
  accepted: {
    type: Boolean,
    default: false,
  },

});

var Log = mongoose.model('Log', LogSchema);

module.exports = Log;

