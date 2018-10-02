(function() {
  'use strict';

  angular
    .module('app.components')
    .controller('MissionModalController', MissionModalController);

  MissionModalController.$inject = ['$scope', '$uibModalInstance', '$state', '$filter'];
  /* @ngInject */
  function MissionModalController($scope, $uibModalInstance, $state, $filter) {
    var vm = this;
    var active ;
    $scope.ok = function() {
      $uibModalInstance.dismiss('close');
    };

    var currentMissionID = 0;

    var testMissions = [
      {
        id: 0,
        shortTitle: $filter('translate')('testmission_0.complete_profile'),
        shortInfo: $filter('translate')('testmission_0.increase_strength_profile'),
        fullTitle: $filter('translate')('testmission_0.complete_profile'),
        image: "../../img/ui/mission_profile.svg",
        actionState: 'profile.edit',
        fullText: $filter('translate')('testmission_0.msg_set_account')
      },
      {
        id: 1,
        shortTitle: $filter('translate')('testmission_1.public_trans'),
        shortInfo: $filter('translate')('testmission_1.prove_envi_sensi'),
        fullTitle: $filter('translate')('testmission_1.public_trans_m'),
        image: "../../img/temp/public_transport_mission.png",
        fullText: $filter('translate')('testmission_1.msg_prove_envi_sensi')
      },
      {
        id: 2,
        shortTitle: $filter('translate')('testmission_2.cycling_city'),
        shortInfo: $filter('translate')('testmission_1.prove_envi_sensi'),
        fullTitle: $filter('translate')('testmission_2.cycling_city'),
        image: "http://ecf.com/files/wp-content/uploads/5423939650_9d2da2b6fd_z.jpg",
        fullText: $filter('translate')('testmission_2.msg_cycling_city')
      },
      {
        id: 3,
        shortTitle:$filter('translate')('testmission_2.walk_mile'),
        shortInfo: $filter('translate')('testmission_2.improve_health'),
        fullTitle: $filter('translate')('testmission_2.walk_mile'),
        image: "http://news.stanford.edu/news/2014/april/images/13763-walking_news.jpg",
        fullText: $filter('translate')('testmission_2.msg_walking')
      },
      {
        id: 4,
        shortTitle:$filter('translate')('testmission_4.run_lola'),
        shortInfo: $filter('translate')('testmission_4.some_exercise'),
        fullTitle:$filter('translate')('testmission_4.run_lola'),
        image: "https://static01.nyt.com/images/2016/12/14/well/move/14physed-running-photo/14physed-running-photo-facebookJumbo.jpg",
        fullText: $filter('translate')('testmission_4.msg_running')
      }
    ];

    activate();

    function activate(){
      vm.testMissions = testMissions;
      vm.currentMissionID = currentMissionID;
      vm.updateMissionView = updateMissionView;
      vm.goToMissionScreen = goToMissionScreen;
    }

    function updateMissionView(missionID){
      vm.currentMissionID = missionID;
    }

    function goToMissionScreen(routeState){
      console.log(routeState);
      $uibModalInstance.dismiss('close');
      $state.go(routeState);
    }
  }
})();
