var relyStack = [], //用于搜集依赖的堆栈数据集
	allRelyContainer = {}, //存储处理过的依赖关系集，在set运作后链式触发 TODO：注意处理循环依赖
	chain_update_rely = function(id, updataKeys) {
		var relyContainer = allRelyContainer[id]; // || (allRelyContainer[this.id] = {});

		relyContainer && $.ftE(updataKeys, function(updataKey) { //触发依赖
			var leaderArr;
			if (leaderArr = relyContainer[updataKey]) {
				$.ftE(leaderArr, function(leaderObj) {
					var leader = leaderObj.dm,
						key = leaderObj.key;
					chain_update_rely(leader.id, leader.set(key, leader._getSource(key).get())) //递归:链式更新
				})
			}
		})
	}

	function Observer(obs) { //动态计算类
		var self = this;
		if (!(self instanceof Observer)) {
			return new Observer(obs);
		}
		DataManager.Object(self);
		if (obs instanceof Function) {
			self._get = obs;//完全暴露错误给用户，方便调试Try(obs, self);
			self.set = $.noop;//与defineGetter|defineSetter一样的机制
			// self._form = $NULL;
		} else {
			self._get = obs.get || function() {
				return self._value
			};
			self.set = obs.set?function(){
				self._value = obs.set.apply(this.arguments)
			}:$.noop;//Try(obs.set, self) || $.noop;
			self._form = obs.form//Try(obs.form, self) || $NULL;
		}
		self._value;
		self._valueOf = Observer._initGetData;
		self._toString = Observer._getData;
	};
Observer._initGetData = function() {
	var self = this;
	self.valueOf = self.toString = Observer._getData;
	return self._value = self.get();
};
Observer._getData = function() {
	return this._value
};
Observer.collect = function(leader_id, follower_id) {
	//allRelyContainer;
};
Observer.pickUp = function(leader, leader_key, relySet) {
	var leader_id = leader.id;
	$.ftE(relySet, function(relyNode) { //处理依赖结果
		var relyId = relyNode.id,
			relyKey = relyNode.key,
			relyContainer = allRelyContainer[relyId] || (allRelyContainer[relyId] = {});

		if (!(leader_id === relyId && leader_key === relyKey)) { //避免直接的循环依赖
			cache = relyContainer[relyKey];
			if (!cache) {
				cache = relyContainer[relyKey] = [];
				cache._ = {};
			}
			var cache_key = cache._[leader_key] || (cache._[leader_key] = "|");

			if (cache_key.indexOf("|" + leader_id + "|") === -1) {
				$.p(cache, {
					dm: leader,
					key: leader_key
				});
				cache._[leader_key] += leader_id + "|";
			}
		}
	});
};
Observer.prototype = {
	get: function() {

		var self = this,
			dm = DataManager.session.topGetter,
			key = DataManager.session.filterKey,
			result;
		$.p(relyStack, []); //开始收集

		result = self._value = self._get();

		var relySet = relyStack.pop(); //获取收集结果
		// console.log(relySet); //debugger;
		relySet.length && Observer.pickUp(dm, key, relySet);

		return result;
	},
	toString: Observer._initGetData,
	valueOf: Observer._initGetData
};

(function() {
	var _get = DM_proto.get,
		_set = DM_proto.set,
		_collect = DM_proto.collect;
	DM_proto.get = function() {
		var result = _get.apply(this, arguments/*$.s(arguments)*/);
		// console.log(result)
		// if (result instanceof Observer) {
		// 	result = result.get()
		// }
		if (relyStack.length) {
			$.p($.lI(relyStack), {
				id: DataManager.session.topGetter.id,
				// dataManager: DataManager.session.topGetter,
				key: DataManager.session.filterKey
			})
		}
		return result;
	};
	DM_proto.set = function() {
		var self= this,
			result = _set.apply(self, arguments/*$.s(arguments)*/),
			relyContainer = allRelyContainer[self.id];
		if (relyContainer) {
			// console.log(result,relyContainer)
			$.ftE(result.updateKey,function(updateKey){
				var relyObjects = relyContainer[updateKey];
				relyObjects&&$.ftE(relyObjects,function(relyObject){
					relyObject.dm.touchOff(relyObject.key)
				});
			});
		}
		return result;
	};
	DM_proto.collect = function(dataManager) {
		var result = _collect.apply(this, arguments/*$.s(arguments)*/);
		if (dataManager instanceof DataManager) {
			Observer.collect(this.id, dataManager.id);
		}
		return result;
	}
}());