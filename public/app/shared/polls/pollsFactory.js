angular.module('socialSurveyor')
    .factory('polls', ['$http', 'auth', function($http, auth){
      var o = {
          polls: [],
          newOptions: [{title: ''},{title: ''} ]
      };
    
      o.getAll = function(){
        return $http.get('/' + auth.currentUser() + '/polls').success(function(data){
          angular.copy(data, o.polls);
        });
      };
    
      o.create = function(poll, cb){
        return $http.post('/' + auth.currentUser() + '/polls', poll, {
          headers: {Authorization: 'Bearer '+auth.getToken()}
        }).success(function(data){
          o.polls.push(data);
          cb(data);
        });
      };
    
      o.get = function(username, pollname) {
        return $http.get('/' + username + '/polls/' + pollname).then(function(res){
          return res.data;
        });
      }
      
      o.delete = function(id){
        return $http.delete('/' + auth.currentUser() + '/polls/' + id, {
          headers: {Authorization: 'Bearer '+auth.getToken()}
        }).then(function(res){
          o.getAll();
    
          return res.data;
        });
      }
      
      o.addOptions = function(id, options, cb){
        return $http.post('/' + auth.currentUser() + '/polls/' + id + '/options', options, {
          headers: {Authorization: 'Bearer '+auth.getToken()}
        }).success(function(data){
          cb(data);
        });
      };
    
      o.voteForOption = function(username, poll, option, cb){
        return $http.put('/' + username + '/polls/' + poll._id + '/options/' + option._id + '/votefor').success(function(data){
            option.votes += 1;
            cb();
          });
      };
      
      o.addEmptyOption = function(){
        o.newOptions.push({title: ''});
      }
      
      o.clearNewOptions = function(){
        o.newOptions.length = 0;
        o.newOptions.push({title:''});
        o.newOptions.push({title:''});
      };
    
      return o;
    }])