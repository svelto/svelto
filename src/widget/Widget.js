
/* =========================================================================
 * Svelto - Widget
 * =========================================================================
 * Copyright (c) 2015 Fabio Spampinato
 * Licensed under MIT (https://github.com/svelto/svelto/blob/master/LICENSE)
 * =========================================================================
 * @requires ../core/core.js
 * @requires ../tmpl/tmpl.js
 * @requires ../pointer/pointer.js
 * @requires ../factory/factory.js
 * ========================================================================= */

//TODO: Add support for remove, right know it doesn't get triggered on `.remove ()` but only on `.trigger ( 'remove' )`, but maybe there's no way of doing it...

(function ( $, _, window, document, undefined ) {

  'use strict';

  /* CONFIG */

  let config = {
    name: 'widget', //INFO: The name of widget, it will be used for the the jQuery pluing `$.fn[name]` and for triggering widget events `name + ':' + event`
    plugin: false, //INFO: A boolean that defines wheter the Widget is also a jQuery plugin or not
    selector: false, //INFO: The selector used to select the website in the DOM, used for `Widgetize`
    templates: {
      base: false //INFO: It will be used as the constructor if no element is provided
    },
    options: {
      characters: {}, //INFO: Used to store some characters needed by the widget
      regexes: {}, //INFO: Contains the used regexes
      errors: { //INFO: It contains all the errors that a widget can trigger
        uninitializable: 'This widget can\'t be initialized, no element or base template have been provided' //INFO: Triggered when the widget is not initializable
      },
      messages: {}, //INFO: Messages that the widget somewhere outputs, maybe with a `$.noty`, maybe just logs it
      attributes: {}, //INFO: Attributes used by the widget
      datas: {}, //INFO: CSS data-* names
      classes: { //INFO: CSS classes to attach inside the widget
        disabled: 'disabled', //INFO: Attached to disabled widgets
        hidden: 'hidden' //INFO: Used to hide an element
      },
      selectors: {}, //INFO: Selectors to use inside the widget
      animations: {}, //INFO: Object storing all the milliseconds required for each animation to occur
      keystrokes: {}, //INFO: Easy way to automatically bind keystrokes to specific methods calls. For example: `{ 'ctrl + o': 'open', Svelto.keyCode.UP: 'up' }`
      callbacks: {} //INFO: Callbacks to trigger on specific events
    }
  };

  /* WIDGET */

  class Widget {

    constructor ( options, element ) {

      /* ATTACH CONFIG */

      _.extend ( this, this._getConfig ( options, element ) );

      /* CHECK IF INITIALIZABLE */

      if ( !element && !this.templates.base ) {

        this._throw ( this.errors.uninitializable );

      }

      /* CACHE TEMPLATES */

      for ( let tmpl in this.templates ) {

        if ( this.templates[tmpl] ) {

          let tmplName = this.name + '.' + tmpl;

          if ( !(tmplName in $.tmpl.cache) ) {

            $.tmpl.cache[tmplName] = $.tmpl ( this.templates[tmpl] );

          }

        }

      }

      /* INIT ELEMENT */

      this.$element = $( element || this._tmpl ( 'base', this.options ) );
      this.element = this.$element[0];

      /* ATTACH INSTANCE */

      $.data ( this.element, 'instance.' + this.name, this );

      /* SET GUID */

      this.guid = $.guid++;

      /* CALLBACKS */

      this._variables ();
      this._init ();
      this._events ();

    }

    _getConfig ( options, element ) {

      /* VARIABLES */

      let configs = [];

      /* PROTOTYPE CHAIN */

      let prototype = Object.getPrototypeOf ( this );

      while ( prototype ) {

        if ( prototype.constructor.config ) {

          configs.push ( prototype.constructor.config );

        }

        prototype = Object.getPrototypeOf ( prototype );

      }

      configs.push ( {} ); //INFO: So that we merge them to a new object

      configs.reverse ();

      /* DATA OPTIONS */

      if ( element ) {

        let $element = $(element),
            name = _.last ( configs ).name.toLowerCase (),
            dataOptions = $element.data ( 'options' ),
            dataNameOptions = $element.data ( name + '-options' );

        if ( dataOptions ) {

          configs.push ({ options: dataOptions });

        }

        if ( dataNameOptions ) {

          configs.push ({ options: dataNameOptions });

        }

      }

      /* OPTIONS */

      if ( options ) {

        configs.push ({ options: options });

      }

      /* CREATE OPTIONS */

      let createOptions = this._createOptions ();

      if ( createOptions ) {

        configs.push ({ options: createOptions });

      }

      /* RETURN */

      return _.merge ( ...configs );

    }

    destroy () {

      this._destroy ();

      $.removeData ( this.element, 'instance.' + this.name );

    }

    /* SPECIAL */

    _createOptions () {} //INFO: Used to pass extra options

    static widgetize ( $widget, name ) { //INFO: Add a widget instance to the $widget

      $widget[name]();

    }

    _variables () {} //INFO: Init your variables inside this function
    _init () {} //INFO: Perform the init stuff inside this function
    _events () {} //INFO: Bind the event handlers inside this function

    _destroy () {} //INFO: Clean the stuff, remove possible memory leaks

    /* WIDGET */

    widget () {

      return this.$element;

    }

    /* INSTANCE */

    instance () {

      return this;

    }

    /* OPTIONS */

    option ( key, value ) {

      if ( !key ) {

        return _.cloneDeep ( this.options );

      } else if ( _.isString ( key ) ) {

        if ( _.isUndefined ( value ) ) {

          return _.cloneDeep ( _.get ( this.options, key ) );

        } else {

          _.set ( this.options, key, value );

        }

      } else if ( _.isPlainObject ( key ) ) {

        for ( let prop in key ) {

          if ( key.hasOwnProperty ( prop ) ) {

            _.set ( this.options, prop, key[prop] );

          }

        }

      }

    }

    /* ENABLED */

    enable () {

      this.$element.removeClass ( this.options.classes.disabled );

    }

    isEnabled () {

      return !this.isDisabled ();

    }

    /* DISABLED */

    disable () {

      this.$element.addClass ( this.options.classes.disabled );

    }

    isDisabled () {

      return this.$element.hasClass ( this.options.classes.disabled );

    }

    /* EVENTS */

    _on ( suppressDisabledCheck, $element, events, selector, handler, onlyOne ) {

      //TODO: Add support for custom data

      /* NORMALIZING PARAMETERS */

      if ( !_.isBoolean ( suppressDisabledCheck ) ) {

        onlyOne = handler;
        handler = selector;
        selector = events;
        events = $element;
        $element = suppressDisabledCheck;
        suppressDisabledCheck = false;

      }

      if ( !( $element instanceof $ ) ) {

        onlyOne = handler;
        handler = selector;
        selector = events;
        events = $element;
        $element = this.$element;

      }

      if ( !_.isString ( selector ) ) {

        onlyOne = handler;
        handler = selector;
        selector = false;

      }

      /* PROXY */

      let handlerProxy = ( ...args ) => {

        if ( !suppressDisabledCheck && this.$element.hasClass ( this.options.classes.disabled ) ) return; //FIXME: Is keeping a reference to `suppressDisabledCheck` wasted leak? Even if so tiny

        return handler.apply ( this, args );

      };

      /* PROXY GUID */

      handlerProxy.guid = handler.guid = ( handler.guid || $.guid++ );

      /* EVENTS NAMESPACING */

      events = events.split ( /\s+/ ).map ( event => event + '.swns' + this.guid ).join ( ' ' );

      /* TRIGGERING */

      $element[onlyOne ? 'one' : 'on'] ( events, selector, handlerProxy );

    }

    _one ( ...args ) {

      return this._on ( ...args, true );

    }

    _onHover ( $element, args ) {

      //FIXME: If we remove the target we are still attaching and removing those events though (just performing the functions calls actually, probably)

      if ( !args ) {

        args = $element;
        $element = this.$element;

      }

      this._on ( $element, Pointer.enter, () => this._on ( ...args ) );
      this._on ( $element, Pointer.leave, () => this._off ( ...args ) );

    }

    //TODO: Add a _offHover (Is it needed?)

    _off ( $element, events, handler ) {

      /* NORMALIZING PARAMETERS */

      if ( !handler ) {

        handler = events;
        events = $element;
        $element = this.$element;

      }

      /* EVENTS NAMESPACING */

      events = events.split ( /\s+/ ).map ( event => event + '.swns' + this.guid ).join ( ' ' );

      /* REMOVING HANDLER */

      $element.off ( events, handler );

    }

    _trigger ( events, data = {} ) {

      let name = this.name.toLowerCase ();

      events = events.split ( ' ' );

      for ( let event of events ) {

        this.$element.trigger ( name + ':' + event, data );

        this.options.callbacks[event].call ( this.element, data );

      }

    }

    /* EVENTS HANDLERS */

    __keydown ( event ) {

      for ( let keystrokes in this.options.keystrokes ) {

        if ( this.options.keystrokes.hasOwnProperty ( keystrokes ) ) {

          for ( let keystroke of keystrokes.split ( ',' ) ) {

            if ( $.matchKeystroke ( event, keystroke ) ) {

              this[this.options.keystrokes[keystrokes]]();

              event.preventDefault ();
              event.stopImmediatePropagation ();

              return true;

            }

          }

        }

      }

      return false;

    }

    /* DELAYING */

    _delay ( fn, delay ) {

      return setTimeout ( () => fn.apply ( this ), delay || 0 );

    }

    /* DEFER */

    _defer ( fn ) {

      return this._delay ( fn );

    }

    /* FRAME */

    _frame ( fn ) {

      return requestAnimationFrame ( fn.bind ( this ) );

    }

    /* THROW */

    _throw ( msg ) {

      throw new Error ( msg );

    }

    /* THROTTLING */

    _throttle ( fn, wait, options ) {

      let throttled = _.throttle ( fn, wait, options );

      throttled.guid = fn.guid = ( fn.guid || $.guid++ );

      return throttled;

    }

    /* DEBOUNCING */

    _debounce ( fn, wait, options ) {

      let debounced = _.debounce ( fn, wait, options );

      debounced.guid = fn.guid = ( fn.guid || $.guid++ );

      return debounced;

    }

    /* TEMPLATE */

    _tmpl ( name, options = {} ) {

      let tmplName = this.name + '.' + name;

      return $.tmpl ( tmplName, options );

    }

    /* INSERTION */

    insertBefore ( selector ) {

      this.$element.insertBefore ( selector );

    }

    insertAfter ( selector ) {

      this.$element.insertAfter ( selector );

    }

    prependTo ( selector ) {

      this.$element.prependTo ( selector );

    }

    appendTo ( selector ) {

      this.$element.appendTo ( selector );

    }

  }

  /* FACTORY */

  $.factory ( Widget, config, Svelto );

}( Svelto.$, Svelto._, window, document ));
