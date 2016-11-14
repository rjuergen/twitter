'use strict';

const Tweet = require('../models/tweet');
const Joi = require('joi');

exports.home = {

  handler: function (request, reply) {
    Tweet.find({}).then(tweets => {
      reply.view('home', {
        title: 'Twitterer',
        tweets: tweets,
      });
    }).catch(err => {
      reply.redirect('/');
    });
  },

};
