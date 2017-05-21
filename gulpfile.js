const gulp = require('gulp');
const gulpLoadPlugins = require('gulp-load-plugins');
const browserSync = require('browser-sync');
const del = require('del');
const $ = gulpLoadPlugins();
const gulpSequence = require('gulp-sequence').use(gulp);
const replace = require('gulp-replace');
const svgstore = require('gulp-svgstore');
const jshint = require('gulp-jshint');
const stylish = require('jshint-stylish');
const inject = require('gulp-inject');
const reload = browserSync.reload;

gulp.task('fonts', () => {
    return gulp.src('app/fonts/**/*')
        .pipe(gulp.dest('dist/assets/fonts'));
});

gulp.task('html', () => {
    return gulp.src('app/*.html')
        .pipe(gulp.dest('dist/'));
});

/**
 * Combine all svgs into one and inject right after body tag
 * place above the themefiles tasks so it first injects the svgs.
 */
gulp.task('svgstore', function() {
  var svgs = gulp
    .src('app/images/svg/*.svg')
    .pipe(svgstore({ inlineSvg: true }));

  function fileContents (filePath, file) {
    return file.contents.toString();
  }

  return gulp
    .src(['app/about.html', 'app/home.html'])
    .pipe(inject(svgs, { transform: fileContents }))
    .pipe(gulp.dest('app/'));
});

gulp.task('styles', () => {
  return gulp.src('app/styles/*.scss')
    .pipe($.plumber())
    .pipe($.sourcemaps.init())
    .pipe($.sass.sync({
      outputStyle: 'expanded',
      precision: 10,
      includePaths: ['.']
    }).on('error', $.sass.logError))
    .pipe($.autoprefixer({browsers: ['> 1%', 'last 2 versions', 'Firefox ESR']}))
    .pipe($.cssnano({safe: true, autoprefixer: false}))
    .pipe($.sourcemaps.write())
    .pipe(gulp.dest('dist/styles'));
});

gulp.task('scripts', () => {
  return gulp.src('app/scripts/*.js')
    .pipe($.plumber())
    .pipe($.sourcemaps.init())
    .pipe($.browserify())
    .pipe($.babel({compact: true}))
    .pipe($.uglify())
    .pipe($.sourcemaps.write('.'))
    .pipe(gulp.dest('dist/scripts'));
});

function lint(files, options) {
  return gulp.src(files)
    .pipe($.eslint(options))
    .pipe($.eslint.format())
    .pipe($.if(!browserSync.active, $.eslint.failAfterError()));
}

gulp.task('lint', () => {
  return lint('app/scripts/**/*.js', {
    fix: true
  })
    .pipe(gulp.dest('app/scripts'));
});

/**
 * Run jshint on js files.
 */
gulp.task('jshint', function() {
  return gulp.src(['app/scripts/**/*.js'])
    .pipe(jshint())
    .pipe(jshint.reporter(stylish));
});

gulp.task('images', () => {
  return gulp.src('app/images/**/*')
    .pipe($.cache($.imagemin({
      progressive: true,
      interlaced: true,
      svgoPlugins: [{cleanupIDs: false}]
    })))
    .pipe(gulp.dest('dist/images'));
});

gulp.task('clean', () => {
    return del(['dist/assets', 'dist/style.css']);
});

gulp.task('serve', ['build'], () => {
  browserSync({
    proxy: 'http://localhost:8080/andreas/dist',
    notify: false,
    port: 8080,
    open: true
  });

  gulp.watch('app/*.html', ['html', reload]);
  gulp.watch('app/styles/**/*', ['styles', reload]);
  gulp.watch('app/scripts/**/*', ['scripts', reload]);
  gulp.watch('app/images/**/*', ['images', reload]);
  gulp.watch('app/fonts/**/*', ['fonts', reload]);
});

gulp.task('size', () => {
    return gulp.src('dist/**/*').pipe($.size({title: 'build', gzip: true}));
});

gulp.task('build', ['clean'], gulpSequence('fonts', 'svgstore', 'styles', 'html', 'lint', 'scripts', 'images', 'size'));

gulp.task('default', ['build']);