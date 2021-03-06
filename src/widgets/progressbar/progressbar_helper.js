
// @require ./progressbar.js

(function ( $, _, Svelto, Progressbar ) {

  /* HELPER */

  $.progressbar = function ( options ) {

    options = _.isNumber ( options ) ? { value: options } : options;

    return new Progressbar ( options );

  };

}( Svelto.$, Svelto._, Svelto, Svelto.Widgets.Progressbar ));
