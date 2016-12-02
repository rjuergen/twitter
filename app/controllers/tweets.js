'use strict';

const User = require('../models/user');

exports.owntimeline = {

  handler: function (request, reply) {
    var userEmail = request.auth.credentials.loggedInUser;
    User.findOne({ email: userEmail }).then(currentUser => {
      reply.redirect('/api/tweets/' + currentUser._id);
    }).catch(err => {
      reply.redirect('/');
    });
  },

};

