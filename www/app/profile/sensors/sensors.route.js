(function() {
  'use strict';

  angular
    .module('app.sensors')
    .run(appRun);

  appRun.$inject = ['routerHelper'];
  /* @ngInject */
  function appRun(routerHelper) {
    routerHelper.configureStates(getStates());
  }

  function getStates() {
    return [
        {
            state: 'profile.sensors',
            config: {
                url: '/sensors',
                templateUrl: 'app/profile/tabs/sensors.html',
                controller: 'SensorsController',
                controllerAs: 'vm'
            }
        },
        {
            state: 'profile.view-sensor',
            config: {
                url: '/sensor/:sensorId',
                templateUrl: 'app/profile/sensors/view-sensor.html',
                controller: 'SensorsController',
                controllerAs: 'vm'
            }
        },
        {
            state: 'profile.add-sensor',
            config: {
                url: '/sensor_/add',
                templateUrl: 'app/profile/sensors/add-sensor.html',
                controller: 'SensorsController',
                controllerAs: 'vm'
            }
        },{
            state: 'profile.edit-sensor',
            config: {
                url: '/sensor/edit/:sensorId',
                templateUrl: 'app/profile/sensors/edit-sensor.html',
                controller: 'SensorsController',
                controllerAs: 'vm'
            }
        }
    ];
  }
})();
