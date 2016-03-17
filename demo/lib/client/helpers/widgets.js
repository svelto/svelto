
SWHelpers = new AntiHelpers ();

SWHelpers.registerAs ( 'sw' );

/* WIDGETS */

SWHelpers.define ( 'action', function ( label, action ) {

  return `<div class="button bordered" onclick="${action}">${label}</div>`;

});

SWHelpers.define ( 'checkbox', function ( label, name = '', value = '' ) {

  return '<label class="button checkbox bordered">' +
           `<span>${label}</span>` +
           `<input type="checkbox" name="${name}" value="${value}">` +
         '</label>';

});

SWHelpers.define ( 'checkAction', function ( label, action, checked ) {

  checked = lodash.isBoolean ( checked ) ? checked : false;

  return '<label class="button checkbox bordered">' +
           `<span>${label}</span>` +
           `<input type="checkbox" ${checked ? 'checked' : ''} onclick="${action}">` +
         '</label>';

});

SWHelpers.define ( 'colorpicker', function ( color = '' ) {

  return '<div class="colorpicker">' +
           `<input name="colorpicker" value="${color}">` +
           '<div class="colorpicker-sb">' +
             '<div class="colorpicker-handler"></div>' +
           '</div>' +
           '<div class="colorpicker-hue">' +
             '<div class="colorpicker-handler"></div>' +
           '</div>' +
         '</div>';

});

SWHelpers.define ( 'datepicker', function ( date = '' ) {

  return '<div class="datepicker">' +
           `<input name="datepicker" value="${date}">` +
           '<div class="datepicker-navigation">' +
             '<div class="button previous" title="Previous month">' +
               '<i class="icon">chevron_left</i>' +
             '</div>' +
             '<div class="datepicker-title">Datepicker</div>' +
             '<div class="button today" title="Today">' +
               '<i class="icon">today</i>' +
             '</div>' +
             '<div class="button next" title="Next month">' +
               '<i class="icon">chevron_right</i>' +
             '</div>' +
           '</div>' +
           '<div class="datepicker-days-names">' +
             '<div title="Monday">M</div>' +
             '<div title="Tuesday">T</div>' +
             '<div title="Wednesday">W</div>' +
             '<div title="Thursday">T</div>' +
             '<div title="Friday">F</div>' +
             '<div title="Saturday">S</div>' +
             '<div title="Sunday">S</div>' +
           '</div>' +
           '<div class="datepicker-days">' +
             '<div class="previous">23</div>' +
             '<div class="previous">24</div>' +
             '<div class="previous">25</div>' +
             '<div class="previous">26</div>' +
             '<div class="previous">27</div>' +
             '<div class="previous">28</div>' +
             '<div class="previous">29</div>' +
             '<div class="previous">30</div>' +
             '<div class="previous">31</div>' +
             '<div>1</div>' +
             '<div>2</div>' +
             '<div>3</div>' +
             '<div>4</div>' +
             '<div>5</div>' +
             '<div>6</div>' +
             '<div>7</div>' +
             '<div>8</div>' +
             '<div>9</div>' +
             '<div>10</div>' +
             '<div>11</div>' +
             '<div>12</div>' +
             '<div>13</div>' +
             '<div>14</div>' +
             '<div>15</div>' +
             '<div>16</div>' +
             '<div>17</div>' +
             '<div>18</div>' +
             '<div>19</div>' +
             '<div>20</div>' +
             '<div>21</div>' +
             '<div>22</div>' +
             '<div>23</div>' +
             '<div>24</div>' +
             '<div>25</div>' +
             '<div>26</div>' +
             '<div>27</div>' +
             '<div>28</div>' +
             '<div>29</div>' +
             '<div>30</div>' +
             '<div>31</div>' +
             '<div class="next">1</div>' +
             '<div class="next">2</div>' +
             '<div class="next">3</div>' +
             '<div class="next">4</div>' +
             '<div class="next">5</div>' +
             '<div class="next">6</div>' +
            '</div>' +
          '</div>';

});

SWHelpers.define ( 'divider', function ( title = '' ) {

  return '<div class="divider block">' +
           `<div class="divider-content">${title}</div>` +
         '</div>';

});

SWHelpers.define ( 'iconAction', function ( icon, action ) {

  return '<div class="button bordered compact" onclick="${action}">' +
           `<i class="icon">${icon}</i>` +
         '</div>';

});

