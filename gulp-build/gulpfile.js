var gulp            = require('gulp'),
    clean           = require('gulp-clean'),
    browserSync     = require('browser-sync').create(),
    concat          = require('gulp-concat'),
    sass            = require('gulp-sass'),
    autoprefixer    = require('gulp-autoprefixer'),
    uglifycss       = require('gulp-uglifycss'),
    uglify          = require('gulp-uglify'),
    notify          = require('gulp-notify'),
    plumber         = require('gulp-plumber'),
    sourcemaps      = require('gulp-sourcemaps'),
    fileInclude     = require('gulp-file-include'),
    beautifyCode    = require('gulp-beautify-code'),
    
    imagemin        = require('gulp-imagemin'),
    imageminUPNG    = require("imagemin-upng"),
    mozjpeg         = require('imagemin-mozjpeg'),
    jpegRecompress  = require('imagemin-jpeg-recompress'),
    svgo            = require('imagemin-svgo'),
    w3cjs           = require('gulp-w3cjs'),
    
    // Source Folder Locations
    src = {
        'root': './src/',
        
        'rootHtml': './src/*.html',
        'rootPartials': './src/partials/',
        
        'rootFonts': './src/assets/fonts/*',
        'fontsAll': './src/assets/fonts/**/*',
        
        'rootCss': './src/assets/css/**/*',
        'rootPluginsCss': './src/assets/css/plugins/**/*',
        
        'styleScss': './src/assets/scss/style.scss',
        'scssAll': './src/assets/scss/**/*',
        
        'rootJs': './src/assets/js/**/*',
        
        'images': './src/assets/images/**/*'
    },
    
    // Destination Folder Locations
    dest = {
        'root': './dest/',
        'fonts': './dest/assets/fonts/',
        'scss': './dest/assets/scss/',
        
        'rootCss': './dest/assets/css',
        'rootPluginsCss': './dest/assets/css/plugins',
        
        'rootJs': './dest/assets/js',
        
        'images': './dest/assets/images/'
    },
    
    // Separator For Vendor CSS & JS
    separator = '\n\n/*====================================*/\n\n',
    
    // Autoprefixer Options
    autoPreFixerOptions = [
        "last 4 version",
        "> 1%",
        "ie >= 9",
        "ie_mob >= 10",
        "ff >= 30",
        "chrome >= 34",
        "safari >= 7",
        "opera >= 23",
        "ios >= 7",
        "android >= 4",
        "bb >= 10"
    ];



/*-- 
    Live Synchronise & Reload
--------------------------------------------------------------------*/

// Browser Synchronise
function liveBrowserSync(done) {
    browserSync.init({
        server: {
            baseDir: dest.root
        }
    });
    done();
}
// Reload
function reload(done) {
    browserSync.reload();
    done();
}


/*-- 
    Gulp Custom Notifier
--------------------------------------------------------------------*/
function customPlumber(errTitle) {
    return plumber({
        errorHandler: notify.onError({
            title: errTitle || "Error running Gulp",
            message: "Error: <%= error.message %>",
            sound: "Glass"
        })
    });
}

/*-- 
    Gulp Other Tasks
--------------------------------------------------------------------*/

/*-- Remove Destination Folder Before Starting Gulp --*/
function cleanProject(done) {
    gulp.src(dest.root)
        .pipe(customPlumber('Error On Clean App'))
        .pipe(clean());
    done();
}

/*-- Copy Font Form Source to Destination Folder --*/
function fonts(done) {
    gulp.src(src.rootFonts)
        .pipe(customPlumber('Error On Copy Fonts'))
        .pipe(gulp.dest(dest.fonts));
    done();
}

/*-- Copy Video & Audio Form Source to Destination Folder --*/
function media(done) {
    gulp.src('./src/assets/media/**/*')
        .pipe(customPlumber('Error On Copy Fonts'))
        .pipe(gulp.dest('./dest/assets/media/'));
    done();
}

/*-- 
    All HTMl Files Compile With Partial & Copy Paste To Destination Folder
--------------------------------------------------------------------*/
function html(done) {
    gulp.src(src.rootHtml)
        .pipe(customPlumber('Error On Compile HTML'))
        .pipe(fileInclude({ basepath: src.rootPartials }))
        .pipe(beautifyCode())
        .pipe(gulp.dest(dest.root));
    done();
}

/*-- 
    CSS & SCSS Task
--------------------------------------------------------------------*/

/*-- Copy All CSS Files Form CSS Folder --*/
function cssCopy(done) {
    gulp.src(src.rootCss)
        .pipe(customPlumber('Error On Copying CSS'))
        .pipe(gulp.dest(dest.rootCss));
    done();
}

/*-- All CSS Plugins --*/
function pluginsCss(done) {
    gulp.src(src.rootPluginsCss)
        .pipe(customPlumber('Error On Combining Plugins CSS'))
        .pipe(concat('plugins.css', {newLine: separator}))
        .pipe(autoprefixer(autoPreFixerOptions))
        .pipe(gulp.dest(dest.rootPluginsCss))
        .pipe(customPlumber('Error On Combine & Minifying Plugins CSS'))
        .pipe(concat('plugins.min.css', {newLine: separator}))
        .pipe(uglifycss())
        .pipe(autoprefixer(autoPreFixerOptions))
        .pipe(gulp.dest(dest.rootPluginsCss));
    done();
}

