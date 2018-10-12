(function() {
  'use strict';

  angular
    .module('app.profile')
    .run(appRun);

  appRun.$inject = ['routerHelper'];
  /* @ngInject */
  function appRun(routerHelper) {
    routerHelper.configureStates(getStates());
  }

  function getStates() {
    return [

        {
            state: 'profile',
            config: {
                url: '/profile/:id',
                templateUrl: 'app/profile/profile.html',
                controller: 'ProfileController',
                controllerAs: 'vm',
                cache: false,
                abstract: true,
                resolve: {
                  profile: function(AuthService, $stateParams){
                    return AuthService.getProfile($stateParams.id).then(function(profile){return profile});
                  }
                }
            }
        },
        {
            state: 'profile.edit',
            config: {
                url: '',
                templateUrl: 'app/profile/profile.edit.html',
                controller: 'ProfileController',
                cache: false,
                abstract: true,
                controllerAs: 'vm'
            }
        },
        {
            state: 'profile.edit.details',
            config: {
                url: '/details',
                templateUrl: 'app/profile/profile.details.html',
                controller: 'ProfileController',
                cache: false,
                controllerAs: 'vm',
                activetab: 'details'
            }
        },
        {
            state: 'profile.edit.password',
            config: {
                url: '/password',
                templateUrl: 'app/profile/profile.password.html',
                controller: 'ProfileController',
                cache: false,
                controllerAs: 'vm',
                activetab: 'password'
            }
        },
        {
            state: 'profile.edit.settings',
            config: {
                url: '/settings',
                templateUrl: 'app/profile/profile.settings.html',
                controller: 'ProfileController',
                cache: false,
                controllerAs: 'vm',
                activetab: 'settings'
            }
        },
        {
          state: 'profile.edit.delete',
          config: {
              url: '/delete',
              templateUrl: 'app/profile/profile.delete.html',
              controller: 'ProfileController',
              cache: false,
              controllerAs: 'vm',
              activetab: 'delete'
          }
      },
        {
            state: 'profile.overview',
            config: {
                url: '/overview',
                templateUrl: 'app/profile/tabs/overview.html',
                controller: 'ProfileController',
                // cache: false,
                controllerAs: 'vm'
            }
        },
        {
            state: 'profile.achievements',
            config: {
                url: '/achievements',
                templateUrl: 'app/profile/tabs/achievements.html',
                controller: 'ProfileAchievementsController',
                controllerAs: 'vm'
            }
        },
        {
            state: 'profile.photos',
            config: {
                url: '/photos',
                templateUrl: 'app/profile/tabs/photos.html',
                controller: 'ProfilePhotosController',
                controllerAs: 'vm'
            }
        },
        {
            state: 'profile.perceptions',
            config: {
                url: '/perceptions',
                templateUrl: 'app/profile/tabs/perceptions.html',
                controller: 'ProfilePerceptionsController',
                controllerAs: 'vm'
            }
        },
        {
            state: 'profile.followers',
            config: {
                url: '/followers',
                templateUrl: 'app/profile/tabs/followers.html',
                controller: 'ProfileFollowersController',
                controllerAs: 'vm'
            }
        }
    ];
  }
})();
