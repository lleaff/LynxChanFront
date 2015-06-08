/* Command line arguments */
var argv = require('yargs').argv;
var production = argv.production || argv.p;

/* =Dependencies
------------------------------------------------------------ */
/*============= Misc ============= */
var fs = require('fs');
if (!production) {
  var browserSyncModule = require('browser-sync');
  var browserSync = browserSyncModule.create();
}
//var merge = require('merge-stream');
//var es = require('event-stream');
var child_process = require('child_process');
/*============= Gulp operations ============= */
var gulp = require('gulp');
//var gutil = require('gulp-util');
var gulpif = require('gulp-if');
/*============= Content operations ============= */
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
/* jade */
var jade = require('gulp-jade');

var debug = require('gulp-debug'); /* DEBUG */

/* =Variables
------------------------------------------------------------ */
var settings;
try {
 settings = JSON.parse(fs.readFileSync('gulpsettings.json', 'utf8'));
} catch(e) {
  if (e instanceof Error && e.code === "ENOENT") { /* File not found */
    console.log(
      "No 'gulpsettings.json' file found, using default settings.");
    settings = {};
  } else { throw e; }
}

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
	jade: basePaths.source+'templates/',
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
    'js', 'html', 'css', 'scss', 'jade', 'md',
  ].map(function(ft) { return '!'+basePaths.source+'**/*.'+ft; });

  return gulp.src([basePaths.source+'**/*.*'].concat(excludeTypes))
    .pipe(gulp.dest(basePaths.build));
});

gulp.task('js', function() {
  return gulp.src(files.js)
    .pipe(gulp.dest(outPaths.js));
});

gulp.task('moveHtml', function() {
    gulp.src(files.html)
    .pipe(gulp.dest(outPaths.html));
});

gulp.task('jade', ['moveHtml'], function() {
    return gulp.src(files.jade)
      .pipe(jade({ pretty: !production }))
      .pipe(gulp.dest(outPaths.html));
});

gulp.task('html', ['moveHtml', 'jade']);

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

  if (settings.startCommand) {
    child_process.spawnSync();
    child_process.execSync(settings.startCommand);
  }

  browserSync.init({
    proxy: {
      target: "localhost:8080",
      port: 3000
    }
  });

  gulp.watch([files.scss, files.css], ['css']);
  gulp.watch(files.jade, ['html', 'browserReload']);
  gulp.watch(files.html, ['html', 'browserReload']);
});

gulp.task('restartServer', ['html'], function() {
  if (settings.reloadCommand) {
    child_process.spawnSync();
    child_process.execSync(settings.reloadCommand);
    console.log("Reload: \""+settings.reloadCommand+"\"");
  }
});

gulp.task('browserReload', ['restartServer'], function() {
  browserSync.reload();
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
