/*global angular */
'use strict';

// Existing module
var gTodoControllers = angular.module('gTodoControllers');

/**
 * The main controller for the app. The controller:
 * - retrieves and persists the model via the todoStorage service
 * - exposes the model to the template and provides event handlers
 */
gTodoControllers.controller(
    'ToolbarController',

    [
        '$scope',
        'GooglePlus',

        function ToolbarController($scope, GooglePlus) {
            $scope.$on("google:ready", function () {
                GooglePlus.getUser().then(function (user) {
                    console.log(user);
                    $scope.userData = user;
                });
            });
        }]);
