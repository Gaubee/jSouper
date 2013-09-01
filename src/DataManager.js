/*
 * DataManager constructor
 */
var _hasOwn = Object.prototype.hasOwnProperty;

function DataManager(baseData, viewInstance) {
	var self = this;
	if (!(self instanceof DataManager)) {
		return new DataManager(baseData, viewInstance);
	}
	baseData = baseData || {};
	// (self._database = [])._data = {};
	self.id = $.uid();
	self._database = DataManager.flat(baseData);
	// console.log(viewInstance)
	self._viewInstances = viewInstance ? [viewInstance] : []; //to touch off
	self._parentDataManager = null; //to get data
	self._subsetDataManagers = []; //to touch off
	(self._arrayDateManagers = [])._ = {}; //Chain
	self._unknownKey = [];
	// baseData&&self.set(baseData);
	$.unique(self._database);
};

global.DataManager = DataManager;
DataManager.flat = function(obj, prefixKey) {
	prefixKey = prefixKey || "";
	var hashTable = [];
	hashTable._data = {};
	if (obj instanceof Object) {
		if (obj instanceof Array) {
			var lenKey = prefixKey + ".length"
			$.push(hashTable, lenKey);
			hashTable._data[lenKey] = obj.length;
			// obj = $.create(obj);
		} else {
			$.forIn(obj, function(val, key) {
				key = prefixKey ? prefixKey + "." + key : key;
				hashTable._data[key] = val;
				$.push(hashTable, key);
				if (val instanceof Object) {
					$.forEach(val = DataManager.flat(val, key), function(key) {
						hashTable._data[key] = val._data[key];
						$.push(hashTable, key);
					})
				}
			});
		}
	}
	if (!prefixKey) {
		$.push(hashTable, "$THIS");
		hashTable._data["$THIS"] = obj;
	}
	($.indexOf(hashTable, prefixKey) === -1) && $.push(hashTable, prefixKey);
	hashTable._data[prefixKey] = obj;

	return hashTable;
};
DataManager.touchOffQueue = function(key) {
	var arrKey = key.split("."),
		result = [key];
	$.fastEach(arrKey, function(nodeKey, index) {
		$.push(result, $.slice(arrKey).splice(0, index).join("."));
	})
	return result;
};
// DataManager.fold = function(key, obj) {@@ // 	var arrKey = key.split("."),@@ // 		result = [];@@ // 	result._data = {};@@ @@// 	for (var i = arrKey.length, newkey, lastKey, cacheObj = {}; i > 0; i -= 1, cacheObj = {}) {@@ // 		lastKey = arrKey.pop();@@ // 		newkey = arrKey.join(".")@@ // 		$.push(result, newkey);@@ // 		cacheObj[lastKey] = obj;@@ // 		result._data[newkey] = cacheObj;@@ // 		obj = cacheObj;@@ // 	}@@ // 	return result@@ // };@@ 
DataManager.foldObj = function(key, obj) {
	var arrKey = key.split(".");
	for (var i = arrKey.length, newkey, lastKey, cacheObj = {}; i > 0; i -= 1, cacheObj = {}) {
		lastKey = arrKey.pop();
		cacheObj[lastKey] = obj;
		obj = cacheObj;
	}
	return obj
};
var _arrIndexReg = /(\.([0-9]+))\./;
DataManager.prototype = {
	get: function(key) {
		var dm = this,
			dmBak = dm,
			parentDM_mark = "$PARENT.",
			key = key || "";
		// key = key === "$THIS" ? "" : key;
		// if (!key) {
		// 	return dm._database._data;
		// }
		if (key.indexOf("$PARENT.")) {
			do {
				if (_hasOwn.call(dm._database._data, key)) {
					return dm._database._data[key];
				}
			} while (dm = dm._parentDataManager);
			// var keyArr = key.split(_arrIndexReg),
			var keyArr = key + ".",
				result;
			// if (keyArr.length > 1) {
			keyArr.replace(_arrIndexReg, function(w, dotIndex, index, i) {
				var preKey = keyArr.substring(0, i),
					dotKey = preKey + dotIndex,
					maybeArr = dmBak.get(preKey),
					maybeDm;
				if ((maybeArr instanceof Array)) { //Chain
					// console.log(dotKey,key.substring(i))
					if (!(dotKey in dmBak._arrayDateManagers._) && (index in maybeArr)) {
						maybeDm = dmBak._arrayDateManagers._[dotKey] = DataManager(maybeArr[index]);
						maybeDm._viewInstances = dmBak._viewInstances;
						maybeDm._prefix = (dmBak._prefix ? dmBak._prefix + "." : "") + dotKey;
						$.push(dmBak._arrayDateManagers, dotKey);
					}
					if (maybeDm = dmBak._arrayDateManagers._[dotKey]) {
						result = maybeDm.get(key.substring(i + dotIndex.length + 1))
					}
				}
			});
		} else {
			result = dm._parentDataManager.get(key.replace(parentDM_mark, ""));
		}
		if (result === undefined) { //Unknown key to manually trigger, whether it is unable to update the data.
			// console.log(dm)
			if ($.indexOf(dmBak._unknownKey, key) === -1) {
				$.push(dmBak._unknownKey, key)
			}
		}
		return result;
	},
	set: function(key, obj) {
		var dm = this,
			viewInstances,
			argsLen = arguments.length,
			hashTable = [],
			updataKey = ["$THIS"],
			database = dm._database,
			arrayDateManagers = dm._arrayDateManagers;

		switch (argsLen) {
			case 0:
				return;
			case 2:
				// dm.set();
				key = DataManager.foldObj(key, obj);
			default:
				obj = key;
				if (obj instanceof Object) {
					hashTable = DataManager.flat(obj);
				} else {
					hashTable._data = {};
					$.push(hashTable, "");
					$.push(hashTable, "$THIS");
					hashTable._data[""] = obj;
					hashTable._data["$THIS"] = obj;
				}
		}

		$.forEach(hashTable, function(key) {
			var val = hashTable._data[key];
			if ($.indexOf(database, key) === -1) {
				$.push(database, key);
			}

			if (database._data[key] !== val || (val instanceof Object)) {
				database._data[key] = val;
				if (dm._prefix) {
					if (key) {
						key = dm._prefix + "." + key
					} else {
						key = dm._prefix
					}
				}
				// $.push(updataKey, key)
				// dm._touchOffSubset(key);
				updataKey.push.apply(updataKey, DataManager.touchOffQueue(key));
			}
			$.fastEach(arrayDateManagers, function(arrDM_key) {
				if (dm._prefix) {
					key = key.replace(dm._prefix + ".", "");
				}
				if (arrDM_key.indexOf(key) === 0) {
					var arrDM = arrayDateManagers._[arrDM_key],
						index = arrDM_key.substring(key.length + 1);
					if (database._data[key]) { // The structure may be changed
						arrDM.set(database._data[key][index]); //iteration trigger
					}
				}
			});
		});
		var i, unKeys, unknownKey, len;
		for (i = 0, unKeys = dm._unknownKey, unknownKey, len = unKeys.length; i < len;) {
			unknownKey = unKeys[i];
			if (dm.get(unknownKey) !== undefined) {
				// $.push(updataKey, unknownKey)
				// dm._touchOffSubset(unknownKey);
				updataKey.push.apply(updataKey, DataManager.touchOffQueue(unknownKey));
				unKeys.splice(i, 1);
				len -= 1;
			} else {
				i += 1;
			}
		}
		// console.log(updataKey)
		updataKey = $.unique(updataKey)
		$.fastEach(updataKey, function(key) {
			dm._touchOffSubset(key);
		});
		return updataKey;;
	},
	_touchOffSubset: function(key) {
		$.forEach(this._subsetDataManagers, function(dm) {
			dm._touchOffSubset(key);
		});
		// $.forEachDyna(this._viewInstances, function(vi) { //use forEachDyna --> attr-vi will be pushin when vi._isAttr.bindHandle files
		// 	if (vi._isAttr) {
		// 		// console.log("building attribute value!")//DEBUG
		// 		$.forEach(vi._triggers, function(key) {
		// 			vi.touchOff(key);
		// 		});
		// 		vi._isAttr.bindHandle(vi, vi.dataManager);
		// 		vi.dataManager.remove(vi);
		// 	} else {
		// 		vi.touchOff(key);
		// 	}
		// });
		var i, vis, vi, len;
		for (i = 0, vis = this._viewInstances, vi, len = vis.length; vi = vis[i];) {
			if (vi._isAttr) {
				// console.log("building attribute value!")//DEBUG
				$.forEach(vi._triggers, function(key) {
					vi.touchOff(key);
				});
				vi._isAttr.setAttribute(vi, vi.dataManager);
				vi.dataManager.remove(vi);
			} else {
				vi.touchOff(key);
				i += 1;
			}
		}
	},
	collect: function(viewInstance) {
		var dm = this;
		if ($.indexOf(dm._viewInstances, viewInstance) === -1) {
			viewInstance.dataManager && viewInstance.dataManager.remove(viewInstance);
			$.push(dm._viewInstances, viewInstance);
			viewInstance.dataManager = dm;
		}
		return dm;
	},
	subset: function(baseData, viewInstance) {
		var subsetDataManager = DataManager(baseData, viewInstance);
		subsetDataManager._parentDataManager = this;
		if (viewInstance instanceof ViewInstance) {
			viewInstance.dataManager = subsetDataManager;
			viewInstance.reDraw();
		}
		$.push(this._subsetDataManagers, subsetDataManager);
		return subsetDataManager; //subset(vi).set(basedata);
	},
	remove: function(viewInstance) {
		var dm = this,
			vis = dm._viewInstances,
			index = $.indexOf(vis, viewInstance);
		if (index !== -1) {
			vis.splice(index, 1);
		}
	}
};