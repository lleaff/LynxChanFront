/* Command line arguments */
var argv = require('yargs').argv;
var production = argv.production || argv.p;

/* =Dependencies
------------------------------------------------------------ */
/* Gulp operations
============= */
var gulp = require('gulp');
//var es = require('event-stream');
//var gutil = require('gulp-util');
//var merge = require('merge-stream');
var gulpif = require('gulp-if');
/* Content operations
============= */
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
/* Misc
============= */
var browserSync = !production ? require('browser-sync').create() : null;

var debug = require('gulp-debug'); /* DEBUG */

/* =Variables
------------------------------------------------------------ */
var package = require('./package.json');

var basePaths = {
	source: 'src/',
	build: './',
};

var paths = {
	js: basePaths.source+'static/',
	scss: basePaths.source+'static/scss/',
	css: basePaths.source+'static/css/',
	html: basePaths.source+'templates/',
	sourcemaps: '../sourcemaps/',
};
var files = {};
Object.keys(paths).forEach(function(ft) {
  files[ft] = paths[ft]+'**/*.'+ft;
});

var outPaths = {
  js: basePaths.build+'static/',
  css: basePaths.build+'static/css/',
	html: basePaths.build+'templates/',
};

/* =Tasks
------------------------------------------------------------ */

gulp.task('default', ['build']);

gulp.task('build', ['js', 'html', 'css', 'otherFiles'], function() {
});

gulp.task('otherFiles', function() {
  var excludeTypes = [
    'js', 'html', 'css', 'scss', 'md'
  ].map(function(ft) { return '!'+basePaths.source+'**/*.'+ft; });

  return gulp.src([basePaths.source+'**/*.*'].concat(excludeTypes))
    .pipe(gulp.dest(basePaths.build));
});

gulp.task('js', function() {
  return gulp.src(files.js)
    .pipe(gulp.dest(outPaths.js));
});

gulp.task('html', function() {
  return gulp.src(files.html)
    .pipe(gulp.dest(outPaths.html));
});

gulp.task('css', function() {
  return gulp.src([files.scss, files.css])
    .pipe(gulpif(!production, sourcemaps.init()))
      .pipe(sass().on('error', sass.logError))
      .pipe(minifyCss())
    .pipe(gulpif(!production, sourcemaps.write(paths.sourcemaps)))
    .pipe(gulp.dest(outPaths.css))
    .pipe(gulpif(!production, browserSync.stream()));
});

gulp.task('browser-sync', ['build'], function() {
  if (production) { return; }

  browserSync.init({
    proxy: "localhost:8080"
  });
  gulp.watch([files.scss, files.css], ['css']);
  gulp.watch(files.html).on('change', browserSync.reload);
});

/* Helper functions
------------------------------------------------------------ */
function commentString(string, fileType) {
	var tags = {
		html:	['<!--', '-->'],
		css:	['/*', '*/'],
		js:		['/*', '*/']
	};
	return tags[fileType][0]+' '+string+' '+tags[fileType][1];
}
