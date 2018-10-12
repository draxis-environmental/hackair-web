(function(){
    'use strict';

    angular.module('app.services')
    .factory('UploadService', UploadService);

    UploadService.$inject = ['$localStorage', 'API_URL', '$http'];

    function UploadService($localStorage, API_URL, $http){
      var service = {
        uploadAvatar: uploadAvatar
      };

      return service;

      function uploadAvatar(fileURL, metaData){
        
        var serverURL = API_URL + '/users/' + $localStorage.user.id + '/profile_picture';


        // if (ionic.Platform.isWebView()) {
        //   var uploadOptions = new FileUploadOptions();
        //   uploadOptions.fileKey = "profile_picture";
        //   uploadOptions.fileName = fileURL.substr(fileURL.lastIndexOf('/') + 1);
        //   uploadOptions.mimeType = "image/jpeg";
        //   uploadOptions.chunkedMode = false;
        //   // uploadOptions.params = {
        //   //     loc: metaData.location,
        //   //     datetime: metaData.date
        //   // };
        //   uploadOptions.headers = {
        //       'authorization': 'Bearer ' + $localStorage.credentials
        //   };

        //   $cordovaFileTransfer.upload(serverURL, fileURL, uploadOptions)
        //   .then(function(result) {
        //           deferred.resolve(result);
        //       }, function(err) {
        //           deferred.reject(err);
        //       }, function(progress) {
        //           deferred.notify(progress);
        //       }
        //   );
        // } else {
        //   deferred.reject('Uploading not supported in browser');
        // }

        // return deferred.promise;

      }

    }
})();
