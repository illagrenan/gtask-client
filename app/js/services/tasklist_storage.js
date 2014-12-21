'use strict';

/**
 * Services that persists and retrieves TODOs from localStorage
 */
gTodoApp.factory('taskListStorage', function ($q, $window, authorizedApi, $rootScope) {
    var STORAGE_ID = 'todos-angularjs-perf';

    return {
        get: function () {

            var dataDeferred = $q.defer()

            authorizedApi.then(function (authorizedApi) {
                gapi.client.load('tasks', 'v1', function () {
                    gapi.client.tasks.tasklists.list().execute(function (resp) {
                            dataDeferred.resolve(resp.items);
                            $rootScope.$apply();
                        }
                    )
                });
            });

            return dataDeferred.promise;
        }
    };
});
