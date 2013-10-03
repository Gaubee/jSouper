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
	if (!(key in store)) {
		$.p(keys, key);
	}
	currentCollection = store[key] || (store[key] = []);
	if (value instanceof Array) {
		$.ftE(value,function(smartTriggerHandle){
			self.push(key,smartTriggerHandle);
		})
		// currentCollection.push.apply(currentCollection, value)
	} else if(value instanceof SmartTriggerHandle){
		$.p(currentCollection, value)
	}else{
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
/*
 * SmartTriggerHandle constructor
 */

function SmartTriggerHandle(key, triggerEvent, data) {
	var self = this,
		match = key;
	// if (!(match instanceof Function)) {
	// 	match = function(matchObj) {
	// 		return matchObj === key;
	// 	}
	// }
	// self.match = match;
	self.matchKey = String(key);
	self.TEMP = data;
	self.event = triggerEvent instanceof Function ? triggerEvent : $.noop;
	self.moveAble = SmartTriggerHandle.moveAble(self);
	self.smartTriggerSetCollection = [];
};
SmartTriggerHandle.moveAble = function(smartTriggerHandle) {
	return $TRUE;
};
SmartTriggerHandle.prototype = {
	// touchOff: function(matchKey) {
	// 	var self = this;
	// 	if (self.matchKey === matchKey) {
	// 		self.event()
	// 	}
	// 	return self;
	// },
	bind: function(smartTriggerSet, key) {
		var self = this;
		$.p(self.smartTriggerSetCollection, smartTriggerSet);
		smartTriggerSet.push(key === $UNDEFINED ? self.matchKey : key, self);
		return self;
	},
	unbind: function(smartTriggerSet) {
		var self = this,
			smartTriggerSetCollection = self.smartTriggerSetCollection,
			index = $.iO(smartTriggerSetCollection, smartTriggerSet);
		if (index !== -1) {
			smartTriggerSet.remove(self);
			smartTriggerSetCollection.splice(index, 1);
		}
		return self;
	}
};