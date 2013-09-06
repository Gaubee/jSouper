var _testDIV = $.DOM.clone(shadowDIV);
var _getAttrOuter = Function("n", "return n." + (_hasOwn.call(_testDIV, "textContent") ? "textContent" : "innerText") + "||''")
var _booleanFalseRegExp = /false|undefined|null|NaN/;

// var _ti,
// 	uidKey,
// 	_asynSetAttribute = function(obj, funName, key, value) {
// 		uidKey = $.uidAvator + key;
// 		if (!((_ti = obj[uidKey]) instanceof _asynSetAttributeFactory)) {
// 			_ti = obj[uidKey] = new _asynSetAttributeFactory(funName, key, value)
// 		}
// 		_ti.exports(obj, value);
// 	},
// 	_asynSetAttributeFactory = function(funName, key, value) {
// 		var self = this;
// 		self.funName = funName;
// 		self.key = key;
// 		self.value = value;
// 		self.exports = self._set;
// 	},
// 	_asynAttributeAssignment = function(obj, key, value) { //1450.000ms --> 1250.000ms ==>16% faster
// 		uidKey = $.uidAvator + key;
// 		if (!((_ti = obj[uidKey]) instanceof _asynAttributeAssignmentFactory)) {
// 			_ti = obj[uidKey] = new _asynAttributeAssignmentFactory(key, value)
// 		}
// 		_ti.exports(obj, value);
// 	},
// 	_asynAttributeAssignmentFactory = function(key, value) {
// 		var self = this;
// 		self.key = key;
// 		self.value = value;
// 		self.exports = self._set;
// 	};
// _asynSetAttributeFactory.prototype = {
// 	// funName: undefined, //undefined value will be rewrite to attribute but not in prototype
// 	// ~~obj:undefined,~~ //Avoid circular references, leading to memory leaks.
// 	// key: undefined,
// 	// value: undefined,
// 	// exports: undefined
// 	_cache: function(obj, newValue) {
// 		this.value = newValue;
// 	},
// 	_set: function(obj, newValue) {
// 		var self = this,
// 			funName = self.funName,
// 			key = self.key;
// 		setTimeout(function() {
// 			obj[funName](key, self.value);
// 			self.exports = self._set;
// 		}, 0);
// 		(self.exports = self._cache).call(self, obj, newValue);
// 	}
// }
// _asynAttributeAssignmentFactory.prototype = {
// 	_cache: function(obj, newValue) {
// 		this.value = newValue;
// 	},
// 	_set: function(obj, newValue) {
// 		var self = this,
// 			key = self.key;
// 		setTimeout(function() {
// 			obj[key] = self.value;
// 			self.exports = self._set;
// 		}, 0);
// 		(self.exports = self._cache).call(self, obj, newValue);
// 	}
// }
var _AttributeHandleEvent = {
	event: function(key, currentNode, parserNode) { //on开头的事件绑定，IE需要绑定Function类型，现代浏览器绑定String类型（_AttributeHandleEvent.com）
		var attrOuter = _getAttrOuter(parserNode);
		try {
			var attrOuterEvent = Function(attrOuter); //尝试编译String类型数据
		} catch (e) {
			attrOuterEvent = $.noop; //失败使用空函数替代
		}
		// _asynSetAttribute(currentNode, "setAttribute", key, attrOuterEvent)
		currentNode.setAttribute(key, attrOuterEvent);
	},
	style: function(key, currentNode, parserNode) {
		var attrOuter = _getAttrOuter(parserNode);
		// _asynSetAttribute(currentNode.style, "setAttribute", 'cssText', attrOuter)
		currentNode.style.setAttribute('cssText', attrOuter);
	},
	com: function(key, currentNode, parserNode) {
		var attrOuter = _getAttrOuter(parserNode);
		// _asynSetAttribute(currentNode, "setAttribute", key, attrOuter)
		currentNode.setAttribute(key, attrOuter)
	},
	dir: function(key, currentNode, parserNode) {
		var attrOuter = _getAttrOuter(parserNode);
		// _asynAttributeAssignment(currentNode, key, attrOuter);
		currentNode[key] = attrOuter;
	},
	bool: function(key, currentNode, parserNode) {
		var attrOuter = $.trim(_getAttrOuter(parserNode).replace(_booleanFalseRegExp, ""));

		if (attrOuter) {
			// currentNode.setAttribute(key, key);
			// _asynAttributeAssignment(currentNode, key, key);
			currentNode[key] = key;
		} else {
			// currentNode.removeAttribute(key);
			// _asynAttributeAssignment(currentNode, key, false);
			currentNode[key] = false;
		}
	}
};