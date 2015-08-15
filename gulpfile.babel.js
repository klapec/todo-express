import gulp from 'gulp';
import gulpLoadPlugins from 'gulp-load-plugins';
import gutil from 'gulp-util';
import domain from 'domain';
import babelify from 'babelify';
import browserify from 'browserify';
import browserSync from 'browser-sync';
import source from 'vinyl-source-stream';
import buffer from 'vinyl-buffer';
import { exec } from 'child_process';
import Server from './server/server';

const $ = gulpLoadPlugins();
const bs = browserSync.create();
const production = process.env.NODE_ENV === 'production';
const server = new Server();

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

gulp.task('default', () => {
  // Initial connect
  // We don't have to spawn a separate process initially,
  // we can reuse this one
  server.connect();
  server.on('connected', () => {
    bs.init({
      proxy: 'http://localhost:3000',
      port: 4000,
      ui: false
    });
  });

  // If any of the watched files changes - kill the server
  // and create a new process
  // (so that the server has been completely refreshed)
  gulp.watch(['./!(node_modules|client)/**/*.{js,html,hbs}'], () => {
    server.kill();
    server.spawn()
      .then(() => {
        bs.reload();
      }, err => {
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
  server.connect();
  server.on('connected', () => {
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
