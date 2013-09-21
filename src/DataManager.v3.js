/*
 * DataManager constructor
 */
// var _hasOwn = Object.prototype.hasOwnProperty;



function DataManager(baseData, viewInstance) {
	var self = this;
	if (!(self instanceof DataManager)) {
		return new DataManager(baseData, viewInstance);
	}
	baseData = baseData || {};
	self.id = $.uid();
	self._database = baseData;
	self._cacheData = {};
	self._viewInstances = []; //to touch off
	self._parentDataManager = $UNDEFINED; //to get data
	self._prefix = $NULL; //冒泡时需要加上的前缀
	self._subsetDataManagers = []; //to touch off
	(self._triggerKeys = [])._ = {};
	viewInstance && self.collect(viewInstance);
	DataManager._instances[self.id] = self;
};
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
	},
	DM_proto = DataManager.prototype,
	DM_proto_get = DM_proto.get;



function _mix(sObj, nObj) {
	var obj_s, obj_n, i;
	if (sObj instanceof Object && nObj instanceof Object) {
		for (i in nObj) {
			var obj_n = nObj[i];
			if ((obj_s = sObj[i]) instanceof DynamicComputed) { //计算属性直接采用自带的set操作
				obj_s.set === $.noop ? (obj_s._value = _mix(obj_s._value, obj_n)) : obj_s.set(obj_n);
			} else if (obj_s !== obj_n) { //避免循环 Avoid Circular
				sObj[i] = _mix(obj_s, obj_n);
			}
		}
		return sObj;
	} else {
		return nObj;
	}
};
global.DataManager = DataManager;
DataManager.__formateKey; //最后一次get处理完成的formateKey
DataManager.__id; //最后一次get的id对象
DataManager._instances = {};
DataManager.config = {
	"$THIS": _placeholder(),
	"$PARENT": _placeholder(),
	"$TOP": _placeholder()
}

function _DM_set(key, nObj) {
	//mix:将对象和当前数据集合混合
	//计算属性需要特殊操作
	//set会引发计算属性链式更新，所以triggerKeys的正常收集仅仅发生在set内部
	var self = this,
		triggerKeys = self._triggerKeys,
		keys,
		lastKey,
		cache_top_n_obj,
		cache_n_Obj,
		updateKeys = [DataManager.config.$THIS];
	switch (arguments.length) {
		case 0:
			break;
		case 1:
			nObj = key;
			self._database = _mix(self._database, nObj);
			key = "";
			break;
		default:
			var sObj = self.get(key)
			if (sObj instanceof DynamicComputed) { //是计算属性
				sObj.set(nObj);
			} else {
				keys = key.split(".");
				lastKey = keys.pop();
				cache_top_n_obj = cache_n_Obj = {};
				$.ftE(keys, function(nodeKey) {
					cache_n_Obj = (cache_n_Obj[nodeKey] = {});
				});
				cache_n_Obj[lastKey] = nObj;
				self._database = _mix(self._database, cache_top_n_obj);
			}
	}
	$.ftE($.un(triggerKeys), function(triggerKey) {
		if (key.indexOf(triggerKey) === 0 || triggerKey.indexOf(key) === 0) {
			var oldVal = self.get(triggerKey),
				newVal = self._update(triggerKey), //updata cacheData
				computedPrototype = self._getSource(triggerKey);
			if (oldVal !== newVal || newVal instanceof Object || (computedPrototype /*updata cacheData*/ instanceof DynamicComputed && oldVal !== computedPrototype.get())) {
				$.p(updateKeys, triggerKey);
			}
		}
	});
	if (key !== "" && !triggerKeys._[key] /*$.iO(triggerKeys, key) === -1*/ ) { //新的Key
		$.p(triggerKeys, key);
		triggerKeys._[key] = $TRUE;
		self._update(key); //更新缓存
		$.p(updateKeys, key);
	}
	$.ftE(updateKeys, function(triggerKey) {
		self._touchOffSubset(triggerKey)
	});
	chain_update_rely(self.id, updateKeys) //开始链式更新
	return updateKeys;
};

