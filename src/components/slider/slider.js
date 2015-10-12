
/* =========================================================================
 * Svelto - Slider v0.2.0
 * =========================================================================
 * Copyright (c) 2015 Fabio Spampinato
 * Licensed under MIT (https://github.com/svelto/svelto/blob/master/LICENSE)
 * =========================================================================
 * @requires ../widget/factory.js
 * @requires ../draggable/draggable.js
 * @requires ../transform/transform.js
 * ========================================================================= */

//TODO: Add vertical slider
//TODO: Make it work without the window resize bind, before we where transforming the transform to a left

;(function ( $, _, window, document, undefined ) {

  'use strict';

  /* SLIDER */

  $.factory ( 'svelto.slider', {

    /* OPTIONS */

    options: {
      min: 0,
      max: 100,
      value: 0,
      step: 1,
      decimals: 0,
      selectors: {
        input: 'input',
        min: '.slider-min',
        max: '.slider-max',
        bar: '.slider-bar',
        unhighlight: '.slider-unhighlight',
        highlight: '.slider-highlight',
        handlerWrp: '.slider-handler-wrp',
        label: '.slider-label'
      },
      callbacks: {
        change: _.noop
      }
    },

    /* SPECIAL */

    _variables: function () {

      this.$slider = this.$element;
      this.$input = this.$slider.find ( this.options.selectors.input );
      this.$min = this.$slider.find ( this.options.selectors.min );
      this.$max = this.$slider.find ( this.options.selectors.max );
      this.$bar = this.$slider.find ( this.options.selectors.bar );
      this.$unhighlight = this.$slider.find ( this.options.selectors.unhighlight );
      this.$highlight = this.$slider.find ( this.options.selectors.highlight );
      this.$handlerWrp = this.$slider.find ( this.options.selectors.handlerWrp );
      this.$label = this.$handlerWrp.find ( this.options.selectors.label );

      this.stepsNr = ( this.options.max - this.options.min ) / this.options.step;

      this._updateVariables ();

    },

    _init: function () {

      this._updatePositions ();

    },

    _events: function () {

      /* INPUT CHANGE */

      this._on ( true, this.$input, 'change', this.__change );

      /* WINDOW RESIZE */

      this._on ( true, $window, 'resize', this.__resize );

      /* KEYDOWN */

      this._onHover ( [$document, 'keydown', this.__keydown] );

      /* MIN / MAX BUTTONS */

      this._on ( this.$min, Pointer.tap, this.decrease );
      this._on ( this.$max, Pointer.tap, this.increase );

      /* DRAG */

      this.$handlerWrp.draggable ({
        draggable: this.isEnabled.bind ( this ),
        axis: 'x',
        $proxy: this.$bar,
        constrainer: {
          $element: this.$bar,
          constrainCenter: true
        },
        modifiers: {
          x: this._dragModifierX.bind ( this )
        },
        callbacks: {
          move: this.__dragMove.bind ( this ),
          end: this.__dragEnd.bind ( this )
        }
      });

    },

    /* PRIVATE */

    _roundValue: function ( value ) {

      return Number ( Number ( value ).toFixed ( this.options.decimals ) );

    },

    _updateVariables: function () {

      this.unhighlightWidth = this.$unhighlight.width ();

      this.stepWidth = this.unhighlightWidth / this.stepsNr;

    },

    _updatePositions: function () {

      var percentage = ( this.options.value - this.options.min ) / this.options.step * 100 / this.stepsNr,
          translateX = this.unhighlightWidth / 100 * percentage;

      this.$handlerWrp.translateX ( translateX );

      this.$highlight.translateX ( translateX );

    },

    _updateLabel: function ( value ) {

      this.$label.html ( _.isUndefined ( value ) ? this.options.value : value );

    },

    _updateInput: function () {

      this.$input.val ( this.options.value ).trigger ( 'change' );

    },

    /* CHANGE */

    __change: function () {

      this.set ( this.$input.val () );

    },

    /* RESIZE */

    __resize: function () {

      this._updateVariables ();
      this._updatePositions ();

    },

    /* LEFT / RIGHT ARROWS */

    __keydown: function ( event ) {

      switch ( event.keyCode ) {

        case $.ui.keyCode.LEFT:
        case $.ui.keyCode.DOWN:
          this.decrease ();
          break;

        case $.ui.keyCode.RIGHT:
        case $.ui.keyCode.UP:
          this.increase ();
          break;

        default:
          return;

      }

      event.preventDefault ();
      event.stopImmediatePropagation ();

    },

    /* DRAG */

    _dragModifierX: function ( distance ) {

      return _.roundCloser ( distance, this.stepWidth );

    },

    __dragMove: function ( data ) {

      this.$highlight.translateX ( data.moveXY.X );

      this._updateLabel ( this._roundValue ( this.options.min + ( data.moveXY.X / this.stepWidth * this.options.step ) ) );

    },

    __dragEnd: function ( data ) {

      this.set ( this.options.min + ( data.endXY.X / this.stepWidth * this.options.step ) );

    },

    /* API */

    get: function () {

      return this.options.value;

    },

    set: function ( value ) {

      value = _.clamp ( this.options.min, this._roundValue ( value ), this.options.max );

      if ( value !== this.options.value ) {

        var prevValue = this.options.value;

        this.options.value = value;

        this._updatePositions ();
        this._updateLabel ();
        this._updateInput ();

        this._trigger ( 'change', {
          previous: prevValue,
          value: this.options.value
        });

      }

    },

    increase: function () {

      this.set ( this.options.value + this.options.step );

    },

    decrease: function () {

      this.set ( this.options.value - this.options.step );

    }

  });

  /* READY */

  $(function () {

    $('.slider').each ( function () {

      var $slider = $(this);

      $slider.slider ({
        min: Number($slider.find ( '.slider-min' ).data ( 'min' ) || 0),
        max: Number($slider.find ( '.slider-max' ).data ( 'max' ) || 100),
        value: Number($slider.find ( 'input' ).val () || 0),
        step: Number($slider.data ( 'step' ) || 1),
        decimals: Number($slider.data ( 'decimals' ) || 0)
      });

    });

  });

}( jQuery, _, window, document ));
