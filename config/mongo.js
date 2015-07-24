// Mongo URI configuration
const mongo = {};

// Export env config depending on NODE_ENV
// Could be overwritten by MONGOURI env variable
switch (process.env.NODE_ENV) {
case 'development':
  mongo.uri = 'mongodb://localhost/todo-app-dev';
  break;
case 'test':
  mongo.uri = 'mongodb://localhost/todo-app-test';
  break;
case 'production':
  mongo.uri = 'mongodb://localhost/todo-app';
  break;
default:
  mongo.uri = 'mongodb://localhost/todo-app-dev';
  break;
}

export default mongo;
