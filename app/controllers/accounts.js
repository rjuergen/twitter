'use strict';

const User = require('../models/user');
const Joi = require('joi');

exports.main = {
  auth: false,
  handler: function (request, reply) {
    reply.view('main', { title: 'Welcome to Twitterer' });
  },

};

exports.signup = {
  auth: false,
  handler: function (request, reply) {
    reply.view('signup', { title: 'Sign up for Twitterer' });
  },

};

exports.login = {
  auth: false,

  handler: function (request, reply) {
    reply.view('login', { title: 'Login to Twitterer' });
  },

};

exports.authenticate = {
  auth: false,

  validate: {

    payload: {
      email: Joi.string().email().required(),
      password: Joi.string().required(),
    },

    failAction: function (request, reply, source, error) {
      reply.view('login', {
        title: 'Login error',
        errors: error.data.details,
      }).code(400);
    },

    options: {
      abortEarly: false,
    },
  },

  handler: function (request, reply) {
    const user = request.payload;
    User.findOne({ email: user.email }).then(foundUser => {
      if (foundUser && foundUser.password === user.password) {
        setCurrentUser(request, user);
        reply.redirect('/api/tweets');
      } else {
        reply.redirect('/signup');
      }
    }).catch(err => {
      reply.redirect('/');
    });
  },

};

exports.logout = {
  auth: false,
  handler: function (request, reply) {
    request.cookieAuth.clear();
    reply.redirect('/');
  },

};

exports.register = {
  auth: false,

  validate: {

    payload: {
      firstName: Joi.string().required(),
      lastName: Joi.string().required(),
      email: Joi.string().email().required(),
      password: Joi.string().required(),
    },

    failAction: function (request, reply, source, error) {
      reply.view('signup', {
        title: 'Sign up error',
        errors: error.data.details,
      }).code(400);
    },

    options: {
      abortEarly: false,
    },
  },

  handler: function (request, reply) {
    const user = new User(request.payload);
    user.creationDate = new Date();
    user.save().then(newUser => {
      setCurrentUser(request, user);
      reply.redirect('/api/tweets');
    }).catch(err => {
      reply.redirect('/');
    });
  },

};

exports.viewSettings = {

  handler: function (request, reply) {
    var donorEmail = request.auth.credentials.loggedInUser;
    User.findOne({ email: donorEmail }).then(foundUser => {
      reply.view('settings', { title: 'Edit Account Settings', user: foundUser });
    }).catch(err => {
      reply.redirect('/');
    });
  },
};

exports.updateSettings = {

  validate: {

    payload: {
      firstName: Joi.string().required(),
      lastName: Joi.string().required(),
      email: Joi.string().email().required(),
      password: Joi.string().required(),
    },

    failAction: function (request, reply, source, error) {
      reply.view('settings', {
        title: 'Change Settings error',
        errors: error.data.details,
      }).code(400);
    },

    options: {
      abortEarly: false,
    },
  },

  handler: function (request, reply) {
    const editedUser = request.payload;
    var userEmail = request.auth.credentials.loggedInUser;
    User.findOne({ email: userEmail }).then(user => {
      user.firstName = editedUser.firstName;
      user.lastName = editedUser.lastName;
      user.email = editedUser.email;
      user.password = editedUser.password;
      return user.save();
    }).then(user => {
      setCurrentUser(request, user);
      reply.view('settings', { title: 'Edit Account Settings', user: user });
    }).catch(err => {
      reply.redirect('/');
    });
  },

};

function setCurrentUser(request, user) {
  request.cookieAuth.set({
    loggedIn: true,
    loggedInUser: user.email,
  });
}

exports.users = {

  handler: function (request, reply) {
    User.find({}).sort('firstName').then(users => {
      users.forEach(u => {
        u.fcreationDate = u.creationDate.getDate() + '.' + u.creationDate.getMonth() +
        '.' + u.creationDate.getFullYear();
      });
      reply.view('users', {
        title: 'User',
        users: users,
      });
    }).catch(err => {
      reply.redirect('/');
    });
  },

};
