var gulp = require('gulp');
var plumber = require("gulp-plumber");
var sass = require("gulp-sass");
var bourbon= require("bourbon");
var bourbon_neat = require("bourbon-neat");
var notify = require("gulp-notify");
var sourcemaps = require("gulp-sourcemaps");

var riot = require("gulp-riot");

/*
gulp.task("riot", function(){ 
  return gulp.src("./riottags/*.jade")
    .pipe(riot( {
      template:"pug"
    }))
    .pipe(gulp.dest("./public/riotjs/"));
});
*/


gulp.task("scss", function(){ 
  return gulp.src("./scss/*.scss")
    .pipe(plumber({
      errorHandler: notify.onError("SCSS Error: <%= error.message %>") //<-
    }))
    .pipe(sourcemaps.init())
      .pipe(sass({
        sourceComments:true
      }).on('error', sass.logError)) 
    .pipe(sourcemaps.write("./"))
    .pipe(gulp.dest("./public/stylesheets/"));
});

gulp.task('watch',function () {
  gulp.watch("scss/**/*.scss", ["scss"]);
  //gulp.watch("riottags/*.jade", ["riot"]);
});

gulp.task('default', ['scss', 'watch']);
