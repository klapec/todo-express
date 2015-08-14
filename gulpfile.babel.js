import gulp from 'gulp';
import gulpLoadPlugins from 'gulp-load-plugins';
import gutil from 'gulp-util';
import domain from 'domain';
import babelify from 'babelify';
import browserify from 'browserify';
import browserSync from 'browser-sync';
import source from 'vinyl-source-stream';
import buffer from 'vinyl-buffer';
import { exec, fork } from 'child_process';
import Server from './server/server';

const $ = gulpLoadPlugins();
const bs = browserSync.create();
const production = process.env.NODE_ENV === 'production';
// Instantiating server object for running tests
const testingServer = new Server();
// This will hold a reference to the spawned development server
let server;

let backTestsResultCode;
let frontTestsResultCode;

const assetsPaths = {
  sass: './client/sass/',
  scripts: './client/scripts/'
};

function errorHandler(err) {
  gutil.log(gutil.colors.red(err.toString()));
  this.emit('end');
}

// Spawning development server
function createServer() {
  return new Promise((resolve, reject) => {
    // Spawns a separate node process with the app server
    // 'color' flag for Chalk
    server = fork('app.js', ['--color']);
    // Listens for a message from the child process
    // which sends it via `process.send`
    server.on('message', message => {
      // Resolves if the server has been successfully started
      if (message.event === 'connected') {
        resolve();
      } else if (message.event === 'error-mongo') {
        reject(message.event);
      } else if (message.event === 'error-express') {
        reject(message.event);
      }
    });
  });
}

gulp.task('default', () => {
  createServer()
    .then(() => {
      // If the server has been successfully started, run browser-sync
      bs.init({
        proxy: 'http://localhost:3000',
        port: 4000
      });
    })
    .catch(err => {
      throw new Error(err);
    });

  // If any of the watched files changes - kill the spawned server
  // and create a new process
  // (so that the server has been completely refreshed)
  gulp.watch(['./!(node_modules|client)/**/*.{js,html,hbs}'], () => {
    server.kill('SIGTERM');
    createServer()
      .then(() => {
        bs.reload();
      })
      .catch(err => {
        throw new Error(err);
      });
  });
  gulp.watch(assetsPaths.sass + '**/*', ['styles']);
  gulp.watch(assetsPaths.scripts + '*', ['scripts']);
});

gulp.task('styles', () => {
  return gulp.src(assetsPaths.sass + 'app.scss')
    .pipe($.plumber({ errorHandler }))
    .pipe($.sass({
      precision: 10
    }))
    .pipe($.autoprefixer({
      browsers: ['last 2 versions', 'Android >= 4']
    }))
    .pipe($.minifyCss())
    .pipe($.rename({
      suffix: '.min'
    }))
    .pipe(gulp.dest('client/public/'))
    .pipe(bs.stream());
});

// Error handling in browserify in gulp:
// http://latviancoder.com/story/error-handling-browserify-gulp
gulp.task('scripts', () => {
  return gulp.src(assetsPaths.scripts + 'app.js', {read: false})
    .pipe($.tap(file => {
      const d = domain.create();

      d.on('error', errorHandler);

      d.run(function() {
        file.contents = browserify({
          entries: [file.path]
        })
        .transform(babelify)
        .bundle()
        .pipe(source('bundle.min.js'))
        .pipe($.if(production, buffer()))
        .pipe($.if(production, $.uglify()))
        .pipe(gulp.dest('client/public/'))
        .pipe(bs.stream());
      });
    }));
});

gulp.task('test', ['test-server', 'test-backend', 'test-frontend'], () => {
  return process.exit(frontTestsResultCode === 1 || backTestsResultCode === 1 ? 1 : 0);
});

gulp.task('test-server', cb => {
  // Create an instance of the Server object
  // We don't need to restart the server on testing
  testingServer.connect();
  testingServer.on('connected', () => {
    cb();
  });
});

gulp.task('test-backend', ['test-server'], cb => {
  exec('./node_modules/.bin/mocha --compilers js:babel-core/register --colors --timeout 10000 server/tests/*.js', (err, stdout, stderr) => {
    gutil.log(stdout);
    gutil.log(stderr);

    // Indicate whether tests ended with an error (status code 1)
    // or without any errors (status code 0)
    // This gets passed to process.exit
    err ? backTestsResultCode = 1 : backTestsResultCode = 0;
    cb();
  });
});

gulp.task('test-frontend', ['test-backend'], cb => {
  exec('./node_modules/.bin/mocha-casperjs client/tests/*.js', (err, stdout, stderr) => {
    gutil.log(stdout);
    gutil.log(stderr);

    err ? frontTestsResultCode = 1 : frontTestsResultCode = 0;
    cb();
  });
});
