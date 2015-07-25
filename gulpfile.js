/* Command line arguments */var argv = require('yargs').argv;
var g = this; /* Global variables */
g.ugly = argv.ugly || argv.u;
g.production = argv.production || argv.p;
g.blank = argv.test || argv.blank;


/*------------------------------------------------------------
 * =Modules
 *------------------------------------------------------------ */
/*============= Misc ============= */
var fs                  = require('fs');
var browserSyncModule   = require('browser-sync');
var browserSync         = browserSyncModule.create();
var merge               = require('merge-stream');
//var es                  = require('event-stream');
var child_process       = require('child_process');
var path                = require('path');
/*============= Gulp operations ============= */
var gulp                = require('gulp');
var gutil               = require('gulp-util');
var gulpif              = require('gulp-if');
var combiner            = require('stream-combiner2');
var preprocess          = require('gulp-preprocess');
/*============= Content operations ============= */
/* General */
var sourcemaps          = require('gulp-sourcemaps'); /* sourcemaps */
var concat              = require('gulp-concat'); /* sourcemaps */
//var insert              = require('gulp-insert');
var replace             = require('gulp-replace');
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
function getBackEndPath() {
  /* Possible paths */
  var posPaths = [
    argv.be || argv.backend,
    gulpSettings && gulpSettings.backEndPath,
    '../be/',
    '../LynxChan/src/be/'
  ];
  var fileContent;
  for (var i = 0; fileContent === undefined && i < posPaths.length; ++i) {
    if (tryReadFileSync(posPaths[i]+'/settings/general.json')) {
      return path.resolve(posPaths[i]);
    }
  }
  /* Not found */
  console.log('[getBackEndPath] Back-end not found, edit gulpSettings.json to either specify "backEndPath" or specify both "generalSettingsPath" and "languagePack.backEndJson" (the back-end\'s path can also be specified with the option --backend)');
}

/* gulpSettings.json keys:
 *    generalSettingsPath,
 *    languagePackPath: {
 *      frontEnd,
 *      backEnd
 *    },
 *    outputFolder,
 *    startCommand,
 *    reloadCommand */
var gulpSettings = JSON.parse(
  tryReadFileSync('gulpSettings.json', {log: true}) ||
    "{}");

var backEndPath = ((gulpSettings.languagePack &&
                    gulpSettings.languagePack.backEndJson) &&
                  gulpSettings.generalSettingsPath) ?
  undefined : getBackEndPath();

var settings = JSON.parse(tryReadFileSync(
  gulpSettings.generalSettingsPath ||
    backEndPath+'/settings/general.json', {log: true}) ||
    "{}");

var jadeLocals = JSON.parse(
  tryReadFileSync('./src/templates/jadeLocals.json', {log: true}) ||
    "{}");

var package = require('./package.json');
//==========================
var CWD = process.cwd(); /* Project's root (same place as gulpfile.js) */

var siteTitle = settings.siteTitle || "Undefined site title";

var url = {
  protocol: settings.sll ? 'https' : 'http',
  domain: !settings.address || settings.address === '127.0.0.1' ?
    'localhost' : settings.address,
  port: settings.port ? settings.port : '8080',
};
url.base = url.protocol+'://'+url.domain+':'+url.port;
url.baseStatic = url.protocol+'://'+'static.'+url.domain+':'+url.port;

//==========================
var themeFolder = argv.theme || argv.t || gulpSettings.themeFolder;
themeFolder = typeof(themeFolder) === 'string' ?
  path.resolve(themeFolder) :
  undefined;
console.info('[i]\tUsing '+(!themeFolder ? 'default theme.' :
                            'theme: '+path.basename(themeFolder)));
themeFolder = themeFolder || './src/static/scss/sass/dummyThemeFolder/';



//==========================
var languagePacks = {
  fe: path.resolve((gulpSettings.languagePack &&
       gulpSettings.languagePack.frontEndFolder) ||
       './src/res/languagePacks/default-en_US'), /* Default language pack */
  be: path.resolve((gulpSettings.languagePack &&
       gulpSettings.languagePack.backEndJson) ||
       backEndPath+'/defaultLanguagePack.json')
};
console.info('[i]\tUsing language packs:\n\tBE:\t'+
             languagePacks.be+'\n\tFE:\t'+languagePacks.fe+'/strings.json');

