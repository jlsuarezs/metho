var gulp = require('gulp');
var gutil = require('gulp-util');
var bower = require('bower');
var concat = require('gulp-concat');
var sass = require('gulp-sass');
var minifyCss = require('gulp-minify-css');
var rename = require('gulp-rename');
var sh = require('shelljs');
var beautify = require('gulp-jsbeautify');
var prettify = require('gulp-prettify');
var jeditor = require('gulp-json-editor');
var cversion = require('gulp-cordova-version');
var minimist = require('minimist');

var paths = {
  sass: ['./scss/**/*.scss'],
  js: ['./www/js/*.js'],
  css: ['./www/css/*.css'],
  html: ['./www/templates/*.html']
};

var knownOptions = {
  string: 'version',
  default: { version: require("./package.json").version }
};

var options = minimist(process.argv.slice(2), knownOptions);

gulp.task('default', ['beautifyjs']);

gulp.task('beautifyjs', function() {
  gulp.src('./www/js/*.js')
    .pipe(beautify({indentSize: 4, maxPreserveNewline: 2, breakChainedOperation: true, endWithNewline: true}))
    .pipe(gulp.dest('./www/js/'));
});

gulp.task('watch', function() {
  gulp.watch(paths.js, ['beautifyjs']);
  gulp.watch(paths.css, ['minifycss']);
});

gulp.task('minifycss', function () {
    gulp.src('./www/css/*.css')
        .pipe(minifyCss())
        .pipe(rename(function (path) {
            path.extname = ".min.css";
            return path;
        }))
        .pipe(gulp.dest('./www/css/'));
});

gulp.task('version', function () {
  gulp.src("./package.json")
    .pipe(jeditor({
      'version': options.version
    }))
    .pipe(gulp.dest("."));

  gulp.src(".")
    .pipe(cversion(options.version));
});
