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

var paths = {
  sass: ['./scss/**/*.scss'],
  js: ['./www/js/*.js'],
  css: ['./www/css/*.css'],
  html: ['./www/templates/*.html']
};

gulp.task('default', ['beautifyjs', 'beautifyhtml']);

gulp.task('beautifyjs', function() {
  gulp.src('./www/js/*.js')
    .pipe(beautify({indentSize: 4, maxPreserveNewline: 2, breakChainedOperation: true, endWithNewline: true}))
    .pipe(gulp.dest('./www/js/'));
});

gulp.task('beautifyhtml', function() {
  gulp.src('./www/templates/*.html')
    .pipe(prettify({indent_size: 4}))
    .pipe(gulp.dest('./www/templates/'));
});

gulp.task('watch', function() {
  gulp.watch(paths.js, ['beautifyjs']);
  gulp.watch(paths.css, ['minifycss']);
  gulp.watch(paths.html, ['beautifyhtml']);
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
