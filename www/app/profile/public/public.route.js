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
                state: 'public',
                config: {
                    url: '/user/:id',
                    templateUrl: 'app/profile/public/public.html',
                    controller: 'PublicProfileController',
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
                state: 'public.overview',
                config: {
                    url: '/overview',
                    templateUrl: 'app/profile/public/tabs/overview.html',
                    controller: 'PublicProfileController',
                    cache: false,
                    controllerAs: 'vm',
                    bindToController: true
                }
            },
            {
                state: 'public.achievements',
                config: {
                    url: '/achievements',
                    templateUrl: 'app/profile/public/tabs/achievements.html',
                    controller: 'PublicProfileAchievementsController',
                    controllerAs: 'vm',
                    bindToController: true
                }
            },
            {
                state: 'public.photos',
                config: {
                    url: '/photos',
                    templateUrl: 'app/profile/public/tabs/photos.html',
                    controller: 'PublicProfilePhotosController',
                    controllerAs: 'vm'
                }
            },
            {
                state: 'public.perceptions',
                config: {
                    url: '/perceptions',
                    templateUrl: 'app/profile/public/tabs/perceptions.html',
                    controller: 'PublicProfilePerceptionsController',
                    controllerAs: 'vm'
                }
            },
            {
                state: 'public.sensors',
                config: {
                    url: '/sensors',
                    templateUrl: 'app/profile/public/tabs/sensors.html',
                    controller: 'PublicProfileSensorsController',
                    controllerAs: 'vm'
                }
            },
            {
                state: 'public.followers',
                config: {
                    url: '/followers',
                    templateUrl: 'app/profile/public/tabs/followers.html',
                    controller: 'PublicProfileFollowersController',
                    controllerAs: 'vm'
                }
            },
            {
                state: 'public.view-sensor',
                config: {
                    url: '/sensors/:id',
                    templateUrl: 'app/public/sensors/view-sensor.html',
                    controller: 'PublicSensorsController',
                    controllerAs: 'vm'
                }
            }
        ];

    }
})();
