
// @require core/readify/readify.js
// @require core/svelto/svelto.js

// `body` is used as a fallback

(function ( $, _, Svelto, Readify ) {

  /* LAYOUT */

  Readify.add ( function () {

    $.$layout = $.$layout || $('.layout, body').first ();

  });

  $.getLayoutOf = function ( ele ) {

    if ( ele ) {

      const $ele = $(ele),
            $layout = $ele[0] === $.body ? $.$body : $ele.parent ().closest ( '.layout, body' );

      if ( $layout.length ) return $layout;

    }

    return $.$layout;

  };

}( Svelto.$, Svelto._, Svelto, Svelto.Readify ));
