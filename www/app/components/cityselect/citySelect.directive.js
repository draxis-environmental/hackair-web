(function () {
  angular.module('app.components')

    .directive('citySelect', citySelect);

  function citySelect() {
    var directive = {
      restrict: 'E',
      templateUrl: 'app/components/cityselect/citySelect.html',
      scope: {
        main: '@',
      },
      replace: true,
      link: link,
      controller: 'citySelectController',
      controllerAs: 'vm',
      bindToController: true // because the scope is isolated
    };

    return directive;

    function link(scope, el, attr, vm) {
      var $root = scope.$root;
      var ul = el.find('.select');

      activate();

      function activate() {
        angular.extend(vm, {
          openList: openList,
          selectCity: selectCity,
          selectedCity: $root.selectedCity,
        });

        scope.$on('selectedCity', onSelectedCity)
      }

      function openList() {
        ul.toggleClass('open');
      }

      function selectCity(city) {
        $root.$broadcast('selectedCity', city);
      }

      function onSelectedCity(e, city) {
        if (scope.vm.main) {
          $root.$broadcast('removeMainCitySelect');
        }

        $root.selectedCity = city;
        vm.selectedCity = $root.selectedCity;

        ul.toggleClass('open');
      }

    }
  }
})();
