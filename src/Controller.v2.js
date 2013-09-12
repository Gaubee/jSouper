function DynamicComputed(obs, isStatic) { //动态计算类，可定制成静态计算类（只收集一次的依赖，适合于简单的计算属性，没有逻辑嵌套）
	var self = this;
	if (!(this instanceof Controller.Observer)) {
		return new Controller.Observer(obs);
	}
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
	if (self._static = !! isStatic) {
		var _cacheGet = self.get;
		self.get = DynamicComputed._staticGet;
	};
	self._value;
	self._valueOf = Controller._initGetData;
	self._toString = Controller._getData;
};
DynamicComputed.prototype.get = function() {

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
DynamicComputed._staticGet = function() { //转化成静态计算类
	var self = this,
		result = _cacheGet.apply(self, $.s(arguments));
	self.get = self._get; //剥离依赖收集器
	return result;
};
DynamicComputed._initGetData = function() {
	var self = this;
	self.valueOf = self.toString;
	return self.value = self.get();
};
DynamicComputed._getData = function() {
	return this.value
};