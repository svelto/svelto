
/* =========================================================================
 * Svelto - Lib - Get Script
 * =========================================================================
 * Copyright (c) 2015-2017 Fabio Spampinato
 * Licensed under MIT (https://github.com/svelto/svelto/blob/master/LICENSE)
 * =========================================================================
 * @require core/svelto/svelto.js
 * ========================================================================= */

(function ( $, _, Svelto ) {

  'use strict';

  /* GET SCRIPT */

  function getScript ( url ) {

    return new Promise ( ( resolve, reject ) => {

      let script = document.createElement ( 'script' ),
          anchor = document.getElementsByTagName ( 'script' )[0];

      script.async = true;

      script.onload = resolve;
      script.onerror = reject;
      script.src = url;

      anchor.parentNode.insertBefore ( script, anchor );

    });

  }

  /* EXPORT */

  Svelto.getScript = getScript;

}( Svelto.$, Svelto._, Svelto ));