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
	self._triggerKeys = new ArraySet();
	viewInstance && self.collect(viewInstance);
	DataManager._instances[self.id] = self;
};

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
			if ((obj_s = sObj[i])._DM_extends_object_constructor) { //拓展的DM_Object对象，通过接口实现操作
				obj_s.set(obj_n);
			} else if (obj_s !== obj_n) { //避免循环 Avoid Circular
				sObj[i] = _mix(obj_s, obj_n);
			}
			DataManager.set(sObj, i, nObj);
		}
		return sObj;
	} else {
		return nObj;
	}
};
DataManager._instances = {};
DataManager.config = {
	"THIS": "$THIS", // _placeholder(),
	"PARENT": "$PARENT", // _placeholder(),
	"TOP": "$TOP" // _placeholder()
};
var DMconfig = DataManager.config;
var _DM_filterKey_RegExp = RegExp(function(config) {
	var str = "";
	$.fI(config, function(key) {
		str += "|" + key.replace(/(\W)/g, "\\$1")
	});
	return str.substring(1);
}(DMconfig));

function _nomarl_set_mix_data(key, nObj) {
	//mix Data 合并数据
	var self = this,
		keys,
		lastKey,
		cache_top_n_obj,
		cache_n_Obj,
		updateKeys = [];
	switch (arguments.length) {
		case 0:
			break;
		case 1:
			nObj = key;
			if (self._database !== nObj || nObj instanceof Object) {
				self._database = _mix(self._database, nObj);
				$.p(updateKeys, DMconfig.THIS);
			};
			key = "";
			break;
		default:
			$.p(updateKeys, DMconfig.THIS);
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
	return _nomarl_set_key_touch(self, key, updateKeys);
};

function _nomarl_set_key_touch(self, key, updateKeys) {
	//根据依赖的关键字集合更新关键字数据缓存，
	//通过对比更新前后，
	//得知改动的关键字
	var triggerKeys = self._triggerKeys;
	triggerKeys.forIn(function(_, triggerKey) {
		if (key.indexOf(triggerKey) === 0 || triggerKey.indexOf(key) === 0) {
			var oldVal = self.get(triggerKey), //get caheData
				newVal = self._update(triggerKey), //updata cacheData and return new data
				DM_Object = self._getSource(triggerKey);
			if (oldVal !== newVal || newVal instanceof Object || (DM_Object[_DM_extends_object_constructor] && oldVal !== computedPrototype.get())) {
				$.p(updateKeys, triggerKey);
			}
		}
	})
	if (key !== "" && !triggerKeys.has(key)) { //新的Key
		$.p(triggerKeys, key);
		triggerKeys._[key] = $TRUE;
		self._update(key); //更新缓存
		$.p(updateKeys, key);
	}
	$.ftE(updateKeys, function(triggerKey) { //触发关键字更新
		self._touchOffSubset(triggerKey)
	});
	chain_update_rely(self.id, updateKeys) //开始链式更新
	return updateKeys;
};



function _bubble_set(key, nObj) {
	//获取飞机对象
	//拼接父对象的相对关键字
	var self = this,
		parentDataManager = self._parentDataManager,
		prefix = self._prefix,
		result,
		subsetIndex,
		updateKeys = [DMconfig.THIS];
	if (parentDataManager) {
		//移除父级对象对自身的触发更新，采用手动更新，以获取updateKeys
		subsetIndex = $.iO(parentDataManager._subsetDataManagers, self);
		parentDataManager._subsetDataManagers.splice(subsetIndex, 1);
		switch (arguments.length) { //确保数据更新到最顶层的数据源中。
			case 0:
				break;
			case 1:
				if (prefix) {
					parentDataManager.set(prefix, nObj)
				} else {
					parentDataManager.set(nObj).length === 0 && updateKeys.pop();
				}
				key = "";
				break;
			default:
				if (prefix) {
					prefix = prefix + "." + key;
				} else {
					prefix = key;
				}
				parentDataManager.set(prefix, nObj)
		}
		//从顶层获取完整数据
		result = _nomarl_set_key_touch(self, key, updateKeys); //set中没有$THIS、$PARENT、$TOP等概念，所以key可以直接使用
		//回位
		parentDataManager._subsetDataManagers.splice(subsetIndex, 0, self);
	}
	return result;
};
// var direction = []; //direction.length>0 , from the parent node.
DataManager.prototype = {
	getParent: function(key) { //一般用于with或者layout
		//不加前缀对父级索取，不冒泡
		var parentDM = this._parentDataManager;
		return parentDM && (key === $UNDEFINED ? this._parentDataManager._database /*get()*/ : this._parentDataManager.get(key));
	},
	getThis: function(key) {
		// var self = this,
		// 	prefix = self._prefix ? self._prefix + "." : "";
		// key = prefix + key;
		// //加前缀，不冒泡
		var self = this,
			cacheData_bak = self._cacheData,
			parentDataManager_bak = self._parentDataManager,
			result;
		self._cacheData = {};
		self._parentDataManager = $UNDEFINED;
		result = key === $UNDEFINED ? self._database /*get()*/ : self._update(key);
		self._cacheData = cacheData_bak;
		self._parentDataManager = parentDataManager_bak;
		return result;
	},
	getTop: function(key) {
		//冒泡到最顶层的父级
		var self = this,
			parentDM = self._parentDataManager;
		while (parentDM = self._parentDataManager) {
			self = parentDM;
		}
		return key === $UNDEFINED ? self._database /*get()*/ : self.get(key);
	},
	getNomarl: function(key) {
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
				if (!triggerKeys.has(key) /*$.iO(triggerKeys, key) === -1*/ ) { //这里不将key存入triggerKeys中，set时自然会存在
					//这种情况不存在缓存机制，因为set的自动更新triggerKeys无法更新到这些key，所以保持使用动态获取
					var cacheData_bak = self._cacheData;
					self._cacheData = {};
					result = self._update(key);
					self._cacheData = cacheData_bak;
				} else {
					result = key in cacheData ? cacheData[key] : self._update(key)
				}
				if (result === $UNDEFINED && (parentDM = self._parentDataManager)) { //冒泡
					return parentDM.get(key);
				}
		}
		return result;
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
	get: function(key) { //getRoute
		var self = this,
			THIS = DMconfig.THIS,
			PARENT = DMconfig.PARENT,
			TOP = DMconfig.TOP,
			result;
		if (key == $UNDEFINED) {
			result = self.getNomarl();
		} else if (!key.indexOf(THIS)) {
			key = key.replace(THIS, "");
			result = key ? self.getThis(key.substring(1)) : self.getThis();
		} else if (!key.indexOf(PARENT)) {
			key = key.replace(PARENT, "");
			result = key ? self.getParent(key.substring(1)) : self.getParent();
		} else if (!key.indexOf(TOP)) {
			key = key.replace(TOP, "");
			result = key ? self.getTop(key.substring(1)) : self.getTop();
		} else {
			result = key ? self.getNomarl(key) : self.getNomarl();
		}
		return result;
	},
	setParent: function() {
		var parentDM = this._parentDataManager;
		return (parentDM && parentDM.set.apply(parentDM, $.s(arguments))) || [];
	},
	setThis: function() {
		return _nomarl_set_mix_data.apply(this, $.s(arguments))
	},
	setTop: function() {
		//冒泡到最顶层的父级
		var self = this,
			parentDM = self._parentDataManager;
		while (parentDM = self._parentDataManager) {
			self = parentDM;
		}
		return self.set.apply(self, $.s(arguments));
	},
	setNomarl: _nomarl_set_mix_data,
	set: function(key, nObj) { //setRoute
		var self = this,
			THIS = DMconfig.THIS,
			PARENT = DMconfig.PARENT,
			TOP = DMconfig.TOP,
			result;
		switch (arguments.length) {
			case 0:
				break;
			case 1:
				result = self.setNomarl(key);

				break;
			default:
				if (!key.indexOf(THIS)) {
					key = key.replace(THIS, "");
					result = self.setThis(key.substring(1), nObj);
				} else if (!key.indexOf(PARENT)) {
					key = key.replace(PARENT, "");
					result = self.setParent(key.substring(1), nObj);
				} else if (!key.indexOf(TOP)) {
					key = key.replace(TOP, "");
					result = self.setTop(key.substring(1), nObj);
				} else {
					result = self.setNomarl(key, nObj);
				}
		}
		console.log(result)
		return result;
	},
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
	_touchOffSubset: function(key) { 
	},
	_collectTriKey: function(viewInstance) {

	},
	collect: function(dm) {

	},
	subset: function(dm,prefix){

	},
	remove: function(viewInstance) {

	}
};
global.DataManager = DataManager;