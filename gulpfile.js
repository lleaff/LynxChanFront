/* Command line arguments */
var argv = require('yargs').argv;
var g = {}; /* Global variables */
g.ugly = argv.ugly || argv.u;
g.production = argv.production || argv.p;
g.blank = argv.test || argv.blank;

/*------------------------------------------------------------
 * =Modules
 *------------------------------------------------------------ */
/*============= Misc ============= */
var fs                  = require('fs');
var browserSyncModule = require('browser-sync');
var browserSync       = browserSyncModule.create();
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
var stripCssComments    = require('gulp-strip-css-comments');
var minifyCss           = require('gulp-minify-css'); /* sourcemaps */
/* jade */
var jade                = require('gulp-jade');
/* Images */
var imagemin            = require('gulp-imagemin');

var debug               = require('gulp-debug'); /* DEBUG */

/*------------------------------------------------------------- 
 * =Variables
 *------------------------------------------------------------*/
/*============= Setting files ============= */
/* Placeholder function */
function getGeneralSettings() {
  /* Possible paths */
  var posPaths = [
    gulpSettings && gulpSettings.generalSettingsPath,
    '../be/settings/general.json',
    '../LynxChan/src/be/settings/general.json'
  ];
  var fileContent;
  for (var i = 0; fileContent === undefined && i < posPaths.length; ++i) {
    fileContent = tryReadFileSync(posPaths[i]);
  }
  if (!fileContent) {
    console.log("[getGeneralSettings] No \"general.json\" found.");
  }
  return fileContent;
}

/* keys: generalSettingsPath, startCommand, reloadCommand */
var gulpSettings  = JSON.parse(
  tryReadFileSync('gulpsettings.json', {log: true}) ||
    "{}");
var settings      = JSON.parse(getGeneralSettings() || "{}");
var jadeSettings  = JSON.parse(
  tryReadFileSync('./src/templates/jadeSettings.json', {log: true}) ||
    "{}");
var package       = require('./package.json');
/*========================== */
var siteTitle = settings.siteTitle || "Undefined site title";

var url = {
  protocol: settings.sll ? 'https' : 'http',
  domain: !settings.address || settings.address === '127.0.0.1' ?
    'localhost' : settings.address,
  port: settings.port ? settings.port : '8080',
};
url.base = url.protocol+'://'+url.domain+':'+url.port;
url.baseStatic = url.protocol+'://'+'static.'+url.domain+':'+url.port;

jadeSettings = concatObjects(jadeSettings, {
  siteTitle:      siteTitle,
  siteLicense:    settings.siteLicense,
  baseUrl:        url.base,
  baseStaticUrl:  url.baseStatic
});

var basePaths = {
	source: 'src/',
	build: argv.output ? './'+argv.output+'/' : (
    argv.o ? './'+argv.o+'/' : './'),
};

var paths = {
	js:         basePaths.source+'static/',
	scss:       basePaths.source+'static/scss/',
	scssExtras: basePaths.source+'static/scss/{cmp/,pages/,sass/,vendor/}',
	css:        basePaths.source+'static/css/',
	html:       basePaths.source+'templates/',
	jade:       basePaths.source+'templates/{cmp/,pages/}',
	jadeExtras: basePaths.source+'templates/jade/', /* For watching */
  jadeStatic: basePaths.source+'static/jade/',
  png:        basePaths.source+'templates/cmp/images/',
	sourcemaps: '../sourcemaps/',
};
var filesRecur = {}; /* { js: src/static/** /*.js, ... } */
Object.keys(paths).forEach(function(ft) {
  var ext = keepFirstWordFromCamelCase(ft);
  filesRecur[ft] = paths[ft]+'**/*.'+ext;
});
var files = {}; /* { js: src/static/*.js, ... } */
Object.keys(paths).forEach(function(ft) {
  var ext = keepFirstWordFromCamelCase(ft);
  files[ft] = paths[ft]+'*.'+ext;
});

var outPaths = {
  js:         basePaths.build+'static/',
  css:        basePaths.build+'static/css/',
	html:       basePaths.build+'templates/',
  htmlStatic: basePaths.build+'static/',
  png:        basePaths.build+'templates/cmp/images/',
};

/*------------------------------------------------------------- 
 *  =Tasks
 *-------------------------------------------------------------*/
gulp.task('default', ['build']);

/* =Build
========================== */
gulp.task('build', ['js', 'html', 'css', 'otherFiles'], function() {
  if (basePaths.build !== './') {
    console.log('Built project to: '+basePaths.build);
  }
});

