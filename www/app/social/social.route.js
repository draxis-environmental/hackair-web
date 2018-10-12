(function() {
  'use strict';

  angular
    .module('app.social')
    .run(appRun);

  appRun.$inject = ['routerHelper'];
  /* @ngInject */
  function appRun(routerHelper) {
    routerHelper.configureStates(getStates());
  }

  function getStates() {
    return [
      {
        state: 'social',
        config: {
          url: '/user/:id',
          templateUrl: 'app/social/social.html',
          controller: 'SocialController',
          controllerAs: 'vm',
          bindToController: true,
          cache: false,
          abstract: true
        }
      },
      {
        state: 'social.user',
        config: {
          url: '/social',
          templateUrl: 'app/social/tabs/social-map.html',
          controller: 'SocialController',
          controllerAs: 'vm'
        }
      },
      // {
      //   state: 'social.contributions',
      //   config: {
      //     url: '/contributions',
      //     templateUrl: 'app/social/tabs/social-contributions.html',
      //     controller: 'SocialController',
      //     controllerAs: 'vm'
      //   }
      // },
      // {
      //   state: 'social.members',
      //   config: {
      //     url: '/members',
      //     templateUrl: 'app/social/tabs/social-members.html',
      //     controller: 'SocialController',
      //     controllerAs: 'vm'
      //   }
      // },
      {
        state: 'community',
        config: {
          url: '/social/community/:id',
          templateUrl: 'app/social/communities/community.html',
          controller: 'CommunityController',
          controllerAs: 'vm'
        }
      },
      {
        state:'new-community',
        config: {
          url: '/social/new-community',
          templateUrl: 'app/social/communities/new-community.html',
          controller: 'CommunityController',
          controllerAs: 'vm'
        }
      },
      {
        state: 'edit-community',
        config: {
          url: '/social/community/:id',
          templateUrl: 'app/social/communities/edit.community.html',
          controller: 'CommunityController',
          controllerAs: 'vm',
          abstract: true
        }
      },
      {
        state: 'edit-community.update',
        config: {
          url: '/edit',
          templateUrl: 'app/social/communities/update.community.html',
          controller: 'CommunityController',
          controllerAs: 'vm'
        }
      },
      {
        state: 'edit-community.delete',
        config: {
          url: '/delete',
          templateUrl: 'app/social/communities/delete.community.html',
          controller: 'CommunityController',
          controllerAs: 'vm'
        }
      }
    ];
  }
})();
