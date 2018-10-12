(function() {
  'use strict';

  angular
    .module('app.landing')
    .run(appRun);

  appRun.$inject = ['routerHelper'];
  /* @ngInject */
  function appRun(routerHelper) {
    routerHelper.configureStates(getStates());
  }

  function getStates() {
    return [
        {
            state: 'about',
            config: {
                url: '/',
                templateUrl: 'app/landing/explore.html'
            }
        },
        {
            state: 'explore',
            config: {
                url: '/',
                templateUrl: 'app/landing/explore.html'
            }
        },
        {
            state: 'register',
            config: {
                url: '/register',
                templateUrl: 'app/landing/register.html',
                controller: 'AuthController',
                controllerAs: 'vm'
            }
        }
    ];
  }
})();
