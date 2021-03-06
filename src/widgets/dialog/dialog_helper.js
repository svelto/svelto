
// @require ./dialog.js

(function ( $, _, Svelto, Dialog ) {

  /* HELPER */

  $.dialog = function ( options = {} ) {

    /* CLEANUP */

    const $modals = $('.modal.open, .dialog.open');

    if ( $modals.length ) {

      return new Promise ( resolve => {

        $modals.one ( 'modal:close dialog:close', _.once ( () => _.defer ( () => resolve ( $.dialog ( options ) ) ) ) );

        $modals.modal ( 'close' );

      });

    }

    /* OPTIONS */

    options = _.isPlainObject ( options ) ? options : { body: String ( options ) };

    /* DIALOG */

    const {$dialog} = new Dialog ( options );

    /* OPEN */

    return new Promise ( resolve => {

      $dialog.one ( 'dialog:close', () => {

        _.defer ( () => { // Deferring because we need the cleanup event to be triggered too
          $dialog.dialog ( 'destroy' );
          $dialog.remove ();
        });

        resolve ();

      });

      $dialog.appendTo ( $.$body );

      $dialog.dialog ( 'open' );

    });

  };

}( Svelto.$, Svelto._, Svelto, Svelto.Widgets.Dialog ));
