'use strict';

// Include Gulp & Tools We'll Use
var gulp = require('gulp');
var $ = require('gulp-load-plugins')();
var del = require('del');
var runSequence = require('run-sequence');
var browserSync = require('browser-sync');
var imagemin = require('gulp-imagemin');
var pngquant = require('imagemin-pngquant');
var gzip = require('gulp-gzip');

// Optimize Images
gulp.task('images', function() {
    return gulp.src(['src/**/**/*.jpg','src/**/**/*.png'])
        .pipe(imagemin({
            optimizationLevel: 3, //类型：Number  默认：3  取值范围：0-7（优化等级）
            progressive: true, //类型：Boolean 默认：false 无损压缩jpg图片
            interlaced: true, //类型：Boolean 默认：false 隔行扫描gif进行渲染
            multipass: true, //类型：Boolean 默认：false 多次优化svg直到完全优化
            use: [pngquant()]
        }))
        .pipe(gulp.dest('dist'))
        .pipe($.size({title: 'images'}));
});

// Concatenate And Minify JavaScript
gulp.task('scripts', function() {
    var sources = ['src/**/*.js'];
    return gulp.src(sources)
        // .pipe($.concat('main.js'))
        .pipe($.uglify({preserveComments: false, compress: true}))
        // Output Files
        .pipe(gulp.dest('dist'))
        .pipe($.size({title: 'scripts'}));
});

// Compile and Automatically Prefix Stylesheets
gulp.task('styles', function() {

    var AUTOPREFIXER_BROWSERS = [
        'ie >= 10',
        'ie_mob >= 10',
        'ff >= 30',
        'chrome >= 34',
        'safari >= 7',
        'opera >= 23',
        'ios >= 7',
        'android >= 4.4',
        'bb >= 10'
    ];

    // For best performance, don't add Sass partials to `gulp.src`
    return gulp.src([
        'src/**/*.scss',
        'src/**/*.css'
    ])
        .pipe($.changed('css', {extension: '.scss'}))
        .pipe($.sass({
            precision: 10,
            onError: console.error.bind(console, 'Sass error:')
        }))
        .pipe($.autoprefixer({
            browsers: AUTOPREFIXER_BROWSERS,
            cascade: false
        }))
        .pipe(gulp.dest('.tmp'))
        // Concatenate And Minify Styles
        .pipe($.if('*.css', $.csso()))
        .pipe(gulp.dest('dist'))
        .pipe($.size({title: 'styles'}));
});

// Scan Your HTML For Assets & Optimize Them
gulp.task('html', function() {
    var assets = $.useref.assets({searchPath: '{.tmp,src}'});

    return gulp.src('src/**/*.html')
        .pipe(assets)
        // Remove Any Unused CSS
        // Note: If not using the Style Guide, you can delete it from
        // the next line to only include styles your project uses.
        .pipe($.if('*.css', $.uncss({
            html: [
                'src/index.html',
                'src/project-2048.html',
                'src/project-mobile.html',
                'src/project-webperf.html',
            ],
            // CSS Selectors for UnCSS to ignore
            ignore: []
        })))

        // Concatenate And Minify Styles
        // In case you are still using useref build blocks
        .pipe($.if('*.css', $.csso()))
        .pipe(assets.restore())
        .pipe($.useref())
        // Minify Any HTML
        .pipe($.if('*.html', $.htmlmin({collapseWhitespace: true})))
        // Output Files
        .pipe(gulp.dest('dist'))
        .pipe($.size({title: 'html'}));
});

// Clean Output Directory
gulp.task('clean', del.bind(null, ['.tmp', 'dist/*', '!dist/.git'], {dot: true}));

// Build and serve the output from the dist build
gulp.task('serve:dist', ['default'], function() {
    browserSync({
        notify: false,
        logPrefix: 'WSK',
        // Run as an https by uncommenting 'https: true'
        // Note: this uses an unsigned certificate which on first access
        //       will present a certificate warning in the browser.
        // https: true,
        server: 'dist',
        baseDir: "dist"
    });
});
// Build Production Files, the Default Task
gulp.task('default', ['clean'], function(cb) {
    runSequence('styles',['html', 'scripts', 'images'], cb);
});
