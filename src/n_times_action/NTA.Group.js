
/* =========================================================================
 * Svelto - N Times Action (Group)
 * =========================================================================
 * Copyright (c) 2015-2016 Fabio Spampinato
 * Licensed under MIT (https://github.com/svelto/svelto/blob/master/LICENSE)
 * =========================================================================
 * @requires ../core/core.js
 * @requires ../cookie/cookie.js
 * ========================================================================= */

(function ( $, _, Svelto, Cookie, NTA ) {

  'use strict';

  /* UTILITIES */

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

  let config = { //TODO: Export this object so that it gets customizable, maybe rename encoder to serializer
    encoder: JSON.stringify,
    decoder: JSON.parse
  };

  /* GROUP */

  class Group {

    constructor ( options ) {

      this.name = options.name;
      this.cookie = options.cookie;

      this.actions = config.decoder ( Cookie.get ( this.name ) || '{}' );

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

      if ( _.isNaN ( times ) ) return;

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

    update () {

      Cookie.set ( this.name, config.encoder ( this.actions ), this.cookie.end, this.cookie.path, this.cookie.domain, this.cookie.secure );

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

        Cookie.remove ( this.name, this.cookie.path, this.cookie.domain );

      }

    }

  }

  /* BINDING */

  NTA.Group = Group;

}( Svelto.$, Svelto._, Svelto, Svelto.Cookie, Svelto.NTA = {} ));
