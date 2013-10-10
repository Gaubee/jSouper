/*
 * DataManager constructor
 */
// var _hasOwn = Object.prototype.hasOwnProperty;

function DataManager(baseData) {
	var self = this;
	if (!(self instanceof DataManager)) {
		return new DataManager(baseData);
	}
	baseData = baseData || {};
	self.id = $.uid();
	self._database = baseData;
	// self._cacheData = {};
	self._viewInstances = []; //to touch off
	self._parentDataManager // = $UNDEFINED; //to get data
	self._prefix // = $NULL; //冒泡时需要加上的前缀
	self._subsetDataManagers = []; //to touch off
	self._triggerKeys = new SmartTriggerSet({
		dataManager: self
	});
	DataManager._instances[self.id] = self;
};
(global.DataManager = DataManager)._instances = {};

var _DM_extends_object_constructor = _placeholder();
DataManager.Object = function(extendsObj) {
	extendsObj[_DM_extends_object_constructor] = $TRUE;
};

function _mix(sObj, nObj) {
	var obj_nx,
		obj_s,
		i;
	if (sObj instanceof Object && nObj instanceof Object) {
		for (var i in nObj) {
			obj_n = nObj[i];
			obj_s = sObj[i]; //||(sObj[i]={});
			if (obj_s && obj_s._DM_extends_object_constructor) { //拓展的DM_Object对象，通过接口实现操作
				obj_s.set(obj_n);
			} else if (obj_s !== obj_n) { //避免循环 Avoid Circular
				sObj[i] = _mix(obj_s, obj_n);
			}
			// DataManager.set(sObj, i, nObj);
		}
		return sObj;
	} else {
		return nObj;
	}
};
var DM_config = DataManager.config = {
	prefix: {
		This: "$THIS",
		Parent: "$PARENT",
		Top: "$TOP"
	}
};
DataManager.session = {
	topGetter: $NULL,
	topSetter: $NULL,
	filterKey: $NULL,
	setStacks: []
};
var DM_proto = DataManager.prototype = {
	get: function(key) { //
		var self = DataManager.session.topGetter = this,
			result = self._database;
		if (arguments.length !== 0) {
			var arrKey = key.split("."),
				parent
			if (result != $UNDEFINED && result !== $FALSE) { //null|undefined|false
				do {
					result = result[arrKey.splice(0, 1)];
					// result = $.valueOf(result[arrKey.splice(0, 1)]);
				} while (result !== $UNDEFINED && arrKey.length);
			}
			/*
		//避免混淆，不使用智能作用域，否则关键字更新触发器无法准确绑定或者会照常大量计算
		if (arrKey.length && (parent = self._parentDataManager)) { //key不在对象中，查询父级
			result = parent.get(key);
		}*/
			DataManager.session.filterKey = key;
		}
		if (result && result[_DM_extends_object_constructor]) {
			result = result.get();
		}
		return result;
	},
	mix: function(key, nObj) {
		//mix Data 合并数据
		var self = this,
			keys,
			lastKey,
			cache_top_n_obj,
			cache_n_Obj;
		switch (arguments.length) {
			case 0:
				break;
			case 1:
				nObj = key;
				if (self._database !== nObj || nObj instanceof Object) {
					self._database = _mix(self._database, nObj);
				};
				key = "";
				break;
			default:
				var sObj = self.get(key)
				if (sObj && sObj[_DM_extends_object_constructor]) { //是DataManager.Object的拓展对象
					sObj.set(nObj); //调用拓展对象的接口
				} else {
					keys = key.split(".");
					lastKey = keys.pop();
					cache_top_n_obj = cache_n_Obj = {};
					$.ftE(keys, function(nodeKey) { //根据对象链生成可混合对象
						cache_n_Obj = (cache_n_Obj[nodeKey] = {});
					});
					cache_n_Obj[lastKey] = nObj;
					self._database = _mix(self._database, cache_top_n_obj);
				}
		}
		return self.touchOff(key);
	},
	set: function(key, nObj) {
		//replace Data 取代原有对象数据
		var self = DataManager.session.topSetter = this,
			lastKey;
		switch (arguments.length) {
			case 0:
				break;
			case 1:
				nObj = key;
				if (self._database !== nObj || nObj instanceof Object) {
					self._database = nObj;
				};
				key = "";
				break;
			default:
				var database = self._database || (self._database = {}),
					sObj,
					cache_n_Obj = database,
					arrKey = key.split("."),
					lastKey = arrKey.pop();
				$.ftE(arrKey, function(currentKey) {
					cache_n_Obj = cache_n_Obj[currentKey] || (cache_n_Obj[currentKey] = {})
				});
				if ((sObj = cache_n_Obj[lastKey]) && sObj[_DM_extends_object_constructor]) {
					sObj.set(nObj)
				} else {
					cache_n_Obj[lastKey] = nObj;
				}
		}
		DataManager.session.filterKey = key;

		// return self.touchOff(key);
		var result = self.getTopDataManager(key),
			setStacks = DataManager.session.setStacks,
			result_dm = result.dataManager,
			result_dm_id = result_dm.id;
		if ($.iO(setStacks, result_dm_id) === -1) {
			$.p(setStacks, result_dm_id);
			result = result.key ? result_dm.set(result.key, nObj) : result_dm.set(nObj);
			// result = result_dm.touchOff(result.key)
			setStacks.pop();
		} else {
			// $.p(setStacks,self.id);
			result = self.touchOff(key);
			// setStacks.pop();
		}
		return result;
	},
	registerTrigger: function(key, trigger) {
		var self = this,
			triggerKeys = self._triggerKeys;
		if (typeof trigger === "function") {
			trigger = {
				key: key,
				event: trigger
			};
		} else {
			if (!("key" in trigger)) {
				trigger.key = key
			}
		}
		return "id" in trigger ? trigger.id : (trigger.id = (triggerKeys.push(key, trigger) - 1) + "-" + key);
	},
	removeTrigger: function(trigger_id) {
		var index = parseInt(trigger_id),
			key = trigger_id.replace(index + "-", ""),
			self = this,
			triggerKeys = self._triggerKeys,
			triggerCollection = triggerKeys.get(key) || [];
		triggerCollection.splice(index, 1);
	},
	getTopDataManager: function(key) {
		var self = this,
			parent = self._parentDataManager,
			result,
			prefix;
		if (parent) {
			prefix = self._prefix //||""
			key ? (prefix && (key = prefix + "." + key) /*else key = key*/ ) : (prefix && (key = prefix) /*key=""*/ );
			result = parent.getTopDataManager(key)
		} else {
			result = {
				dataManager: self,
				key: key
			};
		}
		return result;
	},
	touchOff: function(key) {
		var self = this,
			parent = self._parentDataManager,
			triggerKeys = self._triggerKeys,
			updateKey = [key],
			chidlUpdateKey = [],
			allUpdateKey,
			triggerCollection;
		//self
		triggerKeys.forIn(function(triggerCollection, triggerKey) {
			if ( /*triggerKey.indexOf(key ) === 0 || key.indexOf(triggerKey ) === 0*/ !key || key === triggerKey || triggerKey.indexOf(key + ".") === 0 || key.indexOf(triggerKey + ".") === 0) {
				// console.log("triggerKey:",triggerKey,"key:",key)
				$.p(updateKey, triggerKey)
				$.ftE(triggerCollection, function(smartTriggerHandle) {
					smartTriggerHandle.event(triggerKeys);
				})
			}
		});
		//child
		$.ftE(self._subsetDataManagers, function(childDataManager) {
			var prefix = childDataManager._prefix,
				childResult; // || "";
			if (!key) {
				childResult = childDataManager.set(prefix ? self.get(prefix) : self.get())
			} else if (!prefix) {
				childResult = childDataManager.set(key, self.get(key))
			} else if (key === prefix || prefix.indexOf(key + ".") === 0) {
				// childDataManager.touchOff(prefix.replace(key + ".", ""));
				childResult = childDataManager.set(self.get(prefix))
			} else if (key.indexOf(prefix + ".") === 0) {
				prefix = key.replace(prefix + ".", "")
				childResult = childDataManager.set(prefix, self.get(key))
				// childDataManager.touchOff("")
			}
			$.p(chidlUpdateKey, childResult);
		});
		return {
			key: key,
			// allUpdateKey: allUpdateKey,
			updateKey: updateKey,
			chidlUpdateKey: chidlUpdateKey
		}
	},
	_touchOffSubset: function(key) {},
	_collectTriKey: function(viewInstance) {},
	collect: function(dataManager) { /*收集dataManager的触发集*/
		var self = this,
			myTriggerKeys = self._triggerKeys,
			dmTriggerKeys = dataManager._triggerKeys;
		dmTriggerKeys.forIn(function(dmTriggerCollection, key) {
			myTriggerKeys.push(key, dmTriggerCollection);
			// $.ftE(dmTriggerCollection, function(smartTriggerHandle) {
			// 	smartTriggerHandle.event( /*new triggerKeySet*/ myTriggerKeys);
			// })
		});
		$.ftE(dataManager._subsetDataManagers, function(childDataManager) {
			dataManager.remove(childDataManager);
			$.p(self._subsetDataManagers, childDataManager);
		})
		return self;
	},
	subset: function(dataManager, prefix) { /*收集dataManager的触发集*/
		var self = this,
			myTriggerKeys = self._triggerKeys,
			dmTriggerKeys = dataManager._triggerKeys,
			// dotPrefix = prefix ? prefix + "." : "",
			data = prefix === $UNDEFINED ? self.get() : self.get(prefix);
		dataManager._prefix = DataManager.session.filterKey || "";
		dataManager._parentDataManager && dataManager._parentDataManager.remove(dataManager);
		dataManager._parentDataManager = DataManager.session.topGetter;

		if (dataManager._database !== data) {
			if (dataManager._database instanceof Object) {
				data = _mix(dataManager._database, data)
			}
			// console.log(prefix, data)
			dataManager.set(data)
		}
		$.p(self._subsetDataManagers, dataManager);
		/*
		
		dmTriggerKeys.forIn(function(dmTriggerCollection, key) {
			myTriggerKeys.push(dotPrefix + key, dmTriggerCollection);
		});*/
		return self;
	},
	remove: function(dataManager) {
		var self = this,
			subsetDataManagers = self._subsetDataManagers,
			index = $.iO(subsetDataManagers, dataManager);
		subsetDataManagers.splice(index, 1);
		return self;
	},
	destroy: function() {},
	buildGetter: function(key) {},
	buildSetter: function(key) {}
};
