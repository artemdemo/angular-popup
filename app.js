var app = angular.module('app', ['artemdemo.popup']);

app.controller('mainCtrl',[
    '$scope',
    '$popup',
function(
    $scope,
    $popup){

    $scope.firstExample = function() {
        $popup.show();
    }

    }]);