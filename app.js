var app = angular.module('app', ['artemdemo.popup', 'ngSanitize']);

app.controller('mainCtrl',[
    '$scope', '$timeout',
    '$popup',
function(
    $scope, $timeout,
    $popup){

    $scope.firstExample = function() {
        $popup.show({
            title: 'Alert',
            template: 'Example #1',
            okText: 'OK button text',
            okType: ''
        });
    };

    $scope.secondExample = function(){
        $popup.confirm({
            title: 'Confirm',
            template: 'Example #2',
            okText: 'OK',
            cancelText: 'Cancel'
        });
    };

    $scope.thirdExample = function(){
        $popup.confirm({
            title: 'Confirm',
            template: '<input type="text" id="enterData" />',
            okText: 'OK',
            cancelText: 'Cancel',
            okTap: function() {
                return document.getElementById('enterData').value;
            }
        }).then(function( value ){
            $timeout(function(){
                $popup.show({
                    title: 'Alert',
                    template: value,
                    okText: 'OK',
                    okType: ''
                });
            }, 200);
        });
    };

}]);