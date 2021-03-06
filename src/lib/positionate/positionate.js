
// @require core/svelto/svelto.js
// @require lib/directions/directions.js
// @require lib/embedded_css/embedded_css.js
// @require lib/transform/transform.js

//FIXME: If the positionable element is less than half of the anchor, and it must be pointed, than the pointer may be not well positionated (expecially if we are not aligning to the center)

(function ( $, _, Svelto, Directions, EmbeddedCSS ) {

  /* DEFAULTS */

  let defaults = {
    axis: false, // Set a preferred axis
    strict: false, // If enabled only use the setted axis/direction, even if it won't be the optimial choice
    $anchor: false, // Positionate next to an $anchor element
    point: false, // Positionate at coordinates, ex: { x: number, y: number }
    pointer: false, // The element pointing to the anchor, can be: false -> no pointer, 'auto' -> pointer using the `pointing` decorator, $element -> element used as pointer
    spacing: 0, // Extra space to leave around the positionable element, number or { x: number, y: number }
    constrainer: { // Constrain the $positionable inside the $element
      $element: false, // If we want to keep the $positionable inside this $element
      center: false, // Set the constrain type, it will constrain the whole shape, or the center
      tolerance: { // The amount of pixel flexibility that a constrainer has
        x: 0,
        y: 0
      }
    },
    dimensions: { // A way to override the measured dimensions when computing the available areas, this allows for positioning elements in a stable manner when their dimensions can vary quickly
      width: 0,
      height: 0
    },
    directions: { // How the directions should be prioritized when selecting the `x` axis, the `y` axis, or all of them
      x: ['right', 'left'],
      y: ['bottom', 'top'],
      all: ['bottom', 'right', 'left', 'top']
    },
    alignment: { // Set the alignment of the positionable relative to the anchor
      x: 'center', // `left`, center`, `right`
      y: 'center' // `top`, center`, `bottom`
    },
    callbacks: {
      change: _.noop
    }
  };

  /* POSITIONATE */

  $.fn.positionate = function ( options ) {

    /* NO ELEMENTS */

    if ( !this.length ) return this;

    /* OPTIONS */

    options = _.merge ( {}, $.fn.positionate.defaults, options );

    /* VARIABLES */

    let positionable = this[0],
        $positionable = $(positionable),
        positionableRect = $positionable.getRect (),
        spacingX = _.isNumber ( options.spacing.x ) ? options.spacing.x : options.spacing || 0,
        spacingY = _.isNumber ( options.spacing.y ) ? options.spacing.y : options.spacing || 0,
        windowWidth = window.innerWidth,
        windowHeight = window.innerHeight,
        directions = _.uniq ( [].concat ( options.direction ? [options.direction] : [], options.axis ? options.directions[options.axis] : [], !options.strict || !options.direction && !options.axis ? options.directions.all : [] ) ),
        anchorRect = options.$anchor ? options.$anchor.getRect () : { top: options.point.y - window.scrollY, bottom: options.point.y - window.scrollY, left: options.point.x - window.scrollX, right: options.point.x - window.scrollX, width: 0, height: 0 },
        constrainerRect = options.constrainer.$element ? options.constrainer.$element.getRect () : null,
        isAnchorInsideConstrainer = !!constrainerRect && ( anchorRect.top >= constrainerRect.top && anchorRect.bottom <= constrainerRect.bottom && anchorRect.left >= constrainerRect.left && anchorRect.right <= constrainerRect.right );

    /* ID */

    positionable._positionateGuid = positionable._positionateGuid || $.guid++;
    positionable._positionateGuc = `positionate-${positionable._positionateGuid}`;

    $positionable.addClass ( positionable._positionateGuc );

    /* SPACES */

    let spaces = directions.map ( direction => {

      switch ( direction ) {

        case 'top':
          return isAnchorInsideConstrainer ? Math.max ( 0, anchorRect.top - constrainerRect.top + options.constrainer.tolerance.y ) : anchorRect.top;

        case 'bottom':
          return isAnchorInsideConstrainer ? Math.max ( 0, constrainerRect.bottom - anchorRect.bottom + options.constrainer.tolerance.y ) : windowHeight - anchorRect.bottom;

        case 'left':
          return isAnchorInsideConstrainer ? Math.max ( 0, anchorRect.left - constrainerRect.left + options.constrainer.tolerance.x ) : anchorRect.left;

        case 'right':
          return isAnchorInsideConstrainer ? Math.max ( 0, constrainerRect.right - anchorRect.right + options.constrainer.tolerance.x ) : windowWidth - anchorRect.right;

      }

    });

    /* SPACES PRIORITIZATION */

    spaces.forEach ( ( space, index ) => {

      if ( space < 0 ) {

        let opposite = Directions.getOpposite ( directions[index] ),
            oppositeIndex = directions.indexOf ( opposite );

        if ( oppositeIndex !== -1 ) {

          _.move ( directions, oppositeIndex, 0 );
          _.move ( spaces, oppositeIndex, 0 );

        }

      }

    });

    /* AREAS */

    let areas = directions.map ( ( direction, index ) => {

      switch ( direction ) {

        case 'top':
        case 'bottom':
          return Math.min ( Math.max ( options.dimensions.height, positionableRect.height ), spaces[index] ) * Math.min ( windowWidth, positionableRect.width );

        case 'left':
        case 'right':
          return Math.min ( Math.max ( options.dimensions.width, positionableRect.width ), spaces[index] ) * Math.min ( windowHeight, positionableRect.height );

      }

    });

    /* BEST DIRECTION */

    let bestIndex = areas.indexOf ( Math.max ( ...areas ) ),
        bestDirection = directions[bestIndex],
        coordinates = {};

    /* TOP / LEFT */

    switch ( bestDirection ) {

      case 'top':
        coordinates.top = anchorRect.top - positionableRect.height - spacingY;
        break;

      case 'bottom':
        coordinates.top = anchorRect.bottom + spacingY;
        break;

      case 'left':
        coordinates.left = anchorRect.left - positionableRect.width - spacingX;
        break;

      case 'right':
        coordinates.left = anchorRect.right + spacingX;
        break;

    }

    switch ( bestDirection ) {

      case 'top':
      case 'bottom':
        switch ( options.alignment.x ) {
          case 'left':
            coordinates.left = anchorRect.left;
            break;
          case 'center':
            coordinates.left = anchorRect.left + ( anchorRect.width / 2 ) - ( positionableRect.width / 2 );
            break;
          case 'right':
            coordinates.left = anchorRect.right - positionableRect.width;
            break;
        }
        break;

      case 'left':
      case 'right':
        switch ( options.alignment.y ) {
          case 'top':
            coordinates.top = anchorRect.top;
            break;
          case 'center':
            coordinates.top = anchorRect.top + ( anchorRect.height / 2 ) - ( positionableRect.height / 2 );
            break;
          case 'bottom':
            coordinates.top = anchorRect.bottom - positionableRect.height;
            break;
        }
        break;

    }

    /* CONSTRAIN */

    if ( options.$anchor ) {

      let oppositeSpace = spaces[bestIndex],
          isExtendedX = anchorRect.top + anchorRect.height >= 0 && anchorRect.top <= windowHeight,
          isExtendedY = anchorRect.left + anchorRect.width >= 0 && anchorRect.left <= windowWidth;

      if ( isExtendedX ) coordinates.top = _.clamp ( coordinates.top, spacingY, windowHeight - positionableRect.height - spacingY );
      if ( isExtendedY ) coordinates.left = _.clamp ( coordinates.left, spacingX, windowWidth - positionableRect.width - spacingX );

    } else if ( options.constrainer.$element && constrainerRect ) {

      let halfWidth = options.constrainer.center ? positionableRect.width / 2 : 0,
          halfHeight = options.constrainer.center ? positionableRect.height / 2 : 0;

      /* COORDINATES */

      coordinates.top = _.clamp ( coordinates.top, constrainerRect.top - halfHeight - options.constrainer.tolerance.y + spacingY, constrainerRect.bottom - positionableRect.height + halfHeight + options.constrainer.tolerance.y - spacingY );
      coordinates.left = _.clamp ( coordinates.left, constrainerRect.left - halfWidth - options.constrainer.tolerance.x + spacingX, constrainerRect.right - positionableRect.width + halfWidth + options.constrainer.tolerance.x - spacingX );

    }

    /* DATAS */

    let data = {
      positionable: positionable,
      coordinates: coordinates,
      direction: bestDirection
    };

    /* TRANSLATE */

    $positionable.translate ( coordinates.left, coordinates.top );

    /* CSS CLASS */

    let prevDirection = positionable._positionatePrevDirection;

    positionable._positionatePrevDirection = bestDirection;

    if ( prevDirection !== bestDirection ) {

      $positionable.removeClass ( `position-${prevDirection}` ).addClass ( `position-${bestDirection}` );

    }

    /* POINTER */

    let prevPointer = positionable._positionatePrevPointer;

    positionable._positionatePrevPointer = options.pointer;

    if ( prevPointer === 'auto' && ( options.pointer !== 'auto' || bestDirection !== prevDirection ) ) {

      let oppositeDirection = Directions.getOpposite ( prevDirection );

      $positionable.removeClass ( `pointing-${oppositeDirection}` );

    }

    if ( options.pointer ) {

      if ( options.pointer === 'auto' ) {

        let oppositeDirection = Directions.getOpposite ( bestDirection );

        $positionable.addClass ( `pointing-${oppositeDirection}` );

      }

      /* MOVING */

      switch ( bestDirection ) {

        case 'top':
        case 'bottom':
          let deltaX = _.clamp ( anchorRect.left - coordinates.left + ( anchorRect.width / 2 ), 0, positionableRect.width );
          if ( options.pointer instanceof $ ) {
            options.pointer.translate ( deltaX, 0 );
          } else if ( options.pointer === 'auto' ) {
            EmbeddedCSS.set ( `.${positionable._positionateGuc}:after`, `left:${deltaX}px !important;` ); //TODO: Maybe use `transform` instead, since it lead to improved performances
          }
          break;

        case 'left':
        case 'right':
          let deltaY = _.clamp ( positionableRect.height, anchorRect.top - coordinates.top + ( anchorRect.height / 2 ), 0, positionableRect.height );
          if ( options.pointer instanceof $ ) {
            options.pointer.translate ( 0, deltaY );
          } else if ( options.pointer === 'auto' ) {
            EmbeddedCSS.set ( `.${positionable._positionateGuc}:after`, `top:${deltaY}px !important;` ); //TODO: Maybe use `transform` instead, since it lead to improved performances
          }
          break;

      }

    }

    /* CALLBACK */

    options.callbacks.change ( data );

    /* RETURN */

    return this;

  };

  /* BINDING */

  $.fn.positionate.defaults = defaults;

}( Svelto.$, Svelto._, Svelto, Svelto.Directions, Svelto.EmbeddedCSS ));
