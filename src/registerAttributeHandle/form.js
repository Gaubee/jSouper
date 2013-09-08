var _formKey = {
	"input": function(node) {
		var result = "value";
		// switch (node.type.toLowerCase()) {
		// 	case "button":
		// 	case "reset":
		// 	case "submit":
		// }
		return {
			attributeName: "value",
			eventName: "keyup"
		};
	},
	"button": "innerHTML"
},
	formListerAttribute = function(key, currentNode, parserNode, vi, dm, handle, triggerTable) {
		var attrOuter = _getAttrOuter(parserNode),
			eventConfig = _formKey[currentNode.tagName.toLowerCase()] || {
				attributeName: "innerHTML",
				eventName: "click"
			},
			uidAvator = "form-" + $.uidAvator,
			eventFun = dm.get(attrOuter);
		typeof eventConfig === "function" && (eventConfig = eventConfig(currentNode));
		if (currentNode[uidAvator]) {
			if (currentNode[eventConfig.attributeName] !== eventFun.valueOf()) {
				currentNode[eventConfig.attributeName] = eventFun.valueOf();
			}
			return;
		}
		if (typeof eventFun === "string") {
			_registerEvent(currentNode, eventConfig.eventName, function(e) {
				dm.set(attrOuter, this[eventConfig.attributeName])
			}, $FALSE);
			currentNode[eventConfig.attributeName] = eventFun.valueOf();
		}
		currentNode[uidAvator] = true;
		// 	eventName = key.replace("event-on", "").replace("event-", ""),
		// 	index = $.iO(_elementCache, currentNode),
		// 	eventCollection,
		// 	oldEventFun;
		// if (index === -1) {
		// 	index = $.p(_elementCache, currentNode)
		// 	_elementCache.event[index] = {};
		// };
		// eventCollection = _elementCache.event[index];
		// if (oldEventFun = eventCollection[eventName]) {
		// 	_cancelEvent(currentNode, eventName, oldEventFun)
		// }
		// _registerEvent(currentNode, eventName, eventFun);
		// eventCollection[eventName] = eventFun;
	};
V.ra("bind-form", function(attrKey) {
	return formListerAttribute;
})