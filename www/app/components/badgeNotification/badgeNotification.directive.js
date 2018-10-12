(function(){
    angular.module('app.components')

    .directive('badgeNotification', BadgeNotification);

    function BadgeNotification(){
        var directive = {
            restrict: 'E',
            templateUrl: 'app/components/badgeNotification/badgeNotification.html',
            scope: {
            },
            link: link,
            controller: 'BadgeNotificationController',
            controllerAs: 'vm',
            bindToController: true // because the scope is isolated
        };

        return directive;

        function link(scope, el, attr, ctrl) {

        }
    }
})();
