const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  universityId: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    required: true
  },
  token: {
    type: String
  }
});

const User = mongoose.model('User', userSchema);

module.exports = User;
