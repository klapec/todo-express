require('babel-core/register');

var Server = require('./app');
var server = new Server();

server.connect();
