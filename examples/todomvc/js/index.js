(function() {

	/*
	 * 注册基础的辅助函数
	 */
	window.filter_todo_list = function(arr_data, key, value) {
		if (jSouper.$.isA(arr_data)) {
			return jSouper.filter(arr_data, function(item) {
				return item[key] == value;
			});
		} else {
			return [];
		}
	};
	window.only_have = function(arr_data, value) {
		return arr_data.length == 1 && arr_data[0] == value
	};
	/*
	 * APP初始化
	 */
	jSouper.app({
		Id: "jSouperApp",
		Data: {
			"$Data": {
				todo_list: []
			},
			a: "Gaubee",
			b: "Bangeel"
		}
	});
	/*
	 * 配置、枚举
	 */
	appConfig = {};
	appConfig.TODO_STATE = {
		完成: 1,
		未完成: 0
	};
	App.set("$Con", appConfig);
	/*
	 * 注册路由
	 */
	function _route_init() {
		if (location.hash.indexOf("/active") !== -1) {
			var _completed_filter = [appConfig.TODO_STATE.未完成]
		} else if (location.hash.indexOf("/completed") !== -1) {
			_completed_filter = [appConfig.TODO_STATE.完成]
		} else {
			_completed_filter = [appConfig.TODO_STATE.完成, appConfig.TODO_STATE.未完成]
		}
		App.set("$Cache.todo_completed_filter", _completed_filter)
	};
	_route_init();
	window.onhashchange = _route_init;
	/*
	 * 数据的保存与读取
	 */
	function _save_todo_list() {
		localStorage.setItem("todo_list", JSON.stringify(App.get("$Data.todo_list")))
	};
	try {
		App.set("$Data.todo_list", JSON.parse(localStorage.getItem("todo_list")));
	} catch (e) {}
	var _ti
	App.set("$Event.todo.save_to_ls", function() {
		clearTimeout(_ti);
		_ti = setTimeout(_save_todo_list, 1000);
	});
	window.onbeforeunload = _save_todo_list;
	/*
	 * 事件
	 */
	//添加
	App.set("$Event.todo.add", function() {
		var text = jSouper.$.trim(App.get("$Cache.new_todo.text") || "");
		App.set("$Cache.new_todo.text", "")
		if (!text) {
			return
		}
		App.push("$Data.todo_list", {
			text: text,
			completed: appConfig.TODO_STATE.未完成
		});

		App.get("$Event.todo.save_to_ls")();
	});
	//移除
	App.set("$Event.todo.destory", function(e, vm) {
		vm.removeFromArray();
	});
	//切换完成状态
	App.set("$Event.todo.toggle_completed", function(e, vm) {
		if (vm.get("completed") == appConfig.TODO_STATE.完成) {
			var _completed = appConfig.TODO_STATE.未完成
		} else {
			_completed = appConfig.TODO_STATE.完成
		}
		vm.set("completed", _completed);
		App.get("$Event.todo.save_to_ls")();
	});
	//全部切换完成状态
	App.set("$Event.todo.toggle_all_completed", function() {
		//默认情况下要全部标记为完成，所以初始化韦未完成
		var _completed = appConfig.TODO_STATE.未完成;
		var todo_list = App.get("$Data.todo_list");
		jSouper.forEach(todo_list, function(todo_item) {
			if (todo_item.completed === appConfig.TODO_STATE.未完成) { //如果发现有一个是未完成，那么要全部标记为完成
				_completed = appConfig.TODO_STATE.完成;
				return false;
			}
		});
		jSouper.forEach(todo_list, function(todo_item) {
			todo_item.completed = _completed
		});
		App.set("$Data.todo_list", todo_list);
		App.get("$Event.todo.save_to_ls")();
	});
	//启动编辑
	App.set("$Event.todo.to_edit", function(e, vm) {
		vm.set("$Private.edit", true)
	});
	//完成编辑
	App.set("$Event.todo.complete_edit", function(e, vm) {
		vm.set("$Private.edit", false)
		App.get("$Event.todo.save_to_ls")();
	});
	//清楚已经完成的任务
	App.set("$Event.todo.clear_completed", function(e, vm) {
		var _active_todo_list = filter_todo_list(App.get("$Data.todo_list"), "completed", appConfig.TODO_STATE.未完成)
		App.set("$Data.todo_list", _active_todo_list);
		App.get("$Event.todo.save_to_ls")();
	});

}());