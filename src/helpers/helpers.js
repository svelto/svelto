
/* =========================================================================
 * Svelto - Helpers
 * =========================================================================
 * Copyright (c) 2015 Fabio Spampinato
 * Licensed under MIT (https://github.com/svelto/svelto/blob/master/LICENSE)
 * =========================================================================
 * @requires ../svelto/svelto.js
 * @requires ../ui/ui.js
 * @requires ../widget/widgetize.js
 * @requires ../pointer/Pointer.js
 * @requires vendor/screenfull.js
 * ========================================================================= */

(function ( $, _, window, document, undefined ) {

  'use strict';

  /* SCROLL TO TOP */

  Widgetize.add ( function () {

    $('.scroll-to-top').on ( Pointer.tap, () => $body.add ( $html ).animate ( { scrollTop: 0 }, UI.animation.normal ) );

  });

  /* FULLSCREEN */

  //TODO: Move it to its own component, add the ability to trigger the fullscreen for a specific element
  //FIXME: It doesn't work in iOS's Safari and IE10
  //TODO: Add support

  Widgetize.add ( function () {

    $('.fullscreen-toggler').on ( Pointer.tap, screenfull.toggle );

  });

}( Svelto.$, Svelto._, window, document ));