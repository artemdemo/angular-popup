/*
 * @author Artem Demo
 * @git https://github.com/artemdemo/angular-popup
 */

/**
 * @namespace Directives
 */

(function(){

    var module = angular.module( 'artemdemo.popup', []);

    /**
     * Popup module for angular applications
     *
     * This module has some cool UX functionality:
     * - it will set focus on OK in simple alert popup
     * - it will focus on input if you have one in the popup (will work in confirmation popup only)
     *
     * @class $popup
     * @param $rootScope
     * @param $compile
     * @param $q
     * @param $timeout
     * @param $sce
     */
    var $popup = function( $rootScope, $compile, $q, $timeout, $sce ){
        /**
         * Popup factory object
         *
         * @private
         * @type {Object}
         */
        var $popup = {};

        /**
         * Scope that will contain scope of the created popup
         *
         * @memberof $popup
         * @private
         * @type {Object}
         */
        var popupScope;

        /**
         * Popup DOM object
         *
         * @memberof $popup
         * @private
         * @type {Object}
         */
        var popupEl;

        /**
         * I don't want to show popups one above another,
         * therefore I need to check if there is one open
         *
         * Can be 'closed' OR 'open'
         *
         * @memberof $popup
         * @private
         * @type {string}
         */
        var popupStatus = 'closed';

        /*
         * This object will contain promise.
         * It should be global because I want to use it also when user click on ESC button and in this case it should be global
         */
        var deferred = null;

        /**
         * Templates for popups
         *
         * @memberof $popup
         * @type {Object}
         * @private
         */
        var templates = {};

        /**
         * Template for backdrop
         *
         * @memberof $popup
         * @type {string}
         */
        templates.backdrop = [
            '<div class="popup-backdrop"></div>'
        ].join('');

        /**
         * General template with main popup construction
         *
         * @memberof $popup
         * @type {string}
         * @example
         * &lt;popup&gt;
         * &lt;form&gt;
         * &lt;div class=&quot;popup-container&quot; ng-class=&quot;CUSTOM_CLASS&quot;&gt;
         * &lt;div class=&quot;popup&quot;&gt;
         * &lt;div class=&quot;popup-head&quot;&gt;
         * &lt;h3 class=&quot;popup-title ng-binding&quot; ng-bind-html=&quot;TITLE&quot;&gt;&lt;/h3&gt;
         * &lt;/div&gt;
         * &lt;div class=&quot;popup-body&quot;&gt;
         * &lt;span ng-bind-html=&quot;BODY_TXT&quot;&gt;&lt;/span&gt;
         * &lt;/div&gt;
         * &lt;div class=&quot;popup-buttons&quot;&gt;&lt;/div&gt;
         * &lt;/div&gt;
         * &lt;/div&gt;
         * &lt;/form&gt;
         * &lt;/popup&gt;
         */
        templates.popup = [
            '<popup>',
            '<form>',
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
            '</form>',
            '</popup>'
        ].join('');

        /**
         * Template object for buttons
         *
         * @memberof $popup
         * @type {Object}
         */
        templates.buttons = {};

        /**
         * Buttons for confirmation popup
         *
         * @memberof $popup
         * @type {String}
         */
        templates.buttons.confirm = [
            '<div class="row">',
            '<div class="col-xs-6">',
            '<button ng-click="okAction($event)" class="btn btn-ok" ng-class="okType || \'btn-block btn-primary\'">{{ OK_TXT }}</button>',
            '</div>',
            '<div class="col-xs-6">',
            '<div ng-click="cancelAction($event)" class="btn btn-cancel" ng-class="cancelType || \'btn-block btn-default\'">{{ CANCEL_TXT }}</div>',
            '</div>',
            '</div>'
        ].join('');

        /**
         * Buttons for simple alert popup
         *
         * @memberof $popup
         * @type {String}
         */
        templates.buttons.show = [
            '<button ng-click="okAction($event)" class="btn btn-ok" ng-class="okType || \'btn-block btn-primary\'">{{ OK_TXT }}</button>'
        ].join('');

        /**
         * Show simple popup
         *
         * @function show
         * @memberof $popup
         * @public
         * @param {Object} params - parameters of new popup
         * @example
         *  {
            title: 'Alert',
            template: 'Alert body text',
            okText: 'OK button text',
            okType: 'OK button additional classes'
         *  }
         *
         *  @return {Promise}
         */
        $popup.show = function( params ) {
            var element;
            deferred = $q.defer();

            if ( popupStatus == 'open' ) return false;
            popupStatus = 'open';

            params = angular.isObject(params) ? params : {};

            element = compilePopup('show');

            popupScope.TITLE = params.hasOwnProperty('title') ? params.title : '';
            popupScope.BODY_TXT = params.hasOwnProperty('template') ? $sce.trustAsHtml( params.template ) : '';
            popupScope.OK_TXT = params.hasOwnProperty('okText') ? params.okText : 'Ok';
            popupScope.okType = params.hasOwnProperty('okType') ? params.okType : '';

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


        /**
         * Show dialog popup in the view.
         * Will create new element, new scope and link it to the DOM
         *
         * @function confirm
         * @memberof $popup
         * @public
         * @param {Object} params - parameters of new popup
         * @example
         *  {
            title: 'Alert',
            template: 'Alert body text',
            cancelText: 'Cancel button text',
            cancelType: 'Cancel button additional classes',
            okText: 'OK button text',
            okType: 'OK button additional classes',
            okTap: function()
         *  }
         * @return {Promise} - Promise will return result of given onTap function
         */
        $popup.confirm = function( params ) {
            var element;
            var inputs;

            deferred = $q.defer();

            if ( popupStatus == 'open' ) return false;
            popupStatus = 'open';

            params = angular.isObject(params) ? params : {};

            element = compilePopup('confirm');

            popupScope.TITLE = params.hasOwnProperty('title') ? params.title : '';
            popupScope.BODY_TXT = params.hasOwnProperty('template') ? $sce.trustAsHtml( params.template ) : '';
            popupScope.CANCEL_TXT = params.hasOwnProperty('cancelText') ? params.cancelText : 'Cancel';
            popupScope.cancelType = params.hasOwnProperty('cancelType') ? params.cancelType : '';
            popupScope.OK_TXT = params.hasOwnProperty('okText') ? params.okText : 'Ok';
            popupScope.okType = params.hasOwnProperty('okType') ? params.okType : '';

            for ( var i=0; i < element.length; i++ ) {
                document.body.appendChild( element[i] );
            }

            popupScope.cancelAction = function() {
                deferred.reject();
                $popup.hide();
            };

            $timeout(function(){
                inputs = popupEl.find('input');
                if ( inputs.length > 0 ) inputs[0].focus();
                else popupEl.find('button')[0].focus();
            });

            /**
             * Result of 'okTap' function can prevent popup from closing.
             * If result is FALSE - popup wouldn't close
             * (obviously user can close it by clicking on 'cancel' or using ESC button)
             *
             * @param {Object} event - mouse event that will be send to the custom function
             *
             * @return {Promise}
             */
            popupScope.okAction = function(event) {
                var result = false;
                if ( params.hasOwnProperty('okTap') && angular.isFunction( params.okTap ) ) {
                    result = params.okTap(event);
                } else {
                    // If there are no 'okTap' function we can close popup
                    result = true;
                }
                deferred.resolve( result );
                if ( !! result ) $popup.hide();
            };

            return deferred.promise;
        };



        /**
         * Hide popup.
         * Will destroy scope of the element and remove tags from the DOM
         *
         * @memberof $popup
         * @function hide
         * @public
         */
        $popup.hide = function() {
            popupScope.$destroy();
            popupStatus = 'closed';

            for ( var i=0; i < popupEl.length; i++ ) {
                popupEl.remove();
            }

            angular.element(document.getElementsByTagName('body')[0]).unbind('keyup');
        };

        /**
         * Function is compiling element into the DOM
         *
         * @function compilePopup
         * @memberof $popup
         * @private
         * @param {String} tmpl - template name
         * @return {Object} - DOM element of popup
         */
        var compilePopup = function( tmpl ) {
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

            /*
             * Bind keypress functionality
             */
            angular.element(document.getElementsByTagName('body')[0])
                // if ESC - close popup
                .bind('keyup', function(e){
                    if (e.keyCode == 27 ) {
                        deferred.reject();
                        $popup.hide();
                    }
                });

            return element;
        };

        return $popup;
    };

    module.factory('$popup',[ '$rootScope', '$compile', '$q', '$timeout', '$sce', $popup ]);

})();