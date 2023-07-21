const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema({
  deanId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  slotDateTime: {
    type: String,
    required: true
  },
  duration: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    required: true
  }
});

module.exports = mongoose.model('Session', sessionSchema);