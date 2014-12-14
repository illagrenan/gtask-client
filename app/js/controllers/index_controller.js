/*global angular */
'use strict';

// Existing module
var gTodoControllers = angular.module('gTodoControllers');

gTodoControllers.controller('IndexController',
    [
        '$scope',
        'GooglePlus',
        '$location',
        'authorizedApi',

        function IndexController($scope, GooglePlus, $location, authorizedApi) {
            $scope.rejected = false;

            $scope.goToApp = function () {
                $location.path("/app");
            }

            $scope.login = function () {
                GooglePlus.login().then(function (authResult) {
                    console.log(authResult);

                    GooglePlus.getUser().then(function (user) {
                        console.log("User = ", user);

                        $scope.goToApp();

                    });
                }, function (err) {
                    console.log(err);
                });
            };

            $scope.$on("google:loaded", function () {
                $scope.googleLoaded = true;
            });

            $scope.$on("google:authenticated", function () {
                $scope.goToApp();
            });

            $scope.$on("google:authenticated", function () {
                $scope.goToApp();
            });

            $scope.$on("google:rejected", function () {
                $scope.rejected = true;
            });

        }]);