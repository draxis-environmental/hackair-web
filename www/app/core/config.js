(function() {
  'use strict';

  var core = angular.module('app.core');

  var config = {
    appErrorPrefix: '[Hackair Error] ',
    appTitle: 'HackAIR'
  };

  core.value('config', config);

  core.config(configure);

  configure.$inject = ['$logProvider', 'routerHelperProvider', '$httpProvider', '$translateProvider'];
  /* @ngInject */
  function configure($logProvider, routerHelperProvider, $httpProvider, $translateProvider) {
    if ($logProvider.debugEnabled) {
      $logProvider.debugEnabled(true);
    }
    routerHelperProvider.configure({ docTitle: config.appTitle + ': ' });

    $httpProvider.interceptors.push(AuthorizationInterceptor);
    $httpProvider.interceptors.push(LanguageInterceptor);

    // $locationProvider.html5Mode(false);
    // if you activate the above line then you must also inject $locationProvider

  }

  AuthorizationInterceptor.$inject = ['$q', '$injector', '$localStorage'];
  /* @ngInject */
  function AuthorizationInterceptor ($q, $injector, $localStorage) {
    return {
        /**
         * Interceptor method for $http requests. Main purpose of this method is to add JWT token
         * to every request that application does.
         * @param   {*} config  HTTP request configuration
         * @returns {*}
         */
        request: function requestCallback(config) {

            var token;
            if ($localStorage.credentials) {
                  token = $localStorage.credentials;
            }

            if (token) {
                if (!config.data) {
                    config.data = {};
                }
                /**
                               * Set token to actual data and headers. Note that we need bot ways because of socket cannot modify
                               * headers anyway. These values are cleaned up in backend side policy (middleware).
                               */
                config.headers.authorization = 'Bearer ' + token;


            }
            return config;
        },

        response: function(res) {

          return res;
        },

        /**
         * Interceptor method that is triggered whenever response error occurs on $http requests.
         * @param   {*} response
         * @returns {*|Promise}
         */
        responseError: function responseErrorCallback(response) {
            if (response.status == 401 || (response.data && response.data.status == 401)) {
                $localStorage.$reset();
                $injector.get('$state').go('home');
            }

            return $q.reject(response);
        }
    };
  }

  function LanguageInterceptor($q, $injector, $localStorage, API_URL){
    return {
      request: function requestCallback(config){
        var lang;

        if ($localStorage.currentLanguage == undefined){
          lang = 'en';
        } else {
          lang = $localStorage.currentLanguage;
        }
        if (config.url.search(API_URL) > -1) { // request is to API, attach lang parameter
          config.params = config.params || {};
          config.params.lang = lang;
        }

        return config || $q.when(config);
      }
    }
  }

})();
