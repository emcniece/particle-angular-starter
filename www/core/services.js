angular.module('starter.services', [])


.service('Lamp', function($localStorage, $http, $ionicLoading){

  return {

    getStatus: getStatus,
    setBrightness: setBrightness,
    getBrightness: getBrightness

  }; // return Lamp

  function getStatus(){
    var url = $localStorage.apiUrl + "devices/"+$localStorage.device+"?access_token="+$localStorage.acToken;
    return $http.get( url );

  } // getStatus

  function setBrightness(level){

    $ionicLoading.show({
        template: 'Loading...'
    });

    $http({
        method: 'POST',
        url: $localStorage.apiUrl+"devices/" + $localStorage.device + "/adjustLamp",
        headers: {'Content-Type': 'application/x-www-form-urlencoded'},
        transformRequest: function(obj) {
            var str = [];
            for(var p in obj)
            str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
            return str.join("&");
        },
        data: {
            access_token: $localStorage.acToken,
            args: level
        }
      }).success(function (data) {
          console.log('Response success: ', data);

      }).finally(function(){

        $ionicLoading.hide();
      });

      return level;

    } // setBrightness



    function getBrightness(){

      var url = $localStorage.apiUrl + "devices/"+$localStorage.device+"/brightness?access_token="+$localStorage.acToken;
      return $http.get( url );

    } // getBrightness

})


;