/*
 * DataManager constructor
 */
// var _hasOwn = Object.prototype.hasOwnProperty;

function DataManager(baseData) {
	var self = this;
	if (!(self instanceof DataManager)) {
		return new DataManager(baseData);
	}
	// baseData = baseData || {};
	self.id = $.uid();

	self._database = baseData;
	self.__arrayLen = {}; //cache array length with key
	// self._cacheData = {};
	self._viewInstances = []; //to touch off
	self._parentDataManager // = $UNDEFINED; //to get data
	self._prefix // = $NULL; //冒泡时需要加上的前缀
	// self._smartSource // = $NULL; //store how to get parentDataManager
	// self._smartDataManagers = [];//store smart dm which has prefix key 

	self._siblingDataManagers = [];
	self._subsetDataManagers = []; //to touch off
	self._collectDataManagers = {};
	self._triggerKeys = new SmartTriggerSet({
		dataManager: self
	});
	DataManager._instances[self.id] = self;
};
(global.DataManager = DataManager)._instances = {};

var _DM_extends_object_constructor = _placeholder();

// get DataManager instance by id
DataManager.get = function(id) {
	return DataManager._instances[id];
}

/*
 use _dm_igonre_extend

// ignore extends object in `get` handle
var _extendIgnore = DataManager.ignoreExtendsObject = function(newObj) {
	var self = this;
	if (!(self instanceof _extendIgnore)) {
		return new _extendIgnore(newObj);
	}
	self.value = newObj
};*/
//set时使其进行强制更新
DataManager.updateExtendObject = {};

var $LENGTH = "length";

