(function() {
  'use strict';

  angular
    .module('app.mission')
    .run(appRun);

  appRun.$inject = ['routerHelper'];
  /* @ngInject */
  function appRun(routerHelper) {
    routerHelper.configureStates(getStates());
  }

  function getStates() {
    return [
      // {
      //   state: 'mission',
      //   config: {
      //     onEnter: ['$uibModal', '$state', function ($uibModal, $state){
      //       console.log("open modal");
      //       var modalInstance = $uibModal.open({
      //         templateUrl: '/app/components/mission/view-mission.html',
      //         controller: 'MissionModalController',
      //         controllerAs: 'vm',
      //         size: 'lg',
      //         // abstract: true
      //       });
      //     }]
      //   }
      // },
      // {
      //   state: 'mission.new',
      //   config: {
      //     url: '/new-mission',
      //     templateUrl: '/app/components/mission/tabs/new-mission.html',
      //     controller: 'MissionModalController',
      //     controllerAs: 'vm'
      //   }
      // },
      // {
      //   state: 'mission.available',
      //   config: {
      //     url: '/available-mission',
      //     templateUrl: '/app/components/mission/tabs/available-mission.html',
      //     controller: 'MissionModalController',
      //     controllerAs: 'vm'
      //   }
      // },
      // {
      //   state: 'mission.completed',
      //   config: {
      //     url: '/completed-mission',
      //     templateUrl: '/app/components/mission/tabs/completed-mission.html',
      //     controller: 'MissionModalController',
      //     controllerAs: 'vm'
      //   }
      // }
    ];
  }
})();
