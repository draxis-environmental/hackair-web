(function () {
  'use strict';

  angular
    .module('app.social')
    .controller('CommunityController', CommunityController);

  CommunityController.$inject = ['$scope', '$state', '$localStorage', 'DataService', 'SocialService', 'ngToast', 'AuthService', '$stateParams'];

  function CommunityController($scope, $state, $localStorage, DataService, SocialService, ngToast, AuthService, $stateParams) {
    var vm = this;
    vm.word_for_delete = "hackAIR";

    activate();

    function activate() {
      AuthService.getProfile($localStorage.user.id).then(function (profile) {
        angular.extend(vm, {
          profile: profile
        });

        $localStorage.user = profile;

        vm.communities = profile.communities;
        vm.amCommunityOwner = amCommunityOwner;
        vm.search = search;
        vm.createCommunity = createCommunity;
        vm.updateCommunity = updateCommunity;
        vm.deleteCommunity = deleteCommunity;
        vm.joinCommunity = joinCommunity;
        vm.leaveCommunity = leaveCommunity;
        getCommunityFeed($state.params.id);

        if ($stateParams.id) {
          var filter = vm.communities.filter(function (community) {
            return community.id == $stateParams.id;
          });

          if (filter.length) {
            vm.community = filter[0];
          }
        }
      });
    }

    function amCommunityOwner(community_owner_id) {
      return community_owner_id === $localStorage.user.id;
    }

    function search(val) {
      return DataService.Search.post({
          q: val,
          headers: {
            'authorization': 'Bearer ' + $localStorage.credentials
          }
        })
        .then(function (response) {
          return response.data.data.map(function (item) {
            var result = {}
            if (item.name === null || item.surname === null) {
              result = {
                id: item.id,
                name: item.username + " " + item.type,
                type: item.type
              }
            } else if (item.type === "Community") {
              result = {
                id: item.id,
                name: item.name + " " + item.type,
                type: item.type
              }
            } else {
              result = {
                id: item.id,
                name: item.name + " " + item.surname + " " + item.type,
                type: item.type
              }
            }
            console.log(result);
            return result;
          })
        });
    }
    $scope.onSelect = function ($item) {
      if ($item.type === "Member") {
        $state.go('public.overview', {
          id: $item.id
        });
      } else {
        $state.go('community', {
          id: $item.id
        });
      }
    }

    function getCommunityFeed(community_id) {
      SocialService.getCommunityFeed(community_id)
        .then(function (response) {
          vm.selectedCommunity = response.community;
          vm.communityFeed = response.feeds.data;
        });
    }

    function createCommunity() {
      if(!vm.community || !vm.community.name){
        ngToast.create({
          className: 'danger',
          content: "Please fill the Name field"
        });
        return;
      }
      if(!vm.community || !vm.community.description){
        ngToast.create({
          className: 'danger',
          content: "Please fill the Description field"
        });
        return;
      }
      SocialService.createCommunity(vm.community.name, vm.community.description)
        .then(function (response) {
          ngToast.create({            
            className: 'success',
            content: response.data.message
          });
          $localStorage.user.communities.push(vm.community);

          $state.go('community', {
            id: response.data.data.id
          });
        })
        .catch(function (error) {
          ngToast.create({
            className: 'danger',
            content: error.data.message.name
          });
        });
    }

    function joinCommunity(community_id) {
      SocialService.joinCommunity(community_id)
        .then(function (response) {
          ngToast.create({
            className: 'success',
            content: response.data.data
          });
          $state.reload();
        })
        .catch(function (error) {
          ngToast.create({
            className: 'danger',
            content: error.data.message.description
          });
          $state.reload();
        });
    }

    function leaveCommunity(community_id) {
      SocialService.leaveCommunity(community_id)
        .then(function (response) {
          ngToast.create({
            className: 'success',
            content: response.data.data
          });
          $state.go('social.user', {
            id: $localStorage.user.id
          });
        })
        .catch(function (error) {
          ngToast.create({
            className: 'danger',
            content: error.data.message
          });
          $state.reload();
        });
    }

    function updateCommunity() {
      SocialService.updateCommunity(vm.community.name, vm.community.description, $state.params.id)
        .then(function (response) {
          ngToast.create({
            className: 'success',
            content: response.data.message
          });
          $state.go('community', {
            id: $state.params.id
          });
        })
        .catch(function (error) {
          ngToast.create({
            className: 'danger',
            content: error.data.message
          });
          $state.reload();
        });
    }

    function deleteCommunity() {
      if (vm.delete_word === 'hackAIR') {
        SocialService.deleteCommunity($state.params.id)
          .then(function (response) {
            ngToast.create({
              className: 'success',
              content: response.data.message
            });
            $state.go('social.user', {
              id: $localStorage.user.id
            });
          })
          .catch(function (error) {
            ngToast.create({
              className: 'danger',
              content: error.data.message
            });
            $state.reload();
          });
      }
    }
  }
})();
