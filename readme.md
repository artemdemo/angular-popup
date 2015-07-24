# Angular Popup module #

Module that add popup dialog box to your application

This module has some cool UX functionality:<br>
- it will set focus on OK in simple alert popup<br>
- it will focus on input if you have one in the popup (will work in confirmation popup only)

## Project dependencies ##

angular (required)<br>
angular-sanitize (required)<br>
bootstrap (optional) <br>
less (optional)

## Examples ##

Add to your project

```javascript
var app = angular.module('app', ['artemdemo.popup']);
```

Added reference to your controller

```javascript
app.controller('mainCtrl', ['$popup', function($popup){
    // Your code here
}]);
```

Simple popup

```javascript
$popup.show({
            title: 'Alert',
            template: 'Example #1',
            okText: 'OK button text',
            okType: ''
        });
```

![alt tag](https://raw.githubusercontent.com/artemdemo/angular-popup/master/img/Angular-Popup-module-Simple-Demo.jpg)

Confirmation popup

```javascript
$popup.confirm({
            title: 'Confirm',
            template: 'Example #2',
            okText: 'OK',
            cancelText: 'Cancel'
        });
```

![alt tag](https://raw.githubusercontent.com/artemdemo/angular-popup/master/img/Angular-Popup-module-Confirm-Dialog.jpg)

Confirmation popup with input

```javascript
$popup.confirm({
            title: 'Confirm',
            template: '<input type="text" ng-model="inputValue" />',
            scope: $scope,
            okText: 'OK',
            cancelText: 'Cancel',
            okTap: function(e) {

                // template scope will be available via 'this'
                return this.inputValue;
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
```