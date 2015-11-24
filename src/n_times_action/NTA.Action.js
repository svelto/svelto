
/* =========================================================================
 * Svelto - N Times Action (Action)
 * =========================================================================
 * Copyright (c) 2015 Fabio Spampinato
 * Licensed under MIT (https://github.com/svelto/svelto/blob/master/LICENSE)
 * =========================================================================
 * @requires ../core/core.js
 * @requires NTA.Group.js
 * ========================================================================= */

(function ( $, _, window, document, undefined ) {

  'use strict';

  /* ACTION */

  class Action {

    constructor ( options ) {

      this.group = new Svelto.NTA.Group ( options.group );
      this.name = options.name;

    }

    get () {

      return this.group.get ( this.name );

    }

    set ( times ) {

      this.group.set ( this.name, times );

    }

    reset () {

      this.group.reset ( this.name );

    }

  }

  /* BINDING */

  Svelto.NTA.Action = Action;

}( Svelto.$, Svelto._, window, document ));