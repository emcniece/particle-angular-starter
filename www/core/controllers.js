angular.module('starter.controllers', ['ngStorage'])

.controller('DashCtrl', function($scope, $localStorage, $timeout, $http, $ionicLoading, $ionicModal, Lamp) {


    $scope.data = {
      activeCore: $localStorage.spark.activeCore,
      modalCore: null,
      status: false,
      brightness : '0',
      name : false,
      red: 128,
      green: 128,
      blue: 128,
      buttonColor: null,
      buttonAlpha: 1
    };

    /* todo: modify button color demo!

      For: R=50%, G=66%, B=25%
      opacity: 0.66
      R = 255*(50/66) = 186
      G = 255
      B = 255*(25/66) = 93
      color = rgba(186,255,93,0.6);

    */

    console.log($scope.data.activeCore);
    $scope.localDevices = $localStorage.spark.cores;

    // Modal def
    $ionicModal.fromTemplateUrl('shared/modals/modal-dash-selectcore.html', {
      scope: $scope,
      animation: 'slide-in-up'
    }).then(function(modal) {
      $scope.modal = modal;
    });

    $scope.openModal = function() {
      console.log($scope);
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
            $localStorage.spark.activeCore = core;
          }
        });

        $scope.closeModal();
      }


    };


    $scope.onBrightnessChange = function(){

      Lamp.setBrightness($scope.data.brightness);

    }; // onBrightnessChange

    $scope.doRefresh = function() {

      // Check status, return promise
      Lamp.getStatus()
        .success(function(data) {

          if( data.name){
            $scope.data.name = data.name;
            $scope.data.status = data.connected;
          }

          return false;

        }); // getStatus

      // Check brightness, return promise
      Lamp.getBrightness()
        .success(function(data){

          if( data.name){
            $scope.data.brightness = data.result;
          }

        })
        .finally(function() {
          // Stop the ion-refresher from spinning
          $scope.$broadcast('scroll.refreshComplete');
        });



    }; // doRefresh

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
