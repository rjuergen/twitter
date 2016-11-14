'use strict';

const Tweet = require('../models/tweet');
const User = require('../models/user');
const Joi = require('joi');

exports.home = {

  handler: function (request, reply) {
    Tweet.find({}).populate('user').then(tweets => {
      reply.view('home', {
        title: 'Twitterer',
        tweets: tweets,
      });
    }).catch(err => {
      reply.redirect('/');
    });
  },

};

exports.publish = {

  validate: {

    payload: {
      message: Joi.string().min(1).max(140),
    },

    failAction: function (request, reply, source, error) {
      reply.view('home', {
        title: 'Publish error',
        errors: error.data.details,
      }).code(400);
    },
  },

  handler: function (request, reply) {
    var userEmail = request.auth.credentials.loggedInUser;
    User.findOne({ email: userEmail }).then(foundUser => {
      const tweet = new Tweet(request.payload);
      tweet.user = foundUser;
      return tweet.save();
    }).then(newTweet => {
      reply.redirect('/home');
    }).catch(err => {
      reply.redirect('/');
    });
  },

};
