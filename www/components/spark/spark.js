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

.config(function($stateProvider, $urlRouterProvider) {

  $stateProvider

    .state('tab.spark', {
      url: '/spark',
      views: {
        'tab-spark': {
          templateUrl: 'components/spark/tabs/tab-spark.html',
          controller: 'SparkTabCtrl'
        }
      }
    })
    .state('tab.spark-accounts', {
      url: '/spark/accounts',
      views: {
        'tab-spark': {
          templateUrl: 'components/spark/pages/accounts.html',
          controller: 'SparkAccountCtrl'
        }
      }
    })
    .state('tab.spark-account-detail', {
      url: '/spark/accounts/:id',
      views: {
        'tab-spark': {
          templateUrl: 'components/spark/pages/account-detail.html',
          controller: 'SparkAccountDetailCtrl'
        }
      }
    })
    .state('tab.spark-cores', {
      url: '/spark/cores',
      views: {
        'tab-spark': {
          templateUrl: 'components/spark/pages/cores.html',
          controller: 'SparkCoreCtrl'
        }
      }
    })
    .state('tab.spark-core-detail', {
      url: '/spark/cores/:id',
      views: {
        'tab-spark': {
          templateUrl: 'components/spark/pages/core-detail.html',
          controller: 'SparkCoreDetailCtrl'
        }
      }
    })

  ; // $stateProvider


})


/*===============================================
=            Spark Controllers Layer            =
===============================================*/

.controller('SparkTabCtrl', function($scope, $localStorage) {

  $scope.settings = {
    apiUrl: spark.baseUrl,
    error: false
  };


  $scope.clearData = function(){
    if( confirm('Cannot undo - clear all app localstorage data?')){
        $localStorage.$reset();
      }
  };

}) // SparkCtrl


.controller('SparkAccountCtrl', function($scope, $localStorage, $ionicModal, $ionicLoading) {

  $scope.settings = {
    error: false
  };

  // Modal def
  $ionicModal.fromTemplateUrl('components/spark/modals/modal-account.html', {
    scope: $scope,
    animation: 'slide-in-up'
  }).then(function(modal) {
    $scope.modal = modal;
  });
  $scope.openModal = function() {
    $scope.modal.show();
  };
  $scope.closeModal = function() {
    $scope.modal.hide();
  };

  $scope.addAccount = function(newUser){
    console.log(newUser);
    if( newUser && newUser.email && newUser.pass){
      $ionicLoading.show();
      spark
        .login({username: newUser.email, password: newUser.pass})
        .success(function(data){
          
          console.log('data: ', data);
        })
        .error(function(data, status, headers, config){
          console.log('ERRIR', data, status);
        })
        .finally(function(){
          $ionicLoading.hide();
        })
      ; // spark login

    } else{
      $scope.settings.error = "Please fill out the email and password fields";
    }
  } // addAccount

}) // SparkAccountCtrl

.controller('SparkAccountDetailCtrl', function($scope, $localStorage) {
})
.controller('SparkCoreCtrl', function($scope, $localStorage) {
})
.controller('SparkCoreDetailCtrl', function($scope, $localStorage) {
})


/*============================================
=            Spark Services Layer            =
============================================*/

.service('SparkService', function(spark){

}) // .SparkService

;