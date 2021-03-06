
// @require core/svelto/svelto.js

/* COOKIE */

(function ( $, _, Svelto ) {

  /* COOKIE */

  let Cookie = {

    /* VARIABLES */

    encoder: encodeURIComponent,
    decoder: decodeURIComponent,

    /* API */

    get ( key ) {

      if ( !key ) return null;

      return this.decoder ( document.cookie.replace ( new RegExp ( '(?:(?:^|.*;)\\s*' + this.encoder ( key ).replace ( /[\-\.\+\*]/g, '\\$&' ) + '\\s*\\=\\s*([^;]*).*$)|^.*$' ), '$1' ) ) || null;

    },

    set ( key, value, end, path, domain, secure ) {

      if ( !key || /^(?:expires|max\-age|path|domain|secure)$/i.test ( key ) ) return false;

      let expires = '';

      if ( end ) {

        switch ( end.constructor ) {

          case Number:
            expires = ( end === Infinity ) ? '; expires=Fri, 31 Dec 9999 23:59:59 GMT' : `; max-age=${end}`;
            break;

          case String:
            expires = `; expires=${end}`;
            break;

          case Date:
            expires = '; expires=' + end.toUTCString ();
            break;

        }

      }

      document.cookie = this.encoder ( key ) + '=' + this.encoder ( value ) + expires + ( domain ? `; domain=${domain}` : '' ) + ( path ? `; path=${path}` : '' ) + ( secure ? '; secure' : '' );

      return true;

    },

    remove ( key, path, domain ) {

      if ( !this.has ( key ) ) return false;

      document.cookie = this.encoder ( key ) + '=; expires=Thu, 01 Jan 1970 00:00:00 GMT' + ( domain ? `; domain=${domain}` : '' ) + ( path ? `; path=${path}` : '' );

      return true;

    },

    has ( key ) {

      if ( !key ) return false;

      return ( new RegExp ( '(?:^|;\\s*)' + this.encoder ( key ).replace ( /[\-\.\+\*]/g, '\\$&' ) + '\\s*\\=' ) ).test ( document.cookie );

    },

    keys () {

      let keys = document.cookie.replace ( /((?:^|\s*;)[^\=]+)(?=;|$)|^\s*|\s*(?:\=[^;]*)?(?:\1|$)/g, '' ).split ( /\s*(?:\=[^;]*)?;\s*/ );

      return keys.map ( this.decoder );

    }

  };

  /* EXPORT */

  Svelto.Cookie = Cookie;

}( Svelto.$, Svelto._, Svelto ));
