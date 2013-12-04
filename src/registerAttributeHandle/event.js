var _elementCache = {},
	eventListerAttribute = function(key, currentNode, parserNode, vi /*, dm_id*/ ) {
		var attrOuter = _getAttrOuter(parserNode),
			eventInfos = key.replace("event-", "").toLowerCase().split("-"),
			eventName = eventInfos.shift(), //Multi-event binding
			eventFun = vi.get(attrOuter) || $.noop, //can remove able
			elementHashCode = $.hashCode(currentNode, "event" + eventInfos.join("-"));
		if (eventName.indexOf("on") === 0) {
			eventName = eventName.substring(2)
		}
		var eventCollection = _elementCache[elementHashCode];
		if (!eventCollection) { //init Collection
			eventCollection = _elementCache[elementHashCode] = {}
		}
		var wrapEventFun = eventCollection[eventName]
		if (!wrapEventFun) { //init Event and register event
			wrapEventFun = eventCollection[eventName] = function(e) {
				return wrapEventFun.eventFun.call(this, e, vi)
			}
			_registerEvent(currentNode, eventName, wrapEventFun, elementHashCode);
		}
		wrapEventFun.eventFun = eventFun;
	};

V.ra(function(attrKey) {
	return attrKey.indexOf("event-") === 0;
}, function(attrKey) {
	return eventListerAttribute;
})