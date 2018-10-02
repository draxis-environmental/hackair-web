(function () {
  'use strict';

  angular
    .module('app.chartCompare')
    .controller('chartCompareController', chartCompareController);
  chartCompareController.$inject = ['$translate', '$scope', 'DataService', '$rootScope', '$stateParams', 'ngToast', '$state'];

  function chartCompareController($translate, $scope, DataService, $rootScope, $stateParams, ngToast, $state) {

    var vm = this;

    $scope.city1 = $stateParams.city1;
    $scope.city2 = $stateParams.city2;

    $scope.dateLabels = [];
    $scope.AQData = [];

    vm.cities = [{
        name: 'Athens',
        coords: [37.983310135428795, 23.727893829345703]
      },
      {
        name: 'Berlin',
        coords: [52.51705655410405, 13.39508056640625]
      },
      {
        name: 'Brussels',
        coords: [50.8480064897561, 4.3512725830078125]
      },
      {
        name: 'London',
        coords: [51.507914431826606, -0.11638641357421874]
      },
      {
        name: 'Oslo',
        coords: [59.91274018614317, 10.734329223632812]
      },
      {
        name: 'Thessaloniki',
        coords: [40.63470114170654, 22.943100929260254]
      }
    ];

    // $scope.getAQ = function(dateStart, cityid){
    //   return DataService.AQ.get({
    //     dateStart: dateStart,
    //     lat: vm.cities[cityid].coords[0],
    //     lon: vm.cities[cityid].coords[1]
    //   })
    // }

    $scope.catchErrorinToast = function () {

      $translate('map.no_city_data_message').then(function (translation) {
        var no_data_message = translation;
        $state.go('home');
        ngToast.create({
          className: 'warning',
          content: no_data_message,
          horizontalPosition: 'center'
        });
      });

    };

    $scope.getAQ2 = function (dateStart, city) {
      var citySelected = vm.cities.filter(function (elem) {
        return elem.name == city;
      });
      return DataService.AQ.get({
        dateStart: dateStart,
        lat: citySelected[0].coords[0],
        lon: citySelected[0].coords[1]
      })
    }


    var translation_keys = ['chart.last_week', 'chart.last_month', 'chart.last_year'];
    $translate([translation_keys]).then(function (translation) {
      for (var key in translation) {
        var translation2 = translation[key];
      }
      var translation3 = [];
      for (var key in translation2) {
        translation3.push(translation2[key]);
      }
      console.log(translation3[0]);
      console.log(translation3[1]);
      console.log(translation3[2]);


      $scope.rangeOptions = [{
          id: 1,
          name: translation3[0],
          value: 1
        },
        {
          id: 2,
          name: translation3[1],
          value: 2
        },
        {
          id: 3,
          name: translation3[2],
          value: 3
        }
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

    function activate() {
      vm.chartChange = chartChange;
    }

    function chartChange() {
      $rootScope.$broadcast('chartCompareChanges', $scope.selectedRange);
    }

  }
})();
