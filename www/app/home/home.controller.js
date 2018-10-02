(function() {
  'use strict';

  angular
    .module('app.home')
    .controller('HomeController', HomeController);

  HomeController.$inject = ['$translate' ,'$scope', '$rootScope'];
  /* @ngInject */
  function HomeController($translate, $scope, $rootScope) {
    var vm = this;
    vm.cityHome = '';

      angular.extend(vm, {
        locationChanged: locationChanged
      });

    var translation_keys = ['chart.last_week', 'chart.last_month', 'chart.last_year'];
    $translate([translation_keys]).then(function(translation){
      for (var key in translation)
      {
       var translation2 = translation[key];
      }
      var translation3 = [];
      for (var key in translation2)
      {
       translation3.push(translation2[key]);
      }

      $scope.rangeOptions = [
        {id:1, name:translation3[0], value: 1},
        {id:2, name:translation3[1], value: 2},
        {id:3, name:translation3[2], value: 3}
      ]; 
      $scope.selectedRange = $scope.rangeOptions[0];

    });    

    // $scope.rangeOptions = [
    //   {id:1, name:'Last week', value: 1},
    //   {id:2, name:'Last month', value: 2},
    //   {id:3, name:'Last year', value: 3}
    // ];
    // $scope.selectedRange = $scope.rangeOptions[0];

    activate();

    function activate(){
      vm.chartChange = chartChange;
      $scope.$on('selectedCity', function(event, city){
        vm.selectedCity = city;
        $rootScope.selectedCity = vm.selectedCity;
      });
    }

    function chartChange(){
      $rootScope.$broadcast('chartChanges', $scope.selectedRange);
    }

    function locationChanged(location){
      
    }

  }
})();
