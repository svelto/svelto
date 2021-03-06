
// @require core/browser/browser.js
// @require core/readify/readify.js

(function ( $, _, Svelto, Browser, Readify ) {

  /* AUTOFOCUS */

  let Autofocus = {

    /* VARIABLES */

    enabled: Browser.is.desktop, // On touch devices the keyboard will pop up
    history: [], // List of autofocused elements
    historySize: 3, // How many elements to keep in the history
    restore: false, // Switch focus to the previously focused element
    selectionTypeRe: /text|search|url|tel|password/i,

    /* INIT */

    init () {

      Autofocus.focus ( $.$html );

    },

    /* API */

    set ( ele ) {

      if ( !Autofocus.enabled ) return;

      Autofocus.history.unshift ( ele );
      Autofocus.history = _.uniq ( Autofocus.history ).slice ( 0, Autofocus.historySize );

      ele.focus ();

      /* CARET TO THE END */

      if ( ele.setSelectionRange && Autofocus.selectionTypeRe.test ( ele.type ) ) {

        let length = ele.value.length * 2; // Double the length because Opera is inconsistent about whether a carriage return is one character or two

        if ( !length ) return;

        setTimeout ( () => ele.setSelectionRange ( length, length ), 1 ); // Timeout seems to be required for Blink

        ele.scrollTop = 1000000; // In case it's a tall textarea

      }

    },

    find ( $parent = $.$html, focused ) {

      let $focusable = $parent.find ( '[autofocus], .autofocus' ).filter ( ( i, ele ) => $.isVisible ( ele ) );

      if ( _.isBoolean ( focused ) ) {

        $focusable = $focusable.filter ( ( index, ele ) => $.isFocused ( ele ) === focused );

      }

      return $focusable.length ? $focusable[0] : null;

    },

    focus ( $parent ) {

      if ( !Autofocus.enabled ) return;

      let focusable = Autofocus.find ( $parent );

      if ( !focusable || $.isFocused ( focusable ) ) return;

      Autofocus.set ( focusable );

    },

    blur ( $parent, restore = Autofocus.restore ) {

      if ( !Autofocus.enabled || !Autofocus.history[0] || !$parent[0].contains ( Autofocus.history[0] ) ) return;

      if ( restore ) {

        let previous = Autofocus.history.find ( $.isVisible ) || Autofocus.find ( $.$html );

        if ( previous && !$.isFocused ( previous ) && $.isVisible ( previous ) ) {

          Autofocus.set ( previous );

          return;

        }

      }

      Autofocus.history[0].blur ();

    }

  };

  /* EXPORT */

  Svelto.Autofocus = Autofocus;

  /* READY */

  Readify.add ( Autofocus.init.bind ( Autofocus ) );

}( Svelto.$, Svelto._, Svelto, Svelto.Browser, Svelto.Readify ));
