
// @require ../remote.js
// @require ../widget/widget.js
// @require widgets/panel/panel.js

//TODO: Add support for pinned panels

(function ( $, _, Svelto, Widgets, Factory, Animations ) {

  /* CONFIG */

  let config = {
    name: 'remotePanel',
    templates: {
      placeholder: _.template ( `
        <div class="panel container <%= o.direction %> <%= o.type %> <%= o.classes.placeholder %> <%= o.classes.placeholderExtra %>">
          <svg class="spinner">
            <circle cx="1.625em" cy="1.625em" r="1.25em">
          </svg>
        </div>
      ` )
    },
    options: {
      widget: Widgets.Panel,
      direction: Widgets.Panel.config.options.direction,
      type: Widgets.Panel.config.options.type,
      classes: {
        placeholder: 'remote-panel-placeholder',
        loaded: 'remote-panel-loaded',
        resizing: 'remote-panel-resizing',
        showing: 'remote-panel-showing'
      },
      animations: {
        placeholder: Animations.normal,
        resize: Animations.normal
      }
    }
  };

  /* REMOTE PANEL */

  class RemotePanel extends Widgets.RemoteWidget {}

  /* FACTORY */

  Factory.make ( RemotePanel, config );

}( Svelto.$, Svelto._, Svelto, Svelto.Widgets, Svelto.Factory, Svelto.Animations ));
