
// @require core/widget/widget.js
// @require lib/storage/storage.js

(function ( $, _, Svelto, Factory, Storage ) {

  /* CONFIG */

  let config = {
    name: 'storable',
    selector: '.storable'
  };

  /* STORABLE */

  class Storable extends Svelto.Widget {

    /* SPECIAL */

    _variables () {

      this.storageNamespace = `swns.${this.name}`;

    }

    /* STORAGE */

    _storageGet ( key ) {

      return Storage.get ( `${this.storageNamespace}.${key}` );

    }

    _storageSet ( key, value, ttl ) {

      Storage.set ( `${this.storageNamespace}.${key}`, value, ttl );

    }

    _storageRemove ( key ) {

      Storage.remove ( `${this.storageNamespace}.${key}` );

    }

  }

  /* FACTORY */

  Factory.make ( Storable, config );

}( Svelto.$, Svelto._, Svelto, Svelto.Factory, Svelto.Storage ));
