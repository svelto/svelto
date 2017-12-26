
/* =========================================================================
 * Svelto - Core - Shims - Shims (localStorage)
 * =========================================================================
 * Copyright (c) 2015-2017 Fabio Spampinato
 * Licensed under MIT (https://github.com/svelto/svelto/blob/master/LICENSE)
 * =========================================================================
 * @require core/lodash/lodash.js
 * @require core/modernizr/modernizr.js
 * ========================================================================= */

(function ( _, Modernizr ) {

  'use strict';

  /* LOCAL STORAGE */

  if ( Modernizr.localstorage ) return;

  window.localStorage = {
    key: _.null,
    removeItem: _.undefined,
    clear: _.undefined,
    getItem: _.null,
    setItem: _.undefined
  };

}( window.__svelto_lodash, window.__svelto_modernizr ));
