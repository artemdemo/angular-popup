/**
 * Popup module for angular applications
 *
 * This module has some cool UX functionality:
 * - it will set focus on OK in simple alert popup
 * - it will focus on input if you have one in the popup (will work in confirmation popup only)
 *
 * @auth Artem Demo
 * @git https://github.com/artemdemo/angular-popup
 */

angular.module( 'artemdemo.popup', [])

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

        /*
         * Templates for popups
         */
        var templates = {};

        templates.backdrop = [
            '<div class="popup-backdrop"></div>'
        ].join('');

        // General template with main popup construction
        templates.popup = [
            '<popup>',
            '<div class="popup-container" ng-class="POPUP_TYPE">',
                '<div class="popup">',
                    '<div class="popup-head">',
                        '<h3 class="popup-title ng-binding" ng-bind-html="TITLE"></h3>',
                    '</div>',
                    '<div class="popup-body">',
                        '<span ng-bind-html="BODY_TXT"></span>',
                    '</div>',
                    '<div class="popup-buttons"></div>',
                '</div>',
            '</div>',
            '</popup>'
        ].join('');

        // template object with buttons
        templates.buttons = {};

        // buttons for confirmation popup
        templates.buttons.confirm = [
            '<button ng-click="okAction()" class="btn btn-ok" ng-class="okType || \'btn-default\'">{{ OK_TXT }}</button>',
            '<button ng-click="cancelAction()" class="btn btn-cancel" ng-class="cancelType || \'btn-default\'">{{ CANCEL_TXT }}</button>'
        ].join('');

        // buttons for simple alert popup
        templates.buttons.show = [
            '<button ng-click="okAction($event)" class="btn btn-ok" ng-class="okType || \'btn-default\'">{{ OK_TXT }}</button>'
        ].join('');

        /*
         * Show dialog popup in the view.
         * Will create new element, new scope and link it to the DOM
         *
         * @param params (object) - parameters of new popup
         *  {
                title: 'Alert',
                template: 'Alert body text',
                cancelText: 'Cancel button text',
                cancelType: 'Cancel button additional classes',
                okText: 'OK button text',
                okType: 'OK button additional classes',
                okTap: function()
         *  }
         * @return Promise
         *      Promise will return result of given onTap function
         */
        $popup.confirm = function( params ) {
            var element;
            var deferred = $q.defer();

            if ( popupStatus == 'open' ) return false;
            popupStatus = 'open';

            params = angular.isObject(params) ? params : {};

            element = compilePopup('confirm');

            popupScope.TITLE = params.hasOwnProperty('title') ? params.title : '';
            popupScope.BODY_TXT = params.hasOwnProperty('template') ? $sce.trustAsHtml( params.template ) : '';
            popupScope.CANCEL_TXT = params.hasOwnProperty('cancelText') ? params.cancelText : 'Cancel';
            popupScope.OK_TXT = params.hasOwnProperty('okText') ? params.okText : 'Ok';

            for ( var i=0; i < element.length; i++ ) {
                document.body.appendChild( element[i] );
            }

            popupScope.cancelAction = function() {
                deferred.reject();
                $popup.hide();
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
                if ( !! result ) $popup.hide();
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
            var element;
            var deferred = $q.defer();

            if ( popupStatus == 'open' ) return false;
            popupStatus = 'open';

            params = angular.isObject(params) ? params : {};

            element = compilePopup('show');

            popupScope.TITLE = params.hasOwnProperty('title') ? params.title : '';
            popupScope.BODY_TXT = params.hasOwnProperty('template') ? $sce.trustAsHtml( params.template ) : '';
            popupScope.OK_TXT = params.hasOwnProperty('okText') ? params.okText : 'Ok';

            for ( var i=0; i < element.length; i++ ) {
                document.body.appendChild( element[i] );
            }

            // Setting focus to button in order to let user to close popup in one click
            popupEl.find('button')[0].focus();

            popupScope.okAction = function() {
                deferred.resolve();
                $popup.hide();
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

        /*
         * Function is compiling element into the DOM
         *
         * @param tmpl - template name
         * @return DOM element of popup
         */
        function compilePopup( tmpl ) {
            var linkFn, element;
            var backdrop, buttons;

            popupEl = angular.element( templates.popup );
            backdrop = angular.element( templates.backdrop );
            buttons = angular.element( templates.buttons[tmpl] );

            popupEl.append( backdrop );
            for ( var i=0; i<buttons.length; i++ ) {
                popupEl[0].getElementsByClassName('popup-buttons')[0].appendChild(buttons[i]);
            }

            linkFn = $compile(popupEl);
            popupScope = $rootScope.$new();
            element = linkFn(popupScope);

            popupScope.POPUP_TYPE = 'popup-type-' + tmpl;

            return element;
        }

        return $popup;
    }]);