/*-- Gulp Compile Scss to Css Task & Minify --*/
function styleCss(done) {
    gulp.src(src.styleScss)
        // .pipe(sourcemaps.init())
        .pipe(customPlumber('Error On Compiling Style Scss'))
        .pipe(sass({outputStyle: 'expanded'}).on('error', sass.logError))
        .pipe(concat('style.css'))
        .pipe(autoprefixer(autoPreFixerOptions))
        // .pipe(sourcemaps.write())
        .pipe(gulp.dest(dest.rootCss))
        .pipe(browserSync.stream())
        .pipe(customPlumber('Error On Compiling & Minifying Style Scss'))
        .pipe(sass({outputStyle: 'compressed'}).on('error', sass.logError))
        .pipe(concat('style.min.css'))
        .pipe(autoprefixer(autoPreFixerOptions))
        // .pipe(sourcemaps.write())
        .pipe(gulp.dest(dest.rootCss))
        .pipe(browserSync.stream());
    done();
}
function styleColor(done) {
    gulp.src('./src/assets/scss/color-version/*.scss')
        .pipe(customPlumber('Error On Compiling Style Rtl Scss'))
        .pipe(sass({outputStyle: 'expanded'}).on('error', sass.logError))
        .pipe(autoprefixer(autoPreFixerOptions))
        .pipe(gulp.dest(dest.rootCss))
        .pipe(browserSync.stream());
    done();
}

/*-- Gulp Compile Scss to Css Task & Minify (Helper) --*/
function helperCss(done) {
    gulp.src('./src/assets/scss/helper.scss')
        // .pipe(sourcemaps.init())
        .pipe(customPlumber('Error On Compiling Helper Scss'))
        .pipe(sass({outputStyle: 'expanded'}).on('error', sass.logError))
        .pipe(concat('helper.css'))
        .pipe(autoprefixer(autoPreFixerOptions))
        .pipe(gulp.dest(dest.rootCss))
        .pipe(customPlumber('Error On Compiling & Minifying Helper Scss'))
        .pipe(sass({outputStyle: 'compressed'}).on('error', sass.logError))
        .pipe(concat('helper.min.css'))
        .pipe(autoprefixer(autoPreFixerOptions))
        // .pipe(sourcemaps.write())
        .pipe(gulp.dest(dest.rootCss));
    done();
}

/*-- Gulp Compile Scss to Css Task & Minify --*/
function scss(done) {
    gulp.src(src.scssAll)
        .pipe(customPlumber('Error On Compiling Style Scss'))
        .pipe(gulp.dest(dest.scss));
    done();
}


/*-- 
    JS Task
--------------------------------------------------------------------*/
function jsCopy(done) {
    gulp.src(src.rootJs)
        .pipe(customPlumber('Error On Copying Main Js File'))
        .pipe(gulp.dest(dest.rootJs));
    done();
}

/*-- 
    Image Optimization
--------------------------------------------------------------------*/
function imageOptimize(done) {
    gulp.src(src.images)
        .pipe(imagemin(
            [imageminUPNG(), mozjpeg(), jpegRecompress(), svgo()],
            {verbose: true}
        ))
        .pipe(gulp.dest(dest.images));
    done();
}

/*--
    Gulp Html Validator Check
--------------------------------------------------------------------*/
gulp.task('validator', function htmlValidator(done) {
    gulp.src('./dest/*.html')
        .pipe(w3cjs())
        .pipe(w3cjs.reporter());
    done();
});

/*-- 
    All, Watch & Default Task
--------------------------------------------------------------------*/

/*-- All --*/
gulp.task('clean', cleanProject);
gulp.task('helperCss', helperCss);
gulp.task('allTask', gulp.series(fonts, html, media, cssCopy, pluginsCss, helperCss, styleCss, styleColor, scss, jsCopy, imageOptimize));

/*-- Watch --*/
function watchFiles() {
    gulp.watch(src.fontsAll, gulp.series(fonts, reload));
    gulp.watch('./src/assets/media/**/*', gulp.series(media, reload));
    
    gulp.watch(src.rootHtml, gulp.series(html, reload));
    gulp.watch(src.rootPartials, gulp.series(html, reload));
    
    gulp.watch(src.rootCss, gulp.series(cssCopy, reload));
    gulp.watch(src.rootPluginsCss, gulp.series(pluginsCss, reload));
    gulp.watch('./src/assets/scss/helper.scss', gulp.series(helperCss));
    gulp.watch(src.scssAll, gulp.series(styleCss));
    gulp.watch(src.scssAll, gulp.series(styleColor));
    gulp.watch(src.scssAll, gulp.series(scss));
    
    gulp.watch(src.rootJs, gulp.series(jsCopy, reload));
    
    gulp.watch(src.images, gulp.series(imageOptimize, reload));
}

/*-- Default --*/
gulp.task('default', gulp.series('allTask', gulp.parallel(liveBrowserSync, watchFiles)));