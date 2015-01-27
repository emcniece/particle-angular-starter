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
          console.log(data);
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
  }; // addAccount

}) // SparkAccountCtrl

.controller('SparkAccountDetailCtrl', ['$scope', '$stateParams', '$localStorage', '$location',
  function($scope, $stateParams, $localStorage, $location) {


  $scope.account = $localStorage.spark.accounts[$stateParams.id];
  $scope.account.expiry = secondsToTime($scope.account.expires_in);

  $scope.deleteAccount = function(){
    if(confirm("Are you sure you want to delete this account?")){
      $localStorage.spark.cores.accounts($stateParams.id, 1);
      $location.path('/#/tab/spark/accounts');
    }
  };

}]) // SparkAccountDetailCtrl

.controller('SparkCoreCtrl', function($scope, $localStorage, $ionicModal, $ionicLoading) {

  $scope.cores = $localStorage.spark.cores;

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
.controller('SparkCoreModal',function($scope, $localStorage, $ionicLoading, $ionicModal){

  $scope.settings = {
    error: false
  };
  $scope.accounts = $localStorage.spark.accounts;
  $scope.cores = $localStorage.spark.cores;
  $scope.remoteDevices = [];

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

        // Only display new devices
        angular.forEach(devices, function(core){
          var inScope = false;
          angular.forEach($scope.cores, function(scopeCore){
            if(core.id === scopeCore.id) inScope = true;
          })
          if(!inScope) $scope.remoteDevices.push(core);
        });
        
        if($scope.remoteDevices.length == 0){
          $scope.settings.error = "You have already added all cores from this account.";
        }


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

  }; // getDevices

  $scope.addCores = function(){
    console.log($scope.remoteDevices);
    angular.forEach($scope.remoteDevices, function(core, key){
      if(core.selected){

        var inScope = false;
        angular.forEach($scope.cores, function(scopeCore){
          if( core.id === scopeCore.id) inScope = true;
        });

        if(!inScope){
          // Clean circular JSON
          delete core._spark; delete core.attributes;
          console.log('core: ', core);
          $localStorage.spark.cores.push(core);
          $scope.remoteDevices.splice($scope.remoteDevices.indexOf(core), 1);

          
        }
        $scope.modal.hide();
      } // if core selected
    });



  };

}) // GetDevices

.controller('SparkCoreDetailCtrl', ['$scope', '$stateParams', '$localStorage', '$location',
  function($scope, $stateParams, $localStorage, $location) {


  $scope.core = $localStorage.spark.cores[$stateParams.id];
  console.log($scope.core);

  $scope.deleteCore = function(){
    if(confirm("Are you sure you want to delete this core?")){
      $localStorage.spark.cores.splice($stateParams.id, 1);
      $location.path('tab/spark/cores');
    }
  };

}]) // SparkCoreDetailCtrl


/*============================================
=            Spark Services Layer            =
============================================*/

.service('SparkService', function(spark){

}) // .SparkService

;