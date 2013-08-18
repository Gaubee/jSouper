/*
 * DataManager constructor
 */
_hasOwn = Object.prototype.hasOwnProperty;

function DataManager(baseData, viewInstance) {
	var self = this;
	if (!(self instanceof DataManager)) {
		return new DataManager(baseData, viewInstance);
	}
	baseData = baseData || {};
	self._database = DataManager.flat(baseData);
	// console.log(viewInstance)
	self._viewInstances = viewInstance ? [viewInstance] : []; //to touch off
	self._parentDataManager = null; //to get data
	self._subsetDataManagers = []; //to touch off
};
DataManager.flat = function(obj, prefixKey) {
	prefixKey = prefixKey || "";
	var hashTable = [];
	hashTable._data = {};
	if (obj instanceof Object) {
		if (obj instanceof Array) {
			var lenKey = prefixKey + ".length"
			$.push(hashTable, lenKey);
			hashTable._data[lenKey] = obj.length;
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
	if (prefixKey) {
		$.push(hashTable, prefixKey);
		hashTable._data[prefixKey] = obj;
	}

	return hashTable;
};
DataManager.prototype = {
	get: function(key) {
		var dm = this,
			parentDM_mark = "$PARENT.";
		if (key.indexOf("$PARENT.")) {
			do {
				if (_hasOwn.call(dm._database._data, key)) {
					return dm._database._data[key];
				}
			} while (dm = dm._parentDataManager);
		} else {
			return dm._parentDataManager.get(key.replace(parentDM_mark, ""));
		}
	},
	set: function(key, obj) {
		var dm = this,
			viewInstances,
			argsLen = arguments.length,
			hashTable = [],
			database = this._database;

		switch (argsLen) {
			case 0:
				return;
			case 1:
				if (key instanceof Object) {
					hashTable = DataManager.flat(key);
				}
				break;
			default:
				hashTable = DataManager.flat(obj, key);
		}
		
		$.forEach(hashTable, function(key) {
			var val = hashTable._data[key];
			if ($.indexOf(database, key) === -1) {
				$.push(database, key);
			}

			if (database._data[key] !== val || (val instanceof Object)) {
				database._data[key] = val;
				dm._touchOffSubset(key);
			}
		});
	},
	_touchOffSubset: function(key) {
		$.forEachDyna(this._viewInstances, function(vi) { //use forEachDyna --> attr-vi will be pushin when vi._isAttr.bindHandle files
			if (vi._isAttr) {
				$.forEach(vi._triggers, function(key) {
					vi.touchOff(key);
				});
				vi._isAttr.bindHandle(vi.dataManager);
			} else {
				vi.touchOff(key);
			}
		});
		$.forEach(this._subsetDataManagers, function(dm) {
			dm._touchOffSubset(key);
		});
	},
	collect: function(viewInstance) {
		var dm = this;
		if ($.indexOf(dm._viewInstances, viewInstance) === -1) {
			viewInstance.dataManager.remove(viewInstance);
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
}