(function(){
    angular.module('app.components')

    .directive('airQualityInfo', AirQualityInfo);

    function AirQualityInfo(){
        var directive = {
            restrict: 'E',
            templateUrl: 'app/components/airquality/airQualityInfo.html',
            scope: {
                quality: '@',
                scale: '@',
                showActivities: '@activities'
            },
            link: link,
            controller: 'AirQualityInfoController',
            controllerAs: 'vm',
            bindToController: true // because the scope is isolated
        };

        return directive;

        function link(scope, el, attr, ctrl) {
          if (scope.$root.selectedCity !== undefined){
            ctrl.getAq();
          }
        }
    }
})();
