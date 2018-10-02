(function () {
  'use strict';

  var local = '',
    staging = '',
    production = 'https://api.hackair.eu';

  angular.module('hackair')
    // .constant('API_URL', local)
    // .constant('API_URL', staging)
    .constant('API_URL', production)
    .constant('availableLanguages', [
      'en', // English
      'de', // German
      'no' // Norwegian
    ])
    .constant('defaultLanguage', 'en');

})();
