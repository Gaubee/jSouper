var _elementCache = {},
	eventListerAttribute = function(key, currentNode, attrVM, vi /*, dm_id*/ , handle, triggerTable) {
		var attrOuter = _getAttrOuter(attrVM),
			eventInfos = key.replace("event-", "").toLowerCase().split("-"),
			eventName = eventInfos.shift(), //Multi-event binding
			elementHashCode = $.hashCode(currentNode, "event" + eventInfos.join("-"));
		if (eventName.indexOf("on") === 0) {
			eventName = eventName.substr(2)
		}
		var eventCollection = _elementCache[elementHashCode];
		if (!eventCollection) { //init Collection
			eventCollection = _elementCache[elementHashCode] = {}
		}
		var wrapEventFun = eventCollection[eventName]
		if (!wrapEventFun) { //init Event and register event
			wrapEventFun = eventCollection[eventName] = function(e) {
				//因为事件的绑定是传入事件所在的key，所以外部触发可能只是一个"."类型的字符串
				//没法自动更新eventFun，只能自动更新eventName，因此eventFun要动态获取
				var vi = wrapEventFun.vi;
				var eventFun = vi.get(wrapEventFun.attrOuter) || $.noop;
				var self = this;
				var result;
				if (e._before) {
					result = e._before.call(self, e, vi);
					if (result) {
						result = eventFun.apply(result.ele, result.args);
					}
				} else {
					result = eventFun.call(this, e, vi)
				}
				return result;
			}
			_registerEvent(currentNode, eventName, wrapEventFun, elementHashCode);
		}
		wrapEventFun.eventName = eventName;
		wrapEventFun.attrOuter = attrOuter;
		// console.log(vi.get());
		wrapEventFun.vi = vi;
	};

V.ra(function(attrKey) {
	return attrKey.indexOf("event-") === 0;
}, function(attrKey) {
	return eventListerAttribute;
})