var lang = {
  fe: require(languagePacks.fe+'/strings.json'),
  be: require(languagePacks.be)
};
//==========================

/* Variables forwarded to jade by gulp */
jadeLocals = concatObjects(jadeLocals, {
  siteTitle:      siteTitle,
  siteLicense:    settings.siteLicense,
  baseUrl:        url.base,
  baseStaticUrl:  url.baseStatic,
  lang:           lang.fe,
  l:              lang.fe    /* shorthand */
});

//==========================

var basePaths = {
	source: 'src/',
	build: argv.output || argv.o ? (argv.output || argv.o)+'/' : (
    gulpSettings.outputFolder ? gulpSettings.outputFolder+'/' :
      './'),
};

var outPaths = {
  js:         basePaths.build+'static/js/',
  css:        basePaths.build+'static/css/',
	html:       basePaths.build+'templates/',
  htmlStatic: basePaths.build+'static/',
  png:        basePaths.build+'templates/cmp/images/',
};

var paths = {
	js:           basePaths.source+'static/js/',
	scss:         basePaths.source+'static/scss/',
  /* For watching */
	scssExtras:   basePaths.source+'static/scss/{cmp/,pages/,sass/,vendor/}',
	css:          basePaths.source+'static/css/',
  scssThemeFolder:  themeFolder, /* For watching */
	html:         basePaths.source+'templates/',
	jade:         basePaths.source+'templates/{cmp/,pages/}',
	jadeExtras:   basePaths.source+'templates/jade/', /* For watching */
  jadeStatic:   basePaths.source+'static/jade/',
  png:          basePaths.source+'templates/cmp/images/',
	sourcemaps:   {}, /* Filled below */
};

Object.keys(paths).forEach(function(path) {
  paths.sourcemaps[path] = '../sourcemaps/';
});
paths.sourcemaps.js = '../'+paths.sourcemaps.js;

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
    .pipe(debug())
    .pipe(gulp.dest(basePaths.build));
});

/* =JS =Javascript
------------------------------*/
var jsOutNames = [ 'pre', 'post', 'ext' ];
/* Allows settings concat order when needed */
var jsPaths = {
  pre: [
    paths.js+'pre/settings.js',
    paths.js+'pre/head.js',
    paths.js+'pre/boardI.js',
    paths.js+'pre/threadI.js',
    paths.js+'pre/postingI.js',
    paths.js+'pre/*I.js',
    paths.js+'pre/tail.js'
  ],
  post: [
    paths.js+'post/api.js',
    paths.js+'post/*.js'
  ],
  ext: [ paths.js+'ext/*.js' ]
};

gulp.task('js', function() {

  var combined = [];

  jsOutNames.forEach(function(name, i) {
    combined[i] =
      gulp.src(jsPaths[name])
        .pipe(gulpif(!g.production, sourcemaps.init()))
          .pipe(concat('../'+name+'.js'))
          .pipe(gulpif(g.ugly, uglify()))
        .pipe(gulpif(!g.production, sourcemaps.write(paths.sourcemaps.js)))
        .pipe(gulp.dest(outPaths.js+name));

    combined[i].on('error', console.error.bind(console));
  });

  return merge.apply(this, combined);
});

/*
------------------------------*/
gulp.task('moveHtml', function() {
    gulp.src(filesRecur.html)
    .pipe(gulp.dest(outPaths.html));
});

/* =Jade
------------------------------*/
var relativeRootDir = '../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../../..';

var jadeRegex = {
  languagePackInclude: {
    match: /((^|\n)(\s+)?\binclude(:.*\b)? )(\$LANGUAGE_PACK)/g,
    replace: '$1'+relativeRootDir+languagePacks.fe
  }
};

gulp.task('jade', ['moveHtml', 'jadeStatic'], function() {
    var combined = combiner.obj([
      gulp.src(filesRecur.jade)
        .pipe(replace(jadeRegex.languagePackInclude.match,
                      jadeRegex.languagePackInclude.replace))
        .pipe(jade(
          { pretty: !g.ugly, data: jadeLocals }))
        .pipe(gulp.dest(outPaths.html))
    ]);
    
    combined.on('error', console.error.bind(console));
    return combined;
});
gulp.task('jadeStatic', function() {
    var combined = combiner.obj([
      gulp.src(filesRecur.jadeStatic)
        .pipe(replace(jadeRegex.languagePackInclude.match,
                      jadeRegex.languagePackInclude.replace))
        .pipe(jade(
          { pretty: !g.ugly, data: jadeLocals }))
        .pipe(gulp.dest(outPaths.htmlStatic))
    ]);
    
    combined.on('error', console.error.bind(console));
    return combined;
});

