
/* =========================================================================
 * Svelto - Carousel
 * =========================================================================
 * Copyright (c) 2015-2016 Fabio Spampinato
 * Licensed under MIT (https://github.com/svelto/svelto/blob/master/LICENSE)
 * =========================================================================
 * @requires ../widget/widget.js
 * @requires ../timer/timer.js
 * @requires ../animations/animations.js
 * ========================================================================= */

//TODO: Add slides drag support

(function ( $, _, Svelto, Widgets, Factory, Pointer, Timer, Animations ) {

  'use strict';

  /* CONFIG */

  let config = {
    name: 'carousel',
    plugin: true,
    selector: '.carousel',
    options: {
      startIndex: 0,
      cycle: false,
      interval: 5000,
      intervalMinimumRemaining: 1000,
      classes: {
        prev: 'prev',
        current: 'current'
      },
      selectors: {
        prev: '.carousel-prev',
        next: '.carousel-next',
        indicator: '.carousel-indicator',
        itemsWrp: '.carousel-items',
        item: '.carousel-items > *'
      },
      animations: {
        cycle: Animations.normal
      },
      keystrokes: {
        'left, up': 'previous',
        'right, down, space': 'next'
      },
      callbacks: {
        change: _.noop
      }
    },
  };

  /* CAROUSEL */

  class Carousel extends Widgets.Widget {

    /* SPECIAL */

    _variables () {

      this.$carousel = this.$element;
      this.$prev = this.$carousel.find ( this.options.selectors.prev );
      this.$next = this.$carousel.find ( this.options.selectors.next );
      this.$indicators = this.$carousel.find ( this.options.selectors.indicator );
      this.$itemsWrp = this.$carousel.find ( this.options.selectors.itemsWrp );
      this.$items = this.$carousel.find ( this.options.selectors.item );

      this.maxIndex = this.$items.length - 1;

      this._previous = false;
      this._current = false;

      this.timer = new Timer ( this.next.bind ( this ), this.options.interval, false );

    }

    _init () {

      let $current = this.$items.filter ( '.' + this.options.classes.current ).first ();

      if ( $current.length ) {

        this._current = this._getItemObj ( this.$items.index ( $current ) );

      } else {

        this.set ( this.options.startIndex );

      }

    }

    _events () {

      this.___previousTap ();
      this.___nextTap ();
      this.___indicatorTap ();

      this.___keydown ();
      this.___cycle ();

    }

    _destroy () {

      this.timer.stop ();

    }

    /* PRIVATE */

    _sanitizeIndex ( index ) {

      index = Number ( index );

      return _.isNaN ( index ) ? NaN : _.clamp ( 0, index, this.maxIndex );

    }

    /* PREVIOUS TAP */

    ___previousTap () {

      this._on ( this.$prev, Pointer.tap, this.previous );

    }

    /* NEXT TAP */

    ___nextTap () {

      this._on ( this.$next, Pointer.tap, this.next );

    }

    /* INDICATOR TAP */

    ___indicatorTap () {

      this._on ( this.$indicators, Pointer.tap, this.__indicatorTap );

    }

    __indicatorTap ( event ) {

      this.set ( this.$indicators.index ( event.currentTarget ) );

    }

    /* KEYDOWN */

    ___keydown () {

      this._onHover ( [this.$document, 'keydown', this.__keydown] );

    }

    /* CYCLE */

    ___cycle () {

      this._on ( true, this.$itemsWrp, Pointer.enter, this.__cycleEnter );
      this._on ( true, this.$itemsWrp, Pointer.leave, this.__cycleLeave );

    }

    __cycleEnter () {

      if ( this.options.cycle ) {

        this.timer.pause ();

      }

    }

    __cycleLeave () {

      if ( this.options.cycle ) {

        this.timer.remaining ( Math.max ( this.options.intervalMinimumRemaining, this.timer.remaining () ) );

        this.timer.play ();

      }

    }

    /* ITEM OBJ */

    _getItemObj ( index ) {

      return {
        index: index,
        $item: this.$items.eq ( index ),
        $indicator: this.$indicators.eq ( index )
      };

    }

    /* INDEX */

    _getPrevIndex ( index ) {

      return ( index > 0 ) ? index - 1 : this.maxIndex;

    }

    _getNextIndex ( index ) {

      return ( index < this.maxIndex ) ? index + 1 : 0;

    }

    /* API OVERRIDES */

    enable () {

      super.enable ();

      if ( this.options.cycle || this._wasCycling ) {

        this.play ();

      }

    }

    disable () {

      super.disable ();

      this._wasCycling = this.options.cycle;

      if ( this.options.cycle ) {

        this.stop ();

      }

    }

    /* API */

    get () {

      return this._current.index;

    }

    set ( index ) {

      index = this._sanitizeIndex ( index );

      if ( this._lock || _.isNaN ( index ) || ( this._current && index === this._current.index ) ) return;

      this._lock = true;

      if ( this._current ) {

        this._current.$item.removeClass ( this.options.classes.current ).addClass ( this.options.classes.prev );
        this._current.$indicator.removeClass ( this.options.classes.current );

        this._previous = this._current;

      }

      this._current = this._getItemObj ( index );
      this._current.$item.addClass ( this.options.classes.current );
      this._current.$indicator.addClass ( this.options.classes.current );

      if ( this.options.cycle ) {

        this.timer.stop ();

      }

      this._delay ( function () {

        if ( this._previous ) {

          this._previous.$item.removeClass ( this.options.classes.prev );

        }

        if ( this.options.cycle ) {

          this.timer.play ();

        }

        this._lock = false;

        this._trigger ( 'change' );

      }, this.options.animations.cycle );

    }

    previous () {

      this.set ( this._getPrevIndex ( this._current.index ) );

    }

    next () {

      this.set ( this._getNextIndex ( this._current.index ) );

    }

    /* API TIMER */

    play () {

      this.options.cycle = true;
      this.timer.remaining ( Math.max ( this.options.intervalMinimumRemaining, this.timer.remaining () ) );
      this.timer.play ();

    }

    pause () {

      this.options.cycle = false;
      this.timer.pause ();

    }

    stop () {

      this.options.cycle = false;
      this.timer.stop ();

    }

    reset () {

      this.options.cycle = true;
      this.timer.reset ();

    }

  }

  /* FACTORY */

  Factory.init ( Carousel, config, Widgets );

}( Svelto.$, Svelto._, Svelto, Svelto.Widgets, Svelto.Factory, Svelto.Pointer, Svelto.Timer, Svelto.Animations ));
