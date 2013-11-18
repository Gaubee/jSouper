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
	self.__arrayLen = {}; //cache array length with key
	// self._cacheData = {};
	self._viewInstances = []; //to touch off
	self._parentDataManager // = $UNDEFINED; //to get data
	self._prefix // = $NULL; //冒泡时需要加上的前缀
	// self._smartSource // = $NULL; //store how to get parentDataManager
	// self._smartDataManagers = [];//store smart dm which has prefix key 

	self._siblingDataManagers = [];
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
DataManager.get = function(id) {
	return DataManager._instances[id];
}
var $LENGTH = "length";

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
//DataManager._finallyQuene = [];
// DataManager._finallyHash = {};
DataManager.finallyRun = function(fun) {
	var finallyQuene = DataManager._finallyQuene || (DataManager._finallyQuene = []);
	if (fun) {
		$.p(finallyQuene, fun)
	} else {
		fun = finallyQuene.splice(0,1)[0]
		fun && fun()
	}
}
var _dm_force_update //= $FALSE;  //ignore equal
var DM_proto = DataManager.prototype = {
	get: function(key) { //
		var self = DataManager.session.topGetter = this,
			result = self._database;
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
			// if (lastKey!==$UNDEFINED) {
			// 	if (typeof result === "string" && /*parseInt(lastKey)*/ ~~lastKey === lastKey) { //avoid get NaN
			// 		result = result.charAt(lastKey)
			// 	} else if (result !== $UNDEFINED) {
			// 		result = result[lastKey]
			// 	}
			// }
			/*
		//避免混淆，不使用智能作用域，否则关键字更新触发器无法准确绑定或者会照常大量计算
		if (arrKey.length && (parent = self._parentDataManager)) { //key不在对象中，查询父级
			result = parent.get(key);
		}*/
			DataManager.session.filterKey = key;
		} else {
			DataManager.session.filterKey = $UNDEFINED;
		}
		if (result && result[_DM_extends_object_constructor]) {
			result = result.get(self);
		}
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
		DataManager.session.filterKey = key;

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
					if (self._database !== nObj || nObj instanceof Object || _dm_force_update) {
						self._database = nObj;
					};
					break;
				default: //find Object by the key-dot-path and change it
					if (_dm_force_update||nObj !== DM_proto.get.call(self, key) ) {
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
						if ((sObj = cache_n_Obj[lastKey]) && sObj[_DM_extends_object_constructor]) {
							sObj.set(nObj, self, key) //call ExtendsClass API
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
			// $.p(setStacks,self.id);
			result = $UNDEFINED; //var result
			var linkKey = "",
				__arrayLen = self.__arrayLen,
				__arrayData;
			arrKey && $.ftE(arrKey, function(maybeArrayKey) {
				linkKey = linkKey ? linkKey + "." + maybeArrayKey : maybeArrayKey;
				if ((__arrayData = DM_proto.get.call(self, linkKey)) instanceof Array && __arrayLen[linkKey] !== __arrayData.length) {
					// console.log(linkKey,__arrayData.length, __arrayLen[linkKey])
					__arrayLen[linkKey] = __arrayData.length
					result = self.touchOff(linkKey)
				}
			})
			if (!result && (__arrayData = self.get()) instanceof Array && __arrayLen[""] !== __arrayData.length) {
				__arrayLen[""] = __arrayData.length
				key = "";
			}
			// console.log(key)
			result = result || self.touchOff(key);
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
	touchOff: function(key) { //always touchoff from toppest dm
		var self = this,
			database = self._database;
		$.ftE($.s(_getAllSiblingDataManagers(self)), function(dm) {
			dm._database = database;//maybe on-obj
			dm._touchOff(key)
		})
	},
	_touchOff: function(key) {
		var self = this,
			parent = self._parentDataManager,
			triggerKeys = self._triggerKeys,
			updateKey = [key],
			chidlUpdateKey = [],
			allUpdateKey,
			triggerCollection;
		//child
		$.ftE(self._subsetDataManagers, function(childDataManager) {
			// debugger
			var prefix = childDataManager._prefix,
				childResult; // || "";
			_dm_force_update = $TRUE;
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
			$.p(chidlUpdateKey, childResult);
		});
		//self
		triggerKeys.forIn(function(triggerCollection, triggerKey) {
			//!triggerKey==true;
			if (!key || !triggerKey || key === triggerKey || triggerKey.indexOf(key + ".") === 0 || key.indexOf(triggerKey + ".") === 0) {
				// console.log("filter triggerKey:",triggerKey)
				$.p(updateKey, triggerKey)
				$.ftE(triggerCollection, function(smartTriggerHandle) {
					smartTriggerHandle.event(triggerKeys);
				})
			}
		});
		return {
			key: key,
			// allUpdateKey: allUpdateKey,
			updateKey: updateKey,
			chidlUpdateKey: chidlUpdateKey
		}
	},
	rebuildTree: $.noop,
	collect: function(dataManager) {
		var self = this
		if ($.iO(self._siblingDataManagers, dataManager) === -1) {
			$.p(self._siblingDataManagers, dataManager);
			$.p(dataManager._siblingDataManagers, self);
			self.rebuildTree()
			dataManager._database = self._database;
			// dataManager.touchOff("")
			dataManager.set(dataManager._database)
		}
		return self;
	},
	subset: function(dataManager, prefixKey) {
		var self = this;
		dataManager.remove();
		dataManager._prefix = prefixKey;
		dataManager._parentDataManager = self;
		$.p(self._subsetDataManagers, dataManager);
		dataManager._database = self.get(prefixKey);
		// dataManager.touchOff("");
		dataManager.set(dataManager._database)
		return self;
	},
	remove: function(dataManager) {
		var self = this;
		if (dataManager) {
			var subsetDataManagers = self._subsetDataManagers,
				index = $.iO(subsetDataManagers, dataManager);
			subsetDataManagers.splice(index, 1);
			dataManager._parentDataManager = $UNDEFINED;
		} else {
			dataManager = self._parentDataManager;
			if (dataManager) {
				subsetDataManagers = dataManager._subsetDataManagers
				index = $.iO(subsetDataManagers, self);
				subsetDataManagers.splice(index, 1);
				self._parentDataManager = $UNDEFINED;
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
	},
	buildGetter: function(key) {},
	buildSetter: function(key) {}
};