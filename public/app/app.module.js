google.setOnLoadCallback(function () {  
    angular.bootstrap(document.body, ['socialSurveyor']);
});
google.load('visualization', '1', {packages: ['corechart']});

angular.module('socialSurveyor', ['ui.router']);