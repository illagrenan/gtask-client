/*global todomvc, angular */
'use strict';

/**
 * The main controller for the app. The controller:
 * - retrieves and persists the model via the todoStorage service
 * - exposes the model to the template and provides event handlers
 */
app.controller('TodoCtrl', ['$scope', '$location', '$filter', 'todoStorage', 'GooglePlus', 'cfpLoadingBar', function TodoCtrl($scope, $location, $filter, todoStorage, GooglePlus, cfpLoadingBar) {
    var scope = $scope;
    var todos = scope.todos = [];
    
    todoStorage.get().then(function (data) {
        scope.todos = data;
        cfpLoadingBar.complete();
    });

    scope.$on("google:ready", function () {
        cfpLoadingBar.start();
        console.log("google:ready");
    });

    scope.login = function () {
        GooglePlus.login().then(function (authResult) {
            console.log(authResult);

            GooglePlus.getUser().then(function (user) {
                console.log(user);
            });
        }, function (err) {
            console.log(err);
        });


    };

    scope.newTodo = '';
    scope.remainingCount = $filter('filter')(todos, {completed: false}).length;
    scope.editedTodo = null;

    if ($location.path() === '') {
        $location.path('/');
    }

    scope.location = $location;

    scope.$watch('location.path()', function (path) {
        $scope.statusFilter = {'/active': {completed: false}, '/completed': {completed: true}}[path];
    });

    scope.$watch('remainingCount == 0', function (val) {
        $scope.allChecked = val;
    });

    scope.addTodo = function () {
        var newTodo = $scope.newTodo.trim();

        if (newTodo.length === 0) {
            return;
        }

        todoStorage.insert(
            {
                title: newTodo,
                notest: "Lorem ipsum",
                status: "needsAction"
            }
        ).then(
            function (data) {
                console.log(data);
            }
        )

        $scope.newTodo = '';
        $scope.remainingCount++;
    };

    scope.editTodo = function (todo) {
        $scope.editedTodo = todo;
        // Clone the original todo to restore it on demand.
        $scope.originalTodo = angular.extend({}, todo);
    };

    scope.doneEditing = function (todo) {
        $scope.editedTodo = null;
        todo.title = todo.title.trim();

        if (!todo.title) {
            $scope.removeTodo(todo);
        }

        todoStorage.put(todos);
    };

    scope.revertEditing = function (todo) {
        todos[todos.indexOf(todo)] = $scope.originalTodo;
        $scope.doneEditing($scope.originalTodo);
    };

    scope.removeTodo = function (todo) {
        $scope.remainingCount -= todo.completed ? 0 : 1;
        todos.splice(todos.indexOf(todo), 1);
        todoStorage.put(todos);
    };

    scope.todoCompleted = function (todo) {
        $scope.remainingCount += todo.completed ? -1 : 1;

        todoStorage.update(
            todo.id,
            {
                'status': 'completed'
            }
        ).then(
            function (data) {
                console.log(data);
            }
        )

    };

    scope.clearCompletedTodos = function () {
        $scope.todos = todos = todos.filter(function (val) {
            return true;
            // return !val.completed;
        });
        todoStorage.put(todos);
    };

    scope.markAll = function (completed) {
        todos.forEach(function (todo) {
            todo.completed = !completed;
        });
        $scope.remainingCount = completed ? todos.length : 0;
        todoStorage.put(todos);
    };
}]);
