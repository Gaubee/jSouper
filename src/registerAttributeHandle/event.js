var _addEventListener = function(Element, eventName, eventFun) {
	Element.addEventListener(eventName, eventFun, false);
},
	_removeEventListener = function(Element, eventName, eventFun) {
		Element.removeEventListener(eventName, eventFun, false);
	},
	_attachEvent = function(Element, eventName, eventFun) {
		Element.attachEvent("on" + eventName, eventFun);
	},
	_detachEvent = function(Element, eventName, eventFun) {
		Element.detachEvent("on" + eventName, eventFun);
	},
	_registerEvent = _isIE ? _attachEvent : _addEventListener,
	_cancelEvent =_isIE ? _detachEvent : _removeEventListener,
	_ieEnterPlaceholder = "@" + Math.random().toString(36).substring(2),
	_ieEnterPlaceholderRegExp = RegExp(_ieEnterPlaceholder,"g"),
		_elementCache = [],
	eventListerAttribute = function(key, currentNode, parserNode) {
		var attrOuter = _getAttrOuter(parserNode),
			eventName =  key.replace("event-on", "").replace("event-", ""),
			eventFun = Function("return " + attrOuter.replace(_ieEnterPlaceholderRegExp,"\n"))(),
			index = $.indexOf(_elementCache, currentNode),
			eventCollection,
			oldEventFun;
		if (index === -1) {
			index = $.push(_elementCache, currentNode)
			_elementCache.event[index] = {};
		};
		eventCollection = _elementCache.event[index];
		if (oldEventFun = eventCollection[eventName]) {
			_cancelEvent(currentNode,eventName, oldEventFun)
		}
		_registerEvent(currentNode,eventName, eventFun);
		eventCollection[eventName] = eventFun;
	};
_elementCache.event = {};
V.registerAttrHandle(function(attrKey) {
	return attrKey.indexOf("event-") === 0;
}, function(attrKey) {
	return eventListerAttribute;
})