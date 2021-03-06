
// @optional core/polyfills/polyfills.js
// @optional core/shims/shims.js
// @require core/lodash/lodash.js
// @require core/jquery/jquery.js
// @require core/modernizr/modernizr.js

(function () {

  /* SVELTO */

  let Svelto = {

    VERSION: '[pacco.svelto.version]',
    ENVIRONMENT: '[pacco.environment[0]]',
    DEVELOPMENT: '[pacco.environment[0]]' === 'development',

    /* DEPENDENCIES */

    _: window._,
    $: window.$,
    Modernizr: window.Modernizr,

    /* NAMESPACES */

    Instances: {},
    Templates: {},
    Widgets: {}

  };

  /* EXPORT */

  window.Svelto = Svelto;

}());
