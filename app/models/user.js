'use strict';

const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
  firstName: String,
  lastName: String,
  email: String,
  password: String,
  admin: Boolean,
  avatar: String,
  creationDate: Date,
  gender: {
    type: String,
    uppercase: true,
    enum: ['M', 'F'],
  },
  following: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
});

const User = mongoose.model('User', userSchema);
module.exports = User;
