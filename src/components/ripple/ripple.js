
/* ======================================================================================
 * @PROJECT-NAME v@PROJECT-VERSION - @FILE-NAME-UPPERCASED v0.1.0
 * @PROJECT-REPOSITORY-URL/@PROJECT-BRANCH/@FILE-PATH
 * @PROJECT-WEBSITE/@FILE-NAME
 * ======================================================================================
 * Copyright @PROJECT-START-YEAR-@CURRENT-YEAR @PROJECT-COPYRIGHT-HOLDER
 * Licensed under @PROJECT-LICENSE-NAME (@PROJECT-REPOSITORY-URL/@PROJECT-BRANCH/@PROJECT-LICENSE-FILE-PATH)
 * ======================================================================================
 * @requires ../core/core.js
 * ====================================================================================== */

;(function ( $, _, window, document, undefined ) {

    'use strict';

    /* RIPPLE */

    var Ripple = {

        delay: {
            show: 350,
            hide: 400
        },

        show: function ( event, $element ) {

            var $ripple = $( '<div class="ripple-circle"></div>' ).appendTo ( $element ),
                offset = $element.offset (),
                eventXY = $.eventXY ( event ),
                now = _.now ();

            $ripple.css ({
                top: eventXY.Y - offset.top,
                left: eventXY.X - offset.left
            }).addClass ( 'ripple-circle-show' );

            $element.on ( 'mouseup mouseleave', function () {

                Ripple.hide ( $ripple, now );

            });

        },

        hide: function ( $ripple, before ) {

            var delay = Math.max ( 0, Ripple.delay.show + before - _.now () );

            setTimeout ( function () {

                $ripple.addClass ( 'ripple-circle-hide' );

                setTimeout ( function () {

                    $ripple.remove ();

                }, Ripple.delay.hide );

            }, delay );

        }
    };

    /* READY */

    $(function () {

        $body.on ( 'mousedown', '.ripple', function ( event ) {

            if ( event.button === $.ui.mouseButton.RIGHT ) return;

            Ripple.show ( event, $(this) );

        });

    });

}( jQuery, _, window, document ));
