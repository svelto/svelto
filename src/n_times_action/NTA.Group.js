
/* =========================================================================
 * Svelto - N Times Action (Group)
 * =========================================================================
 * Copyright (c) 2015 Fabio Spampinato
 * Licensed under MIT (https://github.com/svelto/svelto/blob/master/LICENSE)
 * =========================================================================
 * @requires ../core/core.js
 * @requires ../cookie/cookie.js
 * ========================================================================= */

(function ( $, _, window, document, undefined ) {

  'use strict';

  /* TOOLS */

  let getExpiry = function ( expiry ) {

    if ( expiry ) {

      switch ( expiry.constructor ) {

        case Number:
          return ( expiry === Infinity ) ? false : _.nowSecs () + expiry;

        case String:
          return getExpiry ( new Date ( expiry ) );

        case Date:
          let timestamp = expiry.getTime ();
          return _.isNaN ( timestamp ) ? false : Math.floor ( timestamp / 1000 );

      }

    }

    return false;

  };

  /* CONFIG */

  let config = {
    encoder: JSON.stringify,
    decoder: JSON.parse
  };

  /* GROUP */

  class Group {

    constructor ( options ) {

      this.name = options.name;
      this.cookie = options.cookie;

      this.actions = config.decoder ( $.cookie.get ( this.name ) || '{}' );

    }

    get ( action ) {

      let actionj = this.actions[action];

      if ( actionj ) {

        if ( actionj.x && actionj.x < _.nowSecs () ) {

          this.remove ( action );

        } else {

          return actionj.t;

        }

      }

      return 0;

    }

    set ( action, times, expiry ) {

      times = Number ( times );

      if ( !_.isNaN ( times ) ) {

        if ( action in this.actions ) {

          if ( times === 0 && !this.actions[action].x ) {

            return this.remove ( action );

          } else {

            this.actions[action].t = times;

          }

        } else {

          this.actions[action] = { t: times };

          expiry = getExpiry ( expiry );

          if ( expiry ) {

            this.actions[action].x = expiry;

          }

        }

        this.update ();

      }

    }

    update () {

      $.cookie.set ( this.name, config.encoder ( this.actions ), this.cookie.end, this.cookie.path, this.cookie.domain, this.cookie.secure );

    }

    remove ( action ) {

      if ( action ) {

        if ( _.size ( this.actions ) > 1 ) {

          delete this.actions[action];

          this.update ();

        } else {

          this.remove ();

        }

      } else {

        this.actions = {};

        $.cookie.remove ( this.name, this.cookie.path, this.cookie.domain );

      }

    }

  }

  /* BINDING */

  Svelto.NTA = {};
  Svelto.NTA.Group = Group;

}( Svelto.$, Svelto._, window, document ));
