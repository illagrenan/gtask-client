/*global angular */

var module = angular.module('todo.statuses', []);

module
    .service('status', function () {
        'use strict';

        return {
            NEEDS_ACTION_STATUS: "needsAction",
            COMPLETED_STATUS: "completed"
        }
    });