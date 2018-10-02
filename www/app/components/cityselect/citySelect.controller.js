(function () {
  angular.module('app.components')
    .controller('citySelectController', citySelectController);

  /* @ngInject */
  function citySelectController($rootScope, $filter) {
    var vm = this;
    var cities = [{
        name: $filter('translate')('cities.athens'),
        coords: [37.983310135428795, 23.727893829345703]
      },
      {
        name: $filter('translate')('cities.berlin'),
        coords: [52.51705655410405, 13.39508056640625]
      },
      {
        name: $filter('translate')('cities.brussels'),
        coords: [50.8480064897561, 4.3512725830078125]
      },
      {
        name: $filter('translate')('cities.london'),
        coords: [51.507914431826606, -0.11638641357421874]
      },
      {
        name: $filter('translate')('cities.oslo'),
        coords: [59.91274018614317, 10.734329223632812]
      },
      {
        name: $filter('translate')('cities.thessaloniki'),
        coords: [40.63470114170654, 22.943100929260254]
      }
    ];

    activate();

    function activate() {
      angular.extend(vm, {
        cities: cities
      });
    }

  }

})();
