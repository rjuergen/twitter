'use strict';

const Tweet = require('../models/tweet');
const User = require('../models/user');
const Boom = require('boom');
const Joi = require('joi');
const fs = require('fs');
const multiparty = require('multiparty');

var currentImage = [];

exports.owntimeline = {

  handler: function (request, reply) {
    var userEmail = request.auth.credentials.loggedInUser;
    User.findOne({ email: userEmail }).then(currentUser => {
      reply.redirect('/tweets/' + currentUser._id);
    }).catch(err => {
      reply.redirect('/');
    });
  },

};

exports.deleteOne = {

  handler: function (request, reply) {
    Tweet.findOne({ _id: request.params.id }).populate('user').then(t => {
      let id = t.user._id;
      Tweet.remove({ _id: request.params.id }).then(tweet => {
        if (request.params.mainmenuid === 'home') {
          reply.redirect('/tweets');
        } else {
          reply.redirect('/tweets/' + id);
        }
      }).catch(err => {
        reply(Boom.notFound('id not found'));
      });
    }).catch(err => {
      reply.redirect('/');
    });
  },

};

exports.deleteAll = {

  handler: function (request, reply) {
    var userEmail = request.auth.credentials.loggedInUser;
    User.findOne({ email: userEmail }).then(foundUser => {
      Tweet.remove({ user: foundUser }).then(tweets => {

        reply.view('settings', {
          title: 'Edit Account Settings',
          user: foundUser,
          infomessage: 'Deletion of all your tweets was successful!',
        });

      }).catch(err => {
        reply.redirect('/');
      });
    }).catch(err => {
      reply.redirect('/');
    });
  },

};


exports.timeline = {

  handler: function (request, reply) {
    if (request.params.id === undefined) { // home
      Tweet.find({}).sort({ date: 'desc' }).populate('user').then(tweets => {
        displayTweets(request, reply, tweets, null);
      }).catch(err => {
        reply.redirect('/');
      });
    } else { // timeline or own timeline
      User.findOne({ _id: request.params.id }).then(timelineUser => {
        Tweet.find({ user: request.params.id }).sort({ date: 'desc' }).populate('user').then(tweets => {
          displayTweets(request, reply, tweets, timelineUser);
        }).catch(err => {
          reply.redirect('/');
        });
      }).catch(err => {
        reply.redirect('/');
      });
    }
  },

};

exports.publish = {

  validate: {

    payload: {
      message: Joi.string().min(1).max(140),
      image: Joi.string(),
    },

    failAction: function (request, reply, source, error) {
      var userEmail = request.auth.credentials.loggedInUser;
      Tweet.find({}).populate('user').then(tweets => {
        reply.view('/tweets', {
          title: 'Twitterer',
          tweets: tweets,
          can_post: true,
          mainmenuid: 'home',
          image: currentImage[userEmail],
          errors: error.data.details,
        }).code(400);
      });
    },
  },

  handler: function (request, reply) {
    var userEmail = request.auth.credentials.loggedInUser;
    currentImage[userEmail] = null;
    User.findOne({ email: userEmail }).then(foundUser => {
      const tweet = new Tweet(request.payload);
      tweet.user = foundUser;
      tweet.date = new Date();
      return tweet.save();
    }).then(newTweet => {
      if (request.params.mainmenuid === 'home') {
        reply.redirect('/tweets');
      } else {
        let id = newTweet.user._id;
        reply.redirect('/tweets/' + id);
      }
    }).catch(err => {
      reply.redirect('/');
    });
  },

};

function displayTweets(request, reply, tweets, timelineUser) {
  var userEmail = request.auth.credentials.loggedInUser;
  User.findOne({ email: userEmail }).then(currentUser => {
    tweets.forEach(t => {
      t.fdate = t.date.toLocaleString();
      if (currentUser.admin || t.user.email === currentUser.email)
        t.deletable = true;
    });
    if (timelineUser === null) { // home
      reply.view('timeline', {
        title: 'Twitterer',
        tweets: tweets,
        can_post: true,
        mainmenuid: 'home',
        image: currentImage[userEmail],
      });
    } else if (currentUser.email === timelineUser.email) { // own timeline
      reply.view('timeline', {
        title: timelineUser.firstName + ' ' + timelineUser.lastName + ' Timeline',
        tweets: tweets,
        user_id: currentUser._id,
        can_post: true,
        mainmenuid: 'owntimeline',
        image: currentImage[userEmail],
      });
    } else { // someones timeline
      reply.view('timeline', {
        title: timelineUser.firstName + ' ' + timelineUser.lastName + ' Timeline',
        tweets: tweets,
        mainmenuid: 'timeline',
      });
    }
  }).catch(err => {
    reply.redirect('/tweets');
  });
}

exports.uploadImage = {

  payload: {
    maxBytes: 209715200,
    output: 'stream',
    parse: false,
  },

  handler: function (request, reply) {
    var userEmail = request.auth.credentials.loggedInUser;
    User.findOne({ email: userEmail }).then(foundUser => {
      let folder = 'public/images/' + foundUser._id + '/';
      let displayFolder = '/images/' + foundUser._id + '/';
      var form = new multiparty.Form();
      form.parse(request.payload, (err, fields, files) => {
        fs.readFile(files.file[0].path, (err, data) => {
          fs.existsSync(folder) || fs.mkdirSync(folder);
          fs.writeFile(folder + files.file[0].originalFilename, data, err => {
            currentImage[userEmail] = displayFolder + files.file[0].originalFilename;
            if (request.params.mainmenuid === 'home') {
              reply.redirect('/tweets');
            } else {
              reply.redirect('/tweets/' + foundUser._id);
            }
          });
        });
      });
    }).catch(err => {
      reply.redirect('/');
    });
  },

};
