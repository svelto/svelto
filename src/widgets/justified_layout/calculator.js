
/* =========================================================================
 * Svelto - Widgets - Justified Layout (Calculator)
 * =========================================================================
 * Copyright (c) 2015-2017 Fabio Spampinato
 * Licensed under MIT (https://github.com/svelto/svelto/blob/master/LICENSE)
 * =========================================================================
 * @require core/svelto/svelto.js
 * ========================================================================= */

//TODO: normal image + ultra-wide image looks bad, we should add the ultra wide one to its own row, and move the other image to the next row ( http://localhost:8888/most/viewed/13)
//TODO: limit ultra portrait images height

(function ( $, _, Svelto ) {

  'use strict';

  /* DEFAULTS */

  let defaults = {
    container: {
      width: 1048,
      padding: {
        top: 0,
        right: 0,
        bottom: 0,
        left: 0
      }
    },
    row: {
      height: 250, // Target row's height
      margin: 5, // Vertical margin between rows
      maxBoxesNr: Infinity, // Maximum number of boxes in the row
      tolerance: {
        min: .85, // Tunes the minimum ratio
        max: 1.85 // Tunes the maximum ratio
      },
      widows: { // Row not completelly filled with boxes
        show: true, // Compute boxes for widows
        average: true, // Set the height to the average of the previous heights
        justify: false, // Set the height so that no space is left unfilled
        previous: false // Set the height to that of the previous row
      }
    },
    box: {
      margin: 5, // Horizontal margin between boxes
      ratio: undefined // Fixed ratio for all boxes
    }
  };

  /* CALCULATOR */

  function calculator ( ratios, options, _needsMerge = true ) {

    if ( !options || _needsMerge ) {

      options = options ? _.merge ( {}, calculator.defaults, options ) : calculator.defaults;

    }

    ratios = options.box.ratio ? _.fill ( Array ( ratios.length ), options.box.ratio ) : ratios;

    let boxes = _.isNumber ( ratios[0] ) ? ratios.map ( ratio => ({ratio}) ) : ratios;

    return makeLayout ( options, boxes );

  }

  /* ROW */

  const row = { //FIXME: It's global-ish, which it's bad, but it's fast

    init ( options, layout ) {

      this.options = options;
      this.layout = layout;
      this.width = this.options.container.width - this.options.container.padding.left - this.options.container.padding.right;
      this.height = 0;
      this.ratio = 0;
      this.left = this.options.container.padding.left;
      this.top = this.layout.height - this.options.container.padding.bottom;
      this.minRatio = this.width / this.options.row.height * this.options.row.tolerance.min;
      this.maxRatio = this.width / this.options.row.height * this.options.row.tolerance.max;
      this.boxesStartIndex = this.layout.boxesIndex;
      this.boxesNr = 0;

      this._complete = false;

    },

    forEachBox ( callback ) {

      let index = 0;

      for ( let i = this.boxesStartIndex, l = this.layout.boxesIndex; i < l; i++ ) {

        callback ( this.layout.boxes[i], index++ );

      }

    },

    _add ( box ) { // Actually add the box

      this.layout.boxes[this.layout.boxesIndex++] = box;

      this.boxesNr++;

      this.ratio += box.ratio;

    },

    add ( box ) {

      let newRatio = this.ratio + box.ratio,
          widthWithoutMargin = this.width - ( this.boxesNr * this.options.row.margin );

      if ( newRatio < this.minRatio ) { // There's enough space for this and probably another box

        this._add ( box );

        if ( this.boxesNr >= this.options.row.maxBoxesNr ) {

          this.complete ( widthWithoutMargin / newRatio );

        }

        return true;

      } else if ( newRatio > this.maxRatio ) { // Maybe there's space for this

        if ( !this.boxesNr ) { // It's the only box, so it's added

          this._add ( box );

          this.complete ( widthWithoutMargin / newRatio );

          return true;

        }

        let prevWidthWithoutMargin = this.width - ( this.boxesNr - 1 ) * this.options.row.margin,
            prevTargetRatio = prevWidthWithoutMargin / this.options.row.height,
            newTargetRatio = widthWithoutMargin / this.options.row.height;

        if ( Math.abs ( newRatio - newTargetRatio ) > Math.abs ( this.ratio - prevTargetRatio ) ) { // The ratio is closer to the ranges without it

          this.complete ( prevWidthWithoutMargin / this.ratio );

          return false;

        } else { // The ratio is clsoer to the ranges with it

          this._add ( box );

          this.complete ( widthWithoutMargin / newRatio );

          return true;

        }

      } else { // Fills perfectly the space

        this._add ( box );

        this.complete ( widthWithoutMargin / newRatio );

        return true;

      }

    },

    isComplete () {

      return this._complete;

    },

    complete ( height = this.options.row.height, isWidows = false ) { // Set metadata on boxes

      this.height = height;

      let boxLeft = this.left;

      this.forEachBox ( box => {

        box.width = box.ratio * this.height;
        box.height = this.height;
        box.top = this.top;
        box.left = boxLeft;

        boxLeft += box.width + this.options.box.margin;

      });

      boxLeft -= ( this.options.box.margin + this.left );

      if ( isWidows && this.options.row.widows.justify ) {

        let errorWidthPerItem = ( this.width - boxLeft ) / this.boxesNr;

        if ( errorWidthPerItem ) {

          this.forEachBox ( ( box, i ) => {

            let currentWidth = ( i + 1 ) * errorWidthPerItem,
                previousWidth = i ? currentWidth - errorWidthPerItem : 0,
                deltaWidth = ( currentWidth - previousWidth ),
                deltaHeight = deltaWidth / box.ratio;

            box.left += previousWidth;
            box.width += deltaWidth;
            box.height += deltaHeight;

            if ( !i ) {
              this.height += deltaHeight;
            }

          });

        }

      }

      this._complete = true;

    }

  };

  /* HELPERS */

  function addRow ( options, layout ) {

    layout.heights[layout.heightsIndex++] = row.height;

    layout.height += row.height + options.row.margin;

  }

  function addRowWidows ( options, layout ) {

    layout.widows = row.boxesNr;

    if ( row.isComplete () || options.row.widows.show ) {

      if ( !row.isComplete () ) {

        let height = options.row.widows.justify || !row.boxesNr
                       ? undefined
                       : options.row.widows.average
                         ? layout.height / layout.heightsIndex
                         : options.row.widows.previous
                           ? layout.heights[layout.heightsIndex - 1]
                           : undefined;

        row.complete ( height, true );

      }

      addRow ( options, layout );

    } else {

      layout.boxesIndex = row.boxesStartIndex;

    }

  }

  function addBox ( options, layout, box ) {

    let added = row.add ( box );

    if ( row.isComplete () ) {

      addRow ( options, layout );

      row.init ( options, layout );

      if ( !added ) addBox ( options, layout, box );

    }

  }

  function makeLayout ( options, boxes ) {

    let layout = {
      width: options.container.width,
      height: options.container.padding.top + options.container.padding.bottom,
      heights: Array ( boxes.length ),
      heightsIndex: 0,
      boxes: Array ( boxes.length ),
      boxesIndex: 0,
      widows: 0
    };

    row.init ( options, layout );

    boxes.forEach ( box => addBox ( options, layout, box ) );

    if ( row.boxesNr ) {
      addRowWidows ( options, layout );
    }

    if ( layout.heightsIndex !== boxes.length ) {
      layout.heights = layout.heights.slice ( 0, layout.heightsIndex );
    }

    if ( layout.boxesIndex !== boxes.length ) {
      layout.boxes = layout.boxes.slice ( 0, layout.boxesIndex );
    }

    if ( layout.heightsIndex ) {
      layout.height -= options.row.margin;
    }

    return layout;

  }

  /* BINDINGS */

  calculator.defaults = defaults;

  /* EXPORT */

  Svelto.justifiedLayoutCalculator = calculator;

}( Svelto.$, Svelto._, Svelto ));