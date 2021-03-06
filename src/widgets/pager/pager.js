
// @require core/widget/widget.js

//FIXME: Doesn't actually check if the scroll event happened along the same direction of the key that has been pressed
// It can detect scroll only on the document

(function ( $, _, Svelto, Factory ) {

  /* CONFIG */

  let config = {
    name: 'pager',
    plugin: true,
    selector: '.pager',
    options: {
      selectors: {
        previous: '.previous',
        next: '.next'
      },
      keystrokes: {
        'left': 'previous',
        'right': 'next'
      }
    }
  };

  /* PAGER */

  class Pager extends Svelto.Widget {

    /* SPECIAL */

    _variables () {

      this.$pager = this.$element;

    }

    _events () {

      this.___keydown ();

    }

    /* KEYDOWN */

    __keydown ( event ) {

      if ( this.isLocked () || $.isFocused ( document.activeElement ) ) return;

      this.lock ();

      this._scrolled = false;

      this.___scroll ();

      this._delay ( () => { // Waiting for the `scroll` event to fire and giving other event handlers precedence

        this.unlock ();

        if ( this._scrolled ) return;

        this.___scrollReset ();

        if ( $.isDefaultPrevented ( event ) ) return; // Probably another widget was listening for the same event, and it should take priority over this

        super.__keydown ( event );

      }, 50 ); //FIXME: Not exactly a solid implementation

    }

    /* SCROLL */

    ___scroll () {

      this._one ( true, $.$document, 'scroll', this.__scroll );

    }

    ___scrollReset () {

      this._off ( $.$document, 'scroll', this.__scroll );

    }

    __scroll () {

      this._scrolled = true;

    }

    /* API */

    previous () {

      let $previous = this.$pager.find ( this.options.selectors.previous );

      if ( !$previous.length ) return;

      $previous[0].click ();

    }

    next () {

      let $next = this.$pager.find ( this.options.selectors.next );

      if ( !$next.length ) return;

      $next[0].click ();

    }

  }

  /* FACTORY */

  Factory.make ( Pager, config );

}( Svelto.$, Svelto._, Svelto, Svelto.Factory ));
