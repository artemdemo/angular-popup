/**
 * Popup module for angular applications
 *
 * @auth Artem Demo
 * @git https://github.com/artemdemo/angular-popup
 */

angular.module( 'artemdemo.Popup', [])

.factory('$popup',[
    '$rootScope', '$compile', '$q', '$sce',
    function( $rootScope, $compile, $q, $sce ){
        /*
         * Popup factory object
         */
        var $popup = {};

        /*
         * Scope that will contain scope of the created popup
         */
        var popupScope;

        /*
         * Popup DOM object
         */
        var popupEl;

        /*
         * I don't want to show popups one above another,
         * therefore I need to check if there is one open
         *
         * 'closed' OR 'open'
         */
        var popupStatus = 'closed';


        var templates = {};

        templates.confirm = [
            '<div class="art-backdrop visible backdrop-popup active"></div>',
            '<div class="popup-container popup-showing active">',
            '<div class="popup">',
            '<div class="popup-head">',
            '<h3 class="popup-title ng-binding" ng-bind-html="TITLE"></h3>',
            '</div>',
            '<div class="popup-body">',
            '<span ng-bind-html="BODY_TXT"></span>',
            '</div>',
            '<div class="popup-buttons">',
            '<button ng-click="okAction()" class="button" ng-class="okType || \'button-default\'">{{ OK_TXT }}</button>',
            '<button ng-click="cancelAction()" class="button" ng-class="cancelType || \'button-default\'">{{ CANCEL_TXT }}</button>',
            '</div>',
            '</div>',
            '</div>'
        ].join('');

        templates.show = [
            '<div class="art-backdrop visible backdrop-popup active"></div>',
            '<div class="popup-container popup-showing active">',
            '<div class="popup">',
            '<div class="popup-head">',
            '<h3 class="popup-title ng-binding" ng-bind-html="TITLE"></h3>',
            '</div>',
            '<div class="popup-body">',
            '<span ng-bind-html="BODY_TXT"></span>',
            '</div>',
            '<div class="popup-buttons">',
            '<button ng-click="okAction($event)" class="button ng-binding app-bg-color no-border" ng-class="okType || \'button-default\'">{{ OK_TXT }}</button>',
            '</div>',
            '</div>',
            '</div>'
        ].join('');

        /*
         * Show dialog popup in the view.
         * Will create new element, new scope and link it to the DOM
         *
         * @param params (object) - parameters of new popup
         *  {
         *      title: 'Alert',
                template: 'Alert body text',
                cancelText: 'Cancel button text',
                cancelType: 'Cancel button additional classes',
                okText: 'OK button text',
                okType: 'OK button additional classes',
                okTap: function()
         *  }
         * @return Promise
         */
        $popup.confirm = function( params ) {
            var linkFn, element;
            var deferred = $q.defer();

            if ( popupStatus == 'open' ) return false;
            popupStatus = 'open';

            params = angular.isObject(params) ? params : {};

            popupEl = angular.element( templates.confirm );
            linkFn = $compile(popupEl);
            popupScope = $rootScope.$new();
            element = linkFn(popupScope);

            popupScope.TITLE = params.hasOwnProperty('title') ? params.title : '';
            popupScope.BODY_TXT = params.hasOwnProperty('template') ? $sce.trustAsHtml( params.template ) : '';
            popupScope.CANCEL_TXT = params.hasOwnProperty('cancelText') ? params.cancelText : '';
            popupScope.OK_TXT = params.hasOwnProperty('okText') ? params.okText : '';

            for ( var i=0; i < element.length; i++ ) {
                document.body.appendChild( element[i] );
            }

            popupScope.cancelAction = function() {
                deferred.reject();
                artPopup.hide();
            };

            popupScope.okAction = function(e) {
                var result = false;
                if ( params.hasOwnProperty('okTap') && angular.isFunction( params.okTap ) ) {
                    result = params.okTap(e);
                } else {
                    // If there are no 'okTap' function we can close popup
                    result = true;
                }
                deferred.resolve( result );
                if ( !! result ) artPopup.hide();
            };

            return deferred.promise;
        };

        /*
         * Show simple popup
         *
         * @param params (object) - parameters of new popup
         *  {
                title: 'Alert',
                template: 'Alert body text',
                okText: 'OK button text',
                okType: 'OK button additional classes',
                onTap: function()
         *  }
         *
         *  @return Promise
         */
        $popup.show = function( params ) {
            var linkFn, element;
            var deferred = $q.defer();

            if ( popupStatus == 'open' ) return false;
            popupStatus = 'open';

            params = angular.isObject(params) ? params : {};

            popupEl = angular.element( templates.show );
            linkFn = $compile(popupEl);
            popupScope = $rootScope.$new();
            element = linkFn(popupScope);

            popupScope.TITLE = params.hasOwnProperty('title') ? params.title : '';
            popupScope.BODY_TXT = params.hasOwnProperty('template') ? $sce.trustAsHtml( params.template ) : '';
            popupScope.OK_TXT = params.hasOwnProperty('okText') ? params.okText : '';

            for ( var i=0; i < element.length; i++ ) {
                document.body.appendChild( element[i] );
            }

            popupScope.okAction = function() {
                deferred.resolve();
                artPopup.hide();
            };

            return deferred.promise;
        };

        /*
         * Hide popup.
         * Will destroy scope of the element and remove tags from the DOM
         */
        $popup.hide = function() {
            popupScope.$destroy();
            popupStatus = 'closed';

            for ( var i=0; i < popupEl.length; i++ ) {
                popupEl.remove();
            }
        };

        return $popup;
    }]);
