// Ionic Starter App
// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.services' is found in services.js
// 'starter.controllers' is found in controllers.js
angular.module('starter', ['ionic', 'starter.controllers', 'starter.services', 'ngCordova', 'LocalStorageModule', 'ng-slide-down'])

.run(function($ionicPlatform, localStorageService) {
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if (window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
      cordova.plugins.Keyboard.disableScroll(true);

    }
    if (window.StatusBar) {
      // org.apache.cordova.statusbar required
      StatusBar.styleDefault();
    }

    // $rootScope.db = $cordovaSQLite.openDB("projects.db");
    // $cordovaSQLite.execute(db, "CREATE TABLE IF NOT EXISTS projects (id INTEGER PRIMARY KEY AUTOINCREMENT, project_name TEXT, project_matter TEXT)");
    // $cordovaSQLite.execute(db, "CREATE TABLE IF NOT EXISTS references (id INTEGER PRIMARY KEY AUTOINCREMENT, project_name TEXT, project_matter TEXT, project_id INTEGER, parsed_source TEXT, multiple_authors BOOLEAN, authors_lastname TEXT, authors_firstname TEXT, source_type TEXT, book_title TEXT, publication_location TEXT, editor_name TEXT, publication_date TEXT, page_number TEXT, article_title TEXT, periodic_title TEXT, edition_number TEXT, organism_name TEXT, support_type TEXT, homepage_name TEXT, url TEXT, consultation_date TEXT, document_title TEXT, productor TEXT, episode_title TEXT, production_location TEXT, broadcaster TEXT, duration TEXT, student_lastname TEXT, student_firstname TEXT, interviewed_person TEXT, interviewed_person_title TEXT, interview_location TEXT, interview_date DATE)");
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
  });

  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/tab/projects');

  $ionicConfigProvider.backButton.text("Retour");
});