gulp.task('otherFiles', function() {
  var excludeTypes = [
    'js', 'json', 'html', 'css', 'scss', 'jade', 'md',
  ].map(function(ft) { return '!'+basePaths.source+'**/*.'+ft; });

  return gulp.src([basePaths.source+'**/*.*'].concat(excludeTypes))
    .pipe(gulp.dest(basePaths.build));
});

gulp.task('js', function() {
  return gulp.src(filesRecur.js)
    .pipe(gulpif(!g.production, sourcemaps.init()))
      .pipe(gulpif(g.ugly, uglify()))
    .pipe(gulpif(!g.production, sourcemaps.write(paths.sourcemaps)))
    .pipe(gulp.dest(outPaths.js));
});

gulp.task('moveHtml', function() {
    gulp.src(filesRecur.html)
    .pipe(gulp.dest(outPaths.html));
});

gulp.task('jade', ['moveHtml', 'jadeStatic'], function() {
    return gulp.src(filesRecur.jade)
      .pipe(jade({ pretty: !g.ugly, data: jadeSettings }))
      .pipe(gulp.dest(outPaths.html));
});
gulp.task('jadeStatic', function() {
    return gulp.src(filesRecur.jadeStatic)
      .pipe(jade({ pretty: !g.ugly, data: jadeSettings }))
      .pipe(gulp.dest(outPaths.htmlStatic));
});

gulp.task('html', ['moveHtml', 'jade']);

gulp.task('css', function() {
  return gulp.src([files.scss, files.css, '!'+paths.scssExtras+'*'])
    .pipe(gulpif(!g.production, sourcemaps.init()))
      .pipe(sass({ style: (g.ugly ? 'compressed' : 'nested')})
            .on('error', sass.logError))
      .pipe(gulpif(g.production, stripCssComments()))
      .pipe(gulpif(g.ugly, minifyCss()))
    .pipe(gulpif(!g.production, sourcemaps.write(paths.sourcemaps)))
    .pipe(gulp.dest(outPaths.css))
    .pipe(browserSync.stream());
});

gulp.task('images', function() {
  return gulp.src(files.png)
    .pipe(gulpif(g.production), imagemin())
    .pipe(gulp.dest(outPaths.png));
});

/*============ Utility ============== */
/* =Watching
========================== */
gulp.task('sync', ['browser-sync']);
gulp.task('browser-sync', ['build'], function() {
  if (gulpSettings.startCommand) {
    child_process.spawnSync();
    child_process.execSync(gulpSettings.startCommand);
  }

  browserSync.init({
    proxy: {
      target: "localhost:8080",
      port: 3000
    }
  });

  gulp.watch([filesRecur.scss, filesRecur.scssExtras, filesRecur.css],
             ['css'])
             .on('change', serverRefresh);
  gulp.watch([filesRecur.jade, filesRecur.jadeExtras],
             ['html', 'jade', 'browserReload']);
  gulp.watch(files.html, ['html', 'browserReload']);
});

function serverRefresh() {
  if (gulpSettings.reloadCommand) {
    child_process.spawnSync();
    child_process.execSync(gulpSettings.reloadCommand);
    console.log("Reload: \""+gulpSettings.reloadCommand+"\"");
    browserSync.reload();
  }
}

gulp.task('browserReload', ['html'], function() {
  serverRefresh();
});

/* =Clean built files
========================== */
gulp.task('clean', ['clear']);
gulp.task('clear', function() {
  Object.keys(outPaths).forEach(function(outPath) {
      deleteFolderRecursive(
        /* Strip the trailing '/' */
        (outPaths[outPath]).slice(0, outPaths[outPath].length - 1),
        {log: true});
  });
});

/*------------------------------------------------------------- 
 * =Helper functions
 *------------------------------------------------------------*/
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

function keepFirstWordFromCamelCase(camel) {
  function isLowerCase(ch) {
    return ch.toLowerCase() === ch;
  }

  var firstWord = '';
  for (var i = 0; i < camel.length && isLowerCase(camel[i]); ++i) {
    firstWord = firstWord+camel[i];
  }

  return firstWord;
}

/*============= File operations ============= */
function tryReadFileSync(fileName, options) {
  options = options || {};
  if (options.encoding === undefined) { options.encoding = 'utf-8'; }
  try {
    return fileName && fs.readFileSync(fileName, 'utf8');
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
        if (!g.blank) {
          fs.unlinkSync(curPath);
        }
        if (options.log) {
          console.log("[rm -r "+path+"] Removed "+"\""+
                      curPath+"\"");
        }
      }
    });
    if (!g.blank) {
      fs.rmdirSync(path);
    }
  }
}
