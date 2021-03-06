
// @require core/lodash/lodash.js
// @require core/modernizr/modernizr.js

(function ( _, Modernizr ) {

  /* LOCAL STORAGE */

  if ( Modernizr.localstorage ) return;

  window.localStorage = {
    key: _.null,
    removeItem: _.undefined,
    clear: _.undefined,
    getItem: _.null,
    setItem: _.undefined
  };

}( window._, window.Modernizr ));
