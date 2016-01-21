
/* =========================================================================
 * Svelto - Autogrow - Input
 * =========================================================================
 * Copyright (c) 2015-2016 Fabio Spampinato
 * Licensed under MIT (https://github.com/svelto/svelto/blob/master/LICENSE)
 * =========================================================================
 * @requires ../../widget/widget.js
 * ========================================================================= */

//INFO: It supports only `box-sizing: border-box` inputs

(function ( $, _, Svelto, Widgets, Factory ) {

  'use strict';

  /* CONFIG */

  let config = {
    name: 'autogrowInput',
    plugin: true,
    selector: 'input.autogrow',
    options: {
      callbacks: {
        change: _.noop
      }
    }
  };

  /* AUTOGROW INPUT */

  class AutogrowInput extends Widgets.Widget {

    /* SPECIAL */

    _variables () {

      this.$input = this.$element;

      this.ctx = document.createElement ( 'canvas' ).getContext ( '2d' );

    }

    _init () {

      this._update ();

    }

    _events () {

      this.___change ();

    }

    /* PRIVATE */

    _getNeededWidth () {

      this.ctx.font = this.$input.css ( 'font' );

      return this.ctx.measureText ( this.$input.val () ).width;

    }

    /* CHANGE / UPDATE */

    ___change () {

      this._on ( true, 'input change', this._update );

    }

    _update () {

      this.$input.width ( this._getNeededWidth () );

      this._trigger ( 'change' );

    }

  }

  /* FACTORY */

  Factory.init ( AutogrowInput, config, Widgets );

}( Svelto.$, Svelto._, Svelto, Svelto.Widgets, Svelto.Factory ));
