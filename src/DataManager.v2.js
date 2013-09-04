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
	// self.id = $.uid();
	self._database = baseData;
	self._cacheData = {};
	// console.log(viewInstance)
	self._viewInstances = viewInstance ? [viewInstance] : []; //to touch off
	self._parentDataManager = null; //to get data
	self._subsetDataManagers = []; //to touch off
	(self._arrayDateManagers = [])._ = {}; //Chain
	self._triggerKeys = [];
	self._cachestatus = true;
};

global.DataManager = DataManager;

DataManager.fold = function(key, obj) {
	var arrKey = key.split("."),
		result = [];
	result._data = {};

	for (var i = arrKey.length, newkey, lastKey, cacheObj = {}; i > 0; i -= 1, cacheObj = {}) {
		lastKey = arrKey.pop();
		newkey = arrKey.join(".")
		$.push(result, newkey);
		cacheObj[lastKey] = obj;
		result._data[newkey] = cacheObj;
		obj = cacheObj;
	}
	return result
};
DataManager.foldObj = function(key, obj) {
	var arrKey = key.split(".");
	for (var i = arrKey.length, newkey, lastKey, cacheObj = {}; i > 0; i -= 1, cacheObj = {}) {
		lastKey = arrKey.pop();
		cacheObj[lastKey] = obj;
		obj = cacheObj;
	}
	return obj
};
DataManager.mix = function(sobj, nobj, coverArry) {
	if (nobj instanceof Object) {
		if (sobj instanceof Array) {
			if (coverArry && nobj instanceof Array) {
				sobj = nobj;
			} else {
				$.forIn(nobj, function(val, key) {
					// if (key !== "length") {
					sobj[key] = val;
					// }
				})
			}
		} else if (sobj instanceof Object) {
			$.forIn(nobj, function(val, key) {
				sobj[key] = val;
			})
		} else {
			sobj = nobj;
		}
	} else {
		sobj = nobj;
	}
	return sobj;
};
var _arrIndexReg = /(\.([0-9]+))\./;
DataManager.prototype = {
	get: function(key) {
		var self = this,
			baseData = self._database,
			cacheData = self._cacheData,
			result = baseData;
		if (self._cachestatus) {
			if((result = cacheData[key])===undefined){
				self._cachestatus = false;//关闭缓存系统
				result = cacheData[key] = self.get(key);
				self._cachestatus = true;//重新打开缓存系统
			}
		}else{
			var arrKey = key.split(".");
			do{
				result = result[arrKey.splice(0,1)];
			}while(result&&arrKey.length);
			cacheData[key] = result;
		}
		return result;
	},
	set: function(key, obj) {
	},
	_touchOffSubset: function(key) {
	},
	collect: function(viewInstance) {
	},
	subset: function(baseData, viewInstance) {
	},
	remove: function(viewInstance) {
	}
};

//-----------test-------------

var d  = DataManager({
	name:"Gaubee Bangeel",
	detial:{
		firstName:"gaubee",
		lastName:"bangeel"
	}
});
console.log(d.get("detial.firstName"))
console.log(d.get("detial.firstName"))
console.log(d.get("detial.lastName"))
console.log(d.get("name"))
console.log(d)