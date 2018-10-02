(function () {
  'use strict';

  angular
    .module('app.profile')
    .controller('PublicProfileController', PublicProfileController)
    .controller('PublicProfilePhotosController', PublicProfilePhotosController)
    .controller('PublicProfileFollowersController', PublicProfileFollowersController)
    .controller('PublicProfileAchievementsController', PublicProfileAchievementsController)
    .controller('PublicProfilePerceptionsController', PublicProfilePerceptionsController)
    .controller('PublicProfileSensorsController', PublicProfileSensorsController)
    .controller('PublicSensorsController', PublicSensorsController);

  PublicProfileController.$inject = ['$scope', '$rootScope', '$localStorage', '$uibModal', '$filter', 'DataService', 'SocialService', 'ngToast', '$state'];
  /* @ngInject */
  function PublicProfileController($scope, $rootScope, $localStorage, $uibModal, $filter, DataService, SocialService, ngToast, $state) {
    var vm = this;

    var achievements = [
      "Beacon_in_the_dark",
      "Constantly_on_the_move",
      "FeelsL_like_home",
      "Fresh_air_hunter",
      "HackAir's_hero",
      "Hackathon",
      "Hacker_nomad",
      "Hacker's_masterpiece",
      "Health_watcher",
      "Helping_hand",
      "History_buff",
      "How_is_your_life_today",
      "Just_an_extra_badge",
      "Keep_it_scientific",
      "Prolific_hacker",
      "Share_with_others",
      "Survivor",
      "Watcher_on_the_wall"
    ];

    activate();

    function activate() {
      // vm.achievements = achievements;
      getUserProfile($state.params.id).then(function () {
        angular.extend(vm, {
          user: $localStorage.user,
          profile: $localStorage.public_user,
          isFollowed: isFollowed($localStorage.user.following, $localStorage.public_user.id),
          toggleFollow: toggleFollow
        });
      });
    }

    function toggleFollow(followStatus) {
      if (followStatus === true) {
        SocialService.unfollowUser($localStorage.public_user.id)
          .then(function (response) {
            // console.log(response);
            function searchFollowing(nameKey, myArray) {
              for (var i = 0; i < myArray.length; i++) {
                if (myArray[i].id === nameKey) {
                  return i;
                }
              }
            }
            var userPosition = searchFollowing($localStorage.public_user.id, $localStorage.user.following);
            if (userPosition > -1) {
              $localStorage.user.following.splice(userPosition, 1);
            }
            $state.reload();
          })
          .catch(function (e) {
            console.log(e);
          });
      } else {
        SocialService.followUser($localStorage.public_user.id)
          .then(function (response) {
            // console.log(response);
            $localStorage.user.following.push($localStorage.public_user);
            $state.reload();
          })
        // .catch(function(e) {
        //   console.log(e);
        // });
      }

    }

    function isFollowed(following, public_user_id) {
      var isFollowed = false;
      following.forEach(function (element) {
        if (element.id === public_user_id) {
          isFollowed = true;
          return isFollowed;
        }
      });
      return isFollowed;
    }

    function getUserProfile(user_id) {
      return DataService.Users.get(user_id)
        .then(function (user) {
          $localStorage.public_user = user.data;
        })
        .catch(function (response) {
          if (response.status === 404) {
            $state.go('404');
          }
        });
    }

    function transformViewModel(obj) {
      var newObj = {

      };

      for (var key in obj) {
        if (obj[key] !== null && obj[key] !== "" && obj[key] !== 0) {
          newObj[key] = obj[key];
        }
      }
      angular.extend(newObj, {
        outdoor_activities: vm.selectedActivities,
        groups: vm.selectedSensitivities
      });

      return newObj;
    }

    function getSelected(option) {
      return option.selected == true;
    }

    function getOptionsSelected(options, valueProperty, selectedProperty) {
      var optionsSelected = $filter('filter')(options, function (option) {
        return option[selectedProperty] == true;
      });
      return optionsSelected.map(function (group) {
        return group[valueProperty];
      }).join(", ");
    }
  }

  function PublicProfilePhotosController(DataService, $localStorage) {

    var vm = this;

    activate();

    function activate() {
      angular.extend(vm, {
        profile: $localStorage.public_user
      });
      getUserPhotos();
    }

    function getUserPhotos() {
      DataService.Photos.get('', {
          user_id: $localStorage.public_user.id
        })
        .then(function (response) {
          vm.photos = response.data;
        });
    }

  }

  function PublicProfileFollowersController(DataService, $localStorage, SocialService, $state, profile) {
    var vm = this;
    activate();

    function activate() {
      angular.extend(vm, {
        user: $localStorage.user,
        profile: profile,
        getFollowStatus: getFollowStatus,
        toggleFollow: toggleFollow,
        followMap: getFollowMap()
      });
    }
    console.log(vm);

    function getFollowMap() {
      return {
        followers: profile.followers.map(function (user) {
          return {
            id: user.id,
            fullname: user.name + ' ' + user.surname,
            username: user.username,
            profile_picture: user.profile_picture,
            follow_status: getFollowStatus(user.id)
          };
        }),
        following: profile.following.map(function (user) {
          return {
            id: user.id,
            fullname: user.name + ' ' + user.surname,
            username: user.username,
            profile_picture: user.profile_picture,
            follow_status: getFollowStatus(user.id)
          }
        })
      };

    }

    function getFollowStatus(id) {
      var filter = $localStorage.user.following.filter(function (u) {
        return u.id == id
      });
      return filter.length ? true : false;
    }

    function toggleFollow(user) {
      if (user.follow_status) {
        SocialService.unfollowUser(user.id)
          .then(function (response) {
            // Remove user from localstorage user following;
            var filter = $localStorage.user.following.filter(function (u) {
              return u.id == user.id
            });

            if (filter.length) {
              var index = $localStorage.user.following.indexOf(filter[0]);
              $localStorage.user.following.splice(index, 1);
            } else {
              console.error('Error: Oops something went wrong, user not found in localstorage following');
            }

            // run
            angular.extend(vm, {
              followMap: getFollowMap()
            });
          })
        // .catch(function(response){

        // });
      } else {
        SocialService.followUser(user.id)
          .then(function (response) {
            // Add user to localstorage user following;
            $localStorage.user.following.push(user);

            // run
            angular.extend(vm, {
              followMap: getFollowMap()
            });
          })
        // .catch(function(response){

        // });
      }

    }



  }

  PublicProfileAchievementsController.$inject = ['DataService', '$localStorage', '$stateParams', '$uibModal'];

  function PublicProfileAchievementsController(DataService, $localStorage, $stateParams, $uibModal) {
    var vm = this;
    activate();

    function activate() {
      getAchievements();
      angular.extend(vm, {
        profile: $localStorage.public_user
      });
    }

    function getAchievements() {
      var user_id = $stateParams.id;
      // console.log(user_id);      
      DataService.Achievements.badges(user_id)
        .then(function (res) {
          vm.acquired = res.data.data;
        })
        .catch(function (res) {
          console.error(res);
        })
    }

    vm.BadgePopup = function (achievement, type) {
      var modalInstance = $uibModal.open({
        templateUrl: 'app/components/badges/templates/badge-optained.html',
        controller: function ($uibModalInstance, $scope) {
          console.log(type);
          $scope.display_picture = achievement.display_picture;
          if (type == 'acquired') {
            $scope.photoUrl = '/img/badges/Badges_with_bg/' + $scope.display_picture;
          }
          $scope.name = achievement.name;
          $scope.description = achievement.description;
          // console.log($scope.display_picture);
          // console.log($scope.name);
          // console.log($scope.description);
          $scope.ok = function () {
            $uibModalInstance.dismiss('close');
          };
        },
        size: 'sm'
      });
    }

    function openBadgeInfo() {
      var modalInstance = $uibModal.open({
        templateUrl: 'app/components/badges/templates/badge-info.html',
        controller: function ($uibModalInstance, $scope) {
          $scope.ok = function () {
            $uibModalInstance.dismiss('close');
          };
        },
        size: 'sm'
      });
    }

    function openObtainedBadge() {
      var modalInstance = $uibModal.open({
        templateUrl: 'app/components/badges/templates/badge-optained.html',
        controller: function ($uibModalInstance, $scope) {
          $scope.ok = function () {
            $uibModalInstance.dismiss('close');
          };
        },
        size: 'sm'
      });
    }
  }

  function PublicProfileSensorsController(DataService, $localStorage) {
    var vm = this;
    activate();

    function activate() {
      angular.extend(vm, {
        profile: $localStorage.public_user
      });
      getUserSensors();
    }

    function getUserSensors() {
      DataService.Sensors
        .get('', {
          user_id: $localStorage.public_user.id
        })
        .then(function (response) {
          vm.sensors = response.data;
          vm.sensors.forEach(function (sensor) {
            sensor['fromNow'] = moment(sensor['created_at']).format('DD-MM-YYYY HH:MM');
          });
          console.log(vm.sensors);
        });
    }
  }

  function PublicProfilePerceptionsController(DataService, $localStorage) {
    var vm = this;
    activate();

    function activate() {
      angular.extend(vm, {
        profile: $localStorage.public_user
      });
      getUserPerceptions();
    }

    function getUserPerceptions() {
      DataService.Perceptions
        .get('', {
          user_id: $localStorage.public_user.id
        })
        .then(function (response) {
          vm.perceptions = response.data;
        })
    }
  }

  function PublicSensorsController() {
    var vm = this;
    $scope.selectedSensor;

    activate();

    function activate() {
      angular.extend(vm, {
        getSensor: getSensor($stateParams.id)
      });
    }

    function getSensor(id) {
      DataService.Sensors
        .one(id).get()
        .then(function (res) {
          vm.sensor = res.data;

          if ($state.current.name === 'profile.view-sensor') {
            renderSensorMap();
          }

          DataService.Measurements
            .get('', {
              sensor: id,
              timestampStart: new Date(0),
              show: 'all'
            })
            .then(function (result) {
              vm.sensor.measurements = result.data;
            });
        });
    }
  }

})();
