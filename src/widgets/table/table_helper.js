
// @require core/widget/widget.js

(function ( $, _, Svelto, Factory ) {

  /* CONFIG */

  let config = {
    name: 'tableHelper',
    plugin: true,
    selector: 'table.table',
    templates: {
      row: _.template ( `
        <tr <%= o.id ? 'class=' + o.id : '' %> >
          <% for ( var i = 0, l = o.datas.length; i < l; i++ ) { %>
            <td><%= o.datas[i] %></td>
          <% } %>
          <% for ( var i = 0, l = o.missing; i < l; i++ ) { %>
            <td></td>
          <% } %>
        </tr>
      ` )
    },
    options: {
      rowIdPrefix: 'srid',
      selectors: {
        header: 'thead',
        body: 'tbody',
        headerCell: 'th',
        rowCell: 'td',
        emptyRow: 'tr.table-row-empty',
        notEmptyRow: 'tr:not(.table-row-empty)'
      },
      callbacks: {
        change: _.noop,
        add: _.noop,
        update: _.noop,
        remove: _.noop,
        clear: _.noop
      }
    },
  };

  /* TABLE HELPER */

  class TableHelper extends Svelto.Widget {

    /* SPECIAL */

    _variables () {

      this.$table = this.$element;
      this.$header = this.$table.find ( this.options.selectors.header );
      this.$body = this.$table.find ( this.options.selectors.body );
      this.$headerCells = this.$header.find ( this.options.selectors.headerCell );
      this.$emptyRow = this.$body.find ( this.options.selectors.emptyRow );

      this.columnsNr = this.$headerCells.length;

    }

    /* PRIVATE */

    _getRowId ( id ) {

      return this.options.rowIdPrefix + '-' + this.guid + '-' + id;

    }

    /* API */

    add ( id, ...datas ) {

      let rowId = id ? this._getRowId ( id ) : false;

      if ( datas.length ) {

        if ( rowId && $( '.' + rowId ).length === 1 ) return;

        let chunks = _.chunk ( datas, this.columnsNr ),
            $rows = $();

        chunks.forEach ( chunk => {

          let rowHtml = this._template ( 'row', { id: rowId, datas: chunk, missing: this.columnsNr - chunk.length } ),
              $row = $(`<table>${rowHtml}</table>`).find ( 'tr' ); // Parsing a `tr` tag without a table might not be supported by the DOM library

          $rows = $rows.add ( $row );

        });

        this.$body.append ( $rows );

        this._trigger ( 'change' );

        this._trigger ( 'add', {
          $rows: $rows
        });

      }

    }

    update ( id, ...datas ) {

      let $row = $( '.' + this._getRowId ( id ) );

      if ( datas.length && $row.length === 1 ) {

        let $rowCells = $row.find ( this.options.selectors.rowCell );

        for ( let i = 0, l = datas.length; i < l; i++ ) {

          if ( _.isString ( datas[i] ) ) {

            $rowCells.eq ( i ).html ( datas[i] );

          }

        }

        this._trigger ( 'change' );

        this._trigger ( 'update', {
          $row: $row
        });

      }

    }

    remove ( id ) {

      let $row = $( '.' + this._getRowId ( id ) );

      if ( $row.length === 1 ) {

        $row.remove ();

        this._trigger ( 'change' );

        this._trigger ( 'remove', {
          $row: $row
        });

      }

    }

    clear () {

      let $rows = this.$body.find ( this.options.selectors.notEmptyRow );

      if ( $rows.length ) {

        $rows.remove ();

        this._trigger ( 'change' );

        this._trigger ( 'clear', {
          $rows: $rows
        });

      }

    }

  }

  /* FACTORY */

  Factory.make ( TableHelper, config );

}( Svelto.$, Svelto._, Svelto, Svelto.Factory ));
