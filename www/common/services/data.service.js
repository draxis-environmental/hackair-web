(function () {
  'use strict';

  angular.module('app.services')
    .factory('DataService', DataService);

  DataService.$inject = ['API_URL', 'Restangular', '$http', '$localStorage'];

  function DataService(API_URL, Restangular, $http, $localStorage) {
    Restangular.setBaseUrl(API_URL);

    var service = {
      Users: Restangular.service('users'),
      Sensors: Restangular.service('sensors'),
      Sensor: {
        delete: function (sensor_id) {
          return $http.delete(API_URL + '/sensors/' + sensor_id, {})
        }
      },
      Missions: {
        get: function (params) {
          return $http.get(API_URL + '/missions', {
            params: params
          })
        }
      },
      Measurements: Restangular.service('measurements'),
      Photos: Restangular.service('photos/all'),
      Photo: Restangular.service('photos/aqi/'),
      Achievements: {
        badges: function (userId) {
          return $http.get(`${API_URL}/achievements?user_id=${userId}`, {});
        }
      },
      AQ: {
        get: function (params) {
          return $http.get(API_URL + '/aq', {
            params: params
          });
        }
      },
      Perceptions: Restangular.service('perceptions'),
      Profile: {
        togglePrivacy: function (userId) {
          return $http.put(API_URL + '/users/' + userId + '/privacy', {});
        },
        toggleNotificationEmails: function () {
          return $http.post(API_URL + '/users' + '/stop_mails', {});
        },
        toggleNewsletter: function () {
          return $http.post(API_URL + '/users' + '/accept_newsletters', {});
        }
      },
      Search: {
        post: function (params) {
          return $http.post(API_URL + '/users/social/search', params, {
            cache: false,
          });
        }
      }
    };

    return service;
  }
})();
