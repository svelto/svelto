
/* =========================================================================
 * Svelto - Widgets - Chart
 * =========================================================================
 * Copyright (c) 2015-2017 Fabio Spampinato
 * Licensed under MIT (https://github.com/svelto/svelto/blob/master/LICENSE)
 * =========================================================================
 * @require ./config.js
 * @require core/widget/widget.js
 * ========================================================================= */

/* CHART */

(function ( $, _, Svelto, Widgets, Factory, ChartLib ) {

  'use strict';

  /* CHECK IF LOADED */

  if ( !ChartLib ) return;

  /* CONFIG */

  let config = {
    name: 'chart',
    plugin: true,
    selector: 'canvas.chart',
    options: {
      defaults: {
        type: 'line',
        colors: ['#1565c0'], // Primary color
        labels: ['Dataset'],
        datas: [[]]
      },
      datas: {
        type: 'type',
        colors: 'colors',
        labels: 'labels',
        datas: 'datas'
      }
    }
  };

  /* CHART */

  class Chart extends Widgets.Widget {

    /* SPECIAL */

    _variables () {

      this.$chart = this.$element;
      this.chart = this.element;

      let properties = ['type', 'colors', 'labels', 'datas'];

      for ( let property of properties ) {

        this[property] = this.$chart.data ( this.options.datas[property] ) || this.options.defaults[property];

      }

      if ( !_.isArray ( this.datas[0] ) ) this.datas = [this.datas];

    }

    _init () {

      let settings = this._getSettings ();

      this.instance = new ChartLib ( this.chart, settings );

    }

    _destroy () {

      this.instance.destroy ();

    }

    /* PRIVATE */

    _getSettings () {

      return {
        type: this.type,
        data: {
          labels: this.datas[0].map ( ( point, index ) => index + 1 ),
          datasets: _.map ( this.labels, ( label, index ) => ({
            label,
            data: this.datas[index],
            backgroundColor: this.colors[index]
          }))
        }
      };

    }

  }

  /* FACTORY */

  Factory.make ( Chart, config );

}( Svelto.$, Svelto._, Svelto, Svelto.Widgets, Svelto.Factory, window.Chart ));
