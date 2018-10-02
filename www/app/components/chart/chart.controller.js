(function () {
  'use strict';

  angular
    .module('app.components')
    .controller('ChartController', ChartController);
  ChartController.$inject = ['$scope', 'DataService', '$rootScope'];

  function ChartController($scope, DataService, $rootScope) {
    var vm = this;

    $scope.londonaqhistory = [120, 70, 170, 320, 160, 145, 430, 270];
    $scope.dateLabels = [];
    $scope.AQData = [];

    $scope.getAQ = function (dateStart) {
      return DataService.AQ.get({
        dateStart: dateStart,
        lat: $rootScope.selectedCity.coords[0],
        lon: $rootScope.selectedCity.coords[1]
      })
    }

    activate();

    function activate() {}

    $scope.consoleCity = function () {};

  }
})();
