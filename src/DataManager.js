/*
 * DataManager constructor
 */
_hasOwn = Object.prototype.hasOwnProperty;

function DataManager(baseData) {
	var self = this;
	if (!(self instanceof DataManager)) {
		return new DataManager(baseData);
	}
	self._database = DataManager.flat(baseData);
	self._viewInstances = [];
	self._parentDataManager = null;
};
DataManager.flat = function(obj, prefixKey) {
	prefixKey = prefixKey || "";
	var hashTable = [];
	hashTable._data = {};
	$.forIn(obj, function(val, key) {
		key = prefixKey ? prefixKey + "." + key : key;
		hashTable._data[key] = val;
		$.push(hashTable, key);
		if (val instanceof Array) {
			hashTable[key + ".length"] = val.length;
		} else if (val instanceof Object) { //obj or fan
			$.forEach(val = DataManager.flat(val, key), function(key) {
				hashTable._data[key] = val._data[key];
				$.push(hashTable, key);
			})
		}
	});
	return hashTable;
};
DataManager.prototype = {
	get: function(key) {
		var dm = this;
		do {
			if (key in dm._database._data) {
				return dm._database._data[key];
			}
		} while (dm = dm._parentDataManager);
	},
	set: function(key, obj) {
		var dm = this,
			viewInstances,
			argsLen = arguments.length,
			hashTable,
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
			if (!database._hasOwn(key)) {
				$.push(database, key);
			}
			if (database[key] !== hashTable[key]) {
				database._data[key] = hashTable[key];
				do {
					viewInstances = dm._viewInstances;
					$.forEach(viewInstances, function(vi) {
						vi.touchOff(key);
					});
				} while (dm = dm._parentDataManager);
			}
		});
	},
	collect: function(viewInstance) {

	}
}