var _event_cache = {},
	_addEventListener = function(Element, eventName, eventFun) {
		var args = $.s(arguments).splice(3),
			wrapEventFun = _event_cache[$.hashCode(eventFun)] = function() {
				var wrapArgs = $.s(arguments);
				Array.prototype.push.apply(wrapArgs, args);
				eventFun.apply(Element, wrapArgs)
			};
		Element.addEventListener(eventName, wrapEventFun, $FALSE);
	},
	_removeEventListener = function(Element, eventName, eventFun) {
		var wrapEventFun = _event_cache[$.hashCode(eventFun)];
		console.log(eventName,$.hashCode(eventFun),wrapEventFun)
		Element.removeEventListener(eventName, eventFun, $FALSE);
	},
	_attachEvent = function(Element, eventName, eventFun) {
		var args = $.s(arguments).splice(3),
			wrapEventFun = _event_cache[$.hashCode(eventFun)] = function() {
				var wrapArgs = $.s(arguments);
				Array.prototype.push.apply(wrapArgs, args);
				eventFun.apply(Element, wrapArgs)
			};
		Element.attachEvent("on" + eventName, wrapEventFun);
	},
	_detachEvent = function(Element, eventName, eventFun) {
		var wrapEventFun = _event_cache[$.hashCode(eventFun)];
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
		_registerEvent(currentNode, eventName, eventFun,vi);
		eventCollection[eventName] = eventFun;
	};

V.ra(function(attrKey) {
	return attrKey.indexOf("event-") === 0;
}, function(attrKey) {
	return eventListerAttribute;
})