function _DM_bubbleSet(key, nObj) {
	var self = this,
		parentDataManager = self._parentDataManager,
		prefix = self._prefix
	if (parentDataManager) { //确保数据更新到最顶层的数据源中。
		switch (arguments.length) {
			case 0:
				break;
			case 1:
				if (prefix) {
					parentDataManager.set(prefix, nObj)
				} else {
					parentDataManager.set(nObj)
				}
				return _DM_set.call(self, parentDataManager.get(prefix));
			default:
				if (prefix) {
					prefix = prefix + "." + key;
				} else {
					prefix = key;
				}
				parentDataManager.set(prefix, nObj)
				return _DM_set.call(self, key, parentDataManager.get(prefix));
		}
		//从顶层获取完整数据
	}
};
// var direction = []; //direction.length>0 , from the parent node.
DataManager.prototype = {
	getParent: function(key) { //一般用于with或者layout
		//不加前缀对父级索取，不冒泡
		return this._parentDataManager.get(key);
	},
	getThis: function(key) {
		// var self = this,
		// 	prefix = self._prefix ? self._prefix + "." : "";
		// key = prefix + key;
		// //加前缀，不冒泡
		var self = this,
			triggerKeys = self._triggerKeys,
			cacheData = self._cacheData,
			result;
		if (!triggerKeys._[key]) {
			result = self._update(key);
		} else {
			result = cacheData[key];
		}
		return result;
	},
	getTop: function(key) {
		//冒泡到最顶层的父级
		var self = this,
			cacheData = self._cacheData,
			parentDM;
		while (parentDM = self._parentDataManager) {
			self = parentDM;
		}
		return self.get(key);
	},
	_getSource: function(key) {
		var self = this,
			cacheData = self._cacheData,
			arrKey = key.split("."),
			result = self._database;
		if (result != $UNDEFINED && result !== $FALSE) { //null|undefined|false
			do {
				result = result[arrKey.splice(0, 1)];
			} while (result !== $UNDEFINED && arrKey.length);
		}
		return result;
	},
	get: function(key) {
		//冒泡获取，不更新缓存
		var self = this,
			triggerKeys = self._triggerKeys,
			cacheData = self._cacheData,
			result,
			parentDM;
		switch (arguments.length) {
			case 0:
				result = self._database;
				break;
			default:
				if (!triggerKeys._[key] /*$.iO(triggerKeys, key) === -1*/ ) { //这里不将key存入triggerKeys中，set时自然会存在
					result = self._update(key); //这种情况不存在缓存机制，因为set的自动更新triggerKeys无法更新到这些key，所以保持使用动态获取
				} else {
					result = cacheData[key];
				}
				if (result === $UNDEFINED && (parentDM = self._parentDataManager)) { //冒泡
					return parentDM.get(key);
				}
		}
		return result;
	},
	set: _DM_set,
	_update: function(key) { //将更新缓存从get中剥离
		//更新发生于：1、set	2、collect viewInstance	3、get set_triggerKeys(set操作中需更新的key)中不存在的key（由于2，所以不会影响到vi的更新）
		var self = this,
			cacheData = self._cacheData,
			arrKey = key.split("."),
			result = self._database;
		if (result != $UNDEFINED && result !== $FALSE) { //null|undefined|false
			do {
				result = $.valueOf(result[arrKey.splice(0, 1)]);
			} while (result !== $UNDEFINED && arrKey.length);
		}
		return cacheData[key] = result;
	},
	_touchOffSubset: function(key) { //TODO:each下的事件无法冒泡到顶级
		var self = this;
		$.fE(self._subsetDataManagers, function(dm) {
			dm._touchOffSubset(key);
		});
		var i, vis, vi, len;
		$.ftE(self._viewInstances, function(vi) { //属性更新器彻底游离，由属性触发器托管
			vi.touchOff(key);
		});
	},
	_collectTriKey: function(vi) {
		var self = this,
			triggerKeys = self._triggerKeys,
			subsetDataManager = vi.dataManager;
		$.ftE(vi._triggers, function(triggerKey) {
			if (!triggerKeys._[triggerKey] /*$.iO(triggerKeys, triggerKey) === -1*/ ) { //更新触发所需的关键字
				subsetDataManager._update(triggerKey);
			}
		});
		//完全更新完毕后，更新页面，以免函数运作获取到正确数据
		$.ftE(vi._triggers, function(triggerKey) {
			vi.touchOff(triggerKey);
		});
		$.ftE(vi._triggers, function(triggerKey) { //将关键字收集到set操作中需更新的key
			// triggerKeys.push.apply(triggerKeys, vi._triggers);
			$.p(triggerKeys, triggerKey);
			triggerKeys._[triggerKey] = $TRUE;
		});
	},
	collect: function(viewInstance) {
		var self = this;
		if ($.iO(self._viewInstances, viewInstance) === -1) {
			viewInstance.dataManager && viewInstance.dataManager.remove(viewInstance);
			$.p(self._viewInstances, viewInstance);
			viewInstance.dataManager = self;
			self._collectTriKey(viewInstance);
		}
		return self;
	},
	subset: function(viewInstance, prefix) {
		var self = this,
			subsetDataManager = viewInstance.dataManager; //DataManager(baseData, viewInstance);
		subsetDataManager._parentDataManager = self;
		subsetDataManager.set = _DM_bubbleSet;
		if (arguments.length > 1) {
			subsetDataManager._database = _mix(subsetDataManager._database, self.get(String(prefix)));
		} else {
			subsetDataManager._database = self._database;
		}
		if (viewInstance instanceof ViewInstance) {
			viewInstance.dataManager = subsetDataManager;
			// viewInstance.reDraw();
			self._collectTriKey(viewInstance);
		}
		if (prefix) {
			subsetDataManager._prefix = prefix;
		}
		$.p(this._subsetDataManagers, subsetDataManager);
		return subsetDataManager; //subset(vi).set(basedata);},
	},
	remove: function(viewInstance) {
		var self = this,
			vis = self._viewInstances,
			index = $.iO(vis, viewInstance);
		if (index !== -1) {
			vis.splice(index, 1);
		}
	}
};