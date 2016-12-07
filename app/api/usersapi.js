'use strict';

const User = require('../models/user');
const Tweet = require('../models/tweet');
const Boom = require('boom');

exports.find = {

  auth: false,

  handler: function (request, reply) {
    User.find({}).exec().then(users => {
      reply(users);
    }).catch(err => {
      reply(Boom.badImplementation('error accessing db'));
    });
  },

};

exports.findOne = {

  auth: false,

  handler: function (request, reply) {
    User.findOne({ _id: request.params.id }).then(user => {
      if (user != null) {
        reply(user);
      }

      reply(Boom.notFound('id not found'));
    }).catch(err => {
      reply(Boom.notFound('id not found'));
    });
  },

};

exports.create = {

  auth: false,

  handler: function (request, reply) {
    const user = new User(request.payload);
    user.creationDate = new Date();
    user.save().then(newUser => {
      reply(newUser).code(201);
    }).catch(err => {
      reply(Boom.badImplementation('error creating User'));
    });
  },

};

exports.deleteOne = {

  auth: false,

  handler: function (request, reply) {

    Tweet.remove({ user: request.params.id }).then(tweets => {
      User.remove({ _id: request.params.id }).then(user => {
        reply.redirect('/users');
      }).catch(err => {
        reply(Boom.notFound('id not found'));
      });
    }).catch(err => {
      reply(Boom.notFound('id not found'));
    });

  },

};
