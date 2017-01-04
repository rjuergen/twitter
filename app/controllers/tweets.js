'use strict';

const Tweet = require('../models/tweet');
const User = require('../models/user');
const Boom = require('boom');
const Joi = require('joi');
const fs = require('fs');
const multiparty = require('multiparty');

var currentImage = [];
var errors = [];

exports.owntimeline = {

  handler: function (request, reply) {
    var userEmail = request.auth.credentials.loggedInUser;
    User.findOne({ email: userEmail }).then(currentUser => {
      reply.redirect('/tweets/' + currentUser._id);
    }).catch(err => { console.log(err); });
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
    }).catch(err => { console.log(err); });
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

      }).catch(err => { console.log(err); });
    }).catch(err => { console.log(err); });
  },

};


exports.timeline = {

  handler: function (request, reply) {
    if (request.params.id === undefined) { // home
      var userEmail = request.auth.credentials.loggedInUser;
      User.findOne({ email: userEmail }).then(currentUser => {
        let following = currentUser.following;
        following.push(currentUser._id);
        Tweet.find({}).where({ user: { $in: following } }).sort({ date: 'desc' }).populate('user').then(tweets => {
          displayTweets(request, reply, tweets, null);
        }).catch(err => { console.log(err); });
      }).catch(err => { console.log(err); });
    } else { // timeline or own timeline
      User.findOne({ _id: request.params.id }).then(timelineUser => {
        Tweet.find({ user: request.params.id }).sort({ date: 'desc' }).populate('user').then(tweets => {
          displayTweets(request, reply, tweets, timelineUser);
        }).catch(err => { console.log(err); });
      }).catch(err => { console.log(err); });
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
      errors[userEmail] = error;
      if (request.params.mainmenuid === 'home') {
        reply.redirect('/tweets');
      } else {
        User.findOne({ email: userEmail }).then(foundUser => {
          reply.redirect('/tweets/' + foundUser._id);
        }).catch(err => { console.log(err); });
      }
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
    }).catch(err => { console.log(err); });
  },

};

function displayTweets(request, reply, tweets, timelineUser) {
  var userEmail = request.auth.credentials.loggedInUser;
  User.findOne({ email: userEmail }).then(currentUser => {
    currentUser.fcreationDate = currentUser.creationDate.getDate() +
        '.' + currentUser.creationDate.getMonth() + '.' + currentUser.creationDate.getFullYear();
    currentUser.followingCount = currentUser.following.length;
    let error = errors[userEmail];
    errors[userEmail] = null;
    tweets.forEach(t => {
      t.fdate = t.date.toLocaleString();
      if (currentUser.admin || t.user.email === currentUser.email)
        t.deletable = true;
    });
    if (timelineUser === null) { // home
      Tweet.count({ user: currentUser._id }).then(userTweetCount => {
        currentUser.tweetCount = userTweetCount;
        reply.view('timeline', {
          title: 'Twitterer',
          tweets: tweets,
          can_post: true,
          mainmenuid: 'home',
          image: currentImage[userEmail],
          user: currentUser,
          followable: false,
          errors: error,
        });
      }).catch(err => { console.log(err); });
    } else if (currentUser.email === timelineUser.email) { // own timeline
      Tweet.count({ user: currentUser._id }).then(userTweetCount => {
        currentUser.tweetCount = userTweetCount;
        reply.view('timeline', {
          title: timelineUser.firstName + ' ' + timelineUser.lastName + ' Timeline',
          tweets: tweets,
          user_id: currentUser._id,
          can_post: true,
          mainmenuid: 'owntimeline',
          image: currentImage[userEmail],
          user: currentUser,
          followable: false,
          errors: error,
        });
      }).catch(err => { console.log(err); });
    } else { // someones timeline
      timelineUser.fav = currentUser.following.indexOf(timelineUser._id) != -1;
      timelineUser.fcreationDate = timelineUser.creationDate.getDate() +
          '.' + timelineUser.creationDate.getMonth() + '.' + timelineUser.creationDate.getFullYear();
      timelineUser.followingCount = timelineUser.following.length;
      Tweet.count({ user: timelineUser._id }).then(userTweetCount => {
        timelineUser.tweetCount = userTweetCount;
        reply.view('timeline', {
          title: timelineUser.firstName + ' ' + timelineUser.lastName + ' Timeline',
          tweets: tweets,
          mainmenuid: 'timeline',
          user: timelineUser,
          followable: true,
        });
      }).catch(err => { console.log(err); });
    }
  }).catch(err => { console.log(err); });
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
    }).catch(err => { console.log(err); });
  },

};
