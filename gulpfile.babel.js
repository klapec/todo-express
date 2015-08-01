import gulp from 'gulp';
import gulpLoadPlugins from 'gulp-load-plugins';
import gutil from 'gulp-util';
import babelify from 'babelify';
import browserify from 'browserify';
import browserSync from 'browser-sync';
import mainBowerFiles from 'main-bower-files';
import source from 'vinyl-source-stream';
import buffer from 'vinyl-buffer';

const $ = gulpLoadPlugins();
const bs = browserSync.create();

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
    .pipe($.plumber({errorHandler: errorAlert}))
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
    .pipe(bs.reload({stream: true}))
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
    .pipe(buffer())
    .pipe($.uglify())
    .pipe(gulp.dest('public/'))
    .pipe(bs.reload({stream: true}))
    .pipe($.notify({
      title: 'Scripts recompiled',
      message: '<%= file.relative %>',
      sound: 'Glass'
    }));
});

gulp.task('bower', () => {
  return gulp.src(mainBowerFiles())
    .pipe($.rename({
      extname: '.scss'
    }))
    .pipe(gulp.dest(assetsPaths.sass + 'vendors/'));
});
