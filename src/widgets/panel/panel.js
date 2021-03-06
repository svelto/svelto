
// @require core/animations/animations.js
// @require lib/directions/directions.js
// @require widgets/autofocusable/autofocusable.js

//FIXME: Multiple open panels (read it: multiple backdrops) are not well supported
//TODO: Replace flickable support with a smooth moving panel, so operate on drag

(function ( $, _, Svelto, Widgets, Factory, Breakpoints, Breakpoint, Pointer, Animations, Directions ) {

  /* CONFIG */

  let config = {
    name: 'panel',
    plugin: true,
    selector: '.panel',
    options: {
      direction: 'left',
      type: 'default', // `default`, `slim`, `fullscreen` (officially supported) or any other implemented type
      pin: false, // If is a valid key of `Breakpoints` it will get auto pinned/unpinned when we are above or below that breakpoint
      flick: {
        open: false,
        close: true,
        threshold: 20 // Amount of pixels close to the window border where the opening flick gesture should be considered intentional
      },
      scroll: {
        disable: true // Disable scroll when the panel is open
      },
      classes: {
        show: 'show',
        open: 'open',
        pinned: 'pinned',
        flickable: 'flickable', // As a side effect it will gain a `Svelto.Flickable` instance, therefor it will also trigger `flickable:flick` events, that are what we want
        backdrop: {
          show: 'panel-backdrop obscured-show obscured',
          open: 'obscured-open',
          pinned: 'panel-backdrop-pinned'
        },
        layout: {
          show: 'panel-layout'
        }
      },
      datas: {
        direction: 'direction',
        type: 'type'
      },
      animations: {
        open: Animations.normal,
        close: Animations.normal
      },
      keystrokes: {
        'esc': '__esc'
      },
      callbacks: {
        beforeopen: _.noop,
        open: _.noop,
        beforeclose: _.noop,
        close: _.noop
      }
    }
  };

  /* PANEL */

  class Panel extends Widgets.Autofocusable {

    /* SPECIAL */

    _variables () {

      this.$panel = this.$element;
      this.panel = this.element;

      this.$backdrop = $.$html;

      this.options.direction = Directions.get ().find ( direction => this.$panel.hasClass ( direction ) ) || this.options.direction;
      this.options.flick.open = this.options.flick.open || this.$panel.hasClass ( this.options.classes.flickable );

      if ( this.options.pin ) {

        _.merge ( this.options.breakpoints, {
          up: {
            [this.options.pin]: '_autopin',
          },
          down: {
            [this.options.pin]: '_autounpin'
          }
        });

      }

      this._isOpen = this.$panel.hasClass ( this.options.classes.open );
      this._isPinned = this.$panel.hasClass ( this.options.classes.pinned );

      this.options.type = this.$panel.data ( this.options.datas.type ) || this.options.type;

      this.layoutPinnedClass = Widgets.Panel.config.name + '-' + this.options.type + '-' + this.options.classes.pinned + '-' + this.options.direction;

    }

    _events () {

      if ( this._isOpen ) {

        this.___breakpoint ();
        this.___tap ();
        this.___keydown ();
        this.___panelFlick ();
        this.___route ();

      } else {

        this.___layoutFlick ();
        this.___panelFlick ();

      }

      this.__breakpoint ();

    }

    _destroy () {

      this.close ();

    }

    /* TAP */

    ___tap () {

      this._on ( true, $.$html, Pointer.tap, this.__tap );

    }

    __tap ( event ) {

      if ( this.isLocked () || this._isPinned || $.isDefaultPrevented ( event ) || !$.isAttached ( event.target ) || $(event.target).closest ( this.$panel ).length ) return;

      event.preventDefault ();
      event.stopImmediatePropagation ();

      this.close ();

    }

    /* ESC */

    ___keydown () { //TODO: Listen to `keydown` only within the layout, so maybe just if the layout is hovered or focused (right?)

      this._on ( true, $.$document, 'keydown', this.__keydown );

    }

    __esc () {

      if ( this._isPinned ) return null;

      this.close ();

    }

    /* LAYOUT FLICK */

    ___layoutFlick () {

      if ( !this.options.flick.open ) return;

      this.$layout.flickable ();

      this._on ( this.$layout, 'flickable:flick', this.__layoutFlick );

    }

    __layoutFlick ( event, data ) {

      if ( this._isOpen ) return;

      if ( data.direction !== Directions.getOpposite ( this.options.direction ) ) return;

      let layoutOffset = this.$layout.offset ();

      switch ( this.options.direction ) {

        case 'left':
          if ( data.startXY.x - layoutOffset.left > this.options.flick.threshold ) return;
          break;

        case 'right':
          if ( this.$layout.outerWidth () + layoutOffset.left - data.startXY.x > this.options.flick.threshold ) return;
          break;

        case 'top':
          if ( data.startXY.y - layoutOffset.top > this.options.flick.threshold ) return;
          break;

        case 'bottom':
          if ( this.$layout.outerHeight () + layoutOffset.top - data.startXY.y > this.options.flick.threshold ) return;
          break;

      }

      event.preventDefault ();
      event.stopImmediatePropagation ();

      this.open ();

    }

    /* PANEL FLICK */

    ___panelFlick () {

      if ( !this.options.flick.close ) return;

      this.$panel.flickable ();

      this._on ( true, 'flickable:flick', this.__panelFlick );

    }

    __panelFlick ( event, data ) {

      if ( !this._isOpen ) return;

      if ( data.direction !== this.options.direction ) return;

      event.preventDefault ();
      event.stopImmediatePropagation ();

      this.close ();

    }

    /* ROUTE */

    __route () {

      if ( this._isOpen && !$.isAttached ( this.panel ) ) {

        this.close ();

      }

    }

    /* AUTO PINNING */

    _autopin () {

      if ( this._isPinned ) return;

      this._wasAutoOpened = !this._isOpen;

      this.pin ();

    }

    _autounpin () {

      if ( !this._isPinned ) return;

      this[this._wasAutoOpened ? 'close' : 'unpin']();

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

      this._trigger ( 'beforeopen' );

      if ( !this._isPinned ) {

        if ( this.options.pin && Breakpoints.widths[Breakpoint.current] >= Breakpoints.widths[this.options.pin] ) {

          this.pin ();

        } else if ( this.options.scroll.disable ) {

          this.$layout.disableScroll ();

        }

      }

      this._frame ( function () {

        this.$panel.addClass ( this.options.classes.show );
        this.$backdrop.addClass ( this.options.classes.backdrop.show );
        this.$layout.addClass ( this.options.classes.layout.show );

        this._frame ( function () {

          this.$panel.addClass ( this.options.classes.open );
          this.$backdrop.addClass ( this.options.classes.backdrop.open );

          this.autofocus ();

          this.unlock ();

          this._trigger ( 'open' );

        });

      });

      this._reset ();

      this.___breakpoint ();
      this.___tap ();
      this.___keydown ();
      this.___panelFlick ();
      this.___route ();

    }

    close () {

      if ( !this._isOpen ) return null;

      if ( this.isLocked () ) return this.whenUnlocked ( this.close.bind ( this ) );

      this.unpin ();

      this.lock ();

      this._isOpen = false;

      this._trigger ( 'beforeclose' );

      this._frame ( function () {

        this.$panel.removeClass ( this.options.classes.open );
        this.$backdrop.removeClass ( this.options.classes.backdrop.open );

        this._delay ( function () {

          this.$panel.removeClass ( this.options.classes.show );
          this.$backdrop.removeClass ( this.options.classes.backdrop.show );
          this.$layout.removeClass ( this.options.classes.layout.show );

          this.autoblur ();

          if ( this.options.scroll.disable ) this.$layout.enableScroll ();

          this.unlock ();

          this._trigger ( 'close' );

        }, this.options.animations.close );

      });

      this._reset ();

      this.___breakpoint ();
      this.___layoutFlick ();

    }

    /* PINNING */

    isPinned () {

      return this._isPinned;

    }

    togglePin ( force = !this._isPinned ) {

      if ( !!force !== this._isPinned ) {

        this[force ? 'pin' : 'unpin']();

      }

    }

    pin () {

      if ( this._isPinned ) return null;

      if ( this.isLocked () ) return this.whenUnlocked ( this.pin.bind ( this ) );

      this._isPinned = true;

      this.$panel.addClass ( this.options.classes.pinned );

      this.$layout.addClass ( this.layoutPinnedClass );

      this.$backdrop.addClass ( this.options.classes.backdrop.pinned );

      if ( this._isOpen ) {

        this.$layout.enableScroll ();

      } else {

        this.open ();

      }

    }

    unpin () {

      if ( !this._isOpen || !this._isPinned ) return null;

      if ( this.isLocked () ) return this.whenUnlocked ( this.unpin.bind ( this ) );

      this._isPinned = false;

      this.$layout.removeClass ( this.layoutPinnedClass ).disableScroll ();

      this._delay ( function () {

        this.$backdrop.removeClass ( this.options.classes.backdrop.pinned );

        this.$panel.removeClass ( this.options.classes.pinned );

      }, this.options.animations.close );

    }

  }

  /* FACTORY */

  Factory.make ( Panel, config );

}( Svelto.$, Svelto._, Svelto, Svelto.Widgets, Svelto.Factory, Svelto.Breakpoints, Svelto.Breakpoint, Svelto.Pointer, Svelto.Animations, Svelto.Directions ));
