import gulp from 'gulp';
import gulpLoadPlugins from 'gulp-load-plugins';
import gutil from 'gulp-util';
import babelify from 'babelify';
import browserify from 'browserify';
import browserSync from 'browser-sync';
import source from 'vinyl-source-stream';
import buffer from 'vinyl-buffer';
import cp from 'child_process';

const $ = gulpLoadPlugins();
const bs = browserSync.create();
const exec = cp.exec;
const production = process.env.NODE_ENV === 'production';

let testServer;

const assetsPaths = {
  sass: 'assets/sass/',
  scripts: 'assets/scripts/'
};

function errorAlert(err) {
  $.notify.onError({
    title: 'Gulp Error',
    message: 'Check the terminal',
    sound: 'Basso'
  })(err);
  gutil.log(gutil.colors.red(err.toString()));
  this.emit('end');
}

gulp.task('default', ['nodemon'], () => {

  bs.init({
    proxy: 'http://localhost:3000',
    port: 4000
  });

  gulp.watch(assetsPaths.sass + '**/*', ['styles']);
  gulp.watch(assetsPaths.scripts + '*', ['scripts']);
});

gulp.task('nodemon', cb => {
  let called = false;
  return $.nodemon({
    ignore: ['tests/', 'node_modules/', 'bower_components', 'gulpfile.babel.js'],
    script: 'bootstrap.js',
    ext: 'js html hbs',
    env: { 'NODE_ENV': 'development' }
  })
  .on('start', () => {
    if (!called) {
      setTimeout(() => {
        cb();
      }, 4000);
    }
    called = true;
  })
  .on('restart', () => {
    setTimeout(() => {
      bs.reload();
    }, 4000);
  });
});

gulp.task('styles', () => {
  return gulp.src(assetsPaths.sass + 'app.scss')
    .pipe($.plumber({ errorHandler: errorAlert }))
    .pipe($.sass({
      precision: 4
    }))
    .pipe($.autoprefixer({
      browsers: ['last 2 versions', 'Android >= 4']
    }))
    .pipe($.minifyCss())
    .pipe($.rename({
      suffix: '.min'
    }))
    .pipe(gulp.dest('public/'))
    .pipe(bs.reload({ stream: true }))
    .pipe($.notify({
      title: 'Stylesheets recompiled',
      message: '<%= file.relative %>',
      sound: 'Glass'
    }));
});

gulp.task('scripts', () => {
  browserify(assetsPaths.scripts + 'app.js')
    .transform(babelify)
    .bundle()
    .pipe(source('bundle.min.js'))
    .pipe($.if(production, buffer()))
    .pipe($.if(production, $.uglify()))
    .pipe(gulp.dest('public/'))
    .pipe(bs.reload({ stream: true }))
    .pipe($.notify({
      title: 'Scripts recompiled',
      message: '<%= file.relative %>',
      sound: 'Glass'
    }));
});

gulp.task('test', ['test-server', 'test-frontend', 'test-backend'], () => {
  testServer.kill();
  return process.exit();
});

gulp.task('test-server', cb => {
  testServer = exec('NODE_ENV=test node bootstrap.js');

  setTimeout(() => {
    cb();
  }, 3000);
});

gulp.task('test-backend', ['test-frontend'], () => {
  return gulp.src('./tests/backend/*.js', { read: false })
    .pipe($.mocha());
});

gulp.task('test-frontend', ['test-server'], cb => {
  exec('PHANTOMJS_EXECUTABLE=./node_modules/phantomjs/bin/phantomjs ./node_modules/.bin/mocha-casperjs tests/frontend/*.js; exit 0', (err, stdout, stderr) => {
    if (err) {
      return err;
    }
    gutil.log(stdout);
    gutil.log(stderr);
    cb();
  });
});
