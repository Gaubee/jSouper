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
		currentCollection.push.apply(currentCollection, value)
	} else {
		$.p(currentCollection, value)
	}
	return currentCollection.length;
};
SmartTriggerSet.prototype.touchOff = function(key){
	var self = this;
	$.ftE(self.get(key),function(smartTriggerHandle){
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
};
SmartTriggerHandle.moveAble = function(smartTriggerHandle){
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
	bind: function(smartTriggerSet) {
		var self = this;
		self.unbind().smartTriggerSet = smartTriggerSet;
		smartTriggerSet.push(self.matchKey,self);
		return self;
	},
	unbind: function() {
		var self = this;
		self.smartTriggerSet && self.smartTriggerSet.remove(self);
		return self;
	}
};
