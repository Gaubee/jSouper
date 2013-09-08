/*
 * Controller constructor
 */
// var _hasOwn = Object.prototype.hasOwnProperty;

function Controller(baseData, viewInstance) {};
Controller._initGetData = function() {
	var self = this;
	self.valueOf = self.toString;
	return self.value = self.get();
};
Controller._getData = function() {
	return this.value
};

var Proto = Controller.Observer = function(obs) {
	var self = this;
	if (!(this instanceof Controller.Observer)) {
		return new Controller.Observer(obs);
	}
	if (obs instanceof Function) {
		self.get = obs;
		self.set = $.noop; //默认更新value并触发更新
		self.form = $NULL;
	} else {
		self.get = obs.get || function() {
			return self.value
		};
		self.set = obs.set || $.noop;
		self.form = obs.form || $NULL;
	}
	self.value;
	self.valueOf = Controller._initGetData;
	self.toString = Controller._getData;
};
