var gulp = require('gulp');
var gutil = require('gulp-util');
var bower = require('bower');
var historyApiFallback = require('connect-history-api-fallback')

var browserSync = require('browser-sync').create();

var concat = require('gulp-concat');
var concatCSS = require('gulp-concat-css');
var injectVersion = require('gulp-inject-version');
var sass = require('gulp-sass');
var minifyCss = require('gulp-minify-css');
var rename = require('gulp-rename');
var sh = require('shelljs');



var paths = {
  sass: ['./www/scss/*.scss', './www/app/**/*.scss', './scss/**/*.scss']
};

gulp.task('default', ['sass']);

gulp.task('sass', function(done) {
  return gulp.src(paths.sass)
    .pipe(sass())
    .on('error', sass.logError)
    .pipe(gulp.dest('./www/css/'))
    .pipe(minifyCss({
      keepSpecialComments: 0
    }))
    .pipe(rename({ extname: '.min.css' }))
    .pipe(gulp.dest('./www/css/'))
    .pipe(browserSync.stream())
    // .on('end', done);
});

gulp.task('watch', ['sass'], function() {
  gulp.watch(paths.sass, ['sass']);
});

gulp.task('install', ['git-check'], function() {
  return bower.commands.install()
    .on('log', function(data) {
      gutil.log('bower', gutil.colors.cyan(data.id), data.message);
    });
});

gulp.task('build', ['install','sass'], function(){
  console.log('---- built successfully ---');
});

gulp.task('build-css', function(){

  return gulp.src(paths.sass)
  .pipe(sass())
  .pipe(minifyCss({
    keepSpecialComments: 0
  }))
  .pipe(concatCSS('css/bundle.min.css'))
  .pipe(gulp.dest('www'));
})


gulp.task('git-check', function(done) {
  if (!sh.which('git')) {
    console.log(
      '  ' + gutil.colors.red('Git is not installed.'),
      '\n  Git, the version control system, is required to download Ionic.',
      '\n  Download git here:', gutil.colors.cyan('http://git-scm.com/downloads') + '.',
      '\n  Once git is installed, run \'' + gutil.colors.cyan('gulp install') + '\' again.'
    );
    process.exit(1);
  }
  done();
});

gulp.task('serve', ['sass'], function() {

    browserSync.init({
        server: "./www",
        middleware: [historyApiFallback()]
    });

    gulp.watch("scss/*.scss", ['sass']);
    gulp.watch("www/**/*.scss", ['sass']);
    gulp.watch("www/**/*.html").on('change', browserSync.reload);
    gulp.watch("www/**/*.js").on('change', browserSync.reload);
    gulp.watch("www/**/*.css").on('change', browserSync.reload);
});

gulp.task('copy-www', function(){
  sh.rm('-rf', 'out/Release');
  sh.mkdir('-p', 'out/Release');
  sh.cp('-R', 'www/', 'out/Release');
});

gulp.task('version-index', function(){
  return gulp.src('out/Release/index.html')
  .pipe(injectVersion({
    replace:  /%%VERSION%%/g
  }))
  .pipe(gulp.dest('out/Release'));
});

gulp.task('version-footer', function(){
  return gulp.src('out/Release/app/components/footer/footer.html')
  .pipe(injectVersion({
    replace:  /%%VERSION%%/g
  }))
  .pipe(gulp.dest('out/Release/app/components/footer/'));
});

gulp.task('deploy',['install'], function(){


  gulp.start('build-css');

  setTimeout(function(){
    gulp.start('copy-www');
    gulp.start('version-index');
    gulp.start('version-footer');
  }, 3000)

  console.log('completed deploy process, copying to server...');
})


gulp.task('serve:before', ['sass', 'watch']);
