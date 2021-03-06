
// @require core/animations/animations.js
// @require core/pointer/pointer.js
// @require widgets/targeter/opener/opener.js

//TODO: Test with nested layouts
//TODO: Make it work with nested scrollable elements
// It only scrolls properly when the elements are not nested inside scrollable wrappers

(function ( $, _, Svelto, Widgets, Factory, Pointer, Animations ) {

  /* CONFIG */

  let config = {
    name: 'scroller',
    plugin: true,
    selector: '.scroller',
    options: {
      animations: {
        scroll: Animations.fast
      },
      callbacks: {
        scroll: _.noop
      }
    }
  };

  /* SCROLLER */

  class Scroller extends Widgets.Targeter {

    /* SPECIAL */

    _events () {

      super._events ();

      this.___tap ();

    }

    /* TAP */

    ___tap () {

      this._on ( Pointer.tap, this.__tap );

    }

    __tap ( event ) {

      this.scroll ();

    }

    /* API */

    scroll () {

      $.scrollTo ( this.target, { duration: this.options.animations.scroll } );

      this._trigger ( 'scroll' );

    }

  }

  /* FACTORY */

  Factory.make ( Scroller, config );

}( Svelto.$, Svelto._, Svelto, Svelto.Widgets, Svelto.Factory, Svelto.Pointer, Svelto.Animations ));
