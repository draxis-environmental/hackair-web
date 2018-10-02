(function() {
  'use strict';

  angular
    .module('app.auth')
    .controller('AuthController', AuthController);

  AuthController.$inject = ['$state', '$scope', '$rootScope', '$stateParams', 'AuthService', '$localStorage', 'ngToast', '$location', '$filter'];
  /* @ngInject */
  function AuthController($state, $scope, $rootScope, $stateParams, AuthService, $localStorage, ngToast, $location, $filter) {
    var vm = this;
    vm.accept_newsletters = false;
    vm.acceptTerms = false;
    var activeTab = 'login';
    // for unsubscribe.html
    $scope.subStatus =  $location.search().status;
    if ($scope.subStatus!='true' && $scope.subStatus!='false')
      $scope.subStatus = 'unsubscribe';
     // for confirm-email.html
    $scope.confirmed = $location.search().confirmed;
    if ($scope.confirmed!='true' && $scope.confirmed!='false')
      $scope.confirmed = 'confirm';

    activate();

    function activate(){
      angular.extend($rootScope, {
        logout: logout
      });

      angular.extend(vm, {
        isTabActive: isTabActive,
        setTabActive: setTabActive,
        login: login,
        register: register,
        unsubscribe: unsubscribe,
        activation: activation,
        sendReset: sendReset,
        resetPassword: resetPassword,
        currentLanguage: $localStorage.currentLanguage,
        toggleNewsletter: toggleNewsletter,
        toggleAcceptTerms: toggleAcceptTerms
      });
    }


    function toggleNewsletter(){
      vm.accept_newsletters = !vm.accept_newsletters;
      console.log(vm.accept_newsletters);
      vm.user.accept_newsletters = vm.accept_newsletters;
      console.log(vm.user.accept_newsletters);
    }

    function toggleAcceptTerms(){
      vm.acceptTerms = !vm.acceptTerms;
      console.log(vm.acceptTerms);
    }

    function isTabActive(tab){
      return activeTab === tab;
    }

    function setTabActive(tab){
      activeTab = tab;
    }

    function login(){

      AuthService.login(vm.user)
      .then(function success(response){


        $localStorage.credentials = response.data.token;
          var decodedToken = parseJwt($localStorage.credentials);

          var user = {
            id: decodedToken.sub
          };

          AuthService.getProfile(user.id)
          .then(function(userData){

            if (userData.name == null){
              ngToast.create({
                className: 'success',
                content: $filter('translate')('authcontrol.welcome') + userData.username
              });
            } else {
              ngToast.create({
                className: 'success',
                content: $filter('translate')('authcontrol.welcome_back') + userData.name
              });
            }


            angular.extend(user, userData);

            $localStorage.user = user;
            $rootScope.user = user;
            $rootScope.loggedIn = true;

            $state.go('home');
          });

        })
        .catch(function failed(response){
          ngToast.create({
            className: 'warning',
            content: response.data.message
          });
        });

    }

    function logout(){
      // Clear $localStorage
      delete($localStorage.credentials);
      delete($localStorage.user);
      delete($rootScope.loggedIn);
      delete($rootScope.user);

      ngToast.create({
        className: 'success',
        content: $filter('translate')('authcontrol.success_logout')
      });

      $state.go('about');
    }

    function register(){
      if(!vm.user.accept_newsletters) { vm.user.accept_newsletters = false; }
      AuthService.register(vm.user)
      .then(function(response){
        ngToast.create({
          className: 'success',
          content: response.data.message
        });

      })
      .catch(function failure(response){
          ngToast.create({
            className: 'warning',
            content: response.data.message
          });
      });
    }

    function unsubscribe(){
      AuthService.unsubscribe($stateParams.id);
    }

    function activation(){
      AuthService.activation($stateParams.id);
    }

    function sendReset(){
      AuthService.sendReset(vm.user.email)
      .then(function(response){
        ngToast.create({
          className: 'success',
          content: $filter('translate')('authcontrol.reset_link') +vm.user.email
        });
        $state.go('about');
      })
      .catch(function failure(response){
          ngToast.create({
            className: 'warning',
            content: response.data.message
          });
      });
    }

    function resetPassword(){
      var reset_token = $stateParams.id;

      AuthService.resetPassword(vm.user.password, vm.user.confirm, reset_token)
      .then(function(response){
        ngToast.create({
          className: 'success',
          content: $filter('translate')('authcontrol.pass_changed')
        });
        $state.go('about');
      })
      .catch(function failure(response){
          ngToast.create({
            className: 'warning',
            content: response.data.message
          });
      });
    }

    function parseJwt (token) {
        var base64Url = token.split('.')[1];
        var base64 = base64Url.replace('-', '+').replace('_', '/');
        return JSON.parse(window.atob(base64));
    };
  }
})();
