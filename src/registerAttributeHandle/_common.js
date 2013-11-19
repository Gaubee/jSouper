var _testDIV = $.D.cl(shadowDIV),
	_getAttrOuter = Function("n", "return n." + (("textContent" in _testDIV) ? "textContent" : "innerText") + "||''"),
	_booleanFalseRegExp = /false|undefined|null|NaN/; //fix ie

var _AttributeHandleEvent = {
	event: function(key, currentNode, parserNode) { //on开头的事件绑定，IE需要绑定Function类型，现代浏览器绑定String类型（_AttributeHandleEvent.com）
		var attrOuter = _getAttrOuter(parserNode);
		try {
			var attrOuterEvent = Function(attrOuter); //尝试编译String类型数据
		} catch (e) {
			attrOuterEvent = $.noop; //失败使用空函数替代
		}
		currentNode.setAttribute(key, attrOuterEvent);
	},
	style: function(key, currentNode, parserNode) {
		var attrOuter = _getAttrOuter(parserNode);
		currentNode.style.setAttribute('cssText', attrOuter);
	},
	com: function(key, currentNode, parserNode) {
		var attrOuter = _getAttrOuter(parserNode);
		if (currentNode.getAttribute(key) !== attrOuter) {
			currentNode.setAttribute(key, attrOuter)
		}
	},
	dir: function(key, currentNode, parserNode) {
		var attrOuter = _getAttrOuter(parserNode);
		if (currentNode[key] !== attrOuter) {
			currentNode[key] = attrOuter;
		}
	},
	bool: function(key, currentNode, parserNode) {
		var attrOuter = $.trim(_getAttrOuter(parserNode).replace(_booleanFalseRegExp, ""));
		// console.log("key:", key, "attrOuter:", attrOuter)
		if (attrOuter) { // currentNode.setAttribute(key, key);
			currentNode[key] = key;
		} else { // currentNode.removeAttribute(key);
			currentNode[key] = $FALSE;
		}
	},
	radio: function(key, currentNode, parserNode) { //radio checked
		var attrOuter = _getAttrOuter(parserNode);
		if (attrOuter === currentNode.value) {
			currentNode[key] = attrOuter;
		}
	}
};
if (_isIE) {
	var __radio = _AttributeHandleEvent.radio;
	_AttributeHandleEvent.radio = function(key, currentNode, parserNode) {
		var attrOuter = $.trim(_getAttrOuter(parserNode).replace(_booleanFalseRegExp, ""));
		console.log("IE checked", attrOuter)
		if (attrOuter === currentNode.value) {
			currentNode.defaultChecked = attrOuter;
		} else {
			currentNode.defaultChecked = $FALSE;
		}
		(this._attributeHandle = __radio)(key, currentNode, parserNode);
	}
	var __bool = _AttributeHandleEvent.bool;
	_AttributeHandleEvent.bool = function(key, currentNode, parserNode) {
		var attrOuter = $.trim(_getAttrOuter(parserNode).replace(_booleanFalseRegExp, ""));
		console.log("IE selected", attrOuter)
		if (attrOuter) {
			currentNode.defaultChecked = attrOuter;
		} else {
			currentNode.defaultChecked = $FALSE;
		}
		(this._attributeHandle = __bool)(key, currentNode, parserNode);
	}
}