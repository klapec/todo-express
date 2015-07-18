import path from 'path';
import util from 'util';

const defaults = {
  root: path.resolve(__dirname, '..')
};

let config = '';

// Export env config depending on NODE_ENV
switch (process.env.NODE_ENV) {
case 'development':
  config = util._extend(defaults, {
    db: 'mongodb://localhost/todo-app-dev'
  });
  break;
case 'test':
  config = util._extend(defaults, {
    db: 'mongodb://localhost/todo-app-test'
  });
  break;
case 'production':
  config = util._extend(defaults, {
    db: 'mongodb://localhost/todo-app'
  });
  break;
default:
  config = util._extend(defaults, {
    db: 'mongodb://localhost/todo-app-dev'
  });
  break;
}

export default config;
