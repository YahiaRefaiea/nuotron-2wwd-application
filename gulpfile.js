//  LOAD PACKAGES
var gulp = require('gulp'),
    del = require('del'),
    runSequence = require('run-sequence'),
    browserSync = require('browser-sync'),
    pkg = require('./package.json'),
    banner = require('gulp-banner'),
    concat = require('gulp-concat'),
    uglify = require('gulp-uglify'),
    uglifycss = require('gulp-uglifycss'),
    rename = require('gulp-rename'),
    pug = require('gulp-pug'),
    babel = require('gulp-babel'),
    stylus = require('gulp-stylus'),
    koutoSwiss = require('kouto-swiss'),
    fs = require('fs'),

    //  DIRECTORIES
    root = 'application',
    dest = 'release',
    assets = 'includes',
    file = 'nuo',
    min = 'lite',
    mails = 'mails',
    css = 'stylesheets',
    js = 'javascripts',
    img = 'images',
    php = 'php',

    //  BANNER COMMENT
    comment =
      '/*\n'+
      ' *  <%= pkg.name %> <%= pkg.version %>\n'+
      ' *  <%= pkg.description %>\n'+
      ' *  <%= pkg.url %>\n'+
      ' *  \n'+
      ' *  Last update on: <%= new Date().getUTCFullYear() %>/'+
      '<%= new Date().getUTCMonth()+1 %>/<%= new Date().getUTCDate() %>\n'+
      ' *  ©<%= new Date().getFullYear() %> Nuotron. all rights reserved.\n'+
      ' *  Released under the <%= pkg.license %> license.\n'+
      ' *  Source code available on GitHub on:\n'+
      ' *  <%= pkg.homepage %>\n'+
      ' */\n\n';


//  DELETE
gulp.task('del', function() {
  return del.sync(dest);
});


//  BROWSER SYNC
gulp.task('browserSync', function() {
  browserSync({server: {baseDir: dest}});
});


//  PUG
gulp.task('pug', function() {
  return gulp.src(root+'/pug/public/*.pug')
    .pipe(pug({
      pretty: true,
      data: {
        root: JSON.parse(fs.readFileSync(root+'/data/root.json')),
        present: JSON.parse(fs.readFileSync(root+'/data/present.json')),
        callback: JSON.parse(fs.readFileSync(root+'/data/callback.json')),
        questions: JSON.parse(fs.readFileSync(root+'/data/questions.json'))
      }
     }))
    .pipe(gulp.dest(dest));
});

//  MAILS
gulp.task('mails', function() {
  return gulp.src(root+'/pug/mails/*.pug')
    .pipe(pug({
      pretty: true,
      data: {
        root: JSON.parse(fs.readFileSync(root+'/data/root.json')),
        questions: JSON.parse(fs.readFileSync(root+'/data/questions.json'))
      }
     }))
    .pipe(gulp.dest(dest+'/'+mails));
});


//  BABEL
var babelSrc = [
  root+'/babel/lib/jquery-2.2.4.js',
  root+'/babel/lib/jpreloader.js',
  root+'/babel/lib/tippy.all.min.js',
  root+'/babel/molecules/range.js',
  root+'/babel/molecules/spans.js',
  root+'/babel/molecules/nuotron.js',
  root+'/babel/organisms/present.js',
  root+'/babel/organisms/survey.js',
  root+'/babel/molecules/loader.js'
];
gulp.task('babel', function() {
  return gulp.src(babelSrc)
    .pipe(babel())
    .pipe(concat(file+'.js'))
    .pipe(banner(comment, {pkg:pkg}))
    .pipe(gulp.dest(dest+'/'+assets+'/'+js))

    .pipe(uglify())
    .pipe(banner(comment, {pkg:pkg}))
    .pipe(rename({extname:'.'+min+'.js'}))
    .pipe(gulp.dest(dest+'/'+assets+'/'+js));
});


//  STYLUS
gulp.task('stylus', function() {
  return gulp.src(root+'/stylus/app.styl')
    .pipe(stylus({'use': koutoSwiss()}))
    .pipe(banner(comment, {pkg:pkg}))
    .pipe(rename(file+'.css'))
    .pipe(gulp.dest(dest+'/'+assets+'/'+css))

    .pipe(uglifycss())
    .pipe(banner(comment, {pkg:pkg}))
    .pipe(rename({extname:'.'+min+'.css'}))
    .pipe(gulp.dest(dest+'/'+assets+'/'+css));
});


//  IMAGES
gulp.task('img', function() {
  return gulp.src(root+'/img/**/*')
    .pipe(gulp.dest(dest+'/'+assets+'/'+img));
});


//  HTACCESS
gulp.task('htaccess', function() {
  return gulp.src('.htaccess')
    .pipe(gulp.dest(dest));
});


//  PHP
gulp.task('php', function() {
  return gulp.src(root+'/php/**/*')
    .pipe(gulp.dest(dest+'/'+assets+'/'+php));
});


//  WATCH
gulp.task('watch', function() {
  gulp.watch([root+'/pug/**/*', root+'/data/**/*'], ['pug', 'mails', browserSync.reload]);
  gulp.watch(root+'/babel/**/*', ['babel', browserSync.reload]);
  gulp.watch(root+'/stylus/**/*', ['stylus', browserSync.reload]);
  gulp.watch(root+'/img/**/*', ['img', browserSync.reload]);
});


//  DEFAULT
gulp.task('default', function() {
  runSequence(['del', 'pug', 'mails', 'babel', 'stylus', 'img', 'browserSync', 'watch']);
});


//  RELEASE
gulp.task('release', function() {
  runSequence(['del', 'pug', 'mails', 'babel', 'stylus', 'img', 'htaccess', 'php']);
});
