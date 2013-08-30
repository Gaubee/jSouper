var _testDIV = $.DOM.clone(shadowDIV);
var _getAttrOuter = Function("n", "return n." + (_hasOwn.call(_testDIV, "textContent") ? "textContent" : "innerText") + "||''")
var _booleanFalseRegExp = /false|undefined|null|NaN/;

var _ti,
	uidKey,
	_asynSetAttribute = function(obj, funName, key, value) {
		var uidKey = $.uidAvator + key;
		if (_ti = obj[uidKey]) {
			clearTimeout(_ti)
		}
		obj[uidKey] = setTimeout(function() {
			obj[funName](key, value);
			obj[$.uidAvator] = 0;
		}, 0)
	},
	_asynAttributeAssignment = function(obj, key, value) {
		var uidKey = $.uidAvator + key;
		if (_ti = obj[uidKey]) {
			clearTimeout(_ti)
		}
		obj[uidKey] = setTimeout(function() {
			obj[key] = value;
		}, 0)
	};

var _AttributeHandleEvent = {
	event: function(key, currentNode, parserNode) {
		var attrOuter = _getAttrOuter(parserNode);
		try {
			// console.log("event building:",attrOuter)//DEBUG
			var attrOuterEvent = Function(attrOuter);
			// console.log("event build success!")//DEBUG
		} catch (e) {
			// console.log("event build error !")//DEBUG
			attrOuterEvent = $.noop;
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
		_asynSetAttribute(currentNode,"setAttribute",key, attrOuter)
		// currentNode.setAttribute(key, attrOuter)
	},
	//---------
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