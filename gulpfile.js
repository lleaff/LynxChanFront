/* ===Gulp operations */
var gulp = require('gulp');
//var es = require('event-stream');
//var gutil = require('gulp-util');
//var merge = require('merge-stream');
var gulpif = require('gulp-if');
/* ===Content operations */
/* General */
var sourcemaps = require('gulp-sourcemaps'); /* sourcemaps */
var concat = require('gulp-concat'); /* sourcemaps */
//var insert = require('gulp-insert');
//var replace = require('gulp-replace');
/* js */
var uglify = require('gulp-uglify'); /* sourcemaps */
/* scss */
var sass = require('gulp-sass'); /* sourcemaps */
/* css */
var minifyCss = require('gulp-minify-css'); /* sourcemaps */

var debug = require('gulp-debug'); /* DEBUG */

/* =Variables
 * ------------------------------------------------------------ */
var package = require('./package.json');

var basePaths = {
	source: 'src/',
	build: './',
};

var paths = {
	js: basePaths.source+'static/',
	scss: basePaths.source+'static/scss/',
	html: basePaths.source+'templates/',
	sourcemaps: '../sourcemaps/',
};

var outPaths = {
  js: basePaths.build+'static/',
  css: basePaths.build+'static/css/',
	html: basePaths.build+'templates/',
};

/* Command line arguments */
var argv = require('yargs').argv;

var production = argv.production || argv.p;

/* =Tasks
 * ------------------------------------------------------------ */

gulp.task('default', ['build']);

gulp.task('build', ['js', 'html', 'css', 'otherFiles'], function() {
});

gulp.task('otherFiles', function() {
  var excludeTypes = [
    'js', 'html', 'css', 'scss', 'md'
  ].map(function(ft) { return '!'+basePaths.source+'**/*.'+ft; });

  gulp.src([basePaths.source+'**/*.*'].concat(excludeTypes))
    .pipe(gulp.dest(basePaths.build));
});

gulp.task('js', function() {
  gulp.src(paths.js+'/**/*.js')
    .pipe(gulp.dest(outPaths.js));
});

gulp.task('html', function() {
  gulp.src(paths.html+'/**/*.html')
    .pipe(gulp.dest(outPaths.html));
});

gulp.task('css', function() {
  gulp.src(paths.scss+'/**/*.scss')
    .pipe(gulpif(!production, sourcemaps.init()))
      .pipe(sass().on('error', sass.logError))
      .pipe(minifyCss())
    .pipe(gulpif(!production, sourcemaps.write(paths.sourcemaps)))
    .pipe(gulp.dest(outPaths.css));
});

/* Helper functions
 * ------------------------------------------------------------ */
function commentString(string, fileType) {
	var tags = {
		html:	['<!--', '-->'],
		css:	['/*', '*/'],
		js:		['/*', '*/']
	};
	return tags[fileType][0]+' '+string+' '+tags[fileType][1];
}
