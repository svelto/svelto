
// @require ../remote.js
// @require ../widget/widget.js
// @require widgets/modal/modal.js

(function ( $, _, Svelto, Widgets, Factory, Animations ) {

  /* CONFIG */

  let config = {
    name: 'remoteModal',
    templates: {
      placeholder: _.template ( `
        <div class="modal container <%= o.classes.placeholder %> <%= o.classes.placeholderExtra %>">
          <svg class="spinner">
            <circle cx="1.625em" cy="1.625em" r="1.25em">
          </svg>
        </div>
      ` )
    },
    options: {
      widget: Widgets.Modal,
      classes: {
        placeholder: 'remote-modal-placeholder',
        loaded: 'remote-modal-loaded',
        resizing: 'remote-modal-resizing',
        showing: 'remote-modal-showing'
      },
      animations: {
        placeholder: Animations.normal,
        resize: Animations.normal
      }
    }
  };

  /* REMOTE MODAL */

  class RemoteModal extends Widgets.RemoteWidget {}

  /* FACTORY */

  Factory.make ( RemoteModal, config );

}( Svelto.$, Svelto._, Svelto, Svelto.Widgets, Svelto.Factory, Svelto.Animations ));
