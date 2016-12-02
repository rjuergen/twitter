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
});

const User = mongoose.model('User', userSchema);
module.exports = User;
