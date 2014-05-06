var gulp = require("gulp");
var rename = require("gulp-rename");				// https://github.com/hparra/gulp-rename
var uglify = require("gulp-uglify");				// https://github.com/terinjokes/gulp-uglify
var concat = require("gulp-concat");				// https://github.com/wearefractal/gulp-concat
var minifycss = require("gulp-minify-css");
//var watch = require("gulp-watch");				// https://github.com/floatdrop/gulp-watch

gulp.task("default", function () {

	gulp.src([ // Note: List the scripts in the order in which they must be concatenated
                "src/js/vendor/jquery.easing.1.3.min.js",
                "src/js/vendor/jquery.animate-enhanced.min.js",
                "src/js/vendor/jquery.scrollTo.min.js",
                "src/js/vendor/jquery.debouncedresize.js",
                "src/js/vendor/path.js",
                "src/js/vendor/mustache.js",
                "src/js/vendor/jquery.imagesloaded.min.js",
                "src/js/vendor/openseadragon.min.js",
                "src/js/vendor/spotlight.js",
                "src/js/vendor/jquery-ui-1.10.4.custom.min.js",
                "src/js/vendor/perfect-scrollbar-0.4.10.with-mousewheel.min.js",
                "src/js/fitInBox.js",
                "src/js/vendor/jquery.mCustomScrollbar.min.js",
                "src/js/timeline.js",
                "src/js/quadrant.js",
                "src/js/deepzoom.js",
                "src/js/application.js"
	])
	.pipe(concat("main.js"))
	.pipe(uglify())
	.pipe(gulp.dest("js"));

	gulp.src([
                "src/css/jquery.mCustomScrollbar.css",
                "src/css/timeline.css",
                "src/css/main.css"
	])
	.pipe(concat("main.css"))
	//.pipe(minifycss())
	.pipe(gulp.dest("css"));

});
