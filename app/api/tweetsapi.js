'use strict';

const Tweet = require('../models/tweet');
const Boom = require('boom');


exports.deleteOne = {

  handler: function (request, reply) {
    Tweet.findOne({ _id: request.params.id }).populate('user').then(t => {
      let id = t.user._id;
      Tweet.remove({ _id: request.params.id }).then(tweet => {
        reply().code(204);
      }).catch(err => {
        reply(Boom.notFound('id not found'));
      });
    }).catch(err => {
      reply.redirect('/');
    });
  },

};


