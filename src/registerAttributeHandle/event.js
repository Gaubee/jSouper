
var _elementCache = {},
	eventListerAttribute = function(key, currentNode, parserNode, vi, dm) {
		var attrOuter = _getAttrOuter(parserNode),
			eventName = key.replace("event-on", "").replace("event-", ""),
			eventFun = dm.get(attrOuter), //在重用函数的过程中会出现问题
			elementHashCode = $.hashCode(currentNode, "event"),
			eventCollection,
			oldEventFun;
		if (eventFun) {
			eventCollection = _elementCache[elementHashCode] || (_elementCache[elementHashCode] = {});
			if (oldEventFun = eventCollection[eventName]) {
				_cancelEvent(currentNode, eventName, oldEventFun, elementHashCode)
			}
			_registerEvent(currentNode, eventName, eventFun, elementHashCode, vi); //只能定位到属性操作的VI，需要重新构架！！如果完成这个，则_isEach的each元素需要全新的ViewInstance方法，包括remove等来调整次序
			eventCollection[eventName] = eventFun;
		}
	};

V.ra(function(attrKey) {
	return attrKey.indexOf("event-") === 0;
}, function(attrKey) {
	return eventListerAttribute;
})