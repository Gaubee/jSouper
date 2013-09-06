var Controller = function(dataManager, statementRelations) {
	var self = this;
	if (!(self instanceof Controller)) {
		return new Controller(dataManager, statementRelations);
	}
	if (statementRelations === $UNDEFINED) {
		statementRelations = dataManager;
		dataManager = [];
	}
	if (!(dataManager instanceof Array)) {
		if (!(dataManager instanceof DataManager)) {
			dataManager = DataManager(dataManager);
		}
		dataManager = [dataManager];
	};

	(self.dataManager = $.s(dataManager)).unshift(DataManager(statementRelations));

	// $.ftE(self.dataManager,function(dm){
	// 	Controller.Soap(dm);
	// });

	var exportsDM = self.exports();
	// console.log(exportsDM.id, exportsDM._triggerKeys)
	var observerArr = Controller.flatFn(exportsDM._database);
	$.ftE(observerArr, function(fnKey) {
		console.log("fnKey: ",fnKey)
		Controller.relyOn.upPack(fnKey, observerArr._[fnKey].get, exportsDM, dataManager)();
	});
};
Controller.flatFn = function(obj, prefixKey) {
	prefixKey = prefixKey || "";
	var hashTable = [];
	hashTable._ = {};
	if (obj instanceof Object) {
		if (obj instanceof Controller.Observer) {
			$.p(hashTable, prefixKey);
			hashTable._[prefixKey] = obj;
		} else if (obj instanceof Array) {
			$.ftE(obj,function(item,index){
				index = prefixKey ? prefixKey + "." + index : index;
				var substrHashTable = Controller.flatFn(item,index);
				$.ftE(substrHashTable,function(substrKey){
					$.p(hashTable,substrKey);
					hashTable._[substrKey] = substrHashTable._[substrKey]
				})
			});
		} else {
			$.fI(obj, function(val, key) {
				key = prefixKey ? prefixKey + "." + key : key;
				var substrHashTable = Controller.flatFn(val,key);
				$.ftE(substrHashTable,function(substrKey){
					$.p(hashTable,substrKey);
					hashTable._[substrKey] = substrHashTable._[substrKey]
				})
			});
		}
	}
	return hashTable;
};
Controller.Observer = function(obs) {
	var self = this;
	if (!(this instanceof Controller.Observer)) {
		return new Controller.Observer(obs);
	}
	if (obs instanceof Function) {
		self.get = obs;
		self.set = $.noop;
	} else {
		self.get = obs.get;
		self.set = obs.set;
	}
};
(function Soap() { //速补——《云图Cloud Atlas》
	var proto = DataManager.prototype,
		_set = proto.set,
		_get = proto.get;
	proto.set = function() {
		var relys = Controller.relyOn.container[this.id],
			updataKey = _set.apply(this, $.s(arguments))
			relys && $.ftE(updataKey, function(key) {
				if (key = relys[key]) {
					$.ftE(key, function(fn) {
						fn();
					})
				}
			});
	};
	proto.get = function(key) {
		var relyOn = Controller.relyOn,
			id = this.id;
		if (relyOn.status) {
			$.p(relyOn.cache[id] || (relyOn.cache[id] = []), key);
		}
		return _get.apply(this, $.s(arguments))
	};
})();
Controller.relyOn = {
	status: $FALSE,
	container: {},
	cache: {},
	pickUp: function(dm, fun) {
		var self = this;
		$.fI(self.cache, function(keys, id) {
			var con = self.container[id] || (self.container[id] = {});
			$.ftE(keys, function(key) {
				var fns = con[key]
				if (fns && $.iO(fns, fun) === -1) {
					$.p(fns, fun)
				} else {
					$.p((con[key] = []), fun)
				}
			});
		});
		self.cache = {};
	},
	upPack: function(fnKey, fn, sdm, dms) {
		var relyOn = this;

		function upPackFn() {
			relyOn.status = $TRUE;
			var result = fn.apply(sdm, dms);
			relyOn.status = $FALSE;
			console.log(sdm.id, relyOn.cache)
			relyOn.pickUp(sdm, upPackFn);
			sdm.set(fnKey, result);
			// return result;
		}
		return upPackFn;
	}
}

Controller.prototype.find = function(prefix) {
	var self = this,
		dataManager = self.dataManager,
		result = [];
	$.ftE(dataManager, function(dm) {
		var data = dm.get(prefix);
		if (data) {
			if (!(data instanceof Array)) {
				data = [data];
			}
			result.push.apply(result, data);
		}
	});
	return result;
};
Controller.prototype.findOne = function(prefix) {
	var self = this,
		dataManager = self.dataManager,
		result;
	$.fE(dataManager, function(dm) {
		if (result = dm.get(prefix)) {
			return $FALSE;
		}
	});
	return result;
};
Controller.prototype.exports = function() {
	var self = this,
		dataManager = self.dataManager,
		i = dataManager.length - 1,
		result = dataManager[i];

	for (; i > 0; i -= 1) {
		var cache = $.c(dataManager[i - 1])
		cache._parentDataManager = result;
		result = cache;
	}
	self.exports = function() {
		return result;
	}
	return result;
};
Controller.prototype.set = function() {
	var self = this,
		dm = this.exports();
	return dm.set.apply(dm, $.s(arguments));
}
Controller.prototype.get = function() {
	var self = this,
		dm = this.exports();
	return dm.get.apply(dm, $.s(arguments));
}