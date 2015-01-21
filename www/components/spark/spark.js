angular.module('starter.spark', [])

.run(function($ionicPlatform, $localStorage) {
  $ionicPlatform.ready(function() {

  console.log('Spark ready', spark);

    // Load default settings and variables
    $localStorage.$default({
      spark: {
        'accounts': {},
        'cores': {},
        'listeners': {},
        'variables': {},
        'functions': {}
      } // spark
    });

  }); // platform.ready

}) // .run

.service('SparkService', function(spark){



}) // .SparkService

.controller('SparkTabCtrl', function($scope, $localStorage) {

  $scope.settings = {
    apiUrl: spark.baseUrl
  }

  $scope.clearData = function(){
    if( confirm('Cannot undo - clear all app localstorage data?')){
        $localStorage.$reset();
        console.log('cleared', $localStorage);
      }
  }

}) // SparkCtrl

;