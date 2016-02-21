'use strict';

const gulp = require('gulp');
const nodemon = require('gulp-nodemon');
const changed = require('gulp-changed');
const babel = require('gulp-babel');

gulp.task('build', () =>
    gulp.src('src/**/*.js')
        .pipe(changed('./dist/'))
        .pipe(babel({
            comments: false,
            sourceMaps: true,
            plugins: [
                'transform-es2015-spread',
                'transform-es2015-destructuring',
                'transform-es2015-modules-commonjs',
                'transform-es2015-parameters',
                'transform-object-rest-spread',
                'syntax-async-functions',
                'transform-regenerator'
            ]
        }))
        .pipe(gulp.dest('./dist/'))
);

gulp.task('default', ['build'], () => {
    nodemon({
        script: 'dist/index.js',
        ext: 'js',
        ignore: ['dist/**/*', 'Gulpfile.js'],
        tasks: ['build'],
        env: {
            NODE_ENV: 'development',
            DATABASE_HOST: 'localhost',
            DATABASE_PORT: 28015,
            PORT: 8888
        }
    });
});
