
// @require ../remote.js
// @require widgets/toast/toast.js

(function ( $, _, Svelto, Widgets, Factory, Pointer, fetch ) {

  /* CONFIG */

  let config = {
    name: 'remoteReaction',
    options: {
      state: undefined, // The state of the reaction
      stateDefault: null, // The default state
      stateUrl: false, // If provided, fetch the state from here
      stateBatchUrl: false, // If provided, fetch the state from here
      url: false, // Submit the reaction to this url
      ajax: {
        cache: false,
        method: 'post'
      },
      datas: {
        state: 'state',
        stateUrl: 'state-url',
        stateBatchUrl: 'state-batch-url',
        url: 'url'
      },
      classes: {
        noRemoteState: 'no-remote-state'
      }
    }
  };

  /* REMOTE REACTION */

  class RemoteReaction extends Widgets.Remote {

    /* SPECIAL */

    _variables () {

      this.$reaction = this.$element;

    }

    _init () {

      this.options.state = this.$reaction.hasAttribute ( `data-${this.options.datas.state}` ) ? this.$reaction.data ( this.options.datas.state ) : this.options.state || this.options.stateDefault;
      this.options.stateUrl = this.$reaction.data ( this.options.datas.stateUrl ) || this.options.stateUrl;
      this.options.stateBatchUrl = this.$reaction.data ( this.options.datas.stateBatchUrl ) || this.options.stateBatchUrl;
      this.options.url = this.$reaction.data ( this.options.datas.url ) || this.options.url;

      this._update ();

      if ( !this.$reaction.hasClass ( this.options.classes.noRemoteState ) ) {

        this.___remoteState ();

      }

    }

    /* REMOTE STATE */

    async ___remoteState () {

      if ( !this.options.stateUrl ) return;

      let res = await fetch ({
        url: this.options.stateUrl,
        batchUrl: this.options.stateBatchUrl
      });

      this.__remoteState ( res );

    }

    async __remoteState ( res ) {

      let state = await fetch.getValue ( res, 'state' );

      if ( _.isNull ( state ) ) return;

      this._remoteState ( state );

    }

    _remoteState ( state ) {

      if ( state === this.options.state ) return;

      this.options.state = state;

      this._update ();

    }

    /* UPDATE */

    _update () {

      this.$reaction.attr ( `data-${this.options.datas.state}`, String ( this.options.state ) );

    }

    /* REQUEST HANDLERS */

    __beforesend ( req ) {

      this.disable ();

      return super.__beforesend ( req );

    }

    async __error ( res ) {

      if ( this.isAborted () ) return;

      let message = await fetch.getValue ( res, 'message' ) || this.options.messages.error;

      $.toast ( message );

      return super.__error ( res );

    }

    async __success ( res ) {

      if ( this.isAborted () ) return;

      let resj = await fetch.getValue ( res );

      if ( !resj || resj.error ) return this.__error ( res );

      this._success ( resj );

      if ( resj.message && !resj.noop ) $.toast ( resj.message );

      return super.__success ();

    }

    __complete ( res ) {

      this.enable ();

      return super.__complete ( res );

    }

    /* REQUEST CALLBACKS */

    _success ( resj ) {

      if ( !resj.hasOwnProperty ( 'state' ) ) return;

      this.options.state = resj.state;

      this._update ();

    }

    /* API */

    get () {

      return this.options.state;

    }

    set ( state ) {

      if ( state === this.options.state ) return;

      let current = this.get (),
          ajax = {
            url: this.options.url || this.options.ajax.url,
            body: {current, state},
          };

      return this.request ( ajax );

    }

    reset () {

      return this.set ( this.options.stateDefault );

    }

  }

  /* FACTORY */

  Factory.make ( RemoteReaction, config );

}( Svelto.$, Svelto._, Svelto, Svelto.Widgets, Svelto.Factory, Svelto.Pointer, Svelto.fetch ));
