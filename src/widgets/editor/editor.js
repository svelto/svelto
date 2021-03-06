
// @optional ./vendor/marked.js
// @optional lib/emojify/emojify.js
// @optional lib/markdown/markdown.js
// @optional widgets/emoji/picker/popover/popover_trigger.js
// @optional widgets/form/ajax/ajax.js
// @require widgets/storable/storable.js

//TODO: MAYBE make a simpler editor with some stuff unimplemented, then extend it with a `EditorMarkdown` etc...
//TODO: Switch to a `contenteditable` version where the preview and editor actual are the same thing

(function ( $, _, Svelto, Widgets, Factory, Pointer, Emoji, Emojify, EmojipickerPopover, EmojipickerPopoverTrigger, Markdown ) {

  /* CONFIG */

  let config = {
    name: 'editor',
    plugin: true,
    selector: '.editor',
    options: {
      parentUnfullscreenEvents: 'popover:close modal:close panel:close chatmessageeditable:unedit chatmessagereplyable:unreply chatmessagereplyablereply:unreply', //FIXME: Ugly
      parser: Markdown.parse,
      storage: {
        enabled: false, // Whether to preserve the content across refreshes/sessions
        ttl: 604800 // 1 week
      },
      actions: {
        bold () {
          this._action ( '**', '**', 'bold' );
        },
        italic () {
          this._action ( '_', '_', 'italic' );
        },
        strikethrough () {
          this._action ( '~~', '~~', 'removed' );
        },
        list_unordered () {
          this._action ( '\n- ', '\n', 'List element' );
        },
        list_ordered () {
          this._action ( '\n1. ', '\n', 'List element' );
        },
        header_1 () {
          this._action ( '\n# ', '\n', 'Header' );
        },
        header_2 () {
          this._action ( '\n## ', '\n', 'Header' );
        },
        header_3 () {
          this._action ( '\n### ', '\n', 'Header' );
        },
        link () {
          this._action ( '[', '](https://example.com)', 'Link' );
        },
        image () {
          this._action ( '![', '](https://example.com/image.jpg)', 'Image' );
        },
        code () {
          this._action ( '`', '`', 'code' );
        },
        quote () {
          this._action ( '\n> ', '\n', 'Quote' );
        },
        divider () {
          this._action ( '\n-----', '\n', '', false );
        },
        undo () {
          document.execCommand ( 'undo' );
        },
        redo () {
          document.execCommand ( 'redo' );
        },
        store () {
          this._storageSet ( this._storageKey, this.get (), this.options.storage.ttl );
        },
        unstore () {
          this._storageRemove ( this._storageKey );
        },
        restore () {
          this.set ( this._storageGet ( this._storageKey ) );
        },
        preview () {
          this.togglePreview ();
        },
        fullscreen () {
          this.toggleFullscreen ();
        }
      },
      datas: {
        action: 'action'
      },
      classes: {
        preview: 'preview',
        fullscreen: 'fullscreen',
        fullscreenable: {
          request: 'fullscreen-request'
        },
        trigger: {
          active: 'active text-secondary',
        }
      },
      selectors: {
        actions: '[data-action]',
        fullscreenable: '.card, .chat, .chat-message-content, .modal, .panel, .popover',
        preview: '.editor-preview',
        textarea: 'textarea',
        form: 'form',
        triggers: {
          all: '[data-action]',
          preview: '[data-action="preview"]',
          fullscreen: '[data-action="fullscreen"]'
        }
      },
      keystrokes: {
        'ctmd + b': ['action', 'bold'],
        'ctmd + i': ['action', 'italic'],
        'ctmd + s': ['action', 'strikethrough'],
        'ctmd + u': ['action', 'list_unordered'],
        'ctmd + o': ['action', 'list_ordered'],
        'ctmd + l': ['action', 'link'],
        'ctmd + g': ['action', 'image'],
        'ctmd + k': ['action', 'code'],
        'ctmd + m': ['action', 'quote'],
        'ctmd + d': ['action', 'divider'],
        'ctrl + shift + p': ['action', 'preview'],
        'ctrl + shift + f': ['action', 'fullscreen'],
        'esc': '__esc'
      },
      callbacks: {
        action: _.noop,
        preview: _.noop,
        unpreview: _.noop,
        fullscreen: _.noop,
        unfullscreen: _.noop
      }
    }
  };

  /* EDITOR */

  class Editor extends Widgets.Storable {

    /* SPECIAL */

    _variables () {

      super._variables ();

      this.$editor = this.$element;
      this.editor = this.$editor[0];

      this.$textarea = this.$editor.find ( this.options.selectors.textarea );
      this.textarea = this.$textarea[0];
      this.$preview = this.$editor.find ( this.options.selectors.preview );

      this.$triggers = this.$editor.find ( this.options.selectors.triggers.all );
      this.$triggerPreview = this.$triggers.filter ( this.options.selectors.triggers.preview );
      this.$triggerFullscreen = this.$triggers.filter ( this.options.selectors.triggers.fullscreen );

      this.$fullscreenable = this.$editor.parents ( this.options.selectors.fullscreenable );

      this.$emojipickerPopoverTrigger = EmojipickerPopoverTrigger ? this.$editor.find ( EmojipickerPopoverTrigger.config.selector ) : false;

      this.$form = this.$editor.closest ( this.options.selectors.form );

    }

    _init () {

      this._isPreview = this.$editor.hasClass ( this.options.classes.preview );
      this._isFullscreen = this.$editor.hasClass ( this.options.classes.fullscreen );

      /* STORAGE */

      this.options.storage.enabled = this.options.storage.enabled || $.widget.is ( this.editor, Widgets.Storable, true );

      if ( this.options.storage.enabled ) {

        this._storageInit ();

        if ( this._storageKey ) {

          let action = this.get () ? 'store' : 'restore';

          this.options.actions[action].apply ( this );

        }

      }

    }

    _events () {

      this.___change ();
      this.___keydown ();
      this.___triggers ();
      this.___parentUnfullscreen ();

      if ( this.options.storage.enabled && this._storageKey ) {

        this.___storage ();

        if ( this.$form.length ) this.___submit ();

      }

      if ( this.$emojipickerPopoverTrigger && this.$emojipickerPopoverTrigger.length ) this.___emojipicker ();

    }

    /* CHANGE */

    ___change () {

      this._on ( true, 'change', this.__change );

    }

    __change () {

      if ( !this._isPreview ) return;

      this._render ();

    }

    /* KEYDOWN */

    ___keydown ( $target ) {

      this._onHover ( [$.$document, 'keydown', this.__keydown] );
      this._on ( this.$textarea, 'keydown', this.__keydown );

    }

    /* ESC */

    __esc () {

      if ( !this.isFullscreen () ) return null;

      this.unfullscreen ();

    }

    /* TRIGGERS */

    ___triggers () {

      for ( let i = 0, l = this.$triggers.length; i < l; i++ ) {

        let trigger = this.$triggers[i],
            $trigger = $(trigger),
            action = $trigger.data ( this.options.datas.action );

        this._on ( $trigger, Pointer.tap, event => this.action ( action, event ) );

      }

    }

    /* PARENT UNFULLSCREEN */

    ___parentUnfullscreen () {

      this._on ( true, $.$document, this.options.parentUnfullscreenEvents, this.__parentUnfullscreen );

    }

    __parentUnfullscreen ( event ) {

      if ( !event.target.contains ( this.editor ) ) return;

      this.unfullscreen ();

    }

    /* STORAGE */

    ___storage () {

      this._on ( 'change cut paste keyup', this._throttle ( this.options.actions.store.bind ( this ), 1000 ) );

    }

    _storageInit () {

      this._storageKey = this.$editor.attr ( 'id' );

    }

    /* SUBMIT */

    ___submit () {

      let event = Widgets.FormAjax && $.widget.is ( this.$form[0], Widgets.FormAjax ) ? 'formajax:success' : 'submit';

      this._on ( this.$form, event, this.__submit );

    }

    __submit () {

      this.options.actions.unstore.apply ( this );

    }

    /* EMOJIPICKER */

    ___emojipicker () {

      this._on ( true, this.$emojipickerPopoverTrigger, 'emojipickerpopovertrigger:beforetrigger', this.___emojipickerOpen );

    }

    ___emojipickerOpen () {

      this._one ( true, $.$document, 'emojipickerpopover:open', this.__emojipickerOpen );

    }

    __emojipickerOpen () {

      this._one ( true, $.$document, 'emojipickerpopover:beforeclose', this.__emojipickerClose );
      this._on ( true, $.$document, 'emojipicker:pick', this.__emojipickerPick );

    }

    __emojipickerClose () {

      this._off ( $.$document, 'emojipicker:pick', this.__emojipickerPick );

    }

    __emojipickerPick ( event, data ) {

      let encoded = Emoji.encode ( data.emoji, data.tone );

      this._insertAtSelection ( encoded, true );

    }

    /* SELECTION */

    _getSelection () {

      let start = this.textarea.selectionStart,
          end   = this.textarea.selectionEnd,
          text  = this.$textarea.val ().substring ( start, end );

      return { start, end, text };

    }

    _getWordSelection () {

      let value     = this.$textarea.val (),
          selection = this._getSelection ();

      if ( selection.text.length || !value ) return selection;

      /* FINDING */

      let start = selection.start;

      while ( start >= 0 && start < value.length ) {

        if ( !value[start].match ( /[a-zA-Z0-9-]/ ) ) break;

        start -= 1;

      }

      start = Math.min ( selection.start, start + 1 );


      let end = selection.end + 1;

      while ( end < value.length ) {

        if ( !value[end].match ( /[a-zA-Z0-9-]/ ) ) break;

        end += 1;

      }

      if ( start === selection.start || end === selection.end ) return selection;

      this.textarea.setSelectionRange ( start, end );

      return this._getSelection ();

    }

    _insertAtSelection ( text, padding = false ) {

      let value     = this.$textarea.val (),
          selection = this._getSelection (),
          padLeft   = padding && selection.start && value[selection.start - 1] !== ' ' ? ' ' : '',
          padRight  = padding && selection.end < value.length && value[selection.end] !== ' ' ? ' ' : '',
          newValue  = value.substr ( 0, selection.start ) + padLeft + text + padRight + value.substr ( selection.end, value.length ),
          newRange  = selection.start + padLeft.length + text.length;

      this.$textarea.val ( newValue ).trigger ( 'change' );

      this.textarea.setSelectionRange ( newRange, newRange );

    }

    _replaceSelection ( prefix, suffix, placeholder ) {

      let value     = this.$textarea.val (),
          selection = this._getSelection (),
          newValue  = value.substr ( 0, selection.start ) + prefix + placeholder + suffix + value.substr ( selection.end, value.length );

      this.$textarea.val ( newValue ).trigger ( 'change' );

      this.textarea.setSelectionRange ( selection.start + prefix.length, selection.start + prefix.length + placeholder.length );

    }

    _isSelectionWrapped ( prefix, suffix ) {

      let value     = this.$textarea.val (),
          selection = this._getSelection ();

      return value.substr ( selection.start - prefix.length, prefix.length ) === prefix &&
             value.substr ( selection.end, suffix.length ) === suffix;

    }

    _toggleWrapSelection ( prefix, suffix, placeholder ) {

      if ( this._isSelectionWrapped ( prefix, suffix ) ) {

        this._unwrapSelection ( prefix, suffix, placeholder );

      } else {

        this._wrapSelection ( prefix, suffix );

      }

    }

    _wrapSelection ( prefix, suffix ) {

      let value     = this.$textarea.val (),
          selection = this._getSelection (),
          newValue  = value.substr ( 0, selection.start ) + prefix + selection.text + suffix + value.substr ( selection.end, value.length );

      this.$textarea.val ( newValue ).trigger ( 'change' );

      this.textarea.setSelectionRange ( selection.start + prefix.length, selection.end + prefix.length );

    }

    _unwrapSelection ( prefix, suffix, placeholder ) {

      let value         = this.$textarea.val (),
          selection     = this._getSelection (),
          isPlaceholder = selection.text === placeholder,
          newValue      = value.substr ( 0, selection.start - prefix.length ) + ( isPlaceholder ? '' : selection.text ) + value.substr ( selection.end + suffix.length, value.length );

      this.$textarea.val ( newValue ).trigger ( 'change' );

      this.textarea.setSelectionRange ( selection.start - prefix.length, selection.end - prefix.length - ( isPlaceholder ? selection.text.length : 0 ) );

    }

    /* ACTION */

    _action ( prefix, suffix, placeholder, needWord = true ) {

      let selection = needWord ? this._getWordSelection () : this._getSelection ();

      if ( selection.text.length ) {

        this._toggleWrapSelection ( prefix, suffix, placeholder );

      } else {

        this._replaceSelection ( prefix, suffix, placeholder );

      }

    }

    /* PARSE */

    _parse ( str = this.$textarea.val () ) {

      return this.options.parser ( str );

    }

    /* RENDER */

    async _render () {

      this.$preview.html ( await this._parse () );

      if ( Emojify ) this.$preview.emojify ();

    }

    /* API */

    get ( parsed ) {

      return parsed ? this._parse () : this.$textarea.val ();

    }

    set ( value ) {

      if ( !_.isString ( value ) || value === this.$textarea.val () ) return;

      this.$textarea.val ( value ).trigger ( 'change' );

      if ( this._isPreview ) this._render ();

    }

    reset () {

      return this.set ( '' );

    }

    action ( action, event ) {

      if ( !action || !this.options.actions.hasOwnProperty ( action ) ) return;

      if ( event ) event.preventDefault ();

      this.options.actions[action].apply ( this );

      this.textarea.focus ();

      this._trigger ( 'action', {action} );

    }

    /* PREVIEW */

    isPreview () {

      return this._isPreview;

    }

    togglePreview ( force = !this._isPreview ) {

      return this[force ? 'preview' : 'unpreview']();

    }

    preview () {

      if ( this._isPreview ) return null;

      this._isPreview = true;

      this._render ();

      this.$preview.height ( this.$textarea.height () );

      this.$editor.addClass ( this.options.classes.preview );

      this.$triggerPreview.addClass ( this.options.classes.trigger.active );

      this._trigger ( 'preview' );

    }

    unpreview () {

      if ( !this._isPreview ) return null;

      this._isPreview = false;

      this.$editor.removeClass ( this.options.classes.preview );

      this.$triggerPreview.removeClass ( this.options.classes.trigger.active );

      this._trigger ( 'unpreview' );

    }

    /* FULLSCREEN */

    isFullscreen () {

      return this._isFullscreen;

    }

    toggleFullscreen ( force = !this._isFullscreen ) {

      return this[force ? 'fullscreen' : 'unfullscreen']();

    }

    fullscreen () {

      if ( this._isFullscreen ) return null;

      this._isFullscreen = true;

      this.$layout.disableScroll ();
      this.$fullscreenable.addClass ( this.options.classes.fullscreenable.request );
      this.$editor.addClass ( this.options.classes.fullscreen );

      this.$triggerFullscreen.addClass ( this.options.classes.trigger.active );

      this._trigger ( 'fullscreen' );

    }

    unfullscreen () {

      if ( !this._isFullscreen ) return null;

      this._isFullscreen = false;

      this.$layout.enableScroll ();
      this.$fullscreenable.removeClass ( this.options.classes.fullscreenable.request );
      this.$editor.removeClass ( this.options.classes.fullscreen );

      this.$triggerFullscreen.removeClass ( this.options.classes.trigger.active );

      this._trigger ( 'unfullscreen' );

    }

  }

  /* FACTORY */

  Factory.make ( Editor, config );

}( Svelto.$, Svelto._, Svelto, Svelto.Widgets, Svelto.Factory, Svelto.Pointer, Svelto.Emoji, Svelto.Emojify, Svelto.Widgets.EmojipickerPopover, Svelto.Widgets.EmojipickerPopoverTrigger, Svelto.Markdown ));
