angular.module('metho.controllers.refs', [])

// Ref Tab view
.controller('RefCtrl', function($scope, Articles) {
  $scope.articles = Articles.all();
})


// Ref detail view
.controller('RefDetailCtrl', function($scope, $stateParams, Articles, $ionicNavBarDelegate) {
  $scope.article = Articles.get($stateParams.articleId);

  $scope.share = function () {
      text = document.querySelectorAll("ion-content#sub-content")[0].innerText;
      window.plugins.socialsharing.share(text, $scope.article.name);
  }
})


// Ref sub detail view
.controller('RefSubDetailCtrl', function($scope, $stateParams, Articles) {
    $scope.article = Articles.get($stateParams.articleId).subPages[$stateParams.subId];

    $scope.shareSub = function () {
      text = document.querySelectorAll("ion-content#sub-detail-content")[0].innerText;
      window.plugins.socialsharing.share(text, $scope.article.name);
    }
});
