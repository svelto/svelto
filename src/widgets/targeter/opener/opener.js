
// @require ../closer/closer.js
// @require core/browser/browser.js

(function ( $, _, Svelto, Widgets, Factory, Browser, Pointer ) {

  /* CONFIG */

  let config = {
    name: 'opener',
    options: {
      hover: {
        active: false,
        delays: {
          open: 750,
          close: 250
        }
      },
      methods: {
        open: 'open'
      }
    }
  };

  /* OPENER */

  class Opener extends Widgets.Closer {

    /* SPECIAL */

    _events () {

      super._events ();

      this.___hover ();

    }

    /* TAP */

    __tap ( event ) {

      this.open ( event );

    }

    /* HOVER */

    ___hover () {

      if ( this.options.hover.active ) {

        this._on ( Pointer.enter, this.__hoverEnter );

      }

    }

    __hoverEnter () {

      if ( !this.isOpen () ) {

        this._isHoverOpen = false;

        this._hoverOpenTimeout = this._delay ( this.__hoverOpen, this.options.hover.delays.open );

        this._one ( true, Pointer.leave, this.__hoverLeave );

      } else if ( this._isHoverOpen ) {

        if ( this._hoverCloseTimeout ) {

          clearTimeout ( this._hoverCloseTimeout );

          this._hoverCloseTimeout = false;

        }

        this._one ( true, Pointer.leave, this.__hoverLeave );

      }

    }

    __hoverOpen () {

      if ( !this.isOpen () ) {

        this.open ();

        this._isHoverOpen = true;

      }

      this._hoverOpenTimeout = false;

    }

    __hoverLeave  () {

      if ( this._hoverOpenTimeout ) {

        clearTimeout ( this._hoverOpenTimeout );

        this._hoverOpenTimeout = false;

      }

      if ( this.isOpen () && this._isHoverOpen ) {

        this._hoverCloseTimeout = this._delay ( this.__hoverClose, this.options.hover.delays.close );

        this._one ( true, this.$target, Pointer.enter, this.__hoverTargetEnter );

      }

    }

    __hoverClose () {

      if ( this.isOpen () && this._isHoverOpen ) {

        this.close ();

      }

      this._isHoverOpen = false;

      this._hoverCloseTimeout = false;

      this._off ( this.$target, Pointer.enter, this.__hoverTargetEnter );

    }

    __hoverTargetEnter () {

      if ( this._hoverCloseTimeout ) {

        clearTimeout ( this._hoverCloseTimeout );

        this._hoverCloseTimeout = false;

      }

      if ( this.isOpen () && this._isHoverOpen ) {

        this._one ( true, this.$target, Pointer.leave, this.__hoverTargetLeave );

      }

    }

    __hoverTargetLeave () {

      if ( this.isOpen () && this._isHoverOpen ) {

        this._hoverCloseTimeout = this._delay ( this.__hoverClose, this.options.hover.delays.close );

        this._one ( true, this.$target, Pointer.enter, this.__hoverTargetEnter );

      }

    }

    /* API */

    open ( event ) {

      this._targetInstance.whenUnlocked ( () => this._targetInstance[this.options.methods.open]( this.element, event ) );

    }

  }

  /* FACTORY */

  Factory.make ( Opener, config );

}( Svelto.$, Svelto._, Svelto, Svelto.Widgets, Svelto.Factory, Svelto.Browser, Svelto.Pointer ));
