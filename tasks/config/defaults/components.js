
/* =========================================================================
 * Svelto - Tasks - Config - Defaults (Components)
 * =========================================================================
 * Copyright (c) 2015-2016 Fabio Spampinato
 * Licensed under MIT (https://github.com/svelto/svelto/blob/master/LICENSE)
 * ========================================================================= */

//TODO: Maybe use an object and set it : true/false for including/skipping the specified component, this way we can include `typography` without `abbr` simply with a `{ typography: true, 'typography/abbr': false }`

/* COMPONENTS */

var components = [
  'accordion',
  'animations',
  'attached',
  'autogrow',
  // 'autogrow/input',
  // 'autogrow/textarea',
  'blurred',
  // 'boilerplate',
  'breadcrumb',
  'breakpoint',
  'breakpoints',
  'browser',
  'bteach',
  'button',
  // 'button/corner',
  // 'button/tag',
  'card',
  'carousel',
  'chat',
  'checkbox',
  'closer',
  'color',
  'colorpicker',
  'colors',
  'constants',
  'container',
  'cookie',
  'core',
  'datepicker',
  'divider',
  // 'divider/block',
  // 'divider/hr',
  // 'divider/linear',
  // 'divider/text',
  'draggable',
  'dropdown',
  'droppable',
  'embedded',
  'embedded_css',
  'expander',
  'extras',
  'factory',
  'flags',
  'flickable',
  'flippable',
  'footer',
  'form',
  'form_ajax',
  'form_sync',
  'form_validate',
  'fullscreen',
  'grid',
  'header',
  'helpers',
  // 'helpers/border',
  // 'helpers/center',
  // 'helpers/display',
  // 'helpers/fill',
  // 'helpers/flexbox',
  // 'helpers/flip',
  // 'helpers/float',
  // 'helpers/gradient',
  // 'helpers/gutter',
  // 'helpers/image',
  // 'helpers/margin',
  // 'helpers/media_queries',
  // 'helpers/others',
  // 'helpers/overflow',
  // 'helpers/padding',
  // 'helpers/rotation',
  // 'helpers/text',
  // 'helpers/visibility',
  'highlight',
  'icon',
  'icons',
  'image',
  'infobar',
  'input',
  'keyboard',
  'label',
  // 'label/badge',
  // 'label/corner',
  // 'label/floating',
  // 'label/ribbon',
  // 'label/tag',
  'layout',
  'modal',
  'mouse',
  'multiple',
  'n_times_action',
  'notification',
  'noty',
  // 'noty/autoexpand',
  // 'noty/queue',
  // 'noty/queues',
  'one_time_action',
  'opener',
  'outline',
  'overlay',
  'pager',
  'panel',
  'parallax',
  'placeholder',
  'pointer',
  'positionate',
  'prism',
  'progressbar',
  // 'progressbar/indeterminate',
  // 'progressbar/labeled',
  // 'progressbar/striped',
  'radio',
  'raisable',
  'rater',
  'regexes',
  'remote',
  // 'remote/action',
  // 'remote/modal',
  'reset',
  'ripple',
  'route',
  'scroll',
  'sections',
  'select',
  // 'select/dropdown',
  // 'select/toggler',
  'selectable',
  'shape',
  // 'shape/circle',
  // 'shape/square',
  // 'shape/square/sample',
  // 'shape/triangle',
  'sizes',
  'slider',
  'sortable',
  'spinner',
  // 'spinner/label',
  // 'spinner/multicolor',
  'spinner_overlay',
  'statistic',
  'stepper',
  'svelto',
  'switch',
  'table',
  // 'table/bordered',
  // 'table/hoverable',
  // 'table/separated',
  // 'table/striped',
  'table_helper',
  'tabs',
  'tagbox',
  'targeter',
  'textarea',
  'time_ago',
  'timer',
  'tmpl',
  'toggler',
  'toolbar',
  'tooltip',
  'touching',
  'transform',
  'typography',
  // 'typography/abbr',
  // 'typography/blockquote',
  // 'typography/code',
  // 'typography/headers',
  // 'typography/kbd',
  // 'typography/link',
  // 'typography/lists',
  // 'typography/mark',
  // 'typography/paragraph',
  // 'typography/small',
  'validator',
  'widget',
  'widgetize',
  'z_depths'
];

/* EXPORT */

module.exports = components;
