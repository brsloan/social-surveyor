angular.module('socialSurveyor')
  .controller('NavCtrl', [
  '$scope',
  '$state',
  'auth',
  function($scope, $state, auth){
    $scope.isLoggedIn = auth.isLoggedIn;
    $scope.currentUser = auth.currentUser;
    $scope.logOut = function(){
      auth.logOut();
      window.location.replace('/');
    };
  }]);