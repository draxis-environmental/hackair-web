/**
 * Auth interceptor for HTTP and Socket request.It wiill add  JWT  token to each requests.
 *  Token is validated in server side
 */
(function() {

    'use strict';

    angular.module('hackair')
    .factory('AuthorizationInterceptor', [
      '$q', '$injector', '$localStorage',
      function(
        $q, $injector, $localStorage
      ) {
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
                    $injector.get('$state').go('auth');
                }

                return $q.reject(response);
            }
        };
      }
    ])
  ;
}());
