var elixir        = require('laravel-elixir');
var gulp          = require('gulp');
var templateCache = require('gulp-angular-templatecache');

gulp.task('cacheTemplates', function () {
    gulp.src('resources/assets/js/templates/**/*.html')
        .pipe(templateCache())
        .pipe(gulp.dest('public/js'));
});

elixir(function(mix) {
    mix.sass('main.scss')
        .browserify('app.js')
        .task('cacheTemplates', 'resources/assets/js/templates/**/*.html');
});
