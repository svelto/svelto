
// @require core/svelto/svelto.js

(function ( $, _, Svelto ) {

  /* VARIABLES */

  let userAgent  = navigator.userAgent ? navigator.userAgent.toLowerCase () : '',
      vendor     = navigator.vendor ? navigator.vendor.toLowerCase () : '', // Fixes an IE10 bug, `navigator.vendor` it's `undefined` there
      appVersion = navigator.appVersion ? navigator.appVersion.toLowerCase () : '';

  /* CHECKS */

  let isOpera         = /^Opera\//i.test ( userAgent ) || /\x20OPR\//i.test ( userAgent ), /* Opera <= 12 || Opera >= 15 */
      isIpod          = /ipod/i.test ( userAgent ),
      isIphone        = !isIpod && /iphone/i.test ( userAgent ),
      isIpad          = /ipad/i.test ( userAgent ),
      isAndroid       = /android/i.test ( userAgent ),
      isAndroidPhone  = isAndroid && /mobile/i.test ( userAgent ),
      isAndroidTablet = isAndroid && !isAndroidPhone,
      isBlackberry    = /blackberry/i.test ( userAgent ) || /BB10/i.test ( userAgent ),
      isWindows       = /win/i.test ( appVersion ),
      isWindowsPhone  = isWindows && /phone/i.test ( userAgent ),
      isWindowsTablet = isWindows && !isWindowsPhone && /touch/i.test ( userAgent ),
      isMobile        = isIphone || isIpod || isAndroidPhone || isBlackberry || isWindowsPhone,
      isTablet        = isIpad || isAndroidTablet || isWindowsTablet;

  /* BROWSER */

  let Browser = {
    support: {
      browsers: ['chrome', 'firefox', 'edge', 'ie', 'opera', 'safari', 'uc'],
      devices: ['desktop', 'mobile', 'tablet'],
      oss: ['ios', 'android', 'blackberry', 'linux', 'mac', 'windows']
    },
    is: {
      chrome: !isOpera && /chrome|chromium/i.test ( userAgent ) && /google inc/.test ( vendor ),
      firefox: /firefox/i.test ( userAgent ),
      edge: /(edge)\/((\d+)?[\w\.]+)/i.test ( userAgent ),
      ie: /msie/i.test ( userAgent ) || 'ActiveXObject' in window, /* IE || EDGE */
      opera: isOpera,
      safari: /safari/i.test ( userAgent ) && /apple computer/i.test ( vendor ),
      uc: /ucbrowser/i.test ( userAgent ),
      iphone: isIphone,
      ipad: isIpad,
      ipod: isIpod,
      ios: isIphone || isIpad || isIpod,
      android: isAndroid,
      androidPhone: isAndroidPhone,
      androidTablet: isAndroidTablet,
      blackberry: isBlackberry,
      linux: /linux/i.test ( appVersion ),
      mac: !( isIphone || isIpad || isIpod ) && /mac/i.test ( appVersion ),
      windows: isWindows,
      windowsPhone: isWindowsPhone,
      windowsTablet: isWindowsTablet,
      mobile: isMobile,
      tablet: isTablet,
      desktop: !isMobile && !isTablet,
      online: () => navigator.onLine,
      offline: () => !navigator.onLine,
      touchDevice: 'ontouchstart' in window || ( 'DocumentTouch' in window && document instanceof window.DocumentTouch )
    }
  };

  /* EXPORT */

  Svelto.Browser = Browser;

}( Svelto.$, Svelto._, Svelto ));
