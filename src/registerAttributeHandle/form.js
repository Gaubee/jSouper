/*
 *form-bind只做绑定form处理事件，value绑定需要另外通过attr-value={(XX)}来绑定，避免重复
 */
var _formCache = {},
	_formKey = {
		"input": function(node) { //需阻止默认事件，比如Checked需要被重写，否则数据没有变动而Checked因用户点击而变动，没有达到V->M的数据同步
			var result = "value";
			switch (node.type.toLowerCase()) {
				case "checkbox":
					return {
						attributeName: "checked",
						eventNames: ["change"]
					}
				case "button":
				case "reset":
				case "submit":
			}
			return {
				attributeName: "value",
				eventNames: _isIE ? ["propertychange" /*, "keyup"*/ ] : ["input" /*, "keyup"*/ ]
			};
		},
		"button": "innerHTML"
	},
	_noopFormHandle = function(e, newValue) {
		return newValue
	},
	formListerAttribute = function(key, currentNode, parserNode, vi, /*dm_id,*/ handle, triggerTable) {
		var attrOuter = _getAttrOuter(parserNode),
			eventNameHashCode = $.hashCode(currentNode, "form-key");
		if (handle[eventNameHashCode] !== attrOuter) {
			// console.log(handle[eventNameHashCode], attrOuter, arguments)
			handle[eventNameHashCode] = attrOuter;
			var eventNames,
				eventConfig = _formKey[currentNode.tagName.toLowerCase()] || {
					attributeName: "innerHTML",
					eventNames: ["click"]
				},
				elementHashCode = $.hashCode(currentNode, "form"),
				formCollection,
				outerFormHandle,
				innerFormHandle,
				obj = vi.get(attrOuter, $NULL);
			typeof eventConfig === "function" && (eventConfig = eventConfig(currentNode));
			eventNames = eventConfig.eventNames;
			formCollection = _formCache[elementHashCode] || (_formCache[elementHashCode] = {});

			$.ftE(eventNames, function(eventName) {
				if (obj && obj[_DM_extends_object_constructor]) {
					var baseFormHandle = obj.form === $NULL ? _noopFormHandle : obj.form;
					innerFormHandle = function(e) {
						// console.log(eventConfig.attributeName, this[eventConfig.attributeName])
						vi.set(attrOuter, baseFormHandle.call(this, e, this[eventConfig.attributeName], vi))
					};
					// _registerEvent(currentNode, eventName, innerFormHandle, elementHashCode);
				} else /*if (typeof obj === "string") */ {
					// console.log(attrOuter,eventConfig.attributeName,currentNode[eventConfig.attributeName])
					innerFormHandle = function(e) {
						// console.log(attrOuter,":",this[eventConfig.attributeName],vi.get(attrOuter))
						vi.set(attrOuter, this[eventConfig.attributeName])
					};
				}
				if (!(outerFormHandle = formCollection[eventName])) {
					// _cancelEvent(currentNode, eventName, outerFormHandle, elementHashCode)
					outerFormHandle = function(e) {
						outerFormHandle.inner.call(this, e /*arguments*/ );
					}
					_registerEvent(currentNode, eventName, outerFormHandle, elementHashCode);
					formCollection[eventName] = outerFormHandle;
				}
				outerFormHandle.inner = innerFormHandle;
			});
		}
	};
V.ra("bind-form", function(attrKey) {
	return formListerAttribute;
});