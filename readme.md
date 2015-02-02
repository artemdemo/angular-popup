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

```
var app = angular.module('app', ['artemdemo.popup']);
```

Simple popup

```
$popup.show({
            title: 'Alert',
            template: 'Example #1',
            okText: 'OK button text',
            okType: ''
        });
```

Confirmation popup

```
$popup.confirm({
            title: 'Confirm',
            template: 'Example #2',
            okText: 'OK',
            cancelText: 'Cancel'
        });
```

Confirmation popup with input

```
$popup.confirm({
            title: 'Confirm',
            template: '<input type="text" id="enterData" />',
            okText: 'OK',
            cancelText: 'Cancel',
            okTap: function(e) {
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
        });```

## ToDo ##

Add animation for popup