
/* =========================================================================
 * Svelto - Widgets - Toast
 * =========================================================================
 * Copyright (c) 2015-2016 Fabio Spampinato
 * Licensed under MIT (https://github.com/svelto/svelto/blob/master/LICENSE)
 * =========================================================================
 * @require core/animations/animations.js
 * @require core/colors/colors.js
 * @require core/mouse/mouse.js
 * @require core/sizes/sizes.js
 * @require core/widget/widget.js
 * @require lib/timer/timer.js
 * ========================================================================= */

//TODO: Add support for icon other than image
//TODO: Add support for dismissing a toast that contains only one button
//TODO: Add better support for swipe to dismiss
//FIXME: Widgetize the toast, we may add some widgets inside of it

(function ( $, _, Svelto, Widgets, Factory, Pointer, Mouse, Timer, Animations, Colors, Sizes ) {

  'use strict';

  /* VARIABLES */

  let openNotiesData = {};

  /* CONFIG */

  let config = {
    name: 'toast',
    plugin: true,
    selector: '.toast',
    templates: {
      base: '<div class="toast {%=o.type%} {%=o.color%} {%=(o.type !== "action" ? "actionable" : "")%} {%=o.css%}">' +
              `<div class="infobar ${Colors.transparent}">` +
                '{% if ( o.img ) { %}' +
                  '<img src="{%=o.img%}" class="toast-img infobar-left">' +
                '{% } %}' +
                '{% if ( o.title || o.body ) { %}' +
                  '<div class="infobar-center">' +
                    '{% if ( o.title ) { %}' +
                      '<p class="infobar-title">' +
                         '{%#o.title%}' +
                       '</p>' +
                    '{% } %}' +
                    '{% if ( o.body ) { %}' +
                      '{%#o.body%}' +
                    '{% } %}' +
                  '</div>' +
                '{% } %}' +
                '{% if ( o.buttons.length === 1 ) { %}' +
                  '<div class="infobar-right">' +
                    '{% include ( "toast.button", o.buttons[0] ); %}' +
                  '</div>' +
                '{% } %}' +
              '</div>' +
              '{% if ( o.buttons.length > 1 ) { %}' +
                '<div class="toast-buttons multiple center-x">' +
                  '{% for ( var i = 0; i < o.buttons.length; i++ ) { %}' +
                    '{% include ( "toast.button", o.buttons[i] ); %}' +
                  '{% } %}' +
                '</div>' +
              '{% } %}' +
            '</div>',
      button: `<div class="button {%=(o.color || "${Colors.white}")%} {%=(o.size || "${Sizes.small}")%} {%=(o.css || "")%}">` +
                '{%#(o.text || "")%}' +
              '</div>'
    },
    options: {
      anchor: { // Used for selecting the proper queue where this Toast should be attached
        x: 'left',
        y: 'bottom'
      },
      title: false,
      body: false,
      img: false,
      buttons: [],
      /*
             : [{
                color: Colors.white,
                size: Sizes.small,
                css: '',
                text: '',
                onClick: _.noop // If it returns `false` the Toast won't be closed
             }],
      */
      type: 'alert',
      color: Colors.black,
      css: '',
      persistent: false, // Wether it should survive a change of page or not. Needed when used in frameworks like Meteor
      autoplay: true,
      ttl: 3500,
      ttlMinimumRemaining: 1000, // Auto-closing will be stopped on hover and started again on leave, with a remaining time of `Math.min ( what the remaining time was, this option )`;
      classes: {
        open: 'open'
      },
      selectors: {
        queues: '.toast-queues',
        queue: '.toast-queue',
        button: '.toast-buttons .button, .infobar-right .button'
      },
      animations: {
        open: Animations.normal,
        close: Animations.normal
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

  /* TOAST */

  class Toast extends Widgets.Widget {

    /* SPECIAL */

    static ready () {

      $('.layout, body').first ().append ( // `body` is used as a fallback
        '<div class="toast-queues top">' +
          '<div class="toast-queue expanded"></div>' +
          '<div class="toast-queues-row">' +
            '<div class="toast-queue left"></div>' +
            '<div class="toast-queue center"></div>' +
            '<div class="toast-queue right"></div>' +
          '</div>' +
        '</div>' +
        '<div class="toast-queues bottom">' +
          '<div class="toast-queues-row">' +
            '<div class="toast-queue left"></div>' +
            '<div class="toast-queue center"></div>' +
            '<div class="toast-queue right"></div>' +
          '</div>' +
          '<div class="toast-queue expanded"></div>' +
        '</div>'
      );

    }

    _variables () {

      this.$toast = this.$element;
      this.$buttons = this.$toast.find ( this.options.selectors.button );

      this.timer = false;
      this._openUrl = false;

      this._isOpen = this.$toast.hasClass ( this.options.classes.open );

    }

    _init () {

      if ( this._isOpen ) {

        this.___timer ();
        this.___tap ();
        this.___flick ();
        this.___buttonTap ();
        this.___hover ();
        this.___persistent ();
        this.___keydown ();
        this.___breakpoint ();

      } else if ( this.options.autoplay ) {

        this.open ();

      }

    }

    /* PRIVATE */

    _getUrl () {

      return window.location.href.split ( '#' )[0];

    }

    /* TIMER */

    ___timer () {

      if ( this.options.type !== 'action' && _.isNumber ( this.options.ttl ) && !_.isNaN ( this.options.ttl ) && this.options.ttl !== Infinity ) {

        if ( !this.timer ) {

          this.timer = new Timer ( this.close.bind ( this ), this.options.ttl, true );

        } else {

          this.timer.reset ();

        }

        openNotiesData[this.guid] = [this.timer, this.options.ttlMinimumRemaining];

      }

    }

    /* TAP */

    ___tap () {

      if ( this.options.type !== 'action' ) {

        this._on ( Pointer.tap, this.__tap );

      }

    }

    __tap ( event ) {

      event.preventDefault (); // Otherwise the click goes through the toast in Chrome for iOS

      this.close ();

    }

    /* BUTTON TAP */

    ___buttonTap () {

      this._on ( this.$buttons, Pointer.tap, this.__buttonTap );

    }

    __buttonTap ( event, data ) {

      let $button = $(event.target),
          index = this.$buttons.index ( $button ),
          buttonObj = this.options.buttons[index];

      if ( buttonObj.onClick ) {

        if ( buttonObj.onClick.apply ( $button[0], [event, data] ) === false ) return;

      }

      this.close ();

    }

    /* HOVER */

    ___hover () {

      this.$toast.hover ( function () {

        _.forOwn ( openNotiesData, data => data[0].pause () );

      }, function () {

        _.forOwn ( openNotiesData, data => data[0].remaining ( Math.max ( data[1], data[0].remaining () ) ).play () );

      });

    }

    /* FLICK */

    ___flick () {

      if ( this.options.type !== 'action' ) {

        this.$toast.flickable ({
          callbacks: {
            flick: this.__flick.bind ( this )
          }
        });

      }

    }

    __flick ( event, data ) {

      if ( data.orientation === 'horizontal' ) {

        this.close ();

      }

    }

    /* PERSISTENT */

    ___persistent () {

      if ( !this.options.persistent ) {

        this.___route ();

      }

    }

    __route () {

      let currentUrl = this._getUrl ();

      if ( this._openUrl && this._openUrl !== currentUrl ) {

        this.close ();

      }

    }

    /* RESET */

    _reset () {

      /* TIMER */

      delete openNotiesData[this.guid];

      /* FLICK */

      this.$toast.flickable ( 'destroy' );

      /* SUPER */

      super._reset ();

    }

    /* API */

    isOpen () {

      return this._isOpen;

    }

    open () {

      if ( this._lock || this._isOpen ) return;

      this._lock = true;
      this._isOpen = true;

      this._frame ( function () {

        $(this.options.selectors.queues + '.' + this.options.anchor.y + ' ' + this.options.selectors.queue + '.' + this.options.anchor.x).append ( this.$toast );

        this._frame ( function () {

          this.$toast.addClass ( this.options.classes.open );

          this._lock = false;

          this._trigger ( 'open' );

        });

      });

      this.___timer ();
      this.___tap ();
      this.___flick ();
      this.___buttonTap ();
      this.___hover ();
      this.___persistent ();
      this.___keydown ();
      this.___breakpoint ();

      this._defer ( function () {

        this._openUrl = this._getUrl ();

      });

    }

    close () {

      if ( this._lock || !this._isOpen ) return;

      this._lock = true;
      this._isOpen = false;
      this._openUrl = false;

      this._frame ( function () {

        this.$toast.removeClass ( this.options.classes.open );

        this._delay ( function () {

          this.$toast.remove ();

          this._lock = false;

          this._trigger ( 'close' );

        }, this.options.animations.close );

      });

      this._reset ();

    }

  }

  /* FACTORY */

  Factory.init ( Toast, config, Widgets );

}( Svelto.$, Svelto._, Svelto, Svelto.Widgets, Svelto.Factory, Svelto.Pointer, Svelto.Mouse, Svelto.Timer, Svelto.Animations, Svelto.Colors, Svelto.Sizes ));
