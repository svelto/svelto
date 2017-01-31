
/* =========================================================================
 * Svelto - Tasks - Admin - Bump - Javascript
 * =========================================================================
 * Copyright (c) 2015-2017 Fabio Spampinato
 * Licensed under MIT (https://github.com/svelto/svelto/blob/master/LICENSE)
 * ========================================================================= */

/* REQUIRE */

const fs      = require ( 'fs' ),
      gulp    = require ( 'gulp' ),
      replace = require ( 'gulp-replace' );

/* TASK */

function task () {

  const version = JSON.parse ( fs.readFileSync ( './package.json', 'utf8' ) ).version; // We are not using `require` in order to avoid to get a cached value

  return gulp.src ( './src/core/svelto/svelto.js' )
             .pipe ( replace ( /VERSION: '(.*)'/, `VERSION: '${version}'` ) )
             .pipe ( gulp.dest ( './src/core/svelto' ) );

}

task.description = '[ADMIN] [ALL] Bump javascript version';

/* GULP */

gulp.task ( 'bump-javascript', task );