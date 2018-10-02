(function() {
  'use strict';

  angular
    .module('app.components')
    .controller('NotificationController', NotificationController);

  NotificationController.$inject = ['$http', 'API_URL', '$rootScope', '$filter'];
  /* @ngInject */
  function NotificationController($http, API_URL, $rootScope, $filter) {
    var vm = this;
    var active ;

    activate();

    function activate(){
      angular.extend(vm, {
        selectedCity: $rootScope.selectedCity
      });
      getTipOfTheDay();
    }

    function getTipOfTheDay(){
      $http.get(API_URL + '/users/recommendations', {
        params: {
          city: vm.selectedCity.name,
          lat: vm.selectedCity.coords[0],
          lon: vm.selectedCity.coords[1]
        }
      })
      .then(function(response){
        var recommendations = response.data.data.results[0];
        vm.notification = {message: recommendations.isProvidedWithRecommendation.TipOfTheDay, icon: '../../../img/ui/illustration_tip.png'};
      })
      .catch(function(error) {
        vm.notification = {message: $filter('translate')('msg_notification_c'), icon: '../../../img/ui/illustration_tip.png'};
      });
    }
  }
})();
