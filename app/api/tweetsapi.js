'use strict';

const Tweet = require('../models/tweet');
const User = require('../models/user');
const Boom = require('boom');

exports.deleteOne = {

  auth: false,

  handler: function (request, reply) {
    Tweet.remove({ _id: request.params.id }).then(tweet => {
      reply.redirect('/home');
    }).catch(err => {
      reply(Boom.notFound('id not found'));
    });
  },

};

exports.timeline = {

  handler: function (request, reply) {
    var userEmail = request.auth.credentials.loggedInUser;
    User.findOne({ email: userEmail }).then(currentUser => {
      Tweet.find({ user: request.params.id }).sort('date').populate('user').then(tweets => {
        tweets.forEach(t => {
          t.fdate = t.date.toLocaleString();
          if (currentUser.admin || t.user.email === currentUser.email)
            t.deletable = true;
        });
        let title = 'Timeline';
        if (tweets.length > 0)
          title = tweets[0].user.firstName + ' ' + tweets[0].user.lastName + ' Timeline';
        reply.view('timeline', {
          title: title,
          tweets: tweets,
        });
      }).catch(err => {
        reply.redirect('/');
      });
    }).catch(err => {
      reply.redirect('/');
    });
  },

};
