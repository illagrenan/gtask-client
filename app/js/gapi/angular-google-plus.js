/**
 * Options object available for module
 * options/services definition.
 * @type {Object}
 */
var options = {};

/**
 *
 * @type {angular.Module}
 */
var google_plus_module = angular.module('googleplus', []);

google_plus_module.
    provider('GooglePlus', [function () {

        /**
         * clientId
         * @type {Number}
         */
        options.clientId = null;

        this.setClientId = function (clientId) {
            options.clientId = clientId;
            return this;
        };

        this.getClientId = function () {
            return options.clientId;
        };

        /**
         * apiKey
         * @type {String}
         */
        options.apiKey = null;

        this.setApiKey = function (apiKey) {
            options.apiKey = apiKey;
            return this;
        };

        this.getApiKey = function () {
            return options.apiKey;
        };

        /**
         * Scopes
         * @default 'https://www.googleapis.com/auth/plus.login'
         * @type {Boolean}
         */
        options.scopes = 'https://www.googleapis.com/auth/plus.login';

        this.setScopes = function (scopes) {
            options.scopes = scopes;
            return this;
        };

        this.getScopes = function () {
            return options.scopes;
        };

        /**
         * Init Google Plus API
         */
        this.init = function (customOptions) {
            angular.extend(options, customOptions);
        };

        /**
         * This defines the Google Plus Service on run.
         */
        this.$get = ['$q', '$rootScope', '$timeout', function ($q, $rootScope, $timeout) {

            /**
             * Create a deferred instance to implement asynchronous calls
             * @type {Object}
             */
            var deferred = $q.defer();

            /**
             * NgGooglePlus Class
             * @type {Class}
             */
            var NgGooglePlus = function () {
            };

            NgGooglePlus.prototype.login = function () {
                gapi.auth.authorize({
                    client_id: options.clientId,
                    scope: options.scopes,
                    immediate: false
                }, this.handleAuthResult);
                return deferred.promise;
            };

            NgGooglePlus.prototype.checkAuth = function () {
                gapi.auth.authorize({
                    client_id: options.clientId,
                    scope: options.scopes,
                    immediate: true
                }, this.handleAuthResult);
                return deferred.promise;
            };

            NgGooglePlus.prototype.handleClientLoad = function () {
                gapi.client.setApiKey(options.apiKey);
                gapi.auth.init(function () {
                });
                $timeout(this.checkAuth, 1);
            };

            NgGooglePlus.prototype.handleAuthResult = function (authResult) {
                if (authResult && !authResult.error) {
                    deferred.resolve(authResult);
                    $rootScope.$apply();
                } else {
                    deferred.reject('error');
                }
            };

            NgGooglePlus.prototype.getUser = function () {
                var deferred = $q.defer();

                gapi.client.load('oauth2', 'v2', function () {
                    gapi.client.oauth2.userinfo.get().execute(function (resp) {
                        deferred.resolve(resp);
                        $rootScope.$apply();
                    });
                });

                return deferred.promise;
            };

            NgGooglePlus.prototype.getToken = function () {
                return gapi.auth.getToken();
            };

            NgGooglePlus.prototype.setToken = function (token) {
                return gapi.auth.setToken(token);
            };

            return new NgGooglePlus();
        }];
    }])
    .service("initializeGoogleApi", function ($q) {

        // var gapiDeffered = $q.defer()

        console.log("Hello from service.")

        return

    })
    // Initialization of module
    .run(function ($rootScope, $window, $q, initializeGoogleApi) {

        // See: https://github.com/gaslight/angular-googleapi/pull/8/files
        window._googleApiLoaded = function () {
            gapi.auth.init(function () {
                console.info("Google API client library has been loaded.");
                $rootScope.$broadcast("google:ready", {});
            });
        };

        var po = document.createElement('script');
        po.type = 'text/javascript';
        po.async = true;
        po.src = 'https://apis.google.com/js/client.js?onload=_googleApiLoaded';
        var s = document.getElementsByTagName('script')[0];
        s.parentNode.insertBefore(po, s);
    });
