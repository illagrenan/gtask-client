/*global todomvc */
'use strict';

/**
 * Services that persists and retrieves TODOs from localStorage
 */
app.factory('todoStorage', function ($q, $window) {
    var STORAGE_ID = 'todos-angularjs-perf';

    return {
        get: function () {
            var dataDeferred = $q.defer();

            $window.gapi_promise.then(function () {
                gapi.client.load('tasks', 'v1', function () {
                    var request = gapi.client.tasks.tasks.list({'tasklist': '@default'});
                    request.execute(function (resp) {
                            // console.log(resp.items);
                            dataDeferred.resolve(resp.items);
                            // console.log("Resolved");
                        }
                    )
                });
            });

            return dataDeferred;
        },

        put: function (todos) {
            localStorage.setItem(STORAGE_ID, JSON.stringify(todos));
        }
    };
});
