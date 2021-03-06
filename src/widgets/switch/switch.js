
// @require core/colors/colors.js
// @require lib/transform/transform.js
// @require widgets/draggable/draggable.js

//TODO: Add flick support

(function ( $, _, Svelto, Factory, Colors ) {

  /* CONFIG */

  let config = {
    name: 'switch',
    plugin: true,
    selector: '.switch',
    options: {
      colors: {
        on: Colors.secondary,
        off: Colors.gray
      },
      datas: {
        colors: {
          on: 'color-on',
          off: 'color-off'
        }
      },
      classes: {
        checked: 'checked'
      },
      selectors: {
        input: 'input',
        bar: '.switch-bar',
        handler: '.switch-handler'
      },
      keystrokes: {
        'left': 'uncheck',
        'right': 'check',
        'spacebar': 'toggle'
      },
      callbacks: {
        change: _.noop,
        check: _.noop,
        uncheck: _.noop
      }
    }
  };

  /* SWITCH */

  class Switch extends Svelto.Widget {

    /* SPECIAL */

    _variables () {

      this.$switch = this.$element;
      this.$input = this.$switch.find ( this.options.selectors.input );
      this.$bar = this.$switch.find ( this.options.selectors.bar );
      this.$handler = this.$switch.find ( this.options.selectors.handler );

      this.isChecked = this.$input.prop ( 'checked' );

      this.switchWidth = this.$switch.outerWidth () || 47; //FIXME: It shouldn't be set manually, but this widget might be hidden at init time
      this.handlerWidth = this.$handler.outerWidth () || 21; //FIXME: It shouldn't be set manually, but this widget might be hidden at init time

    }

    _init () {

      /* OPTIONS */

      this.options.colors.on = this.$switch.data ( this.options.datas.colors.on ) || this.options.colors.on;
      this.options.colors.off = this.$switch.data ( this.options.datas.colors.off ) || this.options.colors.off;

      /* INITIAL SETTING */

      this._updateColors ();
      this._updatePosition ();

    }

    _events () {

      this.___change ();
      this.___keydown ();
      this.___drag ();

    }

    _destroy () {

      this.$handler.draggable ( 'destroy' );

    }

    /* CHANGE */

    ___change () {

      this._on ( true, this.$input, 'change', this.__change );

    }

    __change () {

      this.toggle ( this.$input.prop ( 'checked' ) );

    }

    /* KEYDOWN */

    ___keydown () {

      this._onHover ( [$.$document, 'keydown', this.__keydown] );

    }

    /* DRAG */

    ___drag () {

      this.$handler.draggable ({
        draggable: this.isEnabled.bind ( this ),
        axis: 'x',
        proxy: {
          $element: this.$switch,
          noMotion: false
        },
        constrainer: {
          $element: this.$switch
        },
        callbacks: {
          end: this.__dragEnd.bind ( this )
        }
      });

    }

    __dragEnd ( event, data ) {

      if ( data.motion ) {

        let isChecked = ( data.dragXY.x + ( this.handlerWidth / 2 ) ) >= ( this.switchWidth / 2 );

        this.toggle ( isChecked, true );

      } else {

        this.toggle ();

      }

    }

    /* UPDATE */

    _updatePosition () {

      this.$handler.translateX ( this.isChecked ? this.switchWidth - this.handlerWidth : 0 );

    }

    _updateColors () {

      this.$bar.toggleClass ( this.options.colors.on, this.isChecked );
      this.$bar.toggleClass ( this.options.colors.off, !this.isChecked );

      this.$handler.toggleClass ( this.options.colors.on, this.isChecked );
      this.$handler.toggleClass ( this.options.colors.off, !this.isChecked );

    }

    _updateInput () {

      this.$input.prop ( 'checked', this.isChecked ).trigger ( 'change' );

    }

    _update () {

      this._updatePosition ();
      this._updateColors ();
      this._updateInput ();

    }

    /* API */

    get () {

      return this.isChecked;

    }

    toggle ( force, _reset ) {

      if ( !_.isBoolean ( force ) ) {

        force = !this.isChecked;

      }

      if ( force !== this.isChecked ) {

        this.isChecked = force;

        this.$switch.toggleClass ( this.options.classes.checked, this.isChecked );

        this._update ();

        this._trigger ( 'change' );

        this._trigger ( this.isChecked ? 'check' : 'uncheck' );

      } else if ( _reset ) {

        this._updatePosition ();

      }

    }

    check () {

      this.toggle ( true );

    }

    uncheck () {

      this.toggle ( false );

    }

  }

  /* FACTORY */

  Factory.make ( Switch, config );

}( Svelto.$, Svelto._, Svelto, Svelto.Factory, Svelto.Colors ));
