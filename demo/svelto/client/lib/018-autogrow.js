
/* =========================================================================
 * Svelto - Autogrow - Textarea
 * =========================================================================
 * Copyright (c) 2015-2016 Fabio Spampinato
 * Licensed under MIT (https://github.com/svelto/svelto/blob/master/LICENSE)
 * =========================================================================
 * @require ../../widget/widget.js
 * ========================================================================= */

// It supports only `box-sizing: border-box` textareas

//TODO: Measure the needed height using canvas, if possible, it would make it super fast

(function ( $, _, Svelto, Widgets, Factory ) {

  'use strict';

  /* CONFIG */

  let config = {
    name: 'autogrowTextarea',
    plugin: true,
    selector: 'textarea.autogrow',
    options: {
      callbacks: {
        change: _.noop
      }
    }
  };

  /* AUTOGROW TEXTAREA */

  class AutogrowTextarea extends Widgets.Widget {

    /* SPECIAL */

    _variables () {

      this.$textarea = this.$element;

      this.$tempTextarea = $('<textarea>').css ({
                              'position': 'fixed',
                              'visibility': 'hidden',
                              'padding': 0,
                              'min-height': 0,
                              'height': 0
                            });

    }

    _init () {

      this._update ();

    }

    _events () {

      this.___inputChange ();

    }

    /* PRIVATE */

    _getNeededHeight () {

      this.$tempTextarea.css ( 'font', this.$textarea.css ( 'font' ) ).val ( this.$textarea.val () ).appendTo ( this.$layout );

      let height = this.$tempTextarea[0].scrollHeight;

      this.$tempTextarea.detach ();

      return height;

    }

    /* INPUT / CHANGE */

    ___inputChange () {

      this._on ( true, 'input change', this._update );

    }

    /* UPDATE */

    _update () {

      let height = this._getNeededHeight ();

      if ( height === this._prevHeight ) return;

      this.$textarea.height ( height );

      this._prevHeight = height;

      this._trigger ( 'change' );

    }

  }

  /* FACTORY */

  Factory.init ( AutogrowTextarea, config, Widgets );

}( Svelto.$, Svelto._, Svelto, Svelto.Widgets, Svelto.Factory ));