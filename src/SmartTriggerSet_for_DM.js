/*
 * SmartTriggerSet constructor
 */

function SmartTriggerSet(data) {
	var self = this;
	self.keys = [];
	self.store = {};
	self.TEMP = data;
};
(SmartTriggerSet.prototype = $.c(ArraySet.prototype)).push = function(key, value) {
	var self = this,
		keys = self.keys,
		store = self.store,
		currentCollection;
	key = String(key);
	self.id=$.uid();
	if (!(key in store)) {
		$.p(keys, key);
	}
	currentCollection = store[key] || (store[key] = []);
	if (value instanceof Array) {
		$.ftE(value, function(smartTriggerHandle) {
			self.push(key, smartTriggerHandle);
		})
		// currentCollection.push.apply(currentCollection, value)
	} else if (value instanceof SmartTriggerHandle) {
		$.p(currentCollection, value)
	} else {
		console.warn("type error,no SmartTriggerHandle instance!");
	}
	return currentCollection.length;
};
SmartTriggerSet.prototype.touchOff = function(key) {
	var self = this;
	$.ftE(self.get(key), function(smartTriggerHandle) {
		smartTriggerHandle.event(self);
	});
	return self;
};
SmartTriggerSet.prototype.remove = function(smartTriggerHandle) {
	var self = this,
		key = smartTriggerHandle.matchKey,
		store = self.store,
		currentCollection = store[key];
	if (currentCollection) {
		var index = $.iO(currentCollection, smartTriggerHandle);
		$.sp.call(currentCollection,index,1);
	}
	return self;
}
/*
 * SmartTriggerHandle constructor
 */

function SmartTriggerHandle(key, triggerEvent, data) {
	var self = this,
		match = key;
	self.matchKey = String(key);
	self.TEMP = data;
	self.event = triggerEvent instanceof Function ? triggerEvent : $.noop;
	self.moveAble = SmartTriggerHandle.moveAble(self);
	self.STS_Collection = [];
};
SmartTriggerHandle.moveAble = function(smartTriggerHandle) {
	return $TRUE;
};
SmartTriggerHandle.prototype = {
	bind: function(smartTriggerSet, key) {
		var self = this;
		$.p(self.STS_Collection, smartTriggerSet);
		smartTriggerSet.push(key === $UNDEFINED ? self.matchKey : key, self);
		return self;
	},
	unbind: function(smartTriggerSet) {
		var self = this,
			STS_Collection = self.STS_Collection,
			index = $.iO(STS_Collection, smartTriggerSet);
		if (index !== -1) {
			smartTriggerSet.remove(self);
			STS_Collection.splice(index, 1);
		}
		return self;
	}
};