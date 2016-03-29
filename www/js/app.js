// Ionic Starter App
// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.services' is found in services.js
// 'starter.controllers' is found in controllers.js
angular.module('metho', ['ionic', 'metho.controllers.projects', 'metho.controllers.refs', 'metho.controllers.settings', 'metho.services.projects', 'metho.services.refs', 'metho.services.settings', 'ngCordova', 'LocalStorageModule', 'ng-slide-down'])

.run(function($ionicPlatform, localStorageService) {
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    cordova.plugins.Keyboard.disableScroll(false);
    if (window.StatusBar) {
      // org.apache.cordova.statusbar required
      StatusBar.styleDefault();
    }

  });
})

.config(function($stateProvider, $urlRouterProvider, $ionicConfigProvider) {

  // Ionic uses AngularUI Router which uses the concept of states
  // Learn more here: https://github.com/angular-ui/ui-router
  // Set up the various states which the app can be in.
  // Each state's controller can be found in controllers.js
  $stateProvider

  // setup an abstract state for the tabs directive
    .state('tab', {
    url: '/tab',
    abstract: true,
    templateUrl: 'templates/tabs.html'
  })

  // Each tab has its own nav history stack:

  .state('tab.projects', {
    url: '/projects',
    views: {
      'tab-projects': {
        templateUrl: 'templates/tab-projects.html',
        controller: 'ProjectsCtrl'
      }
    }
  })

  .state('tab.project-detail', {
    url: '/projects/:projectID',
    views: {
      'tab-projects': {
        templateUrl: 'templates/project-detail.html',
        controller: 'ProjectDetailCtrl'
      }
    }
  })

  .state('tab.source-detail', {
    url: '/projects/:projectID/:sourceID',
    views: {
      'tab-projects': {
        templateUrl: 'templates/source-detail.html',
        controller: 'SourceDetailCtrl'
      }
    }
  })

  .state('tab.ref', {
      url: '/ref',
      views: {
        'tab-ref': {
          templateUrl: 'templates/tab-ref.html',
          controller: 'RefCtrl'
        }
      }
    })
    .state('tab.ref-detail', {
      url: '/ref/:articleId',
      views: {
        'tab-ref': {
          templateUrl: 'templates/ref-detail.html',
          controller: 'RefDetailCtrl'
        }
      }
    })
    .state('tab.ref-sub-detail', {
      url: '/ref/:articleId/:subId',
      views: {
        'tab-ref': {
          templateUrl: 'templates/ref-sub-detail.html',
          controller: 'RefSubDetailCtrl'
        }
      }
    })

  .state('tab.settings', {
    url: '/settings',
    views: {
      'tab-settings': {
        templateUrl: 'templates/tab-settings.html',
        controller: 'SettingsCtrl'
      }
    }
  })

  .state('tab.feedback', {
    url: '/settings/feedback',
    views: {
      'tab-settings': {
        templateUrl: 'templates/feedback.html',
        controller: 'FeedbackCtrl'
      }
    }
  });

  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/tab/projects');

  $ionicConfigProvider.backButton.text("Retour");
});
