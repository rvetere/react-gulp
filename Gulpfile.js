//**********************************************************
// vp24 react - next gen cms
//
// Author: Remo Vetere
//
// Purpose: Gulp buildfile, setting up a perfect dev env and
//    giving tasks for production builds.
//
// Usage: run "gulp" in terminal to execute express together
//    with sass-styles watch task and livereload on html/js/sass
//    code changes.
//
//    run "gulp prod" to build the build/deploy.zip ready for
//    production hosting.
//*********************************************************

var gulp = require('gulp'),
    sass = require('gulp-ruby-sass'),
    sourcemaps = require('gulp-sourcemaps'),
    autoprefixer = require('gulp-autoprefixer'),
    minifycss = require('gulp-minify-css'),
    rename = require('gulp-rename'),
    htmlreplace = require('gulp-html-replace'),
    uglify = require('gulp-uglify'),
    clean = require('gulp-clean'),
    concat = require('gulp-concat'),
    zip = require('gulp-zip');

gulp.task('express', function() {
    var express = require('express');
    var app = express();
    app.use(require('connect-livereload')({port: 35729}));
    app.use(express.static(__dirname + '/src'));
    app.listen(4000, '0.0.0.0');
});

var tinylr;
gulp.task('livereload', function() {
    tinylr = require('tiny-lr')();
    tinylr.listen(35729);
});

var randomCssName = _generateRandomName(),
    randomJsName = _generateRandomName();

//************************
//****** Sub Tasks
//************************

gulp.task('clean-zip', function() {
    return gulp.src('build/deploy.zip', {read: false})
        .pipe(clean());
});

gulp.task('clean-html', function() {
    return gulp.src('build/intermediate/index.html', {read: false})
        .pipe(clean({force: true}));
});

gulp.task('clean-styles', function() {
    return gulp.src('build/intermediate/css', {read: false})
        .pipe(clean({force: true}));
});

gulp.task('build-styles', function() {
    return _buildStyles('dev');
});

gulp.task('build-styles-prod', ['clean-styles', 'clean-html', 'clean-zip'], function() {
    return _buildStyles('prod', randomCssName);
});

gulp.task('clean-scripts', function() {
    return gulp.src('build/intermediate/js', {read: false})
        .pipe(clean());
});

gulp.task('build-scripts-prod', ['clean-scripts'], function() {
    return _buildScripts('prod', randomJsName);
});

gulp.task('replace-html', function() {
    return gulp.src('src/index.html')
        .pipe(htmlreplace({
            'css': 'css/' + randomCssName + '.min.css',
            'js': 'js/' + randomJsName + '.min.js'
        }))
        .pipe(gulp.dest('build/intermediate/'));
});

gulp.task('watch', function() {
    gulp.watch('src/sass/**/*.scss', ['build-styles']);
    gulp.watch('src/**/*.html', _notifyLiveReload);
    gulp.watch('src/css/*.css', _notifyLiveReload);
});

//************************
//****** Main Tasks
//************************

// default task (execute "gulp") - this task is meant to develop the project with
gulp.task('default', ['build-styles', 'express', 'livereload', 'watch'], function() {

});

// production build (execute "gulp prod") - this task will output a "build/deploy.zip", ready for production
gulp.task('prod', ['build-styles-prod', 'build-scripts-prod', 'replace-html'], function() {
    gulp.src('build/intermediate/**/*.*')
        .pipe(zip('deploy.zip'))
        .pipe(gulp.dest('build'));
});

//************************
//****** Private Methods
//************************

function _notifyLiveReload(event) {
    var fileName = require('path').relative(__dirname, event.path);

    tinylr.changed({
        body: {
            files: [fileName]
        }
    });
}

function _buildStyles(env, name) {
    var renameOptions = {suffix: '.min'};

    if (env === 'prod') {
        renameOptions['basename'] = name;
    }

    return sass('src/sass', { sourcemap: true, style: 'expanded' })
        .pipe(autoprefixer({
            browsers: ['last 2 versions', 'ie 8'],
            cascade: false
        }))
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest(env === 'prod' ? 'build/intermediate/css' : 'src/css'))
        .pipe(rename(renameOptions))
        .pipe(minifycss({sourceMap: true}))
        .pipe(gulp.dest(env === 'prod' ? 'build/intermediate/css' : 'src/css'));
}

function _buildScripts(env, name) {
    var renameOptions = {suffix: '.min'};

    if (env === 'prod') {
        renameOptions['basename'] = name;
    }

    return gulp.src('src/js/**/*.js')
        // lint, process, whatever
        .pipe(sourcemaps.init({loadMaps: true}))
        .pipe(concat('app.js'))
        .pipe(uglify())
        .pipe(sourcemaps.write('../js'))
        .pipe(rename(renameOptions))
        .pipe(gulp.dest('build/intermediate/js'));
}

function _generateRandomName() {
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for( var i=0; i < 5; i++ )
        text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
}