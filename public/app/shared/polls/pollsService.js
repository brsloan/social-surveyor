angular.module('socialSurveyor')
    .factory('polls', ['$http', 'auth', function($http, auth){
      var o = {
          polls: []
      };
    
      o.getAll = getAllPolls;
      o.save = savePoll;
      o.get = getPoll;
      o.delete = deletePoll;
      o.saveOptions = saveOptions;
      o.voteForOption = voteForOption;
    
      return o;
      
      function getAllPolls(){
         return $http.get('/' + auth.currentUser() + '/polls').success(function(data){
          angular.copy(data, o.polls);
        });
      }
      
      function savePoll(poll, cb){
        return $http.post('/' + auth.currentUser() + '/polls', poll, {
          headers: {Authorization: 'Bearer '+auth.getToken()}
        }).success(function(data){
          o.polls.push(data);
          cb(data);
        });
      }
      
      function getPoll(username, pollname){
        return $http.get('/' + username + '/polls/' + pollname).then(function(res){
          return res.data;
        });
      }
      
      function deletePoll(id){
        return $http.delete('/' + auth.currentUser() + '/polls/' + id, {
          headers: {Authorization: 'Bearer '+auth.getToken()}
        }).then(function(res){
          o.getAll();
    
          return res.data;
        });
      }
      
      function saveOptions(pollId, options, cb){
        return $http.post('/' + auth.currentUser() + '/polls/' + pollId + '/options', options, {
          headers: {Authorization: 'Bearer '+auth.getToken()}
        }).success(function(data){
          cb(data);
        });
      }
      
      function voteForOption(username, poll, option, cb){
        return $http.put('/' + username + '/polls/' + poll._id + '/options/' + option._id + '/votefor')
        .success(function(data){
            option.votes += 1;
            cb();
          });
      }
      
    }])