
/* =========================================================================
 * Svelto - Factory
 * =========================================================================
 * Copyright (c) 2015 Fabio Spampinato
 * Licensed under MIT (https://github.com/svelto/svelto/blob/master/LICENSE)
 * =========================================================================
 * @requires ../core/core.js
 * @requires ../widget/widget.js
 * @requires ../widgetize/widgetize.js
 * @requires ../tmpl/tmpl.js
 * @requires ../pointer/pointer.js
 *=========================================================================*/

(function ( $, _, window, document, undefined ) {

  'use strict';

  /* FACTORY */

  $.factory = function ( Widget ) {

    /* NAME */

    let name = Widget.config.name,
        nameLowerCase = name.toLowerCase ();

    /* CACHE TEMPLATES */

    for ( let tmplName in Widget.config.templates ) {

      if ( Widget.config.templates[tmplName] ) {

        $.tmpl.cache[nameLowerCase + '.' + tmplName] = $.tmpl ( Widget.config.templates[tmplName] );

      }

    }

    /* WIDGETIZE */

    Widgetize.add ( Widget.prototype._widgetize );

    /* BRIDGE */

    $.factory.bridge ( Widget );

  };

  /* FACTORY BRIDGE */

  $.factory.bridge = function ( Widget ) {

    /* NAME */

    let name = Widget.config.name;

    /* JQUERY PLUGIN */

    $.fn[name] = function ( options, ...args ) { //FIXME: We should be able to extend options, not the entire config

      let isMethodCall = _.isString ( options ),
          returnValue = this;

      if ( isMethodCall ) {

        if ( options.charAt ( 0 ) !== '_' ) { //INFO: Not a private method or property

          /* METHOD CALL */

          for ( let element of this ) {

            /* VARIABLES */

            let instance = $.factory.instance ( Widget, false, element );

            /* CHECKING VALID CALL */

            if ( !_.isFunction ( instance[options] ) ) return; //INFO: Not a method

            /* CALLING */

            let methodValue = instance[options]( ...args );

            if ( !_.isUndefined ( methodValue ) ) {

              returnValue = methodValue;

              break;

            }

          }

        }

      } else {

        /* CLONED OPTIONS */ //INFO: So that the passed options array won't be modified

        let clonedOptions = _.merge ( options, value => value instanceof $ ? value : undefined );

        /* INSTANCE */

        for ( let element of this ) {

          $.factory.instance ( Widget, clonedOptions, element );

        }

      }

      return returnValue;

    };

  };

  /* FACTORY INSTANCE */

  $.factory.instance = function ( Widget, options, element ) {

    let name = Widget.config.name,
        instance = $.data ( element, 'instance.' + name );

    if ( !instance ) {

      instance = new Widget ( options, element );

    }

    return instance;

  };

}( Svelto.$, Svelto._, window, document ));