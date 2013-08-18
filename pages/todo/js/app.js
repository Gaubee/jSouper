(function(global) {
	'use strict';
	// Your starting point. Enjoy the ride!
	var doc = document,
		b = doc.body,
		$ = function(id) {
			return doc.getElementById(id);
		},
		__proto__ = function() {},
		min = function(proto) {
			__proto__.prototype = proto;
			return new __proto__;
		},
		database = {
			newTodo: "",
			todoList: [],
			type: [{
				name: "All",
				index: 0,
				status: true
			}, {
				name: "Active",
				index: 1,
				status: false
			}, {
				name: "Completed",
				index: 2,
				status: false
			}],
			currentTypeName: "All",
			todo_active_length: 0,
			todo_completed_length: 0
		}, //Model
		todo = ViewParser.parse($("todo").innerHTML)(database), //View
		controller = {
			new: function(value) { //redraw
				if (event.which === 13 && value.replace(/\s/g, "")) {
					var todoList = database.todoList,
						index = todoList.length;
					todoList[index] = {
						todo: todo.get("newTodo"),
						index: index,
						completed: false
					}
					todo.set("newTodo", "");
					this.redraw();
				} else {
					todo.set("newTodo", value);
				}
			},
			del: function(index) { //redraw
				var todoList = database.todoList;
				todoList.splice(index, 1);
				for (var i = index, item; item = todoList[i]; i += 1) {
					item.index = item.index - 1;
				}
				this.redraw();
			},
			changStatus: function(index) { //redraw
				var todoList = database["todoList"],
					completed = todoList[index].completed = !todoList[index].completed;
				this.redraw();
			},
			get: function(key) {
				return todo.get(key);
			},
			setType: function(index) {
				var type = database.type;
				for (var i = 0, item; item = type[i]; i += 1) {
					item.status = false;
				}
				database.currentTypeName = type[index].name;
				type[index].status = true;
				todo.set("type", type);
				todo.set("currentTypeName", database.currentTypeName);
			},
			redraw: function() {
				var todo_completed_length = 0,
					todo_active_length = 0,
					todoList = database.todoList;

				for (var i = 0, item; item = todoList[i]; i += 1) {
					if (item.completed) {
						todo_completed_length += 1;
					} else {
						todo_active_length += 1;
					}
				}
				console.log(todo_completed_length,todo_active_length)

				todo.set("todo_completed_length", todo_completed_length);
				todo.set("todo_active_length", todo_active_length);
				todo.set("todoList", todoList);
			}
		} //Controller
		;
	todo.append(b);
	global.controller = controller;
	global.database = database;
	global.todo = todo;
})(window);