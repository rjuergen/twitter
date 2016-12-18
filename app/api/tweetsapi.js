'use strict';

const Tweet = require('../models/tweet');
const Boom = require('boom');


exports.deleteOne = {

  auth: false,

  handler: function (request, reply) {
    Tweet.findOne({ _id: request.params.id }).populate('user').then(t => {
      let id = t.user._id;
      Tweet.remove({ _id: request.params.id }).then(tweet => {
        reply().code(204);
      }).catch(err => {
        reply(Boom.notFound('id not found'));
      });
    }).catch(err => {
      reply(Boom.notFound('id not found'));
    });
  },

};

exports.findByUser = {

  auth: false,

  handler: function (request, reply) {
    Tweet.find({ user: request.params.id }).populate('user').then(tweets => {
      reply(tweets);
    }).catch(err => {
      reply(Boom.notFound('id not found'));
    });
  },

};

exports.create = {

  auth: false,

  handler: function (request, reply) {
    const tweet = new Tweet(request.payload);
    tweet.creationDate = new Date();
    tweet.save().then(newTweet => {
      reply(newTweet).code(201);
    }).catch(err => {
      reply(Boom.badImplementation('error creating Tweet'));
    });
  },

};
