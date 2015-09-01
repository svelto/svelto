
/* ======================================================================================
 * @PROJECT-NAME v@PROJECT-VERSION - @FILE-NAME-UPPERCASED v0.1.0
 * @PROJECT-REPOSITORY-URL/@PROJECT-BRANCH/@FILE-PATH
 * @PROJECT-WEBSITE/@FILE-NAME
 * ======================================================================================
 * Copyright @PROJECT-START-YEAR-@CURRENT-YEAR @PROJECT-COPYRIGHT-HOLDER
 * Licensed under @PROJECT-LICENSE-NAME (@PROJECT-REPOSITORY-URL/@PROJECT-BRANCH/@PROJECT-LICENSE-FILE-PATH)
 * ======================================================================================
 * @requires ../core/core.js
 * ====================================================================================== */

;(function ( $, _, window, document, undefined ) {

    'use strict';

    /* BLUR */

    $.fn.blurred = function ( force ) {

        return this.toggleClass ( 'blurred', force );

    };

}( jQuery, _, window, document ));
