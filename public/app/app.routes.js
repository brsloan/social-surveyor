angular.module('socialSurveyor')
    .config([
      '$stateProvider',
      '$urlRouterProvider',
      function($stateProvider, $urlRouterProvider){
        $stateProvider
          .state('home', {
            url: '/home',
            templateUrl: 'app/components/home/homeView.html',
            controller: 'MainCtrl'
        })
          .state('polls', {
            url: '/polls',
            templateUrl: 'app/components/polls/pollsView.html',
            controller: 'PollsCtrl'
        })
        .state('poll', {
            url: '/{username}/polls/{pollname}',
            templateUrl: 'app/components/poll/pollView.html',
            controller: 'PollCtrl',
            resolve: {
              poll: ['$stateParams', 'polls', function($stateParams, polls){
                return polls.get($stateParams.username, $stateParams.pollname);
              }],
              username: ['$stateParams', function($stateParams){
                return $stateParams.username;
              }]
            }
        })
          .state('login',{
            url: '/login',
            templateUrl: '/app/components/login/loginView.html',
            controller: 'AuthCtrl',
            onEnter: ['$state', 'auth', function($state, auth){
              if(auth.isLoggedIn()){
                $state.go('home');
              }
            }]
          })
          .state('register', {
            url: '/register',
            templateUrl: '/app/components/register/registerView.html',
            controller: 'AuthCtrl',
            onEnter: ['$state', 'auth', function($state, auth){
              if(auth.isLoggedIn()){
                $state.go('home');
              }
            }]
          })
    
        $urlRouterProvider.otherwise('home');
    }]);