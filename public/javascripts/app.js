var app = angular.module('myApp', ['angularFileUpload']);

app.controller('MainCtrl', ['$scope', '$upload', function($scope, $upload){
  $scope.reply ='Hello! Choose a zipfile and a CRS to get started! :D';
  $scope.selectedFile = [];

  $scope.onFileSelect = function($files){
    $scope.selectedFile = $files;
  }

  $scope.uploadFile = function() {
    $files = $scope.selectedFile;

    if($files.length === 0 || $scope.uploadForm.$invalid){
      alert('Fill in all fields!');
      return;
    }

    for (var i = 0; i < $files.length; i++) {
      console.log($scope.crs.split(' ')[0]);
      var file = $files[i];
      $scope.upload = $upload.upload({
        url: 'convert/' + $scope.crs.split(' ')[0], 
        method: 'POST',
        file: file
      }).progress(function(evt) {
        console.log('percent: ' + parseInt(100.0 * evt.loaded / evt.total));
      }).success(function(data, status, headers, config) {
        $scope.reply = JSON.stringify(data, undefined, 2);
      });
    }
  };
}]);

app.directive('typeahead', [function(){
  return {
    restrict: 'A',
    link: function(scope, element, attrs){
      console.log(scope.crs);
      d3.csv('data/gcs.csv', function(err, data){
        var list = [];
        data.forEach(function(obj){
          list.push('EPSG:' + obj.code + ' - ' + obj.name);
        });

        element.typeahead({
          showHintOnFocus: true,
          source: list
        });
      });
    }
  };
}]);

