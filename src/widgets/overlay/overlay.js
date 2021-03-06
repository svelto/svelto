
// @require core/animations/animations.js
// @require widgets/autofocusable/autofocusable.js

(function ( $, _, Svelto, Widgets, Factory, Animations ) {

  /* CONFIG */

  let config = {
    name: 'overlay',
    plugin: true,
    selector: '.overlay',
    options: {
      classes: {
        show: 'show',
        open: 'open',
        parent: {
          show: 'overlay-parent-show',
          open: 'overlay-parent-open'
        }
      },
      animations: {
        open: Animations.fast,
        close: Animations.fast
      },
      keystrokes: {
        'esc': 'close'
      },
      callbacks: {
        open: _.noop,
        close: _.noop
      }
    }
  };

  /* OVERLAY */

  class Overlay extends Widgets.Autofocusable {

    /* SPECIAL */

    _variables () {

      this.$overlay = this.$element;

      this._isOpen = this.$overlay.hasClass ( this.options.classes.open );

    }

    _events () {

      if ( this._isOpen ) {

        this.___keydown ();

      }

    }

    _destroy () {

      this.close ();

    }

    /* PARENT */

    _getParent () {

      if ( !this.$parent ) {

        this.$parent = this.$overlay.parent ();

      }

      return this.$parent;

    }

    /* KEYDOWN */

    ___keydown () {

      this._onHover ( true, [$.$document, 'keydown', this.__keydown] ); //FIXME: Using _onHover in an undocumented way, the first value was supposed to be $element

    }

    /* API */

    isOpen () {

      return this._isOpen;

    }

    toggle ( force = !this._isOpen ) {

      return this[force ? 'open' : 'close']();

    }

    open () {

      if ( this._isOpen ) return null;

      if ( this.isLocked () ) return this.whenUnlocked ( this.open.bind ( this ) );

      this.lock ();

      this._isOpen = true;

      this._frame ( function () {

        this.$overlay.addClass ( this.options.classes.show );
        this._getParent ().addClass ( this.options.classes.parent.show );

        this._frame ( function () {

          this.$overlay.addClass ( this.options.classes.open );
          this._getParent ().addClass ( this.options.classes.parent.open );

          this.autofocus ();

          this.unlock ();

          this._trigger ( 'open' );

        });

      });

      this.___keydown ();

    }

    close () {

      if ( !this._isOpen ) return null;

      if ( this.isLocked () ) return this.whenUnlocked ( this.close.bind ( this ) );

      this.lock ();

      this._isOpen = false;

      this._frame ( function () {

        this.$overlay.removeClass ( this.options.classes.open );
        this._getParent ().removeClass ( this.options.classes.parent.open );

        this._delay ( function () {

          this.$overlay.removeClass ( this.options.classes.show );
          this._getParent ().removeClass ( this.options.classes.parent.show );

          this.autoblur ();

          this.unlock ();

          this._trigger ( 'close' );

        }, this.options.animations.close );

      });

      this._reset ();

    }

  }

  /* FACTORY */

  Factory.make ( Overlay, config );

}( Svelto.$, Svelto._, Svelto, Svelto.Widgets, Svelto.Factory, Svelto.Animations ));
