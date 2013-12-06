;
(function() {
	function Observer(getFun, setFun, formFun) {
		var self = this;
		if (!(self instanceof Observer)) {
			return new Observer(getFun, setFun, formFun)
		}
		self._get = getFun || $.noop
		self._set = setFun || $.noop
		self._form = formFun || $.noop
		self._id = $.uid()
	}

	// 存储处理过的依赖关系集，在set运作后链式触发 TODO：注意处理循环依赖
	var observerCache = Observer.cache = {
		//dm_id:{key:[{dm_id:dm,dm_key:"",abandon:false}...]}
		_: {}
	};

	// 原始的DM-get方法
	var _dm_normal_get = DM_proto.get

	// 带收集功能的DM-get
	var _dm_collect_get = function() {
		var self = this;
		var result = _dm_normal_get.apply(self, arguments)

		//当前收集层
		var _current_collect_layer = _get_collect_stack[_get_collect_stack.length - 1]
		//存储相关的依赖信息
		_current_collect_layer && $.p(_current_collect_layer, {
			//rely object
			dm_id: self.id,
			dm_key: DataManager.session.filterKey
		})
		return result;
	}

	// 用于搜集依赖的堆栈数据集
	var _get_collect_stack = []

	// 委托 set\get\form
	// this ==> dataManager but not Observer-instance
	Observer.prototype = {
		set: function(dm, key, value) {
			return this._set.call(dm, key, value)
		},
		get: function(dm, key, value) {
			/*
			 * dm collect get mode
			 */
			DM_proto.get = _dm_collect_get;

			//生成一层收集层
			$.p(_get_collect_stack, [])

			//运行原生get
			var result = this._get.call(dm, key, value)

			/*
			 * dm normal get mode
			 */
			//回收最近一层依赖
			var _current_collect_layer = _get_collect_stack.pop()

			//获取上次收集的依赖，将上次依赖进行回退
			var _oldObserverObj = observerCache._[dm.id];
			//舍弃上一次的依赖关系
			_oldObserverObj && (_oldObserverObj.abandon = $TRUE)

			var _newObserverObj = {
				// abandon:$FALSE, //delay load
				dm_id: dm.id,
				dm_key: key
			}

			//保存最近一层依赖
			observerCache._[dm.id] = _newObserverObj

			//将依赖关系你想逆向转换
			$.ftE(_current_collect_layer, function(relyObj) {
				var observerObjCollect = observerCache[relyObj.dm_id] || (observerCache[relyObj.dm_id] = {})
				$.p((observerObjCollect[relyObj.dm_key] = []), _newObserverObj)
			})

			DM_proto.get = _dm_normal_get;

			return result;
		},
		form: function(dm, key, value) {
			return this._form.apply(dm, arguments)
		}
	}

	var _dm_normal_set = DM_proto.set
	DM_proto.set = function() {
		var self = this;
		// debugger
		var result = _dm_normal_set.apply(self, arguments)
		if (result.stacks!==0) {//0层的set代表着冒泡到顶层，不代表着进行了set操作
			var observerObjCollect = observerCache[self.id]
			if (observerObjCollect) {
				observerObjCollect = observerObjCollect[DataManager.session.filterKey];
				observerObjCollect && $.ftE(observerObjCollect, function(observerObj) {
					console.log(observerObj)
				})
			}
		}
		return result;
	}
	_dataManagerExtend("Observer", Observer)
}())