function _mix(sObj, nObj) {
	var obj_n,
		obj_s,
		i;
	if (sObj instanceof Object && nObj instanceof Object) {
		for (var i in nObj) {
			obj_n = nObj[i];
			obj_s = sObj[i]; //||(sObj[i]={});
			if (obj_s && obj_s[_DM_extends_object_constructor]) { //拓展的DM_Object对象，通过接口实现操作
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

function _getAllSiblingDataManagers(self, result) {
	$.p(result || (result = []), self)
	var dmSublingDataManagers = self._siblingDataManagers;
	$.ftE(dmSublingDataManagers, function(dm) {
		if ($.iO(result, dm) === -1) {
			_getAllSiblingDataManagers(dm, result);
		}
	});
	return result;
};

// smart-key config
var DM_config = DataManager.config = {
	prefix: {
		This: "$THIS",
		Parent: "$PARENT",
		Top: "$TOP"
	}
};

// TEMP object
DataManager.session = {
	topGetter: $NULL,
	topSetter: $NULL,
	filterKey: $NULL,
	setStacks: [],
	finallyRunStacks: []
};

// to avoid `set` in setting 
// DataManager._finallyQuene = []; // delay load
DataManager.finallyRun = function(fun) {
	var finallyQuene = DataManager._finallyQuene || (DataManager._finallyQuene = []);
	if (fun) {
		$.p(finallyQuene, fun)
	} else {
		while (finallyQuene.length) {
			fun = finallyQuene.shift()
			fun && fun()
		}
	}
}

var _dm_get_source // =$FALSE //get Source ignore extend-Object
var _dm_mix_source // =$FALSE //mix Source ignore extend-Object
var _dm_set_source // =$FALSE //set Source ignore extend-Object

//TODO: replace `_dm_force_update` by setting stack
var _dm_force_update //= $FALSE;  //ignore equal

var DM_proto = DataManager.prototype = {
	getSource: function() {
		_dm_get_source = $TRUE;
		var result = this.get.apply(this, arguments)
		_dm_get_source = $FALSE;
		return result;
	},
	get: function(key) { //
		var self = DataManager.session.topGetter = this,
			result = self._database,
			filterKey;
		if (arguments.length !== 0) {
			var arrKey = key.split("."),
				// lastKey = arrKey.pop(),
				anchor = 0;
			if (result != $UNDEFINED && result !== $FALSE) { //null|undefined|false
				if (_isIE) {
					do { //fix IE String
						var perkey = arrKey[anchor++];
						if (typeof result === "string" && ~~perkey == perkey) {
							result = result.charAt(perkey)
						} else {
							result = result[perkey];
						}
					} while (result !== $UNDEFINED && arrKey.length - anchor);
				} else {
					do { //fix IE String
						result = result[arrKey[anchor++]];
						// result = $.valueOf(result[arrKey.splice(0, 1)]);
					} while (result !== $UNDEFINED && arrKey.length - anchor);
				}
			}

			/*
		//避免混淆，不使用智能作用域，否则关键字更新触发器无法准确绑定或者会照常大量计算
		if (arrKey.length && (parent = self._parentDataManager)) { //key不在对象中，查询父级
			result = parent.get(key);
		}*/
			filterKey = key;
		}
		if (result && result[_DM_extends_object_constructor] && !_dm_get_source) {
			result = result.get(self, key, result.value);
		}
		//filterKey应该在extends_object的get后定义，避免被覆盖
		DataManager.session.filterKey = filterKey;
		return result;
	},
	mixSource: function() {
		_dm_mix_source = $TRUE;
		var result = this.mix.apply(this, arguments)
		_dm_mix_source = $FALSE;
		return result;
	},
	mix: function(key, nObj) {
		//mix Data 合并数据
		var self = this,
			result;
		switch (arguments.length) {
			case 0:
				break;
			case 1:
				result = self.get(); //maybe ExtendsClass
				result = self.set(_mix(result, key));
				break;
			default:
				result = self.get(key);
				result = self.set(key, _mix(result, nObj));
		}
		return result;
	},
	setSource: function() {
		_dm_set_source = $TRUE;
		var result = this.set.apply(this, arguments)
		_dm_set_source = $FALSE;
		return result;
	},
	set: function(key, nObj) {
		//replace Data 取代原有对象数据
		var self = DataManager.session.topSetter = this,
			lastKey,
			argumentLen = arguments.length;
		if (argumentLen === 0) {
			return;
		} else if (argumentLen === 1) {
			nObj = key;
			key = "";
		}

		var result = self.getTopDataManager(key), //Leader:find the dataManager matched by key
			setStacks = DataManager.session.setStacks,
			result_dm = result.dataManager,
			result_dm_id = result_dm.id;
		if ($.iO(setStacks, result_dm_id) === -1) { //maybe have many fork by the ExtendsClass
			$.p(setStacks, result_dm_id);
			result = result.key ? result_dm.set(result.key, nObj) : result_dm.set(nObj);
			// result = result_dm.touchOff(result.key)
			setStacks.pop();
			!setStacks.length && DataManager.finallyRun();
		} else {
			switch (argumentLen) {
				// case 0:
				// 	break;
				case 1:
					var sObj = self._database;
					if (sObj && sObj[_DM_extends_object_constructor] && !_dm_set_source) {
						sObj.set(self, "", nObj);
					} else if (sObj !== nObj || _dm_force_update) {
						self._database = nObj;
					} else if (!(nObj instanceof Object)) { //sObj === nObj && no-object
						return;
					};
					break;
				default: //find Object by the key-dot-path and change it
					if (_dm_force_update || nObj !== DM_proto.get.call(self, key)) {
						//[@Gaubee/blog/issues/45](https://github.com/Gaubee/blog/issues/45)
						var database = self._database || (self._database = {}),
							sObj,
							cache_n_Obj = database,
							cache_cache_n_Obj,
							arrKey = key.split("."),
							lastKey = arrKey.pop();
						$.ftE(arrKey, function(currentKey) {
							cache_cache_n_Obj = cache_n_Obj;
							cache_n_Obj = cache_n_Obj[currentKey] || (cache_n_Obj[currentKey] = {})
						});
						if ((sObj = cache_n_Obj[lastKey]) && sObj[_DM_extends_object_constructor] && !_dm_set_source) {
							sObj.set(self, key, nObj) //call ExtendsClass API
						} else if (cache_n_Obj instanceof Object) {
							cache_n_Obj[lastKey] = nObj;
						} else if (cache_cache_n_Obj) {
							(cache_cache_n_Obj[$.lI(arrKey)] = {})[lastKey] = nObj
						} else { //arrKey.length === 0,and database instanceof no-Object
							(self._database = {})[lastKey] = nObj
						}
					} else if (!(nObj instanceof Object)) { //no any change, if instanceof Object and ==,just run touchOff
						return;
					}
			}
			//TODO:set中的filterKey已经在return中存在，无需再有
			DataManager.session.filterKey = key;
			// debugger
			result = self.touchOff(key);
		}
		// console.log(result)
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
			prefix = self._prefix //||"" ,all prefix has been filter $scope key
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
		var self = this;
		var result;

		var linkKey = "",
			__arrayLen = self.__arrayLen,
			__arrayData;

		//简单的判定是否可能是数组类型的操作并且可能影响到长度
		if (/[^\w]\.?length/.test(key) || /[^\w]\.?[\d]+[^\w]\.?/.test(key)) {
			var arrKey = key.split("."),
				lastKey = arrKey.pop();

			//寻找长度开始变动的那一层级的数据开始_touchOffSibling
			arrKey && $.ftE(arrKey, function(maybeArrayKey) {
				linkKey = linkKey ? linkKey + "." + maybeArrayKey : maybeArrayKey;
				if ((__arrayData = DM_proto.get.call(self, linkKey)) instanceof Array && __arrayLen[linkKey] !== __arrayData.length) {
					// console.log(linkKey,__arrayData.length, __arrayLen[linkKey])
					__arrayLen[linkKey] = __arrayData.length
					result = self._touchOffSibling(linkKey)
				}
			})
		}
		if (!result && (__arrayData = self.get()) instanceof Array && __arrayLen[""] !== __arrayData.length) {
			__arrayLen[""] = __arrayData.length
			key = "";
		}
		result || (result = self._touchOffSibling(key))
		return result;
	},
	_touchOffSibling: function(key) { //always touchoff from toppest dm
		var self = this,
			database = self._database;
		$.ftE($.s(_getAllSiblingDataManagers(self)), function(dm) {
			dm._database = database; //maybe on-obj
			dm._touchOff(key)
		})
		return {
			key: key
		}
	},
	_touchOff: function(key) {
		var self = this,
			triggerKeys = self._triggerKeys,
			allUpdateKey,
			triggerCollection;
		//self
		triggerKeys.forIn(function(triggerCollection, triggerKey) {
			//!triggerKey==true;
			if (!key || !triggerKey || key === triggerKey || triggerKey.indexOf(key + ".") === 0 || key.indexOf(triggerKey + ".") === 0) {
				// console.log("filter triggerKey:",triggerKey)
				// $.p(updateKey, triggerKey)
				$.ftE(triggerCollection, function(smartTriggerHandle) {
					smartTriggerHandle.event(triggerKeys);
				})
			}
		});
		//child
		$.ftE(self._subsetDataManagers, function(childDataManager) {
			// debugger
			var prefix = childDataManager._prefix,
				childResult; // || "";
			_dm_force_update = $TRUE; //TODO: use Stack 
			if (!key) { //key === "",touchoff all
				childResult = childDataManager.set(prefix ? self.get(prefix) : self.get())
			} else if (!prefix) { //prefix==="" equal to $THIS
				childResult = childDataManager.set(key, self.get(key))
			} else if (key === prefix || prefix.indexOf(key + ".") === 0) { //prefix is a part of key,just maybe had been changed
				// childDataManager.touchOff(prefix.replace(key + ".", ""));
				childResult = childDataManager.set(self.get(prefix))
			} else if (key.indexOf(prefix + ".") === 0) { //key is a part of prefix,must had be changed
				prefix = key.replace(prefix + ".", "")
				childResult = childDataManager.set(prefix, self.get(key))
				// childDataManager.touchOff("")
			}
			_dm_force_update = $FALSE;
			//如果不进行锁定，当数组因为其子对象被修改，
			//改动信息就需要冒泡到顶层，等同于强制触发数组的所有关键字，通知所有子对象检查自身是否发生变化。
			//所以锁定是效率所需。
			// $.p(chidlUpdateKey, childResult);
		});
	},
	rebuildTree: $.noop,
	getTop: function() { //get DM tree top
		var self = this,
			next;
		while (next = self._parentDataManager) {
			self = next;
		}
		return self;
	},
	_pushToSubSetDM: function(dataManager, prefixKey) {
		dataManager._parentDataManager = this;
		dataManager._prefix = prefixKey
		return $.p(this._subsetDataManagers, dataManager);
	},
	_pushToCollectDM: function(dataManager, pprefixKey, id) {
		var self = this,
			collectDataManagers = self._collectDataManagers;
		var hash = pprefixKey + id;
		var collectDataManager = collectDataManagers[hash];
		if (!collectDataManager) {
			collectDataManager = collectDataManagers[hash] = new _ArrayDataManager(pprefixKey);
			self._pushToSubSetDM(collectDataManager, pprefixKey)
		}
		collectDataManager.push(dataManager)
	},
	collect: function(dataManager) {
		var self = this,
			finallyRunStacks = DataManager.session.finallyRunStacks;
		if (self !== dataManager) {
			if ($.iO(self._siblingDataManagers, dataManager) === -1) {
				$.p(self._siblingDataManagers, dataManager);
				$.p(dataManager._siblingDataManagers, self);
				self.rebuildTree()
				dataManager._database = self._database;
				finallyRunStacks.push(self.id)
				dataManager.getTop().touchOff("");
				finallyRunStacks.pop();
				!finallyRunStacks.length && DataManager.finallyRun();
			}
		} else {
			// self.set(self._database)
			finallyRunStacks.push(self.id)
			self.getTop().touchOff("");
			finallyRunStacks.pop();
			!finallyRunStacks.length && DataManager.finallyRun();
		}
		return self;
	},
	subset: function(dataManager, prefixKey) {
		var self = this,
			finallyRunStacks = DataManager.session.finallyRunStacks;
		dataManager.remove();
		if (dataManager._isEach) {
			self._pushToCollectDM(dataManager,
				//prefixkey === "[0-9]+?" ==> $THIS.0 ==> return ""; 
				//else return prefixkey.split(".").pop().join(".")
				$.lst(prefixKey,"."),
				// in dif handle
				dataManager._isEach.eachId)
		} else {
			self._pushToSubSetDM(dataManager, prefixKey)
		}
		dataManager.rebuildTree()

		//注意：each会置空touchOff使其无效，导致each运行时页面数据无法更新，
		//所以each对象内部的数据自身获取临时数据进行更新完成后，再移除touchOff
		dataManager._database = self.get(prefixKey);
		finallyRunStacks.push(self.id)
		self.getTop().touchOff("");
		finallyRunStacks.pop();
		!finallyRunStacks.length && DataManager.finallyRun();
		return self;
	},
	remove: function(dataManager) {
		var self = this;
		if (dataManager) {
			if (dataManager._isEach) {
				arrayDataManager = dataManager._arrayDataManager;
				arrayDataManager && arrayDataManager.remove(dataManager)
			} else {
				var subsetDataManagers = self._subsetDataManagers,
					index = $.iO(subsetDataManagers, dataManager);
				subsetDataManagers.splice(index, 1);
				dataManager._parentDataManager = $UNDEFINED;
			}
		} else {
			dataManager = self._parentDataManager;
			if (dataManager) {
				dataManager.remove(self);
			}
		}
		return self;
	},
	replaceAs: function(dataManager) {
		var self = this;
		$.ftE(self._subsetDataManagers, function(subsetDM) {
			subsetDM._parentDataManager = dataManager;
			$.p(dataManager._subsetDataManagers, subsetDM)
		});
		var new_siblingDataManagers = dataManager._siblingDataManagers;
		$.ftE(_getAllSiblingDataManagers(self), function(sublingDM) {
			var siblingDataManagers = sublingDM._siblingDataManagers;
			$.rm(siblingDataManagers, self)
			if ($.iO(new_siblingDataManagers, sublingDM) === -1) {
				$.p(new_siblingDataManagers, sublingDM)
			}
			if ($.iO(siblingDataManagers, dataManager) === -1) {
				$.p(siblingDataManagers, dataManager)
			}
		});
		$.rm(new_siblingDataManagers, self)
		$.ftE(self._viewInstances, function(viewInstance) {
			viewInstance.dataManager = dataManager;
			$.p(dataManager._viewInstances, viewInstance)
		});
		self._triggerKeys.forIn(function(smartTriggerSet, key) {
			dataManager._triggerKeys.push(key, smartTriggerSet)
		})
		dataManager.set(dataManager.get());
		DataManager._instances[self.id] = dataManager;
		self.destroy()
		return $NULL;
	},
	destroy: function() {
		for (var i in this) {
			delete this[i]
		}
	}
	/*,
	buildGetter: function(key) {},
	buildSetter: function(key) {}*/
};