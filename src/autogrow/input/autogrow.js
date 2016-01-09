
/* =========================================================================
 * Svelto - Autogrow - Input
 * =========================================================================
 * Copyright (c) 2015 Fabio Spampinato
 * Licensed under MIT (https://github.com/svelto/svelto/blob/master/LICENSE)
 * =========================================================================
 * @requires ../../widget/widget.js
 * ========================================================================= */

//INFO: It supports only `box-sizing: border-box` inputs

(function ( $, _, window, document, undefined ) {

  'use strict';

  /* CONFIG */

  let config = {
    name: 'autogrowInput',
    plugin: true,
    selector: 'input.autogrow',
    options: {
      callbacks: {
        update () {}
      }
    }
  };

  /* AUTOGROW INPUT */

  class AutogrowInput extends Svelto.Widget {

    /* SPECIAL */

    _variables () {

      this.$input = this.$element;

      this.ctx = document.createElement ( 'canvas' ).getContext ( '2d' );

    }

    _init () {

      this._update ();

    }

    _events () {

      /* INPUT / CHANGE */

      this._on ( true, 'input change', this._update );

    }

    /* PRIVATE */

    _getNeededWidth () {

      this.ctx.font = this.$input.css ( 'font' );

      return this.ctx.measureText ( this.$input.val () ).width;

    }

    _update () {

      this.$input.width ( this._getNeededWidth () );

      this._trigger ( 'update' );

    }

  }

  /* FACTORY */

  $.factory ( AutogrowInput, config, Svelto );

}( Svelto.$, Svelto._, window, document ));
