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

/**
 * Initialize async Google API and return its promise.
 */
google_plus_module.service("initializeGoogleApi", function ($q, $rootScope) {

    var deferedGoogleApi = $q.defer();

    // See: https://github.com/gaslight/angular-googleapi/pull/8/files
    window._googleApiLoaded = function () {
        gapi.auth.init(function () {
            $rootScope.$broadcast("google:loaded", {});
            console.debug("Google API client library has been loaded.");
            deferedGoogleApi.resolve(gapi);
        });
    };

    var gapiScriptElement = document.createElement('script');
    gapiScriptElement.type = 'text/javascript';
    gapiScriptElement.async = true;
    gapiScriptElement.src = 'https://apis.google.com/js/client.js?onload=_googleApiLoaded';
    var scripts = document.getElementsByTagName('script')[0];
    scripts.parentNode.insertBefore(gapiScriptElement, scripts);

    return deferedGoogleApi.promise;
})

google_plus_module.service("authorizedApi", function (initializeGoogleApi, GooglePlus, $q, $rootScope) {

    // TODO Reject this if error with authResult

    var authorizedApiDefered = $q.defer()

    initializeGoogleApi.then(function (resolvedApi) {

        GooglePlus.checkAuth().then(function (authResult) {
            authorizedApiDefered.resolve(resolvedApi);
            console.debug("Google API is authorized");
        })
    });

    $rootScope.$on("google:authenticated", function () {
        authorizedApiDefered.resolve(gapi);
    });

    return authorizedApiDefered.promise
});

google_plus_module.provider('GooglePlus', [function () {

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
                $rootScope.$broadcast("google:authenticated", {});
                deferred.resolve(authResult);
                $rootScope.$apply();
            } else {
                $rootScope.$broadcast("google:rejected", {});
                deferred.reject(authResult);
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
    // Initialization of module
    .run(function ($rootScope, $window, $q, initializeGoogleApi) {
        initializeGoogleApi.then(function (resolvedGoogleApi) {
            console.debug("Google API has been resolved");
            $rootScope.$broadcast("google:ready", {});
        })
    });
