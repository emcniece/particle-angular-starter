angular.module('starter.controllers', ['ngStorage'])

.controller('DashCtrl', function($scope, $localStorage, $timeout, $http, $ionicLoading, $ionicModal, SparkService) {


    $scope.data = {
      activeCore: $localStorage.lampCore,
      activeAcct: $localStorage.spark.activeAcct,
      lastQuery: false,
      modalCore: null,
      status: false,
      brightness : '0',
      name : false,
      color:{
        r: 128,
        g: 128,
        b: 128,
      },
      button: {
        color: {r:0,g:0,b:0},
        alpha: 1
      }

    };

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


      console.log($scope.data.button.color, $scope.data.button.alpha);
    };

    console.log('Active core: ',$scope.data.activeCore);
    console.log('Active acct: ',$scope.data.activeAcct);

    $scope.localDevices = $localStorage.spark.cores;

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
      if( !spark.accessToken){
        SparkService.login()
          .then(function(data){
              spark.getDevice($scope.data.activeCore.id, $scope.updateAC);
            })
            .catch(function(error){
              console.log(error);
            });
      } else{
        spark.getDevice($scope.data.activeCore.id, $scope.updateAC);

      }

    }; // doRefresh

    $scope.updateAC = function(err, device){
      $scope.data.activeCore = device;
      $scope.data.activeCore.lastQuery = +new Date;
      $scope.$broadcast('scroll.refreshComplete');
    };

    $scope.bumpBrightness = function(){
      var newLevel = parseInt($scope.data.brightness, 10) + 5;
      if( newLevel > 255) newLevel = 255;
      $scope.data.brightness = Lamp.setBrightness( newLevel);
    };

    $scope.toggleLamp = function(){
      var newLevel = 0;
      if( $scope.data.brightness === 0){
        newLevel = 255;
      }

      $scope.data.brightness = Lamp.setBrightness(newLevel);

      return newLevel;

    }; // toggleLamp

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
