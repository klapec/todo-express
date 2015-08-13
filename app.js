/* eslint no-var: 0, vars-on-top: 0 */

require('babel-core/register');

var Server = require('./server/server');
var server = new Server();

server.connect();
