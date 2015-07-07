
/* DROPDOWN */

;(function ( $, window, document, undefined ) {

    'use strict';

    /* VARIABLES */

    var assignments = {};

    /* DROPDOWN */

    $.widget ( 'presto.dropdown', {

        /* OPTIONS */

        options: {
            callbacks: {
                open: $.noop,
                close: $.noop
            }
        },

        /* SPECIAL */

        _create: function () {

            this.id = this.$element.attr ( 'id' );
            this.$top_tip = this.$element.find ( '.top-tip' );
            this.$right_tip = this.$element.find ( '.right-tip' );
            this.$bottom_tip = this.$element.find ( '.bottom-tip' );
            this.$left_tip = this.$element.find ( '.left-tip' );
            this.$actionables = this.$element.find ( '.actionable' );

            this.$triggers = $('.dropdown-trigger[data-dropdown="' + this.id + '"]');

            this.opened = false;

            this._bind_trigger_click ();
            this._bind_actionable_click ();
//          this.$btn_parents.on ( 'scroll', this.update ); //If we are doing it into a scrollable content it will be a problem if we don't handle it, the dropdown will not move

        },

        /* TRIGGER CLICK */

        _bind_trigger_click: function () {

            this._on ( this.$triggers, 'click', this.toggle );

        },

        /* ACTIONABLE CLICK */

        _bind_actionable_click: function () {

            this._on ( this.$actionables, 'click', this.close );

        },

        /* WINDOW RESIZE / SCROLL */

        _bind_window_resize_scroll: function () {

            this._on ( $window, 'resize scroll', this.update );

        },

        _unbind_window_resize_scroll: function () {

            this._off ( $window, 'resize scroll', this.update );

        },

        /* WINDOW CLICK */

        _bind_window_click: function () {

            this._on ( $window, 'click', this._handler_window_click );

        },

        _unbind_window_click: function () {

            this._off ( $window, 'click', this._handler_window_click );

        },

        _handler_window_click: function ( event ) {

            var $parents = $(event.target).parents ();

            if ( $parents.index ( this.$element ) === -1 ) { //INFO: Checking if we clicked inside the dropdown

                this.close ();

            }

        },

        /* POSITIONATE */

        _positionate: function () {

            // Variables

            var $trigger = $(assignments[this.id]),
                no_tip = $trigger.hasClass ( 'no-tip' ) || this.$element.hasClass ( 'no-tip' );

            // Reset classes

            $trigger.removeClass ( 'top bottom left right' );
            this.$element.removeClass ( 'top bottom left right' ).toggleClass ( 'no-tip', no_tip );

            // update offsets

            var body_offset = $body.offset (),
                drop_offset = this.$element.offset (),
                trig_offset = $trigger.offset ();

            // common variables

            var trig_center_top = trig_offset.top + ( trig_offset.height / 2 ),
                trig_center_left = trig_offset.left + ( trig_offset.width / 2 );

            var bottom_space = body_offset.height - trig_offset.top - trig_offset.height,
                top_space = trig_offset.top,
                right_space = body_offset.width - trig_offset.left - trig_offset.width,
                left_space = trig_offset.left;

            var useful_doc_width = Math.min ( body_offset.width, drop_offset.width ),
                useful_doc_height = Math.min ( body_offset.height, drop_offset.height );
console.log("useful_doc_width: ", useful_doc_width);
console.log("useful_doc_height: ", useful_doc_height);
            var areas = {
                bottom: Math.min ( bottom_space, drop_offset.height ) * useful_doc_width,
                top: Math.min ( top_space, drop_offset.height ) * useful_doc_width,
                right: Math.min ( right_space, drop_offset.width ) * useful_doc_height,
                left: Math.min ( left_space, drop_offset.width ) * useful_doc_height
            };

            var needed_area = drop_offset.width * drop_offset.height;
console.log("areas: ", areas);
            // helpers

            var get_vertical_left = function () {

                if ( no_tip ) {

                    if ( right_space + trig_offset.width >= drop_offset.width ) {

                        return trig_offset.left;

                    } else if ( left_space + trig_offset.width >= drop_offset.width ) {

                        return left_space + trig_offset.width - drop_offset.width;

                    }

                }

                return Math.max ( 0, Math.min ( body_offset.width - drop_offset.width, trig_center_left - ( drop_offset.width / 2 ) ) );

            };

            var get_horizontal_top = function () {

                if ( no_tip ) {

                    if ( bottom_space + trig_offset.height >= drop_offset.height ) {

                        return trig_offset.top;

                    } else if ( top_space + trig_offset.height >= drop_offset.height ) {

                        return top_space + trig_offset.height - drop_offset.height;

                    }

                }

                return Math.max ( 0, Math.min ( body_offset.height - drop_offset.height, trig_center_top - ( drop_offset.height / 2 ) ) );

            };

            var get_direction_type = function ( direction ) {

                return ( direction === 'top' || direction === 'bottom' ) ? 'vertical' : 'horizontal';

            };

            // get first with acceptable area

            var direction = 'bottom'; //FIXME

            if ( !direction ) {

                for ( var dir in areas ) {

                    if ( areas[dir] >= needed_area ) {

                        direction = dir;
                        break;

                    }

                }

            }

            // get the one with the maximum area

            if ( !direction ) {
console.log("getting maximum area");
                var max_area = -1;

                for ( var dir in areas ) {

                    if ( areas[dir] > max_area ) {

                        max_area = areas[dir];

                    }

                }

                for ( var dir in areas ) {

                    if ( areas[dir] === max_area ) {

                        direction = dir;
                        break;

                    }

                }

            }

            console.log("direction: ", direction);

            // positionate the dropdown

            var direction_type = get_direction_type ( direction );

            var top = ( direction_type === 'horizontal' ) ? get_horizontal_top () : false;
            var left = ( direction_type === 'vertical' ) ? get_vertical_left () : false;

            switch ( direction ) {

                case 'bottom':
                    top = body_offset.height - bottom_space;
                    break;

                case 'top':
                    top = top_space - drop_offset.height;
                    break;

                case 'right':
                    left = body_offset.width - right_space;
                    break;

                case 'left':
                    left = left_space - drop_offset.width;
                    break;

            }

            this.$element.css ({
                top: top,
                left: left
            });

            $trigger.addClass ( direction );
            this.$element.addClass ( direction );

            // positionate the tip

            if ( !no_tip ) {

                drop_offset = this.$element.offset ();

                switch ( direction ) {

                    case 'bottom':
                        this.$top_tip.css ( 'left', trig_center_left - drop_offset.left );
                        break;

                    case 'top':
                        this.$bottom_tip.css ( 'left', trig_center_left - drop_offset.left );
                        break;

                    case 'right':
                        this.$left_tip.css ( 'top', trig_center_top - drop_offset.top );
                        break;

                    case 'left':
                        this.$right_tip.css ( 'top', trig_center_top - drop_offset.top );
                        break;

                }

            }

        },

        /* PUBLIC */

        toggle: function ( event, trigger ) {

            this[this.opened ? 'close' : 'open']( event, trigger );

        },

        open: function ( event, trigger ) {

            if ( trigger ) {

                assignments[this.id] = trigger;

                $(trigger).addClass ( 'active' );

            }

            this.$element.addClass ( 'show' );

            this._positionate ();

            this._delay ( function () {

                this.$element.addClass ( 'active' );

            });

            this.opened = true;

            this._delay ( this._bind_window_click );

            this._bind_window_resize_scroll ();

            this._trigger ( 'open' );

        },

        close: function () {

            $(assignments[this.id]).removeClass ( 'top bottom left right active' );

            this.$element.removeClass ( 'active' );

            this._delay ( function () {

                this.$element.removeClass ( 'show' );

            }, 150 );

            this.opened = false;

            this._unbind_window_click ();

            this._unbind_window_resize_scroll ();

            this._trigger ( 'close' );

        },

        update: function () {

            if ( this.opened ) {

                this._positionate ();

            }

        }

    });

    /* READY */

    $(function () {

        $('.dropdown').dropdown ();

    });

}( lQuery, window, document ));
