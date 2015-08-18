
/* POINTER */

;(function ( $, _, window, document, undefined ) {

    'use strict';

    /* POINTER */

    $.Pointer = {
        pressDuration: 300,
        doubleTapInterval: 300,
        flickDuration: 150,
        motionThreshold: 5
    };

    var events_names = ['tap', 'dbltap', 'press', 'dragstart', 'dragmove', 'dragend', 'flick'],
        events_namespace = 'pointer';

    _.each ( events_names, function ( event_name ) {

        var full_event = events_namespace + event_name;

        $.Pointer[event_name] = full_event;

        $.fn[event_name] = function ( fn ) {

            return fn ? this.on ( full_event, fn ) : this.trigger ( full_event );

        };

    });

    /* TRIGGERS */

    var startEvents = $.browser.hasTouch ? 'touchstart' : 'mousedown',
        moveEvents = $.browser.hasTouch ? 'touchmove' : 'mousemove',
        endEvents = $.browser.hasTouch ? 'touchend touchcancel' : 'mouseup mouseleave',
        $html = $(document.documentElement),
        startXY,
        moveXY,
        deltaXY,
        endXY,
        target,
        $target,
        start_timestamp,
        end_timestamp,
        prev_tap_timestamp = 0,
        motion,
        orientation,
        direction,
        press_timeout;

    var createEvent = function ( name, originalEvent ) {

        var event = $.Event ( name );

        event.originalEvent = originalEvent;
        event.isPointerEvent = true;

        return event;

    };

    var startHandler = function ( event ) {

        startXY = $.eventXY ( event );

        target = event.target;
        $target = $(target);

        start_timestamp = event.timeStamp || _.now ();

        motion = false;

        press_timeout = setTimeout ( pressHandler, $.Pointer.pressDuration );

        $target.trigger ( createEvent ( $.Pointer.dragstart, event ), {
            startXY: startXY
        });

        $html.on ( moveEvents, moveHandler );
        $html.on ( endEvents, endHandler );

    };

    var pressHandler = function () {

        $target.trigger ( createEvent ( $.Pointer.press, event ) );

    };

    var moveHandler = function ( event ) {

        clearTimeout ( press_timeout );

        moveXY = $.eventXY ( event );

        deltaXY = {
            X: moveXY.X - startXY.X,
            Y: moveXY.Y - startXY.Y
        };

        if ( Math.abs ( deltaXY.X ) > $.Pointer.motionThreshold || Math.abs ( deltaXY.Y ) > $.Pointer.motionThreshold ) {

            motion = true;

            $target.trigger ( createEvent ( $.Pointer.dragmove, event ), {
                startXY: startXY,
                moveXY: moveXY,
                deltaXY: deltaXY
            });

        }

    };

    var endHandler = function ( event ) {

        clearTimeout ( press_timeout );

        endXY = $.eventXY ( event );
        deltaXY = {
            X: endXY.X - startXY.X,
            Y: endXY.Y - startXY.Y
        };

        if ( target === event.target ) {

            end_timestamp = event.timeStamp || _.now ();

            if ( !$.browser.hasTouch || !motion ) {

                $target.trigger ( createEvent ( $.Pointer.tap, event ) );

                if ( end_timestamp - prev_tap_timestamp <= $.Pointer.doubleTapInterval ) {

                    $target.trigger ( createEvent ( $.Pointer.dbltap, event ) );

                }

                prev_tap_timestamp = end_timestamp;

            }

            if ( motion && ( end_timestamp - start_timestamp <= $.Pointer.flickDuration ) ) {

                if ( Math.abs ( deltaXY.X ) > Math.abs ( deltaXY.Y ) ) {

                    orientation = 'horizontal';
                    direction = ( deltaXY.X > 0 ) ? 1 : -1;

                } else {

                    orientation = 'vertical';
                    direction = ( deltaXY.Y > 0 ) ? 1 : -1;

                }

                $target.trigger ( createEvent ( $.Pointer.flick, event ), {
                    startXY: startXY,
                    endXY: endXY,
                    deltaXY: deltaXY,
                    orientation: orientation,
                    direction: direction
                });

            }

        }

        $html.off ( moveEvents, moveHandler );
        $html.off ( endEvents, endHandler );

        $target.trigger ( createEvent ( $.Pointer.dragend, event ), {
            startXY: startXY,
            endXY: endXY,
            deltaXY: deltaXY
        });

    };

    $html.on ( startEvents, startHandler );

}( jQuery, _, window, document ));
