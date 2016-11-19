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
      User.findOne({ _id: request.params.id }).then(timelineUser => {
        Tweet.find({ user: request.params.id }).sort('date').populate('user').then(tweets => {
          tweets.forEach(t => {
            t.fdate = t.date.toLocaleString();
            if (currentUser.admin || t.user.email === currentUser.email)
              t.deletable = true;
          });
          let own = (currentUser.email === timelineUser.email);
          reply.view('timeline', {
            title: timelineUser.firstName + ' ' + timelineUser.lastName + ' Timeline',
            tweets: tweets,
            own: own,
          });
        }).catch(err => {
          reply.redirect('/');
        });
      }).catch(err => {
        reply.redirect('/');
      });
    }).catch(err => {
      reply.redirect('/');
    });
  },

};
