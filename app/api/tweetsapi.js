'use strict';

const Tweet = require('../models/tweet');
const User = require('../models/user');
const Boom = require('boom');
const Joi = require('joi');

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
          if (currentUser.email === timelineUser.email) {
            reply.view('owntimeline', {
              title: timelineUser.firstName + ' ' + timelineUser.lastName + ' Timeline',
              tweets: tweets,
              user_id: currentUser._id,
            });
          } else {
            reply.view('timeline', {
              title: timelineUser.firstName + ' ' + timelineUser.lastName + ' Timeline',
              tweets: tweets,
            });
          }
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

exports.timelinePublish = {

  validate: {

    payload: {
      message: Joi.string().min(1).max(140),
    },

    failAction: function (request, reply, source, error) {
      Tweet.find({}).populate('user').then(tweets => {
        reply.view('home', {
          title: 'Twitterer',
          tweets: tweets,
          errors: error.data.details,
        }).code(400);
      });
    },
  },

  handler: function (request, reply) {
    var userEmail = request.auth.credentials.loggedInUser;
    User.findOne({ email: userEmail }).then(foundUser => {
      const tweet = new Tweet(request.payload);
      tweet.user = foundUser;
      tweet.date = new Date();
      return tweet.save();
    }).then(newTweet => {
      let id = newTweet.user._id;
      reply.redirect('/api/tweets/' + id);
    }).catch(err => {
      reply.redirect('/');
    });
  },

};
