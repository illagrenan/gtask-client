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
    'AppController',

    [
        '$scope',
        '$location',
        '$filter',
        'todoStorage',
        'GooglePlus',
        'cfpLoadingBar',
        '$routeParams',
        '$timeout',
        'status',

        function TodoCtrl($scope, $location, $filter, todoStorage, GooglePlus, cfpLoadingBar, $routeParams, $timeout, status) {
            var scope = $scope;

            scope.needsActionTodos = scope.completedTodos = {
                items: []
            };


            todoStorage.get().then(function (data) {
                // Initial load of all tasks

                scope.needsActionTodos = {
                    name: "Needs action",
                    items: $filter('filter')(data, {status: "needsAction"})
                };

                scope.completedTodos = {
                    name: "Completed tasks",
                    items: $filter('filter')(data, {status: "completed"})
                };

                scope.groups = [
                    scope.needsActionTodos,
                    scope.completedTodos
                ];

                scope.dataLoaded = true;
                // scope.remainingCount = $filter('filter')(scope.todos, {status: "needsAction"}).length;
            });

            scope.$on("google:ready", function () {
                // cfpLoadingBar.start();
            });

            scope.newTodo = '';
            scope.editedTodo = null;

            $scope.setFilter = function () {
                var activeFilter = $location.search().filter;
                $scope.activeFilter = activeFilter;

                $scope.statusFilter = {
                    'active': {status: status.NEEDS_ACTION_STATUS},
                    'completed': {status: status.COMPLETED_STATUS}
                }[activeFilter];
            };

            $scope.revertEdits = function (todo) {
                todos[todos.indexOf(todo)] = $scope.originalTodo;
                $scope.editedTodo = null;
                $scope.originalTodo = null;
                $scope.reverted = true;
            };

            $scope.$on('$routeUpdate', function () {
                console.debug("$routeUpdate", "Setting filter");
                $scope.setFilter();
            });


            scope.$watch('location.path()', function (path) {
                // Only on initial load
                console.debug("location.path()", "Setting filter");
                $scope.setFilter();
            });

            scope.$watch('remainingCount == 0', function (val) {
                $scope.allChecked = val;
            });

            scope.addTodo = function (newTodo) {
                var addTodoFormScope = this;

                addTodoFormScope.dataWorking = true;
                addTodoFormScope.placeholder = "Adding task...";

                newTodo = newTodo.trim();

                if (newTodo.length === 0) {
                    addTodoFormScope.dataWorking = false;
                    addTodoFormScope.placeholder = null;
                    return;
                }

                todoStorage.insert(
                    {
                        title: newTodo,
                        notes: "",
                        status: status.NEEDS_ACTION_STATUS
                    }
                ).then(
                    function (data) {
                        scope.needsActionTodos.items.push(data);

                        addTodoFormScope.dataWorking = false;
                        addTodoFormScope.placeholder = null;
                        addTodoFormScope.focusMe = true;
                    }
                )

                addTodoFormScope.newTodo = '';
                $scope.remainingCount++;
            };

            scope.editTodo = function (todo) {
                // alert("haha");
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

                var newStatus;

                if (todo.status === status.COMPLETED_STATUS) {
                    $scope.remainingCount++;
                    newStatus = status.NEEDS_ACTION_STATUS;
                } else {
                    $scope.remainingCount--;
                    newStatus = status.COMPLETED_STATUS;
                }

                todoStorage.update(
                    todo.id,
                    {
                        'status': newStatus
                    }
                ).then(
                    function (data) {
                        todo.status = newStatus;

                        if (newStatus == status.COMPLETED_STATUS) {
                            $timeout(function () {
                                scope.needsActionTodos.items.splice(scope.needsActionTodos.items.indexOf(todo), 1);
                                scope.completedTodos.items.push(todo);
                            }, 1000);
                        } else {
                            $timeout(function () {
                                scope.completedTodos.items.splice(scope.completedTodos.items.indexOf(todo), 1);
                                scope.needsActionTodos.items.push(todo);
                            }, 1000);
                        }
                    }
                )
            };

            scope.clearCompletedTodos = function () {

                //$scope.todos = todos = todos.filter(function (val) {
                //    return true;
                //    // return !val.completed;
                //});
                //todoStorage.put(todos);
            };

            scope.confirmDeleting = function () {
                document.getElementById('toggleDialog2').toggle();
            };

            scope.markAll = function (completed) {
                todos.forEach(function (todo) {
                    todo.completed = !completed;
                });
                $scope.remainingCount = completed ? todos.length : 0;
                todoStorage.put(todos);
            };
        }]);
