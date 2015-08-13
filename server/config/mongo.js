// Mongo URI configuration
let defaultUri = '';

// Export URI depending on NODE_ENV
// Could be overwritten by MONGO_URI env variable
switch (process.env.NODE_ENV) {
  case 'development':
    defaultUri = 'mongodb://localhost/todo-app-dev';
    break;
  case 'test':
    defaultUri = 'mongodb://localhost/todo-app-test';
    break;
  case 'production':
    defaultUri = 'mongodb://localhost/todo-app';
    break;
  default:
    defaultUri = 'mongodb://localhost/todo-app-dev';
    break;
}

export default defaultUri;
