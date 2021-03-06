
// @require core/widget/widget.js

//FIXME: Reposition the draggable properly when autoscrolling inside a container (not document/html)
//FIXME: On iOS, if the draggable is too close to the left edge of the screen dragging it will cause a `scroll to go back` event/animation on safari

(function ( $, _, Svelto, Factory, Animations, Browser, Pointer, Mouse ) {

  /* CONFIG */

  let config = {
    name: 'draggable',
    plugin: true,
    selector: '.draggable',
    options: {
      draggable: _.true, // Checks if we can drag it or not
      multitouch: { // Multitouch-related options
        enabled: false // Whether to abort on multitouch events or not
      },
      threshold: { // Minimum moving threshold for triggering a drag. They can also be functions that return the threshold
        touch () { // Enabled on touch events
          return this.options.axis ? 0 : 5; // If an axis is specified we disable the threshold, in order to enable scrolling
        },
        mouse: 0 // Enabled on mouse events
      },
      tolerance: { // If an axis is set, the draggable didn't move yet, and we drag by more than tolerance in the wrong axis we won't be able to drag it anymore. They can also be functions that return the tolerance
        touch: 0, // Enabled on touch events, it should be 0 since we want to black any scrolling from happeing
        mouse: 5 // Enabled on mouse events
      },
      onlyHandlers: false, // Only an handler can drag it around
      revert: false, // On dragend take it back to the starting position
      axis: false, // Limit the movements to this axis
      $helper: false, // An element to drag around instead of the draggable, can be `false` (in case the draggable will be dragged), a jQuery object or a function yiedling a jQuery object
      proxy: {
        $element: false, // Drag the element also when we are triggering a drag from this element
        noMotion: true // If enabled even if there's no motion the proxied draggable will get positionated to the dragend point event (e.g. just a tap)
      },
      constrainer: { // Constrain the drag inside the $element
        $element: false, // If we want to keep the draggable inside this $element
        center: false, // Set the constrain type, it will constrain the whole shape, or the center
        tolerance: { // The amount of pixel flexibility that a constrainer has
          x: 0,
          y: 0
        }
      },
      modifiers: { // It can modify the setted X and Y translation values
        x: _.true,
        y: _.true
      },
      scroll: { // Autoscroll the window when near the border
        active: false, // Active it or not
        speed: 20, // The amount of autoscroll
        sensitivity: 50 // How close it should be to tbe borders
      },
      classes: {
        dragging: 'draggable-dragging',
        reverting: 'draggable-reverting'
      },
      selectors: {
        handler: '.draggable-handler'
      },
      animations: {
        revert: Animations.fast
      },
      callbacks: {
        start: _.noop,
        move: _.noop,
        end: _.noop
      }
    }
  };

  /* DRAGGABLE */

  class Draggable extends Svelto.Widget {

    /* SPECIAL */

    _variables () {

      this.draggable = this.element;
      this.$draggable = this.$element;
      this.$movable = this.$draggable;

      this.$handlers = this.options.onlyHandlers ? this.$draggable.find ( this.options.selectors.handler ) : this.$draggable;

      this.__doMove = this._frames ( this.__doMove.bind ( this ) ); // For performance reasons

    }

    _events () {

      this.___down ();
      this.___proxy ();

    }

    /* UTILITIES */

    _getThreshold () {

      let threshold = this.isTouch ? this.options.threshold.touch : this.options.threshold.mouse;

      return _.isFunction ( threshold ) ? threshold.call ( this ) : threshold;

    }

    _getTolerance () {

      let tolerance = this.isTouch ? this.options.tolerance.touch : this.options.tolerance.mouse;

      return _.isFunction ( tolerance ) ? tolerance.call ( this ) : tolerance;

    }

    /* DOWN */

    ___down () {

      this._on ( this.$handlers, Pointer.down, this.__down );

    }

    /* PROXY */

    ___proxy () {

      if ( this.options.proxy.$element ) {

        this._on ( this.options.proxy.$element, Pointer.down, this.__down );

      }

    }

    /* ACTIONS */

    _centerToPoint ( XY, suppressClasses ) {

      let offset = this.$movable.offset (),
          rect = this.$movable.getRect (),
          deltaXY = {
            x: XY.x - ( offset.left + ( rect.width / 2 ) ),
            y: XY.y - ( offset.top + ( rect.height / 2 ) )
          };

      return this._actionMove ( deltaXY, suppressClasses );

    }

    _actionMove ( deltaXY, suppressClasses ) {

      /* INITIAL */

      this.initialXY = this.initialXY || this.$movable.translate ();

      /* INIT */

      if ( !this.inited ) {

        this.inited = true;

        /* CLAMPING VALUES */

        if ( this.options.constrainer.$element ) {

          let constrainerRect = this.options.constrainer.$element.getRect (),
              movableRect = this.$movable.getRect ();

          if ( this.options.axis !== 'y' ) {

            let halfWidth = this.options.constrainer.center ? movableRect.width / 2 : 0;

            this.translateX_min = constrainerRect.left - ( movableRect.left - this.initialXY.x ) - halfWidth;
            this.translateX_max = constrainerRect.left + constrainerRect.width - ( ( movableRect.left - this.initialXY.x ) + movableRect.width ) + halfWidth;

          }

          if ( this.options.axis !== 'x' ) {

            let halfHeight = this.options.constrainer.center ? movableRect.height / 2 : 0;

            this.translateY_min = constrainerRect.top - ( movableRect.top - this.initialXY.y ) - halfHeight;
            this.translateY_max = constrainerRect.top + constrainerRect.height - ( ( movableRect.top - this.initialXY.y ) + movableRect.height ) + halfHeight;

          }

        }

        /* CLASSES */

        if ( !suppressClasses ) {

          this._addClasses ();

        }

      }

      /* CLAMPING */

      let translateX = this.initialXY.x,
          translateY = this.initialXY.y;

      if ( this.options.axis !== 'y' ) {

        translateX += deltaXY.x;

        if ( this.options.constrainer.$element ) {

          translateX = _.clamp ( translateX, this.translateX_min - this.options.constrainer.tolerance.x, this.translateX_max + this.options.constrainer.tolerance.x );

        }

      }

      if ( this.options.axis !== 'x' ) {

        translateY += deltaXY.y;

        if ( this.options.constrainer.$element ) {

          translateY = _.clamp ( translateY, this.translateY_min - this.options.constrainer.tolerance.y, this.translateY_max + this.options.constrainer.tolerance.y );

        }

      }

      /* MODIFYING */

      let modifiedXY = {
            x: this.options.axis !== 'y' ? this.options.modifiers.x ( translateX ) : false,
            y: this.options.axis !== 'x' ? this.options.modifiers.y ( translateY ) : false
          };

      /* ABORTION */

      if ( modifiedXY.x === false && modifiedXY.y === false ) return this.initialXY;

      /* SETTING */

      let endXY = {
        x: _.isBoolean ( modifiedXY.x ) ? ( modifiedXY.x ? translateX : this.initialXY.x ) : modifiedXY.x,
        y: _.isBoolean ( modifiedXY.y ) ? ( modifiedXY.y ? translateY : this.initialXY.y ) : modifiedXY.y
      };

      this.$movable.translate ( endXY.x, endXY.y );

      /* MOTION */

      this.motion = true;

      /* RETURNING */

      return endXY;

    }

    /* CLASSES */

    _toggleClasses ( force ) {

      this.$layout.toggleClass ( this.options.classes.layout.priorityZIndex, force );
      this.$movable.toggleClass ( this.options.classes.dragging, force ).toggleClass ( this.options.classes.priorityZIndex, force );

    }

    _addClasses () {

      this._toggleClasses ( true );

    }

    _removeClasses () {

      this._toggleClasses ( false );

    }

    /* HELPER */

    _getHelper ( $draggable ) {

      return _.isFunction ( this.options.$helper )
               ? this.options.$helper ( $draggable )
               : this.options.$helper instanceof $ && this.options.$helper.length
                 ? this.options.$helper
                 : false;

    }

    _initHelper () {

      this.$helper.appendTo ( this.$layout );

    }

    _destroyHelper () {

      this.$helper.remove ();

    }

    /* AUTOSCROLL */

    _autoscroll ( pointXY ) {

      if ( !this.options.scroll.active ) return;

      if ( !this.scrollInited ) {

        this.$scrollParent = this.$movable.scrollParent ();
        this.scrollParent = this.$scrollParent[0];

        this.scrollParentIsDocument = ( this.scrollParent === document || this.scrollParent.tagName === 'HTML' );

        this.scrollInited = true;

      }

      // Logic taken from jQuery UI

  		if ( this.scrollParentIsDocument ) {

  			if ( this.options.axis !== 'x' ) {

          let scrollTop = $.document.scrollTop;

  				if ( pointXY.y - scrollTop <= this.options.scroll.sensitivity ) {

          	$.document.scrollTop = scrollTop - this.options.scroll.speed;

          } else if ( $.window.innerHeight - ( pointXY.y - scrollTop ) <= this.options.scroll.sensitivity ) {

          	$.document.scrollTop = scrollTop + this.options.scroll.speed;

          }

  			}

  			if ( this.options.axis !== 'y' ) {

          let scrollLeft = $.document.scrollLeft;

  				if ( pointXY.x - scrollLeft <= this.options.scroll.sensitivity ) {

          	$.document.scrollLeft = scrollLeft - this.options.scroll.speed;

          } else if ( $.window.innerWidth - ( pointXY.x - scrollLeft ) <= this.options.scroll.sensitivity ) {

          	$.document.scrollLeft = scrollLeft + this.options.scroll.speed;

          }

  			}

  		} else {

        let parentOffset = this.$scrollParent.offset ();

  			if ( this.options.axis !== 'x' ) {

  				if ( ( parentOffset.top + this.scrollParent.offsetHeight ) - pointXY.y <= this.options.scroll.sensitivity ) {

  					this.scrollParent.scrollTop += this.options.scroll.speed;

  				} else if ( pointXY.y - parentOffset.top <= this.options.scroll.sensitivity ) {

  					this.scrollParent.scrollTop -= this.options.scroll.speed;

  				}

  			}

  			if ( this.options.axis !== 'y' ) {

  				if ( ( parentOffset.left + this.scrollParent.offsetWidth ) - pointXY.x <= this.options.scroll.sensitivity ) {

  					this.scrollParent.scrollLeft += this.options.scroll.speed;

  				} else if ( pointXY.x - parentOffset.left <= this.options.scroll.sensitivity ) {

  					this.scrollParent.scrollLeft -= this.options.scroll.speed;

  				}

  			}

  		}

    }

    /* REVERT */

    _revert () {

      this.lock ();

      this._frame ( function () {

        this.$movable.addClass ( this.options.classes.reverting );

        this._frame ( function () {

          this.$movable.translate ( this.initialXY.x, this.initialXY.y );

          this._delay ( function () {

            this.$movable.removeClass ( this.options.classes.reverting );

            if ( this.$helper ) {

              this._destroyHelper ();

            }

            this.unlock ();

          }, this.options.animations.revert );

        });

      });

    }

    /* CLICK */

    __click ( event ) {

      if ( !this.motion ) return;

      event.preventDefault ();
      event.stopImmediatePropagation ();

    }

    /* DRAG START */

    __dragStart ( event ) { // We have to catch it or dragging `img`s on Firefox won't work reliably

      event.preventDefault ();
      event.stopImmediatePropagation ();

    }

    /* DRAG HANDLERS */

    __down ( event ) {

      if ( this.isLocked () || !this.options.draggable ( this ) || Mouse.hasButton ( event, Mouse.buttons.RIGHT ) ) return;

      if ( this.__isAbortable ( event ) ) return this.__abort ( event );

      event.stopImmediatePropagation ();

      this.inited = false;
      this.motion = false;
      this.skippable = true;
      this.scrollInited = false;
      this.ended = false;

      this.$helper = this._getHelper ( this.$draggable );
      this.helper = this.$helper ? this.$helper[0] : false;

      this.$movable = ( this.$helper || this.$draggable );

      this.startEvent = event;
      this.startXY = $.eventXY ( event );

      this.isProxyed = ( this.options.proxy.$element && event.currentTarget === this.options.proxy.$element[0] );

      this.initialXY = false;

      this._trigger ( 'start', { draggable: this.draggable, helper: this.helper, isProxyed: this.isProxyed, startEvent: this.startEvent, startXY: this.startXY } );

      this._on ( true, $.$document, Pointer.move, this.__move );
      this._one ( true, $.$document, Pointer.up, this.__up );
      this._one ( true, $.$document, Pointer.cancel, this.__cancel );
      this._one ( true, Pointer.click, this.__click );
      this._one ( true, $.$document, 'dragstart', this.__dragStart );

    }

    __move ( event ) {

      if ( this.__isAbortable ( event ) ) return this.__abort ( event );

      this.moveEvent = event;
      this.moveXY = $.eventXY ( event ),
      this.deltaXY = {
        x: this.moveXY.x - this.startXY.x,
        y: this.moveXY.y - this.startXY.y
      };

      if ( this.skippable ) {

        this.isTouch = Pointer.isTouchEvent ( event );

        let x = Math.abs ( this.deltaXY.x ),
            y = Math.abs ( this.deltaXY.y );

        /* TOLERANCE */

        if ( this.options.axis ) {

          let tolerance = this._getTolerance (),
              exceeded = ( this.options.axis === 'x' && y > tolerance && y > x ) || ( this.options.axis === 'y' && x > tolerance && x > y );

          if ( exceeded ) return this._off ( $.$document, Pointer.move, this.__move );

        }

        /* THRESHOLD */

        let threshold = this._getThreshold ();

        switch ( this.options.axis ) {
          case 'x':
            if ( x < threshold ) return;
            break;
          case 'y':
            if ( y < threshold ) return;
            break;
          default:
            if ( x < threshold && y < threshold ) return;
            break;
        }

        this.skippable = false;

      }

      event.preventDefault ();
      event.stopImmediatePropagation ();

      this.__doMove ();

    }

    __doMove () {

      if ( this.ended ) return;

      if ( !this.inited ) {

        if ( this.$helper ) {

          this._initHelper ();

        }

        if ( this.$helper || this.isProxyed ) {

          this.initialXY = this._centerToPoint ( this.startXY );

        }

      }

      let dragXY = this._actionMove ( this.deltaXY );

      this._autoscroll ( this.moveXY );

      this._trigger ( 'move', { draggable: this.draggable, helper: this.helper,isProxyed: this.isProxyed, initialXY: this.initialXY, startEvent: this.startEvent, startXY: this.startXY, moveEvent: this.moveEvent, moveXY: this.moveXY, dragXY: dragXY } );

    }

    __up ( event ) {

      event.preventDefault ();
      event.stopImmediatePropagation ();

      this.ended = true;

      let endXY = $.eventXY ( event ),
          dragXY = this.initialXY;

      if ( this.inited ) {

        this._removeClasses ();

      }

      if ( this.motion ) {

        if ( this.options.revert ) {

          this._revert ();

        } else if ( this.$helper ) {

          this._destroyHelper ();

        } else {

          dragXY = this.$movable.translate ();

        }

      } else if ( this.isProxyed && !this.$helper ) {

        if ( ( _.isFunction ( this.options.proxy.noMotion ) ? this.options.proxy.noMotion () : this.options.proxy.noMotion ) && Mouse.hasButton ( event, Mouse.buttons.LEFT, true ) ) {

          dragXY = this._centerToPoint ( endXY, true );

        }

      }

      this._off ( $.$document, Pointer.move, this.__move );
      this._off ( $.$document, Pointer.cancel, this.__cancel );
      this._off ( $.$document, 'dragstart', this.__dragStart );

      if ( this.startEvent.target !== event.target ) this._off ( Pointer.click, this.__click );

      this._trigger ( 'end', { draggable: this.draggable, helper: this.helper, isProxyed: this.isProxyed, initialXY: this.initialXY, startEvent: this.startEvent, startXY: this.startXY, endEvent: event, endXY: endXY, dragXY: dragXY, motion: this.motion } );

    }

    __cancel ( event ) {

      event.stopImmediatePropagation ();

      this.ended = true;

      let endXY = $.eventXY ( event ),
          dragXY = this.$movable.translate ();

      if ( this.inited ) {

        this._removeClasses ();

      }

      if ( this.motion ) {

        if ( this.options.revert ) {

          this._revert ();

          dragXY = this.initialXY;

        } else if ( this.$helper ) {

          this._destroyHelper ();

        }

      }

      this._off ( $.$document, Pointer.move, this.__move );
      this._off ( $.$document, Pointer.up, this.__up );
      this._off ( Pointer.click, this.__click );
      this._off ( $.$document, 'dragstart', this.__dragStart );

      this._trigger ( 'end', { draggable: this.draggable, helper: this.helper, initialXY: this.initialXY, startEvent: this.startEvent, startXY: this.startXY, endEvent: event, endXY: endXY, dragXY: dragXY, motion: this.motion, cancelled: true } );

    }

    __isAbortable ( event ) {

      if ( !this.options.multitouch.enabled ) {

        let originalEvent = event.originalEvent || event;

        if ( 'touches' in originalEvent && originalEvent.touches.length > 1 ) return true;

      }

      return false;

    }

    __abort ( event ) {

      this._off ( $.$document, Pointer.cancel, this.__cancel );

      this.__cancel ( event );

    }

  }

  /* FACTORY */

  Factory.make ( Draggable, config );

}( Svelto.$, Svelto._, Svelto, Svelto.Factory, Svelto.Animations, Svelto.Browser, Svelto.Pointer, Svelto.Mouse ));
