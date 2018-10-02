(function() {
  'use strict';

  angular
    .module('app.social')
    .controller('SocialController', SocialController);

  SocialController.$inject = ['$scope', '$rootScope', '$localStorage', 'SocialService', 'DataService', '$state'];
  /* @ngInject */
  function SocialController($scope, $rootScope, $localStorage, SocialService, DataService, $state) {
    var vm = this;

    vm.timeZoneOffset = new Date().getTimezoneOffset() / (-60);
    console.log(vm.timeZoneOffset);    

    var page_number = 1;
    var socialFeed = [];
    //var selectedCommunity = 0;
    SocialService.getFeed(page_number)
    .then(function(currentPageFeed) {
      vm.socialFeed = getSocialFeed(currentPageFeed);
    });

 
    activate();

    function activate(){
      vm.communities = $localStorage.user.communities;
      vm.search = search;
      vm.amCommunityOwner = amCommunityOwner;
    }

    function amCommunityOwner(community_owner_id) {
      return community_owner_id === $localStorage.user.id;
    }

    function getSocialFeed(currentPageFeed) {
      var socialFeed = [];

      currentPageFeed.forEach(function(feedItem) {

        var newFeedItem = {
          "id": feedItem["user_social_activity_id"],
          "avatar": feedItem["profile_picture"],
          "name": feedItem["name"] + " " + feedItem["surname"],
          "postDate": moment(feedItem["updated_at"], moment.ISO_8601).add(vm.timeZoneOffset, 'hours').format('DD-MM-YYYY hh:mm:ss'),     
          // "postDate": moment(feedItem["updated_at"], moment.ISO_8601).calendar(null, {
          //   sameDay: '[Today at] LT',
          //   nextDay: '[Tomorrow]',
          //   nextWeek: 'dddd',
          //   lastDay: '[Yesterday at] LT',
          //   lastWeek: '[Last] dddd',
          //   sameElse: 'DD/MM/YYYY'
          // }),
          "action": feedItem["action"],
          "user_id": feedItem["user_id"],
          "social_activity_type": feedItem["social_activity_type"]
        }
        if (feedItem["object_metadata"] == null) {
          newFeedItem.photo = "";
        } else {
          newFeedItem.photo = feedItem["object_metadata"]["sky_photo_thumb"];
        }
        socialFeed.push(newFeedItem);
    })
    return socialFeed;
    }

    function search(val) {
        return DataService.Search.post({
          q: val,
          headers: {
            'authorization': 'Bearer ' + $localStorage.credentials
          }
        })
          .then(function(response) {
            return response.data.data.map(function(item) {
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
    $scope.onSelect = function($item){
      if ($item.type === "Member") {
        $state.go('public.overview', {id: $item.id});
      } else {
        $state.go('community', {id: $item.id});
      }

    }
  }
})();
