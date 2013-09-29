/*
 * DataManager constructor
 */
// var _hasOwn = Object.prototype.hasOwnProperty;

function TriggerKeySet() {
	var self = this;
	self.keys = [];
	self.store = {};
};
(TriggerKeySet.prototype = $.c(ArraySet.prototype)).push = function(key, value) {
	var self = this,
		keys = self.keys,
		store = self.store,
		currentCollection;
	key = String(key);
	if (!(key in store)) {
		$.p(keys, key);
	}
	currentCollection = store[key] || (store[key] = []);
	if (value instanceof Array) {
		currentCollection.push.apply(currentCollection, value)
	} else {
		$.p(currentCollection, value)
	}
};

function TriggerKeyItem(key, dataManager) {
	var self = this;
	self.key = key;
	self.dataManager = dataManager;
};
TriggerKeyItem.prototype = {
	get: function() {}
};
(function() {
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
		self._triggerKeys = new TriggerKeySet();
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
				obj_s = sObj[i];//||(sObj[i]={});
				if (obj_s&&obj_s._DM_extends_object_constructor) { //拓展的DM_Object对象，通过接口实现操作
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

	// var direction = []; //direction.length>0 , from the parent node.
	DataManager.prototype = {
		get: function(key) { //
			var self = this,
				arrKey = key.split("."),
				parent,
				result = self._database;
			if (result != $UNDEFINED && result !== $FALSE) { //null|undefined|false
				do {
					result = $.valueOf(result[arrKey.splice(0, 1)]);
				} while (result !== $UNDEFINED && arrKey.length);
			}
			if (arrKey.length&&(parent = self._parentDataManager)) {//key不在对象中，查询父级
				result = parent.get(key);
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
					if (sObj&&sObj[_DM_extends_object_constructor]) { //是DataManager.Object的拓展对象
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
			var self = this,
				keys,
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
					var database = self._database||(self._database = {}),
						cache_n_Obj = database,
						arrKey = key.split("."),
						lastKey = arrKey.pop();
					$.ftE(arrKey,function(currentKey){
						cache_n_Obj = cache_n_Obj[currentKey]||(cache_n_Obj[currentKey] = {})
					});
					cache_n_Obj[lastKey] = nObj;
			}
			return self.touchOff(key);
		},
		touchOff:function(key){

		},
		_touchOffSubset: function(key) {},
		_collectTriKey: function(viewInstance) {},
		collect: function(dataManager) { /*收集dataManager的触发集*/
			var self = this,
				myTriggerKeys = self._triggerKeys,
				dmTriggerKeys = dataManager._triggerKeys;
			dmTriggerKeys.forIn(function(dmTriggerCollection, key) {
				myTriggerKeys.push(key, dmTriggerCollection);
			});
		},
		subset: function(dataManager, prefix) { /*收集dataManager的触发集*/
			var self = this,
				myTriggerKeys = self._triggerKeys,
				dmTriggerKeys = dataManager._triggerKeys,
				dotPrefix = prefix ? prefix += "." : ""
			dataManager._prefix = prefix;
			dataManager._parentDataManager && dataManager._parentDataManager.remove(dataManager);

			dmTriggerKeys.forIn(function(dmTriggerCollection, key) {
				myTriggerKeys.push(dotPrefix + key, dmTriggerCollection);
			});
		},
		remove: function(dataManager) {}
	};
}());