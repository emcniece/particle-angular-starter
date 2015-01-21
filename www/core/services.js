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
/*=========================================
=            Spark API Service            =
=========================================*/
.service('SparkAPI', function($localStorage, $http, $q, $ionicLoading){
  return {
    'apiUrl': 'https://api.spark.io/v1/',

    fetch: fetch
  };

  function fetch(path, account, params, template){

    delete $http.defaults.headers.common['Authorization'];
    if( typeof(account) !== 'undefined' && (account) ){
      var userEncoded = Base64.encode(account.email+':'+account.pass);
      $http.defaults.headers.common['Authorization'] = 'Basic ' + userEncoded;
    }

    if( typeof(template) !== 'undefined'){
      template += " <i class='icon ion-loading-c'></i> ";
      $ionicLoading.show({ template: template + ""});
    }

    console.log( 'SparkAPI Send: ', path, params);

    var request = $http({
      method: 'GET',
      params: params,
      url: $localStorage.settings.sparkApiUrl + path
    });

    return( request.then(handleSuccess, handleError));

  } // fetch

  function handleSuccess(response, status){
    $ionicLoading.hide();
    console.log('SparkAPI success: ', response);
    return response.data;
  }

  function handleError(response){
    console.log('SparkAPI error: ', response);
    $ionicLoading.hide();
    if (! angular.isObject( response.data ) || !response.statusText) {
      return( $q.reject( "An unknown error occurred." ) );
    }

    // Otherwise, use expected error message.
    return( $q.reject( response.data.error_description || response.statusText ) );
  }


})


