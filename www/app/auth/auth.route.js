(function() {
  'use strict';

  angular
    .module('app.auth')
    .run(appRun);

  appRun.$inject = ['routerHelper'];
  /* @ngInject */
  function appRun(routerHelper) {
    routerHelper.configureStates(getStates());
  }

  function getStates() {
    return [
      {
        state: 'auth',
        config: {
          url: '/auth',
          templateUrl: 'app/auth/auth.html',
          controller: 'AuthController',
          controllerAs: 'vm'
        }
      },
      {
        state: 'unsubscribe',
        config: {
          url: '/unsubscribe/:id',
          templateUrl: 'app/auth/unsubscribe.html',
          controller: 'AuthController',
          controllerAs: 'vm'
        }
      },
      {
        state: 'reset',
        config: {
          url: '/reset-password/:id',
          templateUrl: 'app/auth/reset-password.html',
          controller: 'AuthController',
          controllerAs: 'vm'
        }
      },
      {
        state: 'login',
        config: {
          url: '/login',
          templateUrl: 'app/auth/confirm-email.html',
          controller: 'AuthController',
          controllerAs: 'vm'
        }
      },
      {
        state: 'activate',
        config: {
          url: '/activate/:id',
          templateUrl: 'app/auth/activate.html',
          controller: 'AuthController',
          controllerAs: 'vm'
        }
      }

    ];
  }
})();
