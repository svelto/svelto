
// @priority 550
// @require core/animations/animations.js
// @require core/widget/widget.js

(function ( $, _, Svelto, Factory, Animations, Pointer ) {

  /* CONFIG */

  let config = {
    name: 'rails',
    plugin: true,
    selector: '.rails',
    options: {
      navigation: {
        hidable: true // Controls whether the navigation should be hidden when all the buttons are disabled
      },
      scroll: {
        speed: 200 // The distance scrolled when calling `left` or `right`
      },
      classes: {
        shadow: {
          left: 'rails-shadow-left',
          right: 'rails-shadow-right'
        }
      },
      selectors: {
        start: '.rails-start',
        left: '.rails-left',
        right: '.rails-right',
        end: '.rails-end',
        navigation: '.rails-navigation, .rails-start, .rails-left, .rails-right, .rails-end',
        shadow: '.rails-shadow',
        content: '.rails-content',
        active: '.rails-active'
      },
      animations: {
        scroll: Animations.fast
      },
      keystrokes: {
        'home, page_up': 'start',
        'left': 'left',
        'right': 'right',
        'end, page_down': 'end'
      }
    }
  };

  /* RAILS */

  class Rails extends Svelto.Widget {

    /* SPECIAL */

    _variables () {

      this.$rails = this.$element;

      this.$start = this.$rails.find ( this.options.selectors.start );
      this.$left = this.$rails.find ( this.options.selectors.left );
      this.$right = this.$rails.find ( this.options.selectors.right );
      this.$end = this.$rails.find ( this.options.selectors.end );
      this.$navigation = this.$rails.find ( this.options.selectors.navigation );
      this.$shadow = this.$rails.find ( this.options.selectors.shadow );
      this.$content = this.$rails.find ( this.options.selectors.content );
      this.$active = this.$content.find ( this.options.selectors.active );

    }

    _init () {

      this._scrollToElement ( this.$active, false );
      this._updateNavigation ();

    }

    _events () {

      this.___keydown ();
      this.___resize ();
      this.___scroll ();
      this.___startTap ();
      this.___leftTap ();
      this.___rightTap ();
      this.___endTap ();

    }

    /* KEYDOWN */

    ___keydown () {

      this._onHover ( [$.$document, 'keydown', this.__keydown] );

    }

    /* START TAP */

    ___startTap () {

      this._on ( this.$start, Pointer.tap, this.start );

    }

    /* LEFT TAP */

    ___leftTap () {

      this._on ( this.$left, Pointer.tap, this.left );

    }

    /* RIGHT TAP */

    ___rightTap () {

      this._on ( this.$right, Pointer.tap, this.right );

    }

    /* END TAP */

    ___endTap () {

      this._on ( this.$end, Pointer.tap, this.end );

    }

    /* UPDATE */

    _updateNavigation () {

      if ( !this.$navigation.length && !this.$shadow.length ) return;

      let contentRect = this.$content.getRect (),
          scrollLeft = this.$content[0].scrollLeft,
          isStart = ( scrollLeft === 0 ),
          isEnd = ( this.$content[0].scrollWidth - scrollLeft - contentRect.width <= 1 ); // If we use `0`, as we should it won't always trigger

      if ( this.$start.length || this.$left.length ) {

        this.$start.add ( this.$left ).toggleClass ( this.options.classes.disabled, isStart );

      }

      if ( this.$shadow.length ) {

        this.$shadow.toggleClass ( this.options.classes.shadow.left, !isStart );

      }

      if ( this.$end.length || this.$right.length ) {

        this.$end.add ( this.$right ).toggleClass ( this.options.classes.disabled, isEnd );

      }

      if ( this.$shadow.length ) {

        this.$shadow.toggleClass ( this.options.classes.shadow.right, !isEnd );

      }

      if ( this.options.navigation.hidable ) {

        let hidable = ( isStart && isEnd );

        this.$navigation.toggleClass ( this.options.classes.hidden, hidable );

      }

    }

    /* RESIZE */

    ___resize () {

      this._on ( true, $.$window, 'resize:width', this._frames ( this._updateNavigation.bind ( this ) ) );

    }

    /* SCROLL */

    ___scroll () {

      this._on ( true, this.$content, 'scroll', this._frames ( this._updateNavigation.bind ( this ) ) );

    }

    _scroll ( left, animate = true ) {

      if ( animate ) {

        $.animateProp ( this.$content[0], { scrollLeft: left }, { duration: this.options.animations.scroll } );

      } else {

        this.$content[0].scrollLeft = left;

      }

    }

    _deltaScroll ( delta )  {

      this._scroll ( this.$content[0].scrollLeft + delta );

    }

    _scrollToElement ( $element, animate ) {

      if ( !$element.length ) return;

      let eleRect = $element.getRect (),
          contentRect = this.$content.getRect (),
          left = ( eleRect.left - contentRect.left ) + this.$content[0].scrollLeft + ( eleRect.width / 2 ) - ( contentRect.width / 2 );

      this._scroll ( left, animate );

    }

    /* API */

    start () {

      this._scroll ( 0 );

    }

    left () {

      this._deltaScroll ( - this.options.scroll.speed );

    }

    right () {

      this._deltaScroll ( this.options.scroll.speed );

    }

    end () {

      this._scroll ( this.$content[0].scrollWidth );

    }

  }

  /* FACTORY */

  Factory.make ( Rails, config );

}( Svelto.$, Svelto._, Svelto, Svelto.Factory, Svelto.Animations, Svelto.Pointer ));
