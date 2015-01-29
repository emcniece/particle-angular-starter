angular.module('starter.controllers', ['ngStorage'])

.controller('DashCtrl', function($scope, $localStorage, $timeout, $http, $ionicLoading, $ionicModal, SparkService) {


    $scope.data = {
      activeCore: $localStorage.lampCore,
      activeAcct: $localStorage.spark.activeAcct,
      lastQuery: false,
      modalCore: null,
      status: false,
      brightness : '0',
      state: 0,
      name : false,
      color:{
        r: 128,
        g: 128,
        b: 128,
      },
      button: {
        color: {r:128,g:128,b:128},
        alpha: 1
      },
      multiplier: 1

    };

    $scope.localDevices = $localStorage.spark.cores;

    console.log('Active core: ',$scope.data.activeCore);
    console.log('Active acct: ',$scope.data.activeAcct);

    // Update demo button to reflect additive light color
    $scope.updateDemo = function(){
      var highVal = 0,
          highKey = false;

      // Find highest color value
      angular.forEach($scope.data.color, function(value, key){
        value = parseInt(value, 10);
        if( value > highVal){
          highVal = value;
          highKey = key;
        }
      });

      // ... which gives us opacity as a percent
      $scope.data.button.alpha = highVal / 255;

      angular.forEach($scope.data.color, function(value, key){
        $scope.data.button.color[key] = parseInt(value/highVal*255, 10);
      });

    }; // updateDemo

    // Modal def
    $ionicModal.fromTemplateUrl('shared/modals/modal-dash-selectcore.html', {
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

    $scope.selectCore = function(){

      if($scope.data.modalCore){
        angular.forEach($scope.localDevices, function(core){
          if( core.id === $scope.data.modalCore){
            $scope.data.activeCore = core;
            $localStorage.lampCore = core;
          }
        });

        $scope.closeModal();
      }

    };


    $scope.onBrightnessChange = function(){

      Lamp.setBrightness($scope.data.brightness);

    }; // onBrightnessChange

    $scope.doRefresh = function() {

      if(!$scope.data.activeCore){
        alert("Error: Please ensure accounts and cores are added.");
        $scope.$broadcast('scroll.refreshComplete');
      } else{
        SparkService.getDevice($scope.data.activeCore).then(function(device){
          console.log('new', device);
          $scope.data.activeCore = device;
          $scope.$broadcast('scroll.refreshComplete');
        });
      }


    }; // doRefresh

    $scope.updateColor = function(){
      $scope.updateDemo();
      var params = $scope.data.color.r+","+$scope.data.color.g+","+$scope.data.color.b;

      $ionicLoading.show({template:"Sending..."});
      SparkService.callFunction($scope.data.activeCore, 'setColor', params).then(function(data){
        $ionicLoading.hide();
        console.log(data);
        /* TODO: Figure out why core returns bad ints and doesn't change color */
      });
    };

    $scope.updateState = function(){
      $ionicLoading.show({template:"Sending..."});
      SparkService.callFunction($scope.data.activeCore, 'setState', $scope.data.state).then(function(data){
        $ionicLoading.hide();
      });
    };

    $scope.updateSpeed = function(){

      var wait = 500 - $scope.data.speed;

      $ionicLoading.show({template:"Sending..."});
      SparkService.callFunction($scope.data.activeCore, 'setWait', wait).then(function(data){
        $ionicLoading.hide();

        $scope.data.speed = 500 - parseInt(data.return_value, 10);

      });
    };

})


.controller('SettingsCtrl', function($scope, $localStorage) {

  $scope.settings = $localStorage;

  $scope.clearAllData = function(){
      if( confirm('Cannot undo - clear all app localstorage data?')){
          $localStorage.$reset();
          console.log('cleared', $localStorage);
      }
  };

});
