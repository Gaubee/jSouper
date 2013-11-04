
var _elementCache = {},
	eventListerAttribute = function(key, currentNode, parserNode, vi/*, dm_id*/) {
		var attrOuter = _getAttrOuter(parserNode),
			eventName = key.replace("event-on", "").replace("event-", ""),
			eventFun = vi.get(attrOuter), //在重用函数的过程中会出现问题
			elementHashCode = $.hashCode(currentNode, "event"),
			eventCollection,
			oldEventFun;
		if (eventFun) {
			var wrapEventFun = function (e) {
				return eventFun.call(this,e,vi)
			}
			eventCollection = _elementCache[elementHashCode] || (_elementCache[elementHashCode] = {});
			if (oldEventFun = eventCollection[eventName]) {
				_cancelEvent(currentNode, eventName, oldEventFun, elementHashCode)
			}
			_registerEvent(currentNode, eventName, wrapEventFun, elementHashCode); 
			eventCollection[eventName] = wrapEventFun;
		}
	};

V.ra(function(attrKey) {
	return attrKey.indexOf("event-") === 0;
}, function(attrKey) {
	return eventListerAttribute;
})