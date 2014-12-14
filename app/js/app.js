/*global angular */
/*jshint unused:false */
'use strict';

/**
 * The main Google Task app module
 *
 * @type {angular.Module}
 */
var gTodoApp = angular.module('gTodo', [
    'ngRoute',

    'googleplus',
    'cfp.loadingBar',

    'gTodoControllers'
]);

gTodoApp.config(['GooglePlusProvider', function (GooglePlusProvider) {
    GooglePlusProvider.init({
        clientId: '199245156179-96g0rkr0tee9bl8bls9c5gln5evhgdj7.apps.googleusercontent.com',
        apiKey: 'AIzaSyDK_QRf2FgGI1IbTjZtjDNFzKne4dTlyt4',
        scopes: [
            'https://www.googleapis.com/auth/plus.me',
            'https://www.googleapis.com/auth/tasks'
        ]
    });
}]);

gTodoApp.config(['$routeProvider',
    function ($routeProvider) {
        $routeProvider
            .when('/', {
                templateUrl: 'partials/authorize.html',
                controller: 'IndexController'
            })
            // filter param is optional
            .when('/app/:filter?', {
                templateUrl: 'partials/app.html',
                controller: 'AppController',
                reloadOnSearch: false
            })
            .otherwise({
                redirectTo: '/'
            });
    }]);

gTodoApp.run(['$rootScope', function ($rootScope) {
    $rootScope.IS_DEBUG = false;
}]);

//.config(function (googleLoginProvider) {
//    googleLoginProvider.configure({
//        clientId: '890389977008-q78nukvfrokpbdb2tnd530s92adqgt4o.apps.googleusercontent.com',
//        scopes: ["https://www.googleapis.com/auth/userinfo.email", "https://www.googleapis.com/auth/calendar", "https://www.googleapis.com/auth/plus.login"]
//    });
//});