SWHelpers.define ( 'numbox', function ( options ) {

  options = options.hash;

  return `<div class="numbox" data-min="${options.min}" data-max="${options.max}" data-step="${options.step}">` +
           '<div class="button compact numbox-decreaser">' +
             '<i class="icon">remove</i>' +
           '</div>' +
           `<input value="${options.value}" name="${options.name}" class="autogrow compact">` +
           '<div class="button compact numbox-increaser">' +
             '<i class="icon">add</i>' +
           '</div>' +
         '</div>';

});

SWHelpers.define ( 'pager', function ( options ) {

  options = options.hash;

  if ( options.total <= 1 ) return;

  options.url = ( options.url || '#' );

  let getUrl = ( nr ) => ( options.url.indexOf ( '{page}' ) !== -1 ? options.url.replace ( '{page}', nr ) : options.url + nr );

  let pager = '<div class="pager">';

  if ( options.current > 1 ) {

    let nr = options.current - 1,
        url = getUrl ( nr );

    pager += `<a href="${url}" class="button bordered previous" title="Previous page">` +
               '<i class="icon">chevron_left</i>' +
               '<span>Previous</span>' +
             '</a>';

  }

  if ( options.current < options.total || options.total === Infinity || options.total === 'Infinity' ) {

    let nr = options.current + 1,
        url = getUrl ( nr );

    pager += `<a href="${url}" class="button bordered next" title="Next page">` +
               '<span>Next</span>' +
               '<i class="icon">chevron_right</i>' +
             '</a>';

  }

  pager += '</div>';

  return pager;

});

SWHelpers.define ( 'pagination', function ( options ) {

  options = options.hash;

  if ( options.total < 2 ) return;

  options.url = ( options.url || '#' );

  let getUrl = ( nr ) => ( options.url.indexOf ( '{page}' ) !== -1 ? options.url.replace ( '{page}', nr ) : options.url + nr );

  let pagination = '<div class="pagination multiple joined center-x">';

  if ( options.total === Infinity || options.total == 'Infinity' ) {

    pagination += `<a href="${options.url}" class="button bordered compact">Load more</a>`;

  } else {

    let blocks = ( options.blocks || 9 );

    if ( options.current > 1 ) {

      let nr = options.current - 1,
          url = getUrl ( nr );

      pagination += `<a href="${url}" class="button compact bordered previous" title="Previous page">` +
                      '<i class="icon">chevron_left</i>' +
                    '</a>';

      blocks -= 1;

    }

    if ( options.current < options.total ) {

      var needNext = true;
      blocks -= 1;

    } else {

      var needNext = false;

    }

    if ( blocks > 0 ) {

      var needCurrent = true;
      blocks -= 1;

    } else {

      var needCurrent = false;

    }

    let leftBlocks = options.current - 1,
        rightBlocks = options.total - options.current,
        requiredLeftBlocks = Math.floor ( blocks / 2 ),
        requiredRightBlocks = blocks - requiredLeftBlocks,
        outputedLeftBlocks,
        outputedRightBlocks;

    if ( leftBlocks <= requiredLeftBlocks && rightBlocks <= requiredRightBlocks ) {

      outputedLeftBlocks = leftBlocks,
      outputedRightBlocks = rightBlocks;

    } else if ( leftBlocks <= requiredLeftBlocks ) {

      outputedLeftBlocks = leftBlocks,
      outputedRightBlocks = Math.min ( rightBlocks, blocks - outputedLeftBlocks );

    } else if ( rightBlocks <= requiredRightBlocks ) {

      outputedRightBlocks = rightBlocks,
      outputedLeftBlocks = Math.min ( leftBlocks, blocks - outputedRightBlocks );

    } else {

      outputedLeftBlocks = requiredLeftBlocks,
      outputedRightBlocks = requiredRightBlocks;

    }

    while ( outputedLeftBlocks > 0 ) {

      let nr = options.current - outputedLeftBlocks,
          url = getUrl ( nr );

      pagination += `<a href="${url}" class="button compact bordered" title="Page ${nr}">${nr}</a>`;

      outputedLeftBlocks -= 1;

    }

    if ( needCurrent ) {

      pagination += `<div class="label compact bordered active highlighted" title="Current page">${options.current}</div>`;

    }

    let counter = 1;

    while ( counter <= outputedRightBlocks ) {

      let nr = options.current + counter,
          url = getUrl ( nr );

      pagination += `<a href="${url}" class="button compact bordered" title="Page ${nr}">${nr}</a>`;

      counter += 1;

    }

    if ( needNext ) {

      let nr = options.current + 1,
          url = getUrl ( nr );

      pagination += `<a href="${nr}" class="button compact bordered next" title="Next page">` +
                      '<i class="icon">chevron_right</i>' +
                    '</a>';

    }

  }

  pagination += '</div>';

  return pagination;

});

