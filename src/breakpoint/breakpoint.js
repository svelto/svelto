
/* =========================================================================
 * Svelto - Breakpoint
 * =========================================================================
 * Copyright (c) 2015-2016 Fabio Spampinato
 * Licensed under MIT (https://github.com/svelto/svelto/blob/master/LICENSE)
 * =========================================================================
 * @require ../svelto/svelto.js
 * @require ../breakpoints/breakpoints.js
 * ========================================================================= */

(function ( $, _, Svelto, Breakpoints ) {

  'use strict';

  /* VARIABLES */

  let $window = $(window);

  /* BREAKPOINT */

  let Breakpoint = {

    /* VARIABLES */

    throttle: 150, // The amount of milliseconds used to throttle the `$window.on ( 'resize' )` handler
    previous: undefined, // Previous breakpoint
    current: undefined, // Current breakpoint

    /* RESIZE */

    __resize () {

      let current = this.get ();

      if ( current !== this.current ) {

        this.previous = this.current;
        this.current = current;

        $window.trigger ( 'breakpoint:change' );

      }

    },

    /* API */

    get () {

      let intervals = _.sortBy ( _.values ( Breakpoints ) ),
          width = $window.width ();

      for ( let i = 0, l = intervals.length; i < l; i++ ) {

        if ( width >= intervals[i] && ( i === l - 1 || width < intervals[i+1] ) ) {

          return _.findKey ( Breakpoints, interval => interval === intervals[i] );

        }

      }

    }

  };

  /* READY */

  $(function () {

    Breakpoint.current = Breakpoint.get ();

    $window.on ( 'resize', _.throttle ( Breakpoint.__resize.bind ( Breakpoint ), Breakpoint.throttle ) );

  });

  /* EXPORT */

  Svelto.Breakpoint = Breakpoint;

}( Svelto.$, Svelto._, Svelto, Svelto.Breakpoints ));