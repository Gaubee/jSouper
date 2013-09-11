(function(global) {
	'use strict';
	// Your starting point. Enjoy the ride!
	var doc = document,
		body = doc.body,
		VModel = ViewParser,
		$ = function(id) {
			return doc.getElementById(id);
		};
	global.todoModel = DataManager({
		newTodo: "",
		todoList: [],
		filterTodoList: VModel.Proto(function() {
			var todoList = todoModel.get("todoList"),
				status = todoModel.get("status");
			if (status !== 'All') {
				var complatedTodoList = [],
					activeTodoList = [];
				for (var i = 0, todo; todo = todoList[i]; i += 1) {
					if (todo.completed.valueOf()) {
						complatedTodoList.push(todo)
					} else {
						activeTodoList.push(todo)
					}
				}
				if (status === "Completed") {
					return complatedTodoList;
				} else {
					return activeTodoList;
				}
			}
			return todoList;
		}),
		completed_length: VModel.Proto(function() {
			var todoList = todoModel.get("todoList"),
				completed_length = 0;
			for (var i = 0, len = todoList.length; i < len; i += 1) {
				if (todoList[i].completed.valueOf()) {
					completed_length += 1;
				}
			}
			return completed_length;
		}),
		active_length: VModel.Proto(function() {
			var todoList = todoModel.get("todoList"),
				active_length = 0;
			for (var i = 0, len = todoList.length; i < len; i += 1) {
				if (!todoList[i].completed.valueOf()) {
					active_length += 1;
				}
			}
			return active_length;
		}),
		event: {
			push: function(e, vm) {
				if (e.which === 13) {
					var newTodo = todoModel.get("newTodo").trim();
					if (newTodo) {
						var todoList = todoModel.get("todoList");
						todoList.unshift({
							todo: newTodo,
							completed: false/*VModel.Proto({
								get: function() {
									return this.value;
								},
								set: function(newValue) {
									todoModel.set("todoList",todoModel.get("todoList"))
									return newValue;
								}
							})*/
						});
						todoModel.set("todoList", todoList);
						todoModel.set("newTodo", "");
					}
				}
			},
			changeStatus: function(e, vm) {
				var index = this.parentNode.getAttribute("data-index"),
					key = "todoList."+index+".completed";
					// todoList = todoModel.get("todoList"),
					// status;
					todoModel.set(key,!todoModel.get(key))
				// for (var i = 0, todo; todo = todoList[i]; i += 1) {
				// 	if (todo.index === index) {
				// 		todo.completed = !todo.completed;
				// 	}
				// }
				// todoModel.set("todoList", todoList);
			},
			remove: function(e, vm) {
				var index = this.parentNode.getAttribute("data-index"),
					todoList = todoModel.get("filterTodoList");
				console.log(index)
				todoList.splice(index, 1);
				todoModel.set("filterTodoList", todoList);
			},
			clearCompleted: function(e, vm) {
				var todoList = todoModel.get("todoList"),
					activeList = [];
				for (var i = 0, len = todoList.length; i < len; i += 1) {
					if (!todoList[i].completed.valueOf()) {
						activeList.push(todoList[i])
					}
				}
				todoModel.set("todoList", activeList);
			},
			filter: function(e, vm) {
				var status = this.getAttribute("data-status");
				todoModel.set("status", status);
				todoModel.get("status");
			},
			All: {
				select: function(e, vm) {
					var todoList = todoModel.get("todoList"),
						selectAll = !todoModel.get("selectAll");
					for (var i = 0, todo; todo = todoList[i]; i += 1) {
						todo.completed = selectAll
					}
					todoModel.set("todoList", todoList);
					todoModel.set("selectAll", selectAll);
				}
			}
		},
		status: "All",
		selectAll: VModel.Proto(function() {
			var todoList = todoModel.get("todoList");
			for (var i = 0, todo; todo = todoList[i]; i += 1) {
				// console.log(todo.completed)
				if (!todo.completed) {
					return false;
				}
			}
			return true;
		})
	}),
	global.view = VModel.parse($("todo").innerHTML)(todoModel).append(body)
})(window);