gulp.task('html', ['moveHtml', 'jade']);

/* =CSS =SCSS =SASS
------------------------------*/
/* eg.: the string '__thumbSize' will be replaced by '128' */
var sassContext = {};
Object.keys(settings).forEach(function(setting) {
  sassContext['__'+setting] = settings[setting];
});
Object.keys(lang).forEach(function(str) {
  sassContext['l.'+str] = settings[str];
});

var scssPreprocessedFile = paths.scss+'preprocessed.scss';
var scssMainFile = paths.scss+'main.scss';

gulp.task('css', function() {
  var combined = combiner.obj([
    merge(gulp.src(scssMainFile)
      .pipe(preprocess({context: sassContext })),
    gulp.src(['!'+paths.scssExtras+'*', '!'+scssPreprocessedFile,
             '!'+scssMainFile, files.scss, files.css]))
      .pipe(gulpif(!g.production, sourcemaps.init()))
        .pipe(sass({
          includePaths: [themeFolder],
          style: (g.ugly ? 'compressed' : 'nested')})
              .on('error', sass.logError))
        .pipe(gulpif(g.production, stripCssComments()))
        .pipe(gulpif(g.ugly, minifyCss()))
      .pipe(gulpif(!g.production, sourcemaps.write(paths.sourcemaps.css)))
      .pipe(gulp.dest(outPaths.css))
      .pipe(browserSync.stream())
  ]);

  combined.on('error', console.error.bind(console));
  return combined;
});

/* =Images
------------------------------*/
gulp.task('images', function() {
  var combined = combiner.obj([
    gulp.src(files.png)
      .pipe(gulpif(g.production), imagemin())
      .pipe(gulp.dest(outPaths.png))
  ]);

  combined.on('error', console.error.bind(console));
  return combined;
});

/*============ Utility ============== */
/* =Watching, =Sync, =Browser-Sync
========================== */
gulp.task('sync', ['browser-sync']);
gulp.task('browser-sync', ['build'], function() {
  var browserSyncPort = argv.syncport || 3000;
  url.base = url.protocol+'://'+url.domain+':'+browserSyncPort;

  if (gulpSettings.startCommand) {
    child_process.spawnSync();
    child_process.execSync(gulpSettings.startCommand);
  }

  browserSync.init({
    proxy: {
      target: url.domain+':'+url.port,
      port: browserSyncPort
    }
  });

  gulp.watch(
    [filesRecur.scss, filesRecur.scssExtras, filesRecur.css,
      filesRecur.scssThemeFolder],
    ['css'])
    .on('change', serverRefresh);
  gulp.watch(
    [filesRecur.js],
    ['js'])
    .on('change', serverRefresh);
  gulp.watch(
    [filesRecur.jade, filesRecur.jadeExtras, filesRecur.jadeStatic],
    ['html', 'jade', 'jadeStatic', 'browserReload']);
  gulp.watch(
    files.html,
    ['html', 'browserReload']);
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

/* =Remove built files
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

/* =Help
========================== */
gulp.task('help', function() {
  console.log([
    package.name+'\'s gulp tasks and options',
    '--------------------------------------------------',
    '[all]',
    '\t--production\tBuild for deployment as opposed to development version (no sourcemaps, ...)',
    '\t--ugly\t\tMinify code',
    '\t--output, -o\tFolder in which to output the built files, overrides the value configured in gulpSettings.json',
    '\t--backend, --be\tBack-end\'s path, overrides the value configured in gulpSettings.json',
    '[default, build]\tProcess all necessarily files',
    '[css, scss]',
    '\t--theme, -t\tPath to a folder containing the theme.scss file to use instead of the default one, overrides the value configured in gulpSettings.json',
    '[sync, browser-sync]\tWatch files and reload browser automatically with browser-sync, default port is 3000',
    '\t--syncport\tBrowser-sync port',
    '[clear, clean]\tDelete built files',
    '\t--blank\t\tDon\'t delete, only print name of files that would be deleted'
  ].join('\n'));
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
