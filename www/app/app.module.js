(function() {
  'use strict';

  angular.module('hackair', [
    'ngStorage',
    'ngSanitize',
    'ui.select',
    'ui.bootstrap',
    'ui.bootstrap.datetimepicker',
    'tmh.dynamicLocale',
    'pascalprecht.translate',
    'ngMessages',
    'angular-loading-bar',
    'app.core',
    'app.auth',
    'app.layout',
    'app.services',
    'mwl.confirm'
  ])
  .config(localeConfig)

  function localeConfig(tmhDynamicLocaleProvider, $translateProvider, defaultLanguage){
    tmhDynamicLocaleProvider
    .localeLocationPattern('app/locales/angular-locale_{{locale}}.js');
    $translateProvider.useStaticFilesLoader({
      prefix: 'app/i18n/',
      suffix: '.json'
    });
    $translateProvider.preferredLanguage(defaultLanguage);
    $translateProvider.useSanitizeValueStrategy('escape');
  }

})();
