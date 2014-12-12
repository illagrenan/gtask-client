/*global todomvc */
'use strict';

/**
 * Services that persists and retrieves TODOs from localStorage
 */
app.factory('todoStorage', function ($q, $window, authorizedApi, $rootScope) {
    var STORAGE_ID = 'todos-angularjs-perf';

    return {
        get: function () {

            var dataDeferred = $q.defer()

            authorizedApi.then(function (authorizedApi) {
                gapi.client.load('tasks', 'v1', function () {
                    gapi.client.tasks.tasks.list({'tasklist': '@default'}).execute(function (resp) {
                            dataDeferred.resolve(resp.items);
                            $rootScope.$apply();
                        }
                    )
                });
            });

            return dataDeferred.promise;
        },

        insert: function (task) {

            var dataDeferred = $q.defer()
            var data = angular.extend({'tasklist': '@default'}, task);

            authorizedApi.then(function (authorizedApi) {
                authorizedApi.client.load('tasks', 'v1', function () {
                    authorizedApi.client.tasks.tasks.insert(data).execute(function (response) {
                            dataDeferred.resolve(response);
                            $rootScope.$apply();
                        }
                    )
                });
            });

            return dataDeferred.promise;
        },

        update: function (taskIdentifier, updatedData) {

            var dataDeferred = $q.defer()
            var data = angular.extend({'tasklist': '@default', 'task': taskIdentifier}, angular.extend(updatedData, {
                // Thx to http://stackoverflow.com/a/8674004/752142
                'id': taskIdentifier
            }));

            authorizedApi.then(function (authorizedApi) {
                authorizedApi.client.load('tasks', 'v1', function () {
                    authorizedApi.client.tasks.tasks.update(data).execute(function (response) {
                            dataDeferred.resolve(response);
                            $rootScope.$apply();
                        }
                    )
                });
            });

            return dataDeferred.promise;
        },

        put: function (todos) {
            localStorage.setItem(STORAGE_ID, JSON.stringify(todos));
        }
    };
});
