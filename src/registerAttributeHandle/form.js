/*
 *form-bind只做绑定form处理事件，value绑定需要另外通过attr-value={(XX)}来绑定，避免重复
 */
var _formCache = {},
	_formKey = {
		"input": function(node) {
			var result = "value";
			// switch (node.type.toLowerCase()) {
			// 	case "button":
			// 	case "reset":
			// 	case "submit":
			// }
			return {
				attributeName: "value",
				eventNames: ["keyup", "change"]
			};
		},
		"button": "innerHTML"
	}, _noopFormHandle = function(e, newValue) {
		return newValue
	},
	formListerAttribute = function(key, currentNode, parserNode, vi, dm, handle, triggerTable) {
		var attrOuter = _getAttrOuter(parserNode),
			eventConfig = _formKey[currentNode.tagName.toLowerCase()] || {
				attributeName: "innerHTML",
				eventNames: ["click"]
			},
			eventNames,
			index = $.hashCode(currentNode, "form"),
			formCollection,
			oldFormHandle,
			newFormHandle,
			obj = dm.get(attrOuter, $NULL);
		typeof eventConfig === "function" && (eventConfig = eventConfig(currentNode));
		eventNames = eventConfig.eventNames;

		formCollection = _formCache[index] || (_formCache[index] = {});
		$.ftE(eventNames, function(eventName) {
			if (oldFormHandle = formCollection[eventName]) {
				_cancelEvent(currentNode, eventName, oldFormHandle)
			}
			if (obj instanceof Proto) {
				var baseFormHandle = obj.form === $NULL ? _noopFormHandle : obj.form;
				newFormHandle = function(e) {
					dm.set(attrOuter, baseFormHandle.call(this, e, this[eventConfig.attributeName], vi))
				};
				_registerEvent(currentNode, eventName, newFormHandle);
			} else if (typeof obj === "string") {
				newFormHandle = function(e) {
					dm.set(attrOuter, this[eventConfig.attributeName])
				};
				_registerEvent(currentNode, eventName, newFormHandle);
			}
			formCollection[eventName] = newFormHandle;
		});
	};
V.ra("bind-form", function(attrKey) {
	return formListerAttribute;
})