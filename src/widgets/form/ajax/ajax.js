
/* =========================================================================
 * Svelto - Widgets - Form Ajax
 * =========================================================================
 * Copyright (c) 2015-2016 Fabio Spampinato
 * Licensed under MIT (https://github.com/svelto/svelto/blob/master/LICENSE)
 * =========================================================================
 * @require ../validate/validate.js
 * @require core/svelto/svelto.js
 * @require widgets/noty/noty.js
 * @require widgets/spinner/overlay/overlay.js
 * ========================================================================= */

//TODO: Add a way to abort it, maybe hovering the spinner a clickable X will be displayed and abort the request if tapped (or something more intuitive and easier to implement...)
//TODO: Test it with `input[type="file"]`

//FIXME: `formValidate` is listed as a requirement just because it need to be executed before `formAjax`

(function ( $, _, Svelto, Widgets, Factory ) {

  'use strict';

  /* CONFIG */

  let config = {
    name: 'formAjax',
    plugin: true,
    selector: 'form.ajax',
    options: {
      spinnerOverlay: true, // Enable/disable the `spinnerOverlay`, if disabled one can use the triggered events in order to provide a different visual feedback to the user
      timeout: 31000, // 1 second more than the default value of PHP's `max_execution_time` setting
      messages: {
        error: 'An error occurred, please try again later',
        success: 'Done! A page refresh may be needed',
        refreshing: 'Done! Refreshing the page...',
        redirecting: 'Done! Redirecting...'
      },
      callbacks: {
        beforesend: _.noop,
        error: _.noop,
        success: _.noop,
        complete: _.noop
      }
    }
  };

  /* FORM AJAX */

  class FormAjax extends Widgets.Widget {

    /* SPECIAL */

    _variables () {

      this.form = this.element;
      this.$form = this.$element;

    }

    _events () {

      this.___submit ();

    }

    /* PRIVATE */

    ___submit () {

      this._on ( true, 'submit', this.__submit );

    }

    __submit ( event ) {

      event.preventDefault ();
      event.stopImmediatePropagation ();

      $.ajax ({

        cache: false,
        contentType: false,
        data: new FormData ( this.form ),
        processData: false,
        timeout: this.options.timeout,
        type: this.$form.attr ( 'method' ) || 'POST',
        url: this.$form.attr ( 'action' ),

        beforeSend: () => {

          if ( this.options.spinnerOverlay ) {

            this.$form.spinnerOverlay ( 'open' );

          }

          this._trigger ( 'beforesend' );

        },

        error: ( res ) => {

          let resj = _.attempt ( JSON.parse, res );

          if ( !_.isError ( resj ) ) {

            $.noty ( resj.msg || this.options.messages.error );

          } else {

            $.noty ( this.options.messages.error );

          }

          this._trigger ( 'error' );

        },

        success: ( res ) => {

          let resj = _.attempt ( JSON.parse, res );

          if ( !_.isError ( resj ) ) {

            if ( resj.refresh || resj.url === window.location.href || _.trim ( resj.url, '/' ) === _.trim ( window.location.pathname, '/' ) ) {

              $.noty ( resj.msg || this.options.messages.refreshing );

              location.reload ();

            } else if ( resj.url ) {

              // In order to redirect to another domain the protocol must be provided. For instance `http://www.domain.tld` will work while `www.domain.tld` won't

              $.noty ( resj.msg || this.options.messages.redirecting );

              location.assign ( resj.url );

            } else {

              $.noty ( resj.msg || this.options.messages.success );

            }

          } else {

            $.noty ( this.options.messages.success );

          }

          this._trigger ( 'success' );

        },

        complete: () => {

          if ( this.options.spinnerOverlay ) {

            this.$form.spinnerOverlay ( 'close' );

          }

          this._trigger ( 'complete' );

        }

      });

    }

  }

  /* FACTORY */

  Factory.init ( FormAjax, config, Widgets );

}( Svelto.$, Svelto._, Svelto, Svelto.Widgets, Svelto.Factory ));
