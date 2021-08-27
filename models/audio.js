const mongoose = require('mongoose');
const Schema = mongoose.Schema;

var audioSchema = new Schema({
  nombre:    { type: String },
  analisis:  {type: Object},
  statistics:  {type: Object},
  annoyid: {type: Number}
});

module.exports = mongoose.model('audioDB', audioSchema);
