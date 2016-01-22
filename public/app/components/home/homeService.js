angular.module('socialSurveyor')
    .factory('home', function(){
       var o = {
          newOptions: [{title: ''},{title: ''}]
      };
        
      o.addNewOption = addNewOption;
      o.removeNewOption = removeNewOption;
      o.clearNewOptions = clearNewOptions;
      
      return o;
      
      function addNewOption(){
        o.newOptions.push({title: ''});
      }
      
      function removeNewOption(){
        if(o.newOptions.length > 2)
            o.newOptions.pop();
      }
      
      function clearNewOptions(){
        o.newOptions.length = 0;
        o.newOptions.push({title:''});
        o.newOptions.push({title:''});
      }
        
    });