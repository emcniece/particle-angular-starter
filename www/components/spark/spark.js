angular.module('starter.spark', [])

.run(function($ionicPlatform, $localStorage) {
  $ionicPlatform.ready(function() {

  console.log('Spark ready', spark);

    // Load default settings and variables
    $localStorage.$default({
      spark: {
        'accounts': [],
        'cores': [],
        'listeners': [],
        'variables': [],
        'functions': []
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

  $scope.accounts = $localStorage.spark.accounts;

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

  $scope.clearError = function(){ $scope.settings.error = false; };

  $scope.addAccount = function(newUser){

    if( newUser && newUser.email && newUser.pass){
      $ionicLoading.show({template:"Loading..."});
      spark
        .login({username: newUser.email, password: newUser.pass})
        .then(function(data){

          $scope.accounts.push({
            email: newUser.email,
            password: newUser.remember ? newUser.pass : false,
            access_token: data.access_token,
            token_type: data.token_type,
            expires_in: data.expires_in
          });
          $scope.closeModal();

        })
        .catch(function(error){
          console.log(error);
          $scope.settings.error = "Something went wrong! "+error;
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

.controller('SparkAccountDetailCtrl', ['$scope', '$stateParams', '$localStorage', '$location',
  function($scope, $stateParams, $localStorage, $location) {


  $scope.account = $localStorage.spark.accounts[$stateParams.id];
  $scope.account.expiry = secondsToTime($scope.account.expires_in);

  $scope.deleteAccount = function(){
    if(confirm("Are you sure you want to delete this account?")){
      //delete $localStorage.spark.accounts[$stateParams.id];
      $location.path('/#/tabs/spark/accounts');

    }
  }

}]) // SparkAccountDetailCtrl

.controller('SparkCoreCtrl', function($scope, $localStorage, $ionicModal, $ionicLoading) {


  // Modal def
  $ionicModal.fromTemplateUrl('components/spark/modals/modal-cores.html', {
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


}) // SparkCoreCtrl

// Load cores after acct selection
.controller('SparkCoreModal',function($scope, $localStorage, $ionicLoading){

  $scope.settings = {
    error: false
  };
  $scope.accounts = $localStorage.spark.accounts;

  $scope.changeAcct = function(){
    $scope.settings.error = false;
    if($scope.selectedAcct){
      $ionicLoading.show({template:"Logging in..."});
      $scope.doLogin();
    }
  }; // changeAcct

  $scope.doLogin = function(){
    spark.login({accessToken: $scope.selectedAcct})
      .then(
        $scope.getDevices,
        function(err) {
          console.log('API call completed on promise fail: ', err);
          $ionicLoading.hide();
        }
      );
  };

  $scope.getDevices = function(token){

    $ionicLoading.hide();
    $ionicLoading.show({template:"Getting devices..."});

    var devicesPr = spark.listDevices()
      .then( function(devices){
        console.log(devices);
        $scope.cores = devices;

        /*
         * NEXT UP:
         * Store selected cores in $localStorage
         * make sure that account and/or access_token is stored with core
         * then propagate to SparkCoreCtrl $scope.cores
         * probably have to loop x10^45 to get it done
         */

      }, function(error){
        console.log('error', error);
        $scope.settings.error = "Error: "+error.message;
      }
    ).finally(function(){
      $ionicLoading.hide();
    });

  };

}) // GetDevices

.controller('SparkCoreDetailCtrl', function($scope, $localStorage) {
})


/*============================================
=            Spark Services Layer            =
============================================*/

.service('SparkService', function(spark){

}) // .SparkService

;