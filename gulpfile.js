/* Command line arguments */
var argv = require('yargs').argv;
var production = argv.production || argv.p;
var blank = argv.test || argv.blank;

/* =Modules
------------------------------------------------------------ */
/*============= Misc ============= */
var fs                  = require('fs');
if (!production) {
  var browserSyncModule = require('browser-sync');
  var browserSync       = browserSyncModule.create();
}
//var merge               = require('merge-stream');
//var es                  = require('event-stream');
var child_process       = require('child_process');
/*============= Gulp operations ============= */
var gulp                = require('gulp');
var gutil               = require('gulp-util');
var gulpif              = require('gulp-if');
/*============= Content operations ============= */
/* General */
var sourcemaps          = require('gulp-sourcemaps'); /* sourcemaps */
var concat              = require('gulp-concat'); /* sourcemaps */
//var insert              = require('gulp-insert');
//var replace             = require('gulp-replace');
/* js */
var uglify              = require('gulp-uglify'); /* sourcemaps */
/* scss */
var sass                = require('gulp-sass'); /* sourcemaps */
/* css */
var minifyCss           = require('gulp-minify-css'); /* sourcemaps */
/* jade */
var jade                = require('gulp-jade');

var debug               = require('gulp-debug'); /* DEBUG */

/* =Variables
------------------------------------------------------------ */
var baseUrl       = 'http://localhost:8080',
    baseStaticUrl = 'http://static.localhost:8080';

var settings      = JSON.parse(tryReadFileSync('gulpsettings.json'));
var jadeSettings  = JSON.parse(tryReadFileSync('./src/templates/jadeSettings.json'));
jadeSettings = concatObjects({ baseUrl: baseUrl, baseStaticUrl: baseStaticUrl });

var package       = require('./package.json');

var basePaths = {
	source: 'src/',
	build: './',
};

var paths = {
	js:     basePaths.source+'static/',
	scss:   basePaths.source+'static/scss/',
	css:    basePaths.source+'static/css/',
	html:   basePaths.source+'templates/',
	jade:   basePaths.source+'templates/{pages,cmp}',
	sourcemaps: '../sourcemaps/',
};
var files = {}; /* { js: src/static/**.*js, ... } */
Object.keys(paths).forEach(function(ft) {
  files[ft] = paths[ft]+'**/*.'+ft;
});

var outPaths = {
  js:     basePaths.build+'static/',
  css:    basePaths.build+'static/css/',
	html:   basePaths.build+'templates/',
};

/* =Tasks
------------------------------------------------------------ */
gulp.task('default', ['build']);

/*============ Build ============== */
gulp.task('build', ['js', 'html', 'css', 'otherFiles'], function() {
});

gulp.task('otherFiles', function() {
  var excludeTypes = [
    'js', 'json', 'html', 'css', 'scss', 'jade', 'md',
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
      .pipe(jade({ pretty: !production, data: jadeSettings }))
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
    .pipe(!production ? browserSync.stream() : gutil.noop());
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

gulp.task('clear', function() {
  Object.keys(outPaths).forEach(function(outPath) {
      deleteFolderRecursive(
        /* Strip the trailing '/' */
        (outPaths[outPath]).slice(0, outPaths[outPath].length - 1),
        {log: true});
  });
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

function concatObjects(obj1, obj2) {
  var obj = {};
  [obj1, obj2].forEach(function(object) {
    Object.keys(object || {}).forEach(function(key) {
      obj[key] = object[key];
    });
  });
  return obj;
}

/*============= File operations ============= */
function tryReadFileSync(fileName, options) {
  options = options || {};
  if (options.encoding === undefined) { options.encoding = 'utf-8'; }
  try {
    return fs.readFileSync(fileName, 'utf8');
  } catch(e) {
    if (e instanceof Error && e.code === "ENOENT") { /* File not found */
      if (options.log) {
        console.log(
          "[tryReadFileSync] No '"+fileName+"' file found.");
      }
      return undefined;
    } else { throw e; }
  }
}

function deleteFolderRecursive (path, options) {
  options = options || {};
  var files = [];
  if( fs.existsSync(path) ) {
    files = fs.readdirSync(path);
    files.forEach(function(file,index){
      var curPath = path + "/" + file;
      if(fs.lstatSync(curPath).isDirectory()) { // recurse
        deleteFolderRecursive(curPath, options);
      } else { // delete file
        if (!blank) {
          fs.unlinkSync(curPath);
        }
        if (options.log) {
          console.log("[rm -r "+path+"] Removed "+"\""+
                      curPath+"\"");
        }
      }
    });
    if (!blank) {
      fs.rmdirSync(path);
    }
  }
}
