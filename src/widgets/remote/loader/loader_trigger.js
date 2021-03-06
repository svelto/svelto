
// @require ../remote_trigger.js
// @require ./loader.js

(function ( $, _, Svelto, Widgets, Factory ) {

  /* CONFIG */

  let config = {
    name: 'remoteLoaderTrigger',
    plugin: true,
    selector: '.remote-loader-trigger',
    options: {
      widget: Widgets.RemoteLoader
    }
  };

  /* REMOTE LOADER TRIGGER */

  class RemoteLoaderTrigger extends Widgets.RemoteTrigger {

    /* OPTIONS */

    _getOptions () {

      return _.merge ( super._getOptions (), {
        callbacks: {
          beforesend: this.disable.bind ( this ) //TODO: Replace with a linear "spinner" overlay
        }
      });

    }

    /* API */

    trigger () {

      this._trigger ( 'beforetrigger' );

      this.$trigger[this.options.widget.config.name] ( this._getOptions () );

      this._trigger ( 'trigger' );

    }

  }

  /* FACTORY */

  Factory.make ( RemoteLoaderTrigger, config );

}( Svelto.$, Svelto._, Svelto, Svelto.Widgets, Svelto.Factory ));
