/*
 * Controller constructor
 */
// var _hasOwn = Object.prototype.hasOwnProperty;

function Controller(baseData, viewInstance) {};
Controller._initGetData = function() {
	var self = this;
	self.valueOf = self.toString;
	return self.value = self.get();
};
Controller._getData = function() {
	return this.value
};

var Proto = Controller.Observer = function(obs) {
	var self = this;
	if (!(this instanceof Controller.Observer)) {
		return new Controller.Observer(obs);
	}
	if (obs instanceof Function) {
		self.get = obs;
		self.set = $.noop; //默认更新value并触发更新
		self.form = $NULL;
	} else {
		self.get = obs.get || function() {
			return self.value
		};
		self.set = obs.set || $.noop;
		self.form = obs.form || $NULL;
	}
	self.value;
	self.valueOf = Controller._initGetData;
	self.toString = Controller._getData;
};
var relyOn = Controller.relyOn = {
	// status: $FALSE,//true --> For pick up Dependent keyword.
	setStack: [],
	container: {}, //{  relyDM.id:{ keys:[key],DM:source_dataManager.id,key:triggerKey }  }
	cache: {},
	pickUp: function(leader, leader_key, relyKeys) { //拾取依赖的关键字
		var leader_id = leader.id,
			result = relyOn.container[leader_id] || (relyOn.container[leader_id] = {}),
			container = relyOn.container,
			cache;

		$.ftE(relyKeys, function(observerObj) {
			var observerId = observerObj.id,
				observerKey = observerObj.key,
				observerContainer = container[observerId] || (container[observerId] = {});

			if (!(leader_id === observerId && leader_key === observerKey)) { //避免直接的循环依赖
				cache = observerContainer[observerKey];
				if (!cache) {
					cache = observerContainer[observerKey] = [];
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
	}
};
/*
通过AOP重写set\get函数，每次set的前开启关键字收集，完成set后关闭收集、并处理收集器，生成“依赖缓存”，
这样在set函数中的所有相关到get的字符都会被获取到。

这些被获取的字符在被set的时候将会通过“依赖缓存”来得知依赖者，然后再set完成后去更新依赖者的get。
*/
(function Soap() { //速补——《云图Cloud Atlas》
	var proto = DataManager.prototype,
		_set = proto._set = proto.set,
		_get = proto._get = proto.get,
		chain_update_rely = function(id, updataKeys) {
			var relys = relyOn.container[id]; // || (relyOn.container[this.id] = {});

			relys && $.ftE(updataKeys, function(updataKey) { //触发依赖
				var leaderArr;
				if (leaderArr = relys[updataKey]) {
					$.ftE(leaderArr, function(leaderObj) {
						var dm = leaderObj.dm,
							key = leaderObj.key;
						dm._touchOffSubset(key);
						chain_update_rely(dm.id,[key])//递归:链式更新
					})
				}
			})
		};
	proto.set = function() {
		var self = this,
			setStack = relyOn.setStack,
		updataKeys = _set.apply(self, $.s(arguments));
		chain_update_rely(self.id,updataKeys)//开始链式更新
	};
	proto.get = function(key) {
		var self = this,
			relyOn = Controller.relyOn,
			id = self.id,
			setStack = relyOn.setStack,
			args = $.s(arguments),
			observerObj,
			result,
			updataKeys,
			relyKeys = $.lI(setStack),
			innerRelyKeys;
		if ((observerObj = _get.call(self, key, $.noop)) instanceof Proto) { //是监听处理器，则进行收集

			$.p(setStack, []); //开始收集

			observerObj.get();

			innerRelyKeys = setStack.pop(); //获取收集结果

			innerRelyKeys.length && relyOn.pickUp(self, key, innerRelyKeys);
		}
		result = _get.apply(self, args); //保持原本语义 

		relyKeys && $.p(relyKeys, {
			id: id,
			key: key //DataManager.__formateKey
		});

		return result
	};
})();