(function(){
    angular.module('app.components')

    .directive('map', map);

    function map(){
        var directive = {
            restrict: 'E',
            templateUrl: 'app/components/map/map.html',
            scope: {
                intro: '='
            },
            link: link,
            controller: 'MapController',
            controllerAs: 'vm',
            bindToController: true // because the scope is isolated
        };

        return directive;

        function link(scope, el, attr, ctrl) {

        }
    }
})();
