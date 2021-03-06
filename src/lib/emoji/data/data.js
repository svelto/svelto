
// @optional ./raw/raw.js
// @require core/svelto/svelto.js
// @require lib/fetch/fetch.js

(function ( $, _, Svelto, EmojiDataRaw, fetch ) {

  /* EMOJI DATA */

  let EmojiData = {

    /* VARIABLES */

    _raw: EmojiDataRaw,
    _rawUrl: `/static/json/emoji.json?v=${Svelto.VERSION}`,
    _data: undefined,

    /* UTILITIES */

    _parse ( data ) {

      // data = JSON.parse ( JSON.stringify ( data ) );

      data.alts = {};
      // data.chars = [];
      data.emojis = {};
      data.emoticons = {};

      data.categories.forEach ( category => {

        category.emojis.forEach ( emoji => {

          if ( emoji.alts ) {

            emoji.alts.forEach ( alt => data.alts[alt] = emoji );

          }

          // data.chars.push ([ emoji.char, emoji.id ]);

          data.emojis[emoji.id] = emoji;

          if ( emoji.emoticons ) {

            emoji.emoticons.forEach ( emoticon => {

              let prev = data.emoticons[emoticon];

              if ( _.isUndefined ( prev ) ) {

                data.emoticons[emoticon] = emoji;

              } else if ( _.isArray ( prev ) ) {

                data.emoticons[emoticon].push ( emoji );

              } else {

                data.emoticons[emoticon] = [prev, emoji];

              }

            });

          }

        });

      });

      // data.chars = data.chars.sort ( ( a, b ) => b[0].length - a[0].length );

      return data;

    },

    /* METHODS */

    async getRemoteRaw () {

      return ( await fetch ( EmojiData._rawUrl ) ).json ();

    },

    async getRaw () {

      if ( EmojiData._raw ) return EmojiData._raw;

      return EmojiData._raw = await EmojiData.getRemoteRaw ();

    },

    async get () {

      if ( EmojiData._data ) return EmojiData._data;

      let raw = await EmojiData.getRaw ();

      if ( EmojiData._data ) return EmojiData._data; // It may have been already parsed by another concurrent call

      return EmojiData._data = EmojiData._parse ( raw );

    }

  };

  /* EXPORT */

  Svelto.EmojiData = EmojiData;

}( Svelto.$, Svelto._, Svelto, Svelto.EmojiDataRaw, Svelto.fetch ));
