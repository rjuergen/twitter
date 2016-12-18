const Accounts = require('./app/controllers/accounts');
const Tweets = require('./app/controllers/tweets');
const Assets = require('./app/controllers/assets');

module.exports = [

  { method: 'GET', path: '/', config: Accounts.login },
  { method: 'GET', path: '/signup', config: Accounts.signup },
  { method: 'GET', path: '/login', config: Accounts.login },
  { method: 'POST', path: '/login', config: Accounts.authenticate },
  { method: 'GET', path: '/logout', config: Accounts.logout },
  { method: 'POST', path: '/register', config: Accounts.register },
  { method: 'GET', path: '/settings', config: Accounts.viewSettings },
  { method: 'POST', path: '/settings', config: Accounts.updateSettings },
  { method: 'GET', path: '/users', config: Accounts.users },
  { method: 'GET', path: '/users/delete/{id}', config: Accounts.deleteOne },
  { method: 'GET', path: '/users/follow/{id}', config: Accounts.follow },
  { method: 'GET', path: '/users/unfollow/{id}', config: Accounts.unfollow },

  { method: 'GET', path: '/owntimeline', config: Tweets.owntimeline },
  { method: 'GET', path: '/tweets/delete/{mainmenuid}/{id}', config: Tweets.deleteOne },
  { method: 'GET', path: '/tweets/{id}', config: Tweets.timeline },
  { method: 'GET', path: '/tweets', config: Tweets.timeline },
  { method: 'POST', path: '/tweets/deleteAll', config: Tweets.deleteAll },

  { method: 'POST', path: '/upload/{mainmenuid}', config: Tweets.uploadImage },
  { method: 'POST', path: '/publish/{mainmenuid}', config: Tweets.publish },

  {
    method: 'GET',
    path: '/{param*}',
    config: { auth: false },
    handler: Assets.servePublicDirectory,
  },

];
