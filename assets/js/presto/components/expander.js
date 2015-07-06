
/* EXPANDER */

;(function ( $, window, document, undefined ) {

    'use strict';

    /* EXPANDER */

    $.widget ( 'presto.expander', {

        /* OPTIONS */

        options: {
            callbacks: {
                open: $.noop,
                close: $.noop
            }
        },

        /* SPECIAL */

        _create: function () {

            this.$header = this.$element.children ( '.header' );
            this.$content = this.$element.children ( '.content' );

            this.opened = this.$element.hasClass ( 'opened' );

            if ( !this.opened ) this.close ( true );

            this._bind_click ();

        },

        /* PRIVATE */

        _bind_click: function () {

            this._on ( this.$header, 'click', this.toggle );

        },

        /* PUBLIC */

        toggle: function () {

            this[this.opened ? 'close' : 'open']();

        },

        open: function ( force ) {

            if ( !this.opened || force ) {

                this.opened = true;

                this.$element.addClass ( 'opened' );

                this._trigger ( 'open' );

            }

        },

        close: function ( force ) {

            if ( this.opened || force ) {

                this.opened = false;

                this.$element.removeClass ( 'opened' );

                this._trigger ( 'close' );

            }

        }

    });

    /* READY */

    $(function () {

        $('.expander').expander ();

    });

}( lQuery, window, document ));
