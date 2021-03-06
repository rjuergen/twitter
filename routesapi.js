const UsersApi = require('./app/api/usersapi');
const TweetsApi = require('./app/api/tweetsapi');

module.exports = [
  { method: 'GET', path: '/api/users', config: UsersApi.find },
  { method: 'GET', path: '/api/users/{id}', config: UsersApi.findOne },
  { method: 'POST', path: '/api/users', config: UsersApi.create },
  { method: 'DELETE', path: '/api/users/{id}', config: UsersApi.deleteOne },

  { method: 'DELETE', path: '/api/tweets/{id}', config: TweetsApi.deleteOne },
  { method: 'GET', path: '/api/tweets/{id}', config: TweetsApi.findByUser },
  { method: 'POST', path: '/api/tweets', config: TweetsApi.create },

];
