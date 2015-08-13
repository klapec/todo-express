require('babel-core/register');

var Server = require('./server/server');
var server = new Server();

server.connect();
