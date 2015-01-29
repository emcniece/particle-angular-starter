angular.module('starter.spark', [])

.run(function($ionicPlatform, $localStorage) {
  $ionicPlatform.ready(function() {

  console.log('Spark ready', spark);
  console.log("Storage", $localStorage);

    // Load default settings and variables
    $localStorage.$default({
      spark: {
        activeCore: null,
        activeAcct: null,
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
  $ionicModal.fromTemplateUrl('components/spark/modals/modal-add-account.html', {
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

    var devicesPr = spark.getAttributesForAll()
      .then( function(devices){
        console.log(devices);

        // Only display new devices
        angular.forEach(devices, function(core){
          var inScope = false;
          angular.forEach($scope.cores, function(scopeCore){
            if(core.id === scopeCore.id) inScope = true;
          });

          if(!inScope) $scope.remoteDevices.push(core);
        });

        if($scope.remoteDevices.length === 0){
          $scope.settings.error = "You have already added all cores from this account.";
        }

      }, function(error){
        console.log('error', error);
        $scope.settings.error = "Error: "+error.message;
      }
    ).finally(function(){
      $ionicLoading.hide();
    });

  }; // getDevices

  $scope.addCores = function(){

    angular.forEach($scope.remoteDevices, function(core, key){
      if(core.selected){

        var inScope = false;
        angular.forEach($scope.cores, function(scopeCore){
          if( core.id === scopeCore.id) inScope = true;
        });

        if(!inScope){
          // Clean circular JSON
          delete core._spark; delete core.attributes;
          core.access_token = $scope.selectedAcct;
          console.log('core: ', core);

          $localStorage.spark.cores.push(core);
          $scope.remoteDevices.splice($scope.remoteDevices.indexOf(core), 1);

        }
        $scope.modal.hide();
      } // if core selected
    });



  };

}) // GetDevices

.controller('SparkCoreDetailCtrl', ['$scope', '$stateParams', '$localStorage', '$location', 'SparkService',
  function($scope, $stateParams, $localStorage, $location, SparkService) {


  $scope.core = $localStorage.spark.cores[$stateParams.id];
  console.log($scope.core);

  $scope.deleteCore = function(){
    if(confirm("Are you sure you want to delete this core?")){
      $localStorage.spark.cores.splice($stateParams.id, 1);
      $location.path('tab/spark/cores');
    }
  };

  $scope.getDetails = function(){

    SparkService.getDevice($scope.core).then(function(device){
      if(device.functions) $scope.core.functions = device.functions;
      if(device.variables) $scope.core.variables = device.variables;
    });

    $scope.$broadcast('scroll.refreshComplete');
  }

}]) // SparkCoreDetailCtrl

// Account selection modal
.controller('SparkSelectAcctCtrl', function($scope, $localStorage, $ionicLoading){
  $scope.accounts = $localStorage.spark.accounts;
  $scope.accts = {selected:false};
  $scope.loginComplete = false;

  $scope.selectAccount = function(){

      if(!$scope.accts.selected) return;

      $ionicLoading.show({template: "Logging in..."});

      spark.login({accessToken: $scope.accts.selected})
        .then(function(data){
          $localStorage.spark.activeAcct = {access_token : data.accessToken};
          $scope.loginComplete = true;
        })
        .catch(function(error){
          console.log(error);
          $scope.settings.error = "Something went wrong! "+error;
        })
        .finally(function(){
          $ionicLoading.hide();
        });
  }; // selectAccount
})

/*============================================
=            Spark Services Layer            =
============================================*/

.service('SparkService', function($rootScope, $q, $localStorage, $ionicModal, $ionicLoading){

  var $scope = $scope || $rootScope.$new();

  return {
    login: login,
    getDevice: getDevice,
    callFunction: callFunction

  }; // return SparkService

  function login(activeAcct){

    var acct = false,
        promise;
    $scope.accounts = $localStorage.spark.accounts;

    if(activeAcct)
      acct = activeAcct;
    else if($localStorage.spark.activeAcct)
      acct = $localStorage.spark.activeAcct.access_token;
    else if($localStorage.spark.accounts[0])
      acct = $localStorage.spark.accounts[0].access_token;

    var init = function(){
      // Modal def
      promise = $ionicModal.fromTemplateUrl('components/spark/modals/modal-accounts.html', {
        scope: $scope,
        animation: 'slide-in-up'
      }).then(function(modal) {
        $scope.modal = modal;
        return modal;
      });
      $scope.openModal = function() {
        $scope.modal.show();
      };
      $scope.closeModal = function() {
        $scope.modal.hide();
      };
      //Cleanup the modal when we're done with it!
      $scope.$on('$destroy', function() {
        console.log('destroying');
        $scope.modal.remove();
      });

      return promise;
    }; // init


    if( !acct){
      // Prompt for acct select
      init().then(function(modal){ modal.show(); });
    } else{
      // Return login promise
      console.log('Assisted login:', acct);
      return spark.login({accessToken: acct});
    } // if acct


  }

  function getDevice(core){

    if(!core.id){
      console.log('SparkService getDevice error: no core provided');
      return false;
    }

    var deferred = $q.defer();

    if(!spark.accessToken){

      // Perform login check version first
      this.login().then(function(){

        spark.getDevice(core.id, function(err, device){
          device.lastQuery = +new Date;
          deferred.resolve(device);
        }); // getDevice
      }); // login.then

    } else{

      // Otherwise if logged in just getDevice
      spark.getDevice(core.id, function(err, device){
          device.lastQuery = +new Date;
          deferred.resolve(device);
        }); // getDevice
    }

    return deferred.promise;

  } // getDevice

  function callFunction(core, name, params){

    var deferred = $q.defer();

    if(!core.id || !name){
      console.log('SparkService callFunction error: wrong/missing parameters');
      deferred.resolve(false);
    }


    if( typeof(core.callFunction) === 'undefined'){
      alert('Core is not properly defined');
      deferred.resolve(false);
    } else{
      if(!spark.accessToken){

        // Perform login check version first
        this.login().then(function(){

          core.callFunction(name, params, function(err, data){
            console.log('function return:', err, data);
            deferred.resolve(data);
          });
        }); // login.then

      } else{

        // Otherwise if logged in just getDevice
        core.callFunction(name, params, function(err, data){
          deferred.resolve(data);
        });
      }
    } // if callFunction is fn


    return deferred.promise;

  } // getDevice


}) // .SparkService

;