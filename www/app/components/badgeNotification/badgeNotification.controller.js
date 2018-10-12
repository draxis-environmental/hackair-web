(function() {
  'use strict';

  angular
    .module('app.components')
    .controller('BadgeNotificationController', BadgeNotificationController);

  BadgeNotificationController.$inject = [];
  /* @ngInject */
  function BadgeNotificationController() {
    var vm = this;
    var active ;

    activate();

    function activate(){
    }
  }
})();
