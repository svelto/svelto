
// @priority 300
// @require core/widgetize/widgetize.js
// @require lib/emoji/emoji.js

(function ( $, _, Svelto, Widgetize, EmojiData, Emoji ) {

  /* EMOJIFY */

  let Emojify = {

    /* OPTIONS */

    options: {
      parse: {
        emoticon: true,
        encoded: true,
        unicode: false //FIXME: Doesn't work properly, and it's very slow
      }
    },

    /* UTILITIES */

    getEmoticons ( str ) {

      let matches = _.findMatches ( str, Emoji.options.regexes.emoticon ),
          sorted  = matches.sort ( ( a, b ) => b.index - a.index );

      return sorted.map ( match => ({
        emoticon: match[0],
        index: match.index
      }));

    },

    getEncoded ( str ) {

      let matches = _.findMatches ( str, Emoji.options.regexes.encoded ),
          uniq    = _.uniqBy ( matches, _.first ),
          sorted  = uniq.sort ( ( a, b ) => b[0].length - a[0].length );

      return sorted.map ( match => ({
        encoded: match[0],
        name: match[1],
        tone: match[3] || Emoji.options.tone
      }));

    },

    /* PARSE */

    async parseEmoticon ( str, options ) {

      if ( !Emojify.options.parse.emoticon ) return str;

      let matches = Emojify.getEmoticons ( str );

      for ( let i = 0, l = matches.length; i < l; i++ ) {

        let {emoticon, index} = matches[i];

        if ( ( index > 0 && !str[index - 1].match ( /\s/ ) ) || ( index + emoticon.length < str.length && !str[index + emoticon.length].match ( /\s/ ) ) ) continue;

        let emoji = await Emoji.getByEmoticon ( emoticon, true );

        if ( !emoji ) return;

        let parsed = await Emoji.make ( emoji.id, Emoji.options.tone, options );

        str = str.substring ( 0, index ) + parsed + str.substring ( index + emoticon.length );

      }

      return str;

    },

    async parseEncoded ( str, options ) {

      if ( !Emojify.options.parse.encoded ) return str;

      let matches = Emojify.getEncoded ( str );

      for ( let i = 0, l = matches.length; i < l; i++ ) {

        let {encoded, name, tone} = matches[i],
            emoji = await Emoji.getByName ( name );

        if ( !emoji ) continue;

        let parsed = await Emoji.make ( emoji.id, tone, options );

        str = _.replaceAll ( str, encoded, parsed );

      }

      return str;

    },

    async parseUnicode ( str, options ) {

      if ( !Emojify.options.parse.unicode ) return str;

      let data = await EmojiData.get ();

      for ( let i = 0, l = data.chars.length; i < l; i++ ) {

        let [char, name] = data.chars[i],
            emoji = await Emoji.getByName ( name ),
            tones = emoji.tones ? 6 : 1;

        for ( let ti = 6, tl = 1; ti >= tl; ti-- ) {

          let unicode = await Emoji.emoji2unicode ( emoji, ti );

          if ( str.indexOf ( unicode ) === -1 ) continue;

          str = _.replaceAll ( str, unicode, await Emoji.make ( name, ti, options ) );

        }

      }

      return str;

    },

    /* API */

    async emojify ( target, options ) {

      if ( target instanceof $ ) {

        return Promise.all ( target.get ().map ( node => Emojify.node ( node, options ) ) );

      } else if ( _.isElement ( target ) ) {

        return Emojify.node ( target, options );

      } else if ( _.isString ( target ) ) {

        return Emojify.string ( target, options );

      }

    },

    async string ( str, options ) {

      return Emojify.parseUnicode ( str, options )
                    .then ( str => Emojify.parseEncoded ( str, options ) )
                    .then ( str => Emojify.parseEmoticon ( str, options ) );

    },

    async node ( node, options ) {

      let type = node.nodeType;

      if ( type === 3 ) { // Text node

        let value = node.nodeValue,
            parsed = await Emojify.string ( value, options );

        if ( value !== parsed ) {

          if ( Emoji.options.native.enabled && !Emoji.options.native.wrap ) {

            node.nodeValue = parsed;

          } else {

            let parent = node.parentNode;

            if ( !parent ) return; // Maybe `node` is a remotely loaded element, not attached to the DOM

            if ( parent.childNodes.length === 1 ) {

              parent.innerHTML = parsed;

            } else {

              let replacement = $.parseHTML ( `<span>${parsed}</span>` )[0];

              node.parentNode.replaceChild ( replacement, node );

            }

          }

        }

      } else if ( type === 1 ) { // Element node

        return Promise.all ( Array.prototype.map.call ( node.childNodes, node => Emojify.node ( node, options ) ) );

      }

    }

  };

  /* PLUGIN */

  $.fn.emojify = function ( options ) {

    return Emojify.emojify ( this, options );

  };

  /* WIDGETIZE */

  Widgetize.add ( '.emojify', Emojify.emojify );

  /* EXPORT */

  Svelto.Emojify = Emojify;

}( Svelto.$, Svelto._, Svelto, Svelto.Widgetize, Svelto.EmojiData, Svelto.Emoji ));
