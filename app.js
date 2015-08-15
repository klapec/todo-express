/* eslint no-var: 0, vars-on-top: 0 */

require('babel-core/register');

var Server = require('./server/server');
var server = new Server();

server.connect();

// If run in development with child_process.fork
// Used in gulp for reloading the server on file changes
if (process.send) {
  // Forwards 'connected' event from server.js
  // to the handler in gulpfile.babel.js
  // so that it knows when the server has actually started running
  server.on('connected', function() {
    process.send({ event: 'connected' });
  });

  server.on('error-express', function() {
    process.send({ event: 'error-express' });
  });

  server.on('error-mongo', function() {
    process.send({ event: 'error-mongo' });
  });
}
