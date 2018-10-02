(function() {
  'use strict';

  angular
    .module('app.core', [
      'ngAnimate',
      'ngSanitize',
      // 'core.exception',
      // 'core.logger',
      'core.router',
      'ui.router',
      'ngToast',
      'ngFileUpload',
      'geolocation'
    ]);
})();
