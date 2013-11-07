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
				case "radio":
					return {
						// attributeName: "checked",
						attributeName: "value",
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
		"select": {
			eventNames: ["change"],
			inner: function(e, vi, attrOuter, value /*for arguments*/ ) {
				var ele = this;
				var obj = vi.get(attrOuter)
				value = ele.value;
				if (ele.multiple) {
					value = [];
					$.ftE(ele.options, function(option) {
						if (option.selected) {
							$.p(value, option.value);
						}
					})
				}
				if (obj && obj[_DM_extends_object_constructor] && obj.form) {
					arguments[3] = value;
					vi.set(attrOuter, obj.form.apply(ele, arguments))
				} else {
					vi.set(attrOuter, value)
				}
			}
		}
	},
	formListerAttribute = function(key, currentNode, parserNode, vi, /*dm_id,*/ handle, triggerTable) {
		var attrOuter = _getAttrOuter(parserNode),
			eventNameHashCode = $.hashCode(currentNode, "bind-form");
		if (handle[eventNameHashCode] !== attrOuter) {
			// console.log(handle[eventNameHashCode], attrOuter, arguments)
			handle[eventNameHashCode] = attrOuter;
			var eventNames,
				eventConfig = _formKey[currentNode.tagName.toLowerCase()];
			if (!eventConfig) return;
			var elementHashCode = $.hashCode(currentNode, "form"),
				formCollection,
				outerFormHandle,
				innerFormHandle;
			if (eventConfig) {
				typeof eventConfig === "function" && (eventConfig = eventConfig(currentNode));
				eventNames = eventConfig.eventNames;
				formCollection = _formCache[elementHashCode] || (_formCache[elementHashCode] = {});

				if (!eventConfig.inner) {
					innerFormHandle = function(e /*, vi, attrOuter*/ ) {
						var obj = vi.get(attrOuter)
						if (obj && obj[_DM_extends_object_constructor] && obj.form) {
							vi.set(attrOuter, obj.form.apply(this, arguments))
						} else {
							vi.set(attrOuter, this[eventConfig.attributeName])
						}
					};
					eventConfig.inner = innerFormHandle;
				}
				$.ftE(eventNames, function(eventName) {
					if (!(outerFormHandle = formCollection[eventName])) {
						// outerFormHandle = function(e) {
						// 	var self = this;
						// 	outerFormHandle.before && outerFormHandle.before.call(this, e, vi)
						// 	outerFormHandle.inner.call(this, e, vi);
						// 	outerFormHandle.after && outerFormHandle.after.call(this, e, vi)
						// }
						outerFormHandle = Function('o,v,k' /*eventConfig,vi,attrOuter(bind-key)*/ , 'return function(e){var s=this;' + (eventConfig.before ? 'o.before.call(s,e,v,k);' : '') + 'o.inner.call(s,e,v,k);' + (eventConfig.after ? 'o.after.call(s,e,v,k);' : '') + '}')(eventConfig, vi, attrOuter);
						_registerEvent(currentNode, eventName, outerFormHandle, elementHashCode);
						formCollection[eventName] = outerFormHandle;
					}

				});
			}
		}
	};
V.ra("bind-form", function(attrKey) {
	return formListerAttribute;
});