var gulp = require('gulp');
var concat = require('gulp-concat');
var minify = require('gulp-uglify');


gulp.task('prod', function () {
    gulp.src(['app.js', 'ai.js'])
    .pipe(concat('all.js'))
    .pipe(minify())
    .pipe(gulp.dest('./dist/'));
})

gulp.task('prod2', function () {
    gulp.src(['/appb2.js', 'aib2.js'])
    .pipe(concat('all.js'))
    .pipe(gulp.dest('./dist/'));
})


gulp.task('default', function () {
    gulp.src(['app.js', 'ai.js'])
    .pipe(concat('all.js'))
    .pipe(gulp.dest('./dist/'));
})
