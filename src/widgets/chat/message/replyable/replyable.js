
// @require core/colors/colors.js
// @require core/widget/widget.js
// @require widgets/remote/loader/loader.js

(function ( $, _, Svelto, Factory, Colors ) {

  /* CONFIG */

  let config = {
    name: 'chatMessageReplyable',
    plugin: true,
    selector: '.chat-message.replyable',
    templates: {
      reply: _.template ( `
        <div class="chat-message-reply no-tip <%= o.cls %>">
          <%= o.img ? '<div class="chat-message-img"></div>' : '' %>
          <div class="chat-message-content remote-loader no-wrap container bordered" data-url="<%= o.url %>">
            <svg class="spinner">
              <circle cx="1.625em" cy="1.625em" r="1.25em"></circle>
            </svg>
          </div>
        </div>
      ` )
    },
    options: {
      url: false, // Url for remote-loading the actual reply widget
      datas: {
        url: 'reply-url'
      },
      selectors: {
        // reply: '+ .chat-message-reply' //TODO: Limited DOM libraries support
      },
      callbacks: {
        reply: _.noop,
        unreply: _.noop
      }
    }
  };

  /* CHAT MESSAGE REPLY */

  class ChatMessageReplyable extends Svelto.Widget {

    /* SPECIAL */

    _variables () {

      this.$replyable = this.$element;

      this.options.url = this.$replyable.data ( this.options.datas.url ) || this.options.url;

    }

    /* HELPERS */

    _getReply () {

      return this.$replyable.next ().filter ( '.chat-message-reply' );

    }

    /* API */

    reply () {

      let $reply = this._getReply ();

      if ( $reply.length ) return $reply[0].focus ();

      let cls = this.$replyable.attr ( 'class' ),
          img = !!this.$replyable.children ( '.chat-message-img' ).length,
          url = this.options.url,
          options = {cls, img, url};

      $reply = $(this._template ( 'reply', options ));

      this.$replyable.after ( $reply );

      $reply.widgetize ()[0].focus ();

      this._trigger ( 'reply' );

    }

    unreply () {

      let $reply = this._getReply ();

      if ( !$reply.length ) return;

      $reply.trigger ( 'chatmessagereplyablereply:unreply' ).remove ();

      this._trigger ( 'unreply' );

    }

  }

  /* FACTORY */

  Factory.make ( ChatMessageReplyable, config );

}( Svelto.$, Svelto._, Svelto, Svelto.Factory, Svelto.Colors ));
