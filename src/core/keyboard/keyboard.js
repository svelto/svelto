
/* =========================================================================
 * Svelto - Core - Keyboard
 * =========================================================================
 * Copyright (c) 2015-2016 Fabio Spampinato
 * Licensed under MIT (https://github.com/svelto/svelto/blob/master/LICENSE)
 * =========================================================================
 * @require core/browser/browser.js
 * @require core/svelto/svelto.js
 * ========================================================================= */

(function ( $, _, Svelto, Browser ) {

  'use strict';

  /* KEYBOARD */

  let Keyboard = {
    keys: {
      BACKSPACE: 8,
      COMMA: 188,
      DEL: 46,
      DELETE: 46,
      DOWN: 40,
      END: 35,
      ENTER: 13,
      ESC: 27,
      ESCAPE: 27,
      HOME: 36,
      LEFT: 37,
      PAGE_DOWN: 34,
      PAGE_UP: 33,
      PERIOD: 190,
      RIGHT: 39,
      SPACE: 32,
      SPACEBAR: 32,
      TAB: 9,
      UP: 38
    },
    keystroke: {

      match ( event, keystroke ) {

        // It only supports ctrl/cmd/meta/alt/shift/char/Keyboard.keys[charName] //TODO: Improve it
        // ctrl/cmd/meta are treated as the same key, they are intended as `ctrl` if we are not using a Mac, or as `cmd` if we are instead using it

        let specialKeys = ['ctrl', 'cmd', 'meta', 'alt', 'shift'],
            keys = keystroke.split ( '+' ).map ( key => key.trim ().toLowerCase () );

        if ( ( _.includes ( keys, 'ctrl' ) || _.includes ( keys, 'cmd' ) || _.includes ( keys, 'meta') ) !== Keyboard.keystroke.hasCtrlOrCmd ( event ) ) return false;
        if ( _.includes ( keys, 'alt' ) !== event.altKey ) return false;
        if ( _.includes ( keys, 'shift' ) !== event.shiftKey ) return false;

        for ( let key of keys ) {

          if ( !_.includes ( specialKeys, key ) ) {

            if ( !( event.keyCode === Keyboard.keys[key.toUpperCase ()] || String.fromCharCode ( event.keyCode ).toLowerCase () === key ) ) return false;

          }

        }

        return true;

      },

      hasCtrlOrCmd ( event ) {

        return ( !Browser.is.mac && event.ctrlKey ) || ( Browser.is.mac && event.metaKey );

      }

    }

  };

  /* EXPORT */

  Svelto.Keyboard = Keyboard;

}( Svelto.$, Svelto._, Svelto, Svelto.Browser ));
