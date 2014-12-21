'use strict';

/**
 * Services that persists and retrieves TODOs from localStorage
 */
gTodoApp.factory('todoStorage', function ($q, $window, authorizedApi, $rootScope) {
    var STORAGE_ID = 'todos-angularjs-perf';

    return {
        get: function (tasklist) {

            var dataDeferred = $q.defer();

            if (tasklist == null) {
                tasklist = "@default";
            }

            authorizedApi.then(function (authorizedApi) {

                gapi.client.load('tasks', 'v1', function () {
                    gapi.client.tasks.tasks.list({'tasklist': tasklist}).execute(function (resp) {
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

        remove: function (todo) {

            var data = {
                tasklist: "@default",
                task: todo.id
            }

            authorizedApi.then(function (authorizedApi) {
                authorizedApi.client.load('tasks', 'v1', function () {
                    authorizedApi.client.tasks.tasks.delete(data).execute()
                });
            });
        },

        put: function (todos) {
            localStorage.setItem(STORAGE_ID, JSON.stringify(todos));
        }
    };
});
