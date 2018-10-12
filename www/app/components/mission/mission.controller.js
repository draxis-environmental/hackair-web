(function() {
  'use strict';

  angular
    .module('app.components')
    .controller('MissionController', MissionController);

  MissionController.$inject = ['$uibModal'];
  /* @ngInject */
  function MissionController($uibModal) {
    var vm = this;
    var active ;


    activate();

    function activate() {
      vm.openMissionModal = openMissionModal;

    }

    function openMissionModal() {
      var modalInstance = $uibModal.open({
        templateUrl: '/app/components/mission/view-mission.html',
        controller: 'MissionModalController',
        controllerAs: 'vm',
        size: 'lg',
        // abstract: true
      });
    }
  }
})();
