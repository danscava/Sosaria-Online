var gulp = require("gulp"),
    jasmine = require("gulp-jasmine");

gulp.task("test", function() {
    return gulp.src("test/**/*.spec.js")
        .pipe(jasmine({
        includeStackTrace: true
    }));
});
