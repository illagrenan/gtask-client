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
        'taskListStorage',
        'GooglePlus',
        'cfpLoadingBar',
        '$routeParams',
        '$timeout',
        'status',

        function TodoCtrl($scope,
                          $location,
                          $filter,
                          todoStorage,
                          taskListStorage,
                          GooglePlus,
                          cfpLoadingBar,
                          $routeParams,
                          $timeout,
                          status) {

            /*
             * Local variables
             */
            var scope = $scope;
            var dateNow = Date.now();

            /*
             * Scope variables
             */
            scope.newTodo = '';
            scope.editedTodo = null;
            scope.needsActionTodos = scope.completedTodos = {
                items: []
            };

            /*
             * Initial functions
             */
            taskListStorage.get().then(function (data) {
                    scope.taskLists = data;
                    scope.taskListsLoaded = true;

                    // TODO Check tasklist length.
                    scope.loadTaskData(scope.taskLists[0]);
                }
            );

            /*
             * Scope methods
             */
            scope.isOverdue = function (dueDate) {
                if (dueDate === undefined) {
                    return false;
                }

                return Date.parse(dueDate) < dateNow;
            };

            scope.loadTaskData = function (taskList) {

                if (scope.selectedTaskList == taskList) {
                    // Do not refresh already selected tasklist
                    return;
                }

                scope.dataLoaded = false;

                scope.needsActionTodos = scope.completedTodos = {
                    items: []
                };

                todoStorage.get(taskList.id).then(function (data) {
                    scope.needsActionTodos = {
                        name: "Needs action",
                        items: $filter('filter')(data, {status: status.NEEDS_ACTION_STATUS})
                    };

                    scope.completedTodos = {
                        name: "Completed tasks",
                        items: $filter('filter')(data, {status: status.COMPLETED_STATUS})
                    };


                    scope.groups = [
                        scope.needsActionTodos,
                        scope.completedTodos
                    ];

                    scope.dataLoaded = true;
                    scope.selectedTaskList = taskList;
                });

            };

            scope.setFilter = function () {
                var activeFilter = $location.search().filter;
                scope.activeFilter = activeFilter;

                scope.statusFilter = {
                    'active': {status: status.NEEDS_ACTION_STATUS},
                    'completed': {status: status.COMPLETED_STATUS}
                }[activeFilter];
            };

            $scope.revertEdits = function (todo) {

                document.getElementById("toast").toggle();

                scope.needsActionTodos.items[scope.needsActionTodos.items.indexOf(todo)] = $scope.originalTodo;

                $scope.editedTodo = null;
                $scope.originalTodo = null;
                $scope.reverted = true;
            };

            scope.$on('$routeUpdate', function () {
                console.debug("$routeUpdate", "Setting filter");
                scope.setFilter();
            });


            scope.$watch('location.path()', function (path) {
                // Only on initial load
                console.debug("location.path()", "Setting filter");
                scope.setFilter();
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

            scope.editTodo = function (todo, group) {
                if (group.name == scope.completedTodos.name) {
                    // Editing completed todos is disabled
                    // TODO Show some hint to user

                    return false;
                }

                $scope.editedTodo = todo;
                // Clone the original todo to restore it on demand.
                $scope.originalTodo = angular.extend({}, todo);
            };

            scope.doneEditing = function (todo) {
                $scope.editedTodo = null;

                todo.title = todo.title.trim();

                todoStorage.update(
                    todo.id,
                    {
                        'title': todo.title
                    }
                )

                // TODO Reconsider!
                //if (!todo.title) {
                //    $scope.removeTodo(todo);
                //}

                // todoStorage.put(todos);
            };

            scope.revertEditing = function (todo) {

                throw "Deprecated";

                todos[todos.indexOf(todo)] = $scope.originalTodo;
                $scope.doneEditing($scope.originalTodo);
            };

            scope.removeTodo = function (todo, group) {
                // $scope.remainingCount -= todo.completed ? 0 : 1;
                group.items.splice(group.items.indexOf(todo), 1);
                todoStorage.remove(todo);
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
