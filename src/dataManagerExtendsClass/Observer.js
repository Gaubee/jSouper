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
	if (!(this instanceof Observer)) {
		return new Observer(obs);
	}
	DataManager.Object(self);
	if (obs instanceof Function) {
		self._get = obs;
		self.set = $.noop; //默认更新value并触发更新
		self._form = $NULL;
	} else {
		self._get = obs.get || function() {
			return self._value
		};
		self.set = obs.set || $.noop;
		self._form = obs.form || $NULL;
	}
	self._value;
	self._valueOf = Observer._initGetData;
	self._toString = Observer._getData;
};
Observer.prototype.get = function() {

	var self = this,
		result;
	$.p(relyStack, []); //开始收集

	result = self._get();

	var relySet = relyStack.pop(); //获取收集结果

	relySet.length && relyOn.pickUp(self, key, relySet);
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

Observer._initGetData = function() {
	var self = this;
	self.valueOf = self.toString;
	return self.value = self.get();
};
Observer._getData = function() {
	return this.value
};