(function(){
    angular.module('app.components')

    .directive('mission', mission);

    function mission(){
        var directive = {
            restrict: 'E',
            templateUrl: 'app/components/mission/mission.html',
            scope: {
            },
            link: link,
            controller: 'MissionController',
            controllerAs: 'vm',
            bindToController: true // because the scope is isolated
        };

        return directive;

        function link(scope, el, attr, ctrl) {

        }
    }
})();
