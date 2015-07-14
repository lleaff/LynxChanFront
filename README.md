# LynxChanFront
A front-end for [Lynx Chan](https://gitlab.com/mrseth/LynxChan)

## Goals

* Responsive, one interface for both desktop and mobile.
* Graceful degradation, provide fallbacks for non-JS and legacy browser users while avoiding unnecessary polyfills.
* Accessibility, using HTML5 semantic elements and microformats where appropriate.
* Themable, the look and feel of the CSS can be customized by editing a single short file.

## Technologies used

Jade is used to generate the HTML, and Sass (scss) for the CSS. This allows the code to be clean, DRY, and modulable.
Gulp automates all the compilation steps, and Browser-sync allows for fast feedback loops.

## Build instructions

```
npm install
node ./node_modules/gulp/bin/gulp.js --production
```
The built files will be in the folders `templates` and `static`.


If you want to do work on the front-end then I advise you to install gulp globally:
```
sudo npm install -g gulp
```
Call `gulp help` when inside the project for a list of available taks and options.

#### Configuration
`gulpSettings.json` in the same directory as `gulpfile.js`.  
All keys are optional (except `generalSettingsPath` if the front-end (`fe`) is not situated directly next to the back-end (`be`)):  

* `generalSettingsPath`: Path to the back-end's general settings file, used to set things such as the chan's name (usual location: `${BACK_END}/settings/general.json`).
* `languagePackPath`: {
  *   `backEnd`: Path to the back-end's language pack (json).
  *   `frontEnd`: Path to the front-end's language pack (json).
  }
* `themeFolder`: Path to a folder containing a `theme.scss` file to use instead of the default one.
* `outputFolder`: Path to the folder in which to output the built files.
* `startCommand`: Command executed when starting `gulp browser-sync`.
* `reloadCommand`: Command executed by `gulp browser-sync` before reloading the browser.
