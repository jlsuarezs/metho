var gulp = require('gulp');
var gutil = require('gulp-util');
var bower = require('bower');
var concat = require('gulp-concat');
var sass = require('gulp-sass');
var minifyCss = require('gulp-minify-css');
var rename = require('gulp-rename');
var sh = require('shelljs');
var beautify = require('gulp-jsbeautify');

var paths = {
  sass: ['./scss/**/*.scss'],
  js: ['./www/js/*.js'],
  css: ['./www/css/*.css']
};

gulp.task('default', ['js']);

gulp.task('js', function() {
  gulp.src('./www/js/*.js')
    .pipe(beautify({indentSize: 4, maxPreserveNewline: 2, breakChainedOperation: true}))
    .pipe(gulp.dest('./www/js/'));
});

gulp.task('watch', function() {
  gulp.watch(paths.js, ['js']);
});

gulp.task('install', ['git-check'], function() {
    return bower.commands.install()
    .on('log', function(data) {
        gutil.log('bower', gutil.colors.cyan(data.id), data.message);
    });
});

gulp.task('css', function () {
    gulp.src('./www/css/*.css')
        .pipe(minifyCss())
        .pipe(rename(function (path) {
            path.extname = ".min.css";
            return path;
        }))
        .pipe(gulp.dest('./www/css/'));
});
