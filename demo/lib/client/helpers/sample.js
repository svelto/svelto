
SampleHelpers = new AntiHelpers ();

SampleHelpers.registerAs ( 'sample' );

/* STRINGS */

SampleHelpers.define ( 'imageUrl', () => '/sample/sample.png' );

SampleHelpers.define ( 'imageWideUrl', () => '/sample/sample-wide.png' );

SampleHelpers.define ( 'text', function ( wordsNr ) {

  let loremIpsum = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Curabitur aliquet tincidunt turpis, in pharetra mi convallis ut. Vivamus eget sodales nibh, eu placerat erat. Vivamus massa urna, volutpat non tempus eget, placerat quis elit. Nullam pretium id arcu sed eleifend. Phasellus sollicitudin quis ante nec ornare. Maecenas nibh eros, vehicula vel eros eget, viverra semper nisi. Nulla facilisi. Praesent pretium porttitor arcu, sit amet consequat neque luctus non. Cras sodales, justo quis tempus dignissim, diam est commodo orci, eget accumsan sem ante vitae sem. Curabitur quam ipsum, porta id sapien in, consectetur auctor nibh. Vivamus egestas ante vel cursus aliquet. In non ante nec velit tempus lacinia nec sollicitudin ex. Phasellus semper lorem a diam scelerisque, sed accumsan erat molestie. Mauris vulputate lacinia erat. Nunc urna risus, facilisis at posuere in, pulvinar quis odio. Maecenas et sollicitudin arcu.';

  if ( lodash.isNumber ( wordsNr ) ) {

    return loremIpsum.toLowerCase ().split ( '.' ).join ( '' ).split ( ',' ).join ( '' ).split ( ' ' ).slice ( 0, wordsNr ).join ( ' ' );

  }

  return loremIpsum;

});

/* WIDGETS */

SampleHelpers.define ( 'image', function ( classes = '' ) {

  return '<img src="' + SampleHelpers.imageUrl () + '" class="' + classes + '"/>';

});

SampleHelpers.define ( 'imageWide', function ( classes = '' ) {

  return '<img src="' + SampleHelpers.imageWideUrl () + '" class="' + classes + '"/>';

});

SampleHelpers.define ( 'paragraph', function () {

  let widths = ['95%', '92%', '100%', '87%', '97%', '93%', '97%'];

  return widths.map ( width => SWHelpers.placeholder ( width, 10 ) ).join ( '' );

});

SampleHelpers.define ( 'select', function ( name = '' ) {

  return '<select name="' + name + '" placeholder="Select a color...">' +
           '<option value="red" selected="selected">Red</option>' +
           '<option value="green">Green</option>' +
           '<option value="blue">Blue</option>' +
           '<optgroup label="Special">' +
             '<option value="inherit">Inherit</option>' +
             '<option value="transparent">Transparent</option>' +
           '</optgroup>' +
         '</select>';

});

SampleHelpers.define ( 'square', function ( classes = '' ) {

  return '<div class="square-sample ' + classes + '">' +
           '<p>' + SampleHelpers.text ( 9 ) + '</p>' +
         '</div>';

});

/* CODE */

SampleHelpers.define ( 'css', function () {

  return `%widget {
  @include last-child-no-gutter ();
  position: relative;
  margin: 0 0 $gutter;
}

.widget {
  @extend %widget;
}`;

});

SampleHelpers.define ( 'html', function () {

  return `<div class="divider">HTML</div>
<div class="multiple">
  <div class="label">Label</div>
  <div class="button">Button</div>
  <div class="container">Container</div>
</div>`;

});

SampleHelpers.define ( 'js', function () {

  return `(function () {

  'use strict';

  /* SVELTO */

  let Svelto = {
    VERSION: '0.4.0-beta2',
    $: jQuery,
    _: lodash,
    Widgets: {} // Widgets' classes namespace
  };

  /* EXPORT */

  window.Svelto = Svelto;

}());`;

});
