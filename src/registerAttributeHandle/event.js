var _addEventListener = function(Element, eventName, eventFun) {
	Element.addEventListener(eventName, eventFun, $FALSE);
},
	_removeEventListener = function(Element, eventName, eventFun) {
		Element.removeEventListener(eventName, eventFun, $FALSE);
	},
	_IE_event_cache = {},
	_attachEvent = function(Element, eventName, eventFun) {
		var wrapEventFun = _IE_event_cache[$.hashCode(eventFun)] = function() {
			eventFun.apply(Element, $.s(arguments))
		};
		Element.attachEvent("on" + eventName, wrapEventFun);
	},
	_detachEvent = function(Element, eventName, eventFun) {
		var wrapEventFun = _IE_event_cache[$.hashCode(eventFun)];
		eventFun && Element.detachEvent("on" + eventName, wrapEventFun);
	},
	_registerEvent = _isIE ? _attachEvent : _addEventListener,
	_cancelEvent = _isIE ? _detachEvent : _removeEventListener,
	_elementCache = {},
	eventListerAttribute = function(key, currentNode, parserNode, vi, dm) {
		var attrOuter = _getAttrOuter(parserNode),
			eventName = key.replace("event-on", "").replace("event-", ""),
			eventFun = dm.get(attrOuter), //Function("return " + attrOuter.replace(_ieEnterPlaceholderRegExp,"\n"))(),
			index = $.hashCode(currentNode),
			eventCollection,
			oldEventFun;

		eventCollection = _elementCache[index] || (_elementCache[index] = {});
		if (oldEventFun = eventCollection[eventName]) {
			_cancelEvent(currentNode, eventName, oldEventFun)
		}
		_registerEvent(currentNode, eventName, eventFun);
		eventCollection[eventName] = eventFun;
	};

V.ra(function(attrKey) {
	return attrKey.indexOf("event-") === 0;
}, function(attrKey) {
	return eventListerAttribute;
})