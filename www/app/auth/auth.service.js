(function(){
    'use strict';

    angular.module('app.auth')
    .factory('AuthService', AuthService);

    AuthService.$inject = ['$http','API_URL'];

    function AuthService($http, API_URL){
        var service = {
            login: login,
            logout: logout,
            register: register,
            getProfile: getProfile,
            sendReset: sendReset,
            resetPassword: resetPassword,
            unsubscribe: unsubscribe,
            activation: activation
        };

        return service;

        function login(user){
            return $http.post(API_URL + '/users/login', user);
        }

        function logout(){
        }

        function register(user){
            return $http.post(API_URL + '/users', user);
        }

        function sendReset(email){
          var data = {
            email: email
          }
          return $http.post(API_URL + '/users/password/reset', data);
        }

        function resetPassword(password, repeat_password, reset_token){
          var data = {
            password: password,
            confirm: repeat_password,
            token: reset_token
          }
          return $http.post(API_URL + '/users/password/change', data);
        }

        function unsubscribe(token){
          window.location.href= API_URL + '/unsubscribe/' + token;
        }

        function activation(token){
          window.location.href= API_URL + '/users/confirm/' + token;
        }

        function getProfile(user){
            return $http.get(API_URL + '/users/' + user, {cache: false})
            .then(function(response){
                return response.data.data;
            });
        }

    }
})();
