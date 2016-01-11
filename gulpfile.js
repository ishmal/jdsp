var gulp = require('gulp');
var ts = require('gulp-typescript');
var gutil = require("gulp-util");
var rimraf = require('rimraf');
var browserSync = require('browser-sync');
var webpack = require('webpack');
var jshint = require('gulp-jshint');

 
gulp.task('lint', function() {
  return gulp.src('./src/lib/*.js')
    .pipe(jshint({esnext: true}))
    .pipe(jshint.reporter('default'));
});


gulp.task('copylibs', function(done) {
    gulp.src(['node_modules/angular2/**/*'], {base: "node_modules/angular2"} )
      .pipe(gulp.dest('web/lib/angular2'));
    gulp.src(['node_modules/reflect-metadata/**/*'], {base: "node_modules/reflect-metadata"} )
      .pipe(gulp.dest('web/lib/reflect-metadata'));
    gulp.src(['node_modules/es6-shim/**/*'], {base: "node_modules/es6-shim"} )
      .pipe(gulp.dest('web/lib/es6-shim'));
    gulp.src(['node_modules/es6-promise/**/*'], {base: "node_modules/es6-promise"} )
        .pipe(gulp.dest('web/lib/es6-promise'));
    gulp.src(['node_modules/systemjs/**/*'], {base: "node_modules/systemjs"} )
        .pipe(gulp.dest('web/lib/systemjs'));
    gulp.src(['node_modules/bootstrap/**/*'], {base: "node_modules/bootstrap"} )
        .pipe(gulp.dest('web/lib/bootstrap'));
    gulp.src(['node_modules/jquery/**/*'], {base: "node_modules/jquery"} )
        .pipe(gulp.dest('web/lib/jquery'));
    gulp.src(['node_modules/rxjs/**/*'], {base: "node_modules/rxjs"} )
        .pipe(gulp.dest('web/lib/rxjs'));
});

gulp.task('assets', function() {
  gulp.src(['./src/**/*.json', './src/**/*.html', './src/**/*.css', './src/**/*.png'])
    .pipe(gulp.dest('./web'));
});

// in order for project-based gulp-typescript to work, you MUST create the project
// outside of a task...
var tsProject = ts.createProject('tsconfig.json');

gulp.task('ts', function(done) {
  //var tsResult = tsProject.src()
  var tsResult = gulp.src([
      "src/**/*.ts",
      "typings/**/*.d.ts"
    ])
    .pipe(ts(tsProject), undefined, ts.reporter.fullReporter(true));
  return tsResult.js.pipe(gulp.dest('web'));
});

gulp.task('watch', ['watch.assets', 'watch.ts', 'watch.web']);

gulp.task('watch.assets', ['assets'], function() {
  return gulp.watch(['./src/**/*.json', './src/**/*.html', './src/**/*.css'], [
    'assets'
  ]);
});

gulp.task('watch.ts', ['ts'], function() {
  return gulp.watch('src/**/*.ts', ['ts']);
});

gulp.task('watch.web', function() {

});

gulp.task("webpack", function(callback) {

    var config = {
        context: __dirname + "/src",
        entry: './boot',
        output: {
            path: __dirname + "/web/lib",
            filename: 'app.bundle.js'
        },
        module: {
            loaders: [
                {
                    test: /\.ts$/,
                    loader: 'ts-loader'
                }
            ]
        }
    };

    webpack(config, function(err, stats) {
        if(err) throw new gutil.PluginError("webpack", err);
        gutil.log("[webpack]", stats.toString({
            // output options
        }));
        callback();
    });

});

gulp.task("webpack-lib", function(callback) {

    var config = {
        context: __dirname + "/src/lib",
        entry: './digi',
        output: {
            path: __dirname + "/web/lib",
            filename: 'libdigi.js'
        },
        module: {
            loaders: [
                {
                    test: /\.js$/,
                    loader: 'babel-loader',
                    query: {
                        plugins: ['transform-runtime'],
                        presets: [ 'es2015' ]
                    }
                }
            ]
        }
    };

    webpack(config, function(err, stats) {
        if(err) throw new gutil.PluginError("webpack", err);
        gutil.log("[webpack]", stats.toString({
            // output options
        }));
        callback();
    });

});

gulp.task('webserver', function() {
    browserSync({
        server: {
            baseDir: "./web/"
        }
    });
});

gulp.task('build', ['copylibs', 'webpack', 'ts']);

gulp.task('clean', function(cb) {
  rimraf("./web", { force: true }, cb);
});

gulp.task('default', ['build', 'webserver', 'watch']);
