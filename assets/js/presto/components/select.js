
/* SELECT */

//TODO: Add support for selecting multiple options (with checkboxes maybe)
//FIXME: Doesn't work when the page is scrolled (check in the components/form)
//TODO: add select-closer

;(function ( $, window, document, undefined ) {

    'use strict';

    /* SELECT */

    $.widget ( 'presto.select', {

        /* TEMPLATES */

        templates: {
            base: '<div id="dropdown-{%=o.id%}" class="dropdown select-dropdown attached">' +
                      '<div class="container">' +
                          '<div class="container-content">' +
                              '<div class="multiple-wrp vertical stretched nowrap">' +
                                  '<div class="multiple">' +
                                      '{% for ( var i = 0, l = o.options.length; i < l; i++ ) { %}' +
                                          '{% include ( "presto.select." + ( o.options[i].value ? "option" : "optgroup" ), o.options[i] ); %}' +
                                      '{% } %}' +
                                  '</div>' +
                              '</div>' +
                          '</div>' +
                      '</div>' +
                  '</div>',
            optgroup: '<div class="divider-wrp block">' +
                          '<div class="divider">' +
                              '{%=o.prop%}' +
                          '</div>' +
                      '</div>',
            option: '<div class="button actionable xsmall sharp" data-value="{%=o.prop%}">' +
                        '<div class="label-center">' +
                            '{%=o.value%}' +
                        '</div>' +
                    '</div>'
       },

        /* OPTIONS */

        options: {
            callbacks: {
                open: $.noop,
                close: $.noop,
                change: $.noop
            }
        },

        /* SPECIAL */

        _variables: function () {

            this.$trigger = this.$element;
            this.id = this.$trigger.data ( 'select' );
            this.$select = this.$trigger.find ( 'select' );
            this.$options = this.$select.find ( 'option' );
            this.select_options = [];
            this.$select_label = this.$trigger.find ( '.select-label' );
            this.$valueholder = this.$trigger.find ( '.valueholder' );

            if ( this.$valueholder.length === 0 ) {

                this.$valueholder = this.$select_label;

            }

            this.$dropdown = false;
            this.$dropdown_container = false;
            this.$buttons = false;

        },

        _init: function () {

            this._update_valueholder ();

            if ( !$.browser.isMobile ) {

                this.$select.addClass ( 'hidden' );

                this._init_select_options ();
                this._init_dropdown ();

                this._bind_button_click ();

            }

        },

        _events: function () {

            this._on ( this.$select, 'change', function () {
                this.update ();
                this._trigger ( 'change' );
            });

        },

        /* BUTTON CLICK */

        _bind_button_click: function () {

            this._on ( this.$buttons, 'click', this._handler_button_click );

        },

        _handler_button_click: function ( event, button ) {

            this.$select.val ( $(button).data ( 'value' ) ).trigger ( 'change' );

        },

        /* PRIVATE */

        _init_select_options: function () { //FIXME: Add support for arbitrary number of optgroups levels

            var previous_optgroup,
                current_optgroup;

            for ( var i = 0, l = this.$options.length; i < l; i++ ) {

                var $option = this.$options.eq ( i ),
                    $parent = $option.parent ();

                if ( $parent.is ( 'optgroup' ) ) {

                    current_optgroup = $parent.attr ( 'label' );

                    if ( current_optgroup !== previous_optgroup ) {

                        previous_optgroup = current_optgroup;

                        this.select_options.push ({
                            prop: current_optgroup
                        });

                    }

                }

                this.select_options.push ({
                    value: $option.html (),
                    prop: $option.attr ( 'value' )
                });

            }

        },

        _init_dropdown: function () {

            var html = this._tmpl ( 'base', { id: this.id, options: this.select_options } );

            $body.append ( html );

            this.$dropdown = $('#dropdown-' + this.id);
            this.$dropdown_container = this.$dropdown.find ( '.container' );
            this.$buttons = this.$dropdown.find ( '.button' );

            this.$trigger.addClass ( 'dropdown-trigger' ).data ( 'dropdown', 'dropdown-' + this.id );

            var instance = this;

            this.$dropdown.dropdown ({
                callbacks: {
                    open: function () {
                        instance._set_dropdown_width.bind ( instance )(); //FIXME: is the bind necessary?
                        instance._trigger ( 'open' );
                    },
                    close: instance.options.callbacks.close
                }
            });

            this._update_dropdown ();

        },

        _update_valueholder: function () {

            var $selected_option = this.$options.filter ( '[value="' + this.$select.val () + '"]' );

            this.$valueholder.html ( $selected_option.html () );

        },

        _update_dropdown: function () {

            this.$buttons.removeClass ( 'active' );

            this.$buttons.filter ( '[data-value="' + this.$select.val () + '"]' ).addClass ( 'active' );

        },

        _set_dropdown_width: function () {

            this.$dropdown_container.css ( 'min-width', this.$trigger.width () );

        },

        /* PUBLIC */

        select: function ( value ) {

            this.$buttons.filter ( '[data-value="' + value + '"]' ).click ();

        },

        update: function () {

            if ( !$.browser.isMobile ) {

                this._update_dropdown ();

            }

            this._update_valueholder ();

        }

    });

    /* READY */

    $(function () {

        $('.select-trigger').select ();

    });

}( lQuery, window, document ));
