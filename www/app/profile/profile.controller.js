(function () {
  'use strict';

  angular
    .module('app.profile')
    .controller('ProfileController', ProfileController)
    .controller('ProfilePhotosController', ProfilePhotosController)
    .controller('ProfileFollowersController', ProfileFollowersController)
    .controller('ProfileAchievementsController', ProfileAchievementsController)
    .controller('ProfilePerceptionsController', ProfilePerceptionsController);

  /* @ngInject */
  function ProfileController($translate, $timeout, $scope, $rootScope, $localStorage, $uibModal, $filter, DataService, SocialService, Upload, ngToast, $state, $http, API_URL, profile) {
    var vm = this;
    vm.word_for_delete = "hackAIR";

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
      console.log(profile);
      profile.gender = $filter('translate')('profile.genders.' + $localStorage.user.gender)
      vm.achievements = achievements;
      // profile.accept_newsletters = false;

      // profile.age = null;
      if (profile.year_of_birth != null) {
        profile.age = parseInt(new Date().getFullYear()) - profile.year_of_birth;
      }

      angular.extend(profile, {
        groupsString: profile.groups.map(function (e) {
          return e.name
        }).join(', '),
        outdoorActivitiesString: profile.outdoor_activities.map(function (e) {
          return e.name
        }).join(', ')
      });

      angular.extend(vm, {
        profile: profile,
        togglePrivacy: togglePrivacy,
        toggleNotificationEmails: toggleNotificationEmails,
        toggleNewsletter: toggleNewsletter,
        getPhoto: getPhoto
      });


      angular.extend(vm, {
        // outdoor_activities: getOutdoorActivities(),
        // sensitivities:      getSensitivities(),
        // selectedActivities: '',
        openBadgeInfo: openBadgeInfo,
        getOptionsSelected: getOptionsSelected,
        openOptainedBadge: openOptainedBadge,
        updateProfile: updateProfile,
        locationChanged: locationChanged,
        changePassword: changePassword,
        deleteAccount: deleteAccount,
        popOverContent: '',
      });
      getOptions(API_URL, $http);
      getSecondaryProfile();
      getContributions(vm.profile.social_feed.data);
      $scope.$on('updatedProfile', updateView);
      initProfilePopover();
    }

    function initProfilePopover() {
      vm.popOverContent = '<ul>';
      $http.get(API_URL + '/levels').then(res => {
        res.data.data.forEach(level => {
          vm.popOverContent += `<li>${level.name} ( ${level.points_from} - ${level.points_to} )</li>`;
        });
        vm.popOverContent += '</ul>';
      });
      $('.level-info').popover({
        container: 'body',
        trigger: 'hover'
      });
    }

    function getProfile() {
      var profile = angular.copy($localStorage.user);
      // calculating user's age

      return profile;
    }

    function updateView() {
      angular.extend(vm, {
        profile: profile
      });
    }

    function getSecondaryProfile() {
      if (!vm.profile.secondary_profile) {
        vm.profile.secondary_profile = {
          show: false,
          details: {}
        }
      }
      setTimeout(() => {
        $('.year-input').datepicker({
          format: "yyyy",
          viewMode: "years",
          minViewMode: "years",
          orientation: "bottom"
        });
      }, 2000);
    }

    function getContributions(array) {
      var newContributions = [];
      array.forEach(function (contribution) {
        var oldDate = contribution['updated_at'];
        // contribution['updated_at'] = contribution['updated_at'].substring(0, 10);
        contribution['updated_at'] = contribution['updated_at'];
        // contribution['updated_at'] = moment(oldDate).calendar(null, {
        //   sameDay: '[Today at] LT',
        //   nextDay: '[Tomorrow]',
        //   nextWeek: 'dddd',
        //   lastDay: '[Yesterday at] LT',
        //   lastWeek: '[Last] dddd',
        //   sameElse: 'DD/MM/YYYY'
        // });
        newContributions.push(contribution);
      });
      vm.contributions = newContributions;
    }

    function updateProfile() {
      if (vm.profile.secondary_profile.show === false) {
        vm.profile.secondary_profile.details = {};
      } else {
        if (vm.profile.secondary_profile.details === undefined) {
          vm.profile.secondary_profile.details = {};
        }
      }
      var User = DataService.Users.one($localStorage.user.id);
      var updatedProfile = transformViewModel(vm.profile);
      if (!updatedProfile.name) {
        updatedProfile.name = ''
      }
      if (!updatedProfile.surname) {
        updatedProfile.surname = ''
      }
      updatedProfile.profile_picture = vm.profile.profile_picture;
      angular.extend(User, updatedProfile);

      User.put()
        .then(function (response) {
          $localStorage.user = response.data;
          // vm.profile = getProfile();

          ngToast.create({
            className: 'success',
            content: $filter('translate')('profilecontrol.profile_saved')
          });

          $rootScope.$broadcast('updatedProfile');

          // $state.go('profile.overview');
          $state.reload();
        })
        .catch(function (response) {
          ngToast.create({
            className: 'danger',
            content: response.data.message
          });
        });
    }

    function toggleNotificationEmails() {
      vm.profile.notify_email = !vm.profile.notify_email;
      $localStorage.user.notify_email = vm.profile.notify_email;

      DataService.Profile.toggleNotificationEmails()
        .then(function (res) {
          ngToast.create({
            className: 'success',
            content: $filter('translate')('profilecontrol.notification_saved')
          });
        })
        .catch(function (res) {});

    }

    function toggleNewsletter() {
      vm.profile.accept_newsletters = !vm.profile.accept_newsletters;
      $localStorage.user.accept_newsletters = vm.profile.accept_newsletters;

      DataService.Profile.toggleNewsletter()
        .then(function (res) {
          ngToast.create({
            className: 'success',
            content: $filter('translate')('profilecontrol.newsletter_saved')
          });
        })
        .catch(function (res) {});

    }

    function togglePrivacy() {
      vm.profile.private = !vm.profile.private;
      $localStorage.user.private = vm.profile.private;

      DataService.Profile.togglePrivacy($localStorage.user.id)
        .then(function (res) {
          ngToast.create({
            className: 'success',
            content: $filter('translate')('profilecontrol.privacy_saved')
          });
        })
        .catch(function (res) {});
    }

    function locationChanged(location) {
      vm.profile.place_id = location.place_id;
    }

    function getOptions(API_URL, $http) {
      return $http.get(API_URL + '/content/recommendations')
        .then(function (response) {
          vm.outdoor_activities = response.data.data.activities; // Which activities exist on the backend?
          vm.sensitivities = response.data.data.groups;

          angular.extend(vm, {
            selectedActivities: [],
            selectedSensitivities: []
          });

          vm.outdoor_activities.forEach(function (activity) {
            var filter = vm.profile.outdoor_activities.filter(function (myActivity) {
              return activity.id == myActivity.id
            });
            if (filter.length) {
              vm.selectedActivities.push(activity);
            } else {
              return;
            }

          });

          vm.sensitivities.forEach(function (sensitivity) {
            var filter = vm.profile.groups.filter(function (mySensitivity) {
              return sensitivity.id == mySensitivity.id
            });
            if (filter.length) {
              vm.selectedSensitivities.push(sensitivity);
            } else {
              return;
            }

          });

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

    function openOptainedBadge() {
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

    function getPhoto() {
      var modalInstance = $uibModal.open({
        templateUrl: 'app/profile/upload-photo.html',
        controller: function ($uibModalInstance, $scope, API_URL) {
          var preparedData;

          $scope.cancel = function () {
            $uibModalInstance.dismiss('close');
          };
          $scope.ok = function () {
            prepareData();
            uploadSelectedPhoto();
            $uibModalInstance.dismiss('close');
            $state.reload();
          };

          function prepareData() {
            var data = {
              profile_picture: $scope.attachment,
              headers: {
                'authorization': 'Bearer ' + $localStorage.credentials
              }
            };
            preparedData = data;
          }

          function uploadSelectedPhoto() {
            Upload.upload({
              url: API_URL + '/users/' + $localStorage.user.id + '/profile_picture',
              data: preparedData
            }).then(function (response) {
              vm.user.profile_picture = response.data.data.profile_picture;
            }, function (resp) {});
          }
        },
        size: 'sm'
      });


    }

    function changePassword() {
      $http.post(API_URL + "/users/" + vm.profile.id + "/password", {
          old_password: vm.user.current_password,
          password: vm.user.new_password,
          confirm: vm.user.confirm_password
        })
        .then(function (response) {
          ngToast.create({
            className: 'success',
            content: $filter('translate')('profilecontrol.pass_updated')
          });
          $state.reload();
        })
        .catch(function (response) {
          ngToast.create({
            className: 'warning',
            content: $filter('translate')('profilecontrol.some_wrong')
          });
          $state.reload();
        });
    }

    function deleteAccount() {
      if (vm.delete_word === 'hackAIR') {
        $http.delete(API_URL + "/users/" + vm.profile.id)
          .then(function (response) {
            ngToast.create({
              className: 'success',
              content: $filter('translate')('profilecontrol.success_deleted')
            });
            // Clear $localStorage
            delete($localStorage.credentials);
            delete($localStorage.user);
            delete($localStorage.firstPhoto);
            delete($rootScope.loggedIn);
            $state.go('about');
          })
          .catch(function (error) {
            ngToast.create({
              className: 'warning',
              content: $filter('translate')('profilecontrol.some_wrong')
            });
            $state.reload();
          })
      }
    }

  }

  function ProfilePhotosController(DataService, $localStorage, ngToast, $translate) {

    var vm = this;

    angular.extend(vm, {
      getPhotoAQI: getPhotoAQI
    });

    activate();

    function activate() {
      getMyPhotos();
    }

    function getMyPhotos() {
      DataService.Photos.get('', {
          user_id: $localStorage.user.id
        })
        .then(function (response) {
          vm.photos = response.data;
        });
    }

    function getPhotoAQI(image_id) {

      $translate('profile.photos.loading_please_wait').then(function (translation) {
        vm.airQualityTitle = translation;
      })
      vm.airQualityIndex = '...';

      DataService.Photo.get(image_id)
        .then(function (response) {
          if (response.data != null) {
            var translation_key = response.data.index;
            if (translation_key == 'very good') {
              translation_key = 'very_good';
            }

            $translate('profile.photos.' + translation_key).then(function (translation) {
              vm.airQualityIndex = translation;
              vm.airQualityTitle = translation;
            });
          } else if (response.data == null) {
            $translate('profile.photos.the_photo_does_not_contain_usable_sky').then(function (translation) {
              vm.airQualityTitle = translation;
            });
            $translate('profile.photos.NOT_AVAILABLE').then(function (translation) {
              vm.airQualityIndex = translation;
            });
          }
        });
    }

  }

  function ProfileFollowersController($localStorage, SocialService, $state, profile) {
    var vm = this;
    activate();

    function activate() {
      angular.extend(vm, {
        profile: profile,
        toggleFollow: toggleFollow,
        followMap: getFollowMap()
      });
    }

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
            follow_status: true
          }
        })
      };

    }

    function getFollowStatus(id) {
      var filter = profile.following.filter(function (u) {
        return u.id == id
      });
      return filter.length ? true : false;
    }

    function toggleFollow(user) {
      if (user.follow_status) {
        SocialService.unfollowUser(user.id)
          .then(function (response) {
            // Remove user from localstorage user following;
            var filter = profile.following.filter(function (u) {
              return u.id == user.id
            });

            if (filter.length) {
              var index = profile.following.indexOf(filter[0]);
              profile.following.splice(index, 1);
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
            profile.following.push(user);

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

  ProfileAchievementsController.$inject = ['$scope', '$rootScope', '$localStorage', '$uibModal', '$filter', 'DataService', 'SocialService', 'Upload', 'ngToast', '$state', '$http', 'API_URL'];

  function ProfileAchievementsController($scope, $rootScope, $localStorage, $uibModal, $filter, DataService, SocialService, Upload, ngToast, $state, $http, API_URL) {

    var vm = this;
    activate();

    function activate() {
      getAchievements();
    }

    function getAchievements() {
      DataService.Achievements.badges($localStorage.user.id)
        // DataService.Achievements.badges(102)
        .then(function (res) {
          vm.acquired = res.data.data;
          if (vm.available)
            findAcquired();
        })
        .catch(function (res) {});
      DataService.Achievements.badges()
        // DataService.Achievements.badges(102)
        .then(function (res) {
          vm.available = res.data.data;
          findAcquired();
          if (vm.available.length)
            findAcquired();

        })
        .catch(function (res) {});

      function findAcquired() {
        vm.available.map(av => {
          for (let i = 0; i < vm.acquired.length; i++) {
            if (av.id == vm.acquired[i].id) {
              av.isAquired = true;
            }
          }
        });
      }
    }


    vm.BadgePopup = function (achievement, type) {
      var modalInstance = $uibModal.open({
        templateUrl: 'app/components/badges/templates/badge-optained.html',
        controller: function ($uibModalInstance, $scope) {
          $scope.display_picture = achievement.display_picture;
          if (type == 'acquired') {
            $scope.photoUrl = '/img/badges/Badges_with_bg/' + $scope.display_picture;
          } else if (type == 'available') {
            $scope.photoUrl = '/img/badges/Badges_with_bg_Grayscale/' + $scope.display_picture;
          }

          $scope.name = achievement.name;
          $scope.description = achievement.description;
          $scope.ok = function () {
            $uibModalInstance.dismiss('close');
          };
        },
        size: 'sm'
      });
    }

  };

  // function ProfileAchievementsController() {
  // }

  function ProfilePerceptionsController(DataService, $localStorage) {
    var vm = this;
    activate();

    function activate() {
      getMyPerceptions();
    }

    function getMyPerceptions() {
      DataService.Perceptions
        .get('', {
          user_id: $localStorage.user.id
        })
        .then(function (response) {
          vm.perceptions = response.data;
        })
    }
  }
})();