SWHelpers.define ( 'placeholder', function ( width = 0, height = 0, content = true ) {

  width = lodash.isNumber ( width ) ? width + 'px' : width;
  height = lodash.isNumber ( height ) ? height + 'px' : height;
  content = content !== false ? ( lodash.isString ( content ) ? content : width + ' - ' + height ) : '';

  return `<div class="placeholder" style="width:${width}; height:${height};">${content}</div>`;

});

SWHelpers.define ( 'progressbar', function ( value = 0, decimals = 0 ) {

  return `<div data-value="${value}" data-decimals="${decimals}" class="progressbar">` +
           `<div data-value="${value}%" style="min-width:${value}%;" class="progressbar-highlight"></div>` +
         '</div>';

});

SWHelpers.define ( 'radio', function ( label, name = '', value = '' ) {

  return '<label class="button radio bordered">' +
           `<span>${label}</span>` +
           `<input type="radio" name="${name}" value="${value}">` +
         '</label>';

});

SWHelpers.define ( 'radioAction', function ( label, name, action, checked ) {

  checked = lodash.isBoolean ( checked ) ? checked : false;

  return '<label class="button radio bordered">' +
           `<span>${label}</span>` +
           `<input type="radio" name="${name}" ${checked ? 'checked' : ''} onclick="${action}">` +
         '</label>';

});

SWHelpers.define ( 'rater', function ( rating, maximum ) {

  let rater = '<div class="rater">';

  for ( let i = 1; i <= maximum; i++ ) {

    let state = ( rating >= i ? 'active' : ( rating >= i - 0.5 ? 'half-active' : '' ) );

    rater += `<div class="rater-star ${state}"></div>`;

  }

  rater += '</div>';

  return rater;

});

SWHelpers.define ( 'slider', function ( options ) {

  options = options.hash;

  return `<div data-min="${options.min}" data-max="${options.max}" data-step="${options.step}" class="slider">` +
           `<input type="number" name="${options.name}" value="${options.value}">` +
           '<div class="slider-bar">' +
             '<div class="slider-highlight"></div>' +
           '</div>' +
           '<div class="slider-handler">' +
             '<div class="slider-label"></div>' +
           '</div>' +
         '</div>';

});

SWHelpers.define ( 'spinner', function ( classes = '' ) {

  return `<svg class="spinner ${classes}">` +
           '<circle cx="1.625em" cy="1.625em" r="1.25em"></circle>' +
         '</svg>';

});

SWHelpers.define ( 'spinnerLabel', function ( classes = '' ) {

  let spinner = SWHelpers.spinner ();

  return `<div class="spinner-label ${classes}">${spinner}</div>`;

});

SWHelpers.define ( 'switch', function ( options ) {

  options = options.hash;

  options['color-on'] = options['color-on'] || '';
  options['color-off'] = options['color-off'] || '';
  options.name = options.name || '';
  options.value = options.value || 0;

  return `<div data-color-on="${options['color-on']}" data-color-off="${options['color-off']}" class="switch">` +
           `<input type="checkbox" name="${options.name}" value="${options.value}">` +
           '<div class="switch-bar"></div>' +
           '<div class="switch-handler"></div>' +
         '</div>';

});

/* TOOLS */

SWHelpers.define ( 'notification', function ( options ) {

  $.notification ( ( options instanceof Spacebars.kw ) ? options.hash : ( options || '' ) );

});

SWHelpers.define ( 'timeAgo', function ( timestamp ) {

  return lodash.timeAgo ( timestamp ).str;

});

SWHelpers.define ( 'toast', function ( options ) {

  $.toast ( ( options instanceof Spacebars.kw ) ? options.hash : ( options || '' ) );

});

/* UTILITIES */

SWHelpers.define ( 'times', function ( times, start ) {

  start = lodash.isNumber ( start ) ? start : 1;

  return lodash.range ( start, times + start );

});

SWHelpers.define ( 'nowSecs', function ( offset ) {

  offset = lodash.isNumber ( offset ) ? offset : 0;

  return lodash.nowSecs () + offset;

});