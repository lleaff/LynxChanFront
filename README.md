# LynxChanFront
A front-end for [Lynx Chan](https://gitlab.com/mrseth/LynxChan)

## Goals

* Responsive, one interface for both desktop and mobile
* Graceful degradation, provide fallbacks for non-JS and legacy browser users while avoiding unnecessary polyfills
* Accessibility, using HTML5 semantic elements and microformats where appropriate

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
