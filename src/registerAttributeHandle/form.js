/*
 *form-bind只做绑定form处理事件，value绑定需要另外通过attr-value={(XX)}来绑定，避免重复
 */
var _formCache = {},
	__text = {
		attributeName: "value",
		eventNames: _isIE ? ["propertychange" /*, "keyup"*/ ] : ["input" /*, "keyup"*/ ]
	},
	_formKey = {
		"input": function(node) { //需阻止默认事件，比如Checked需要被重写，否则数据没有变动而Checked因用户点击而变动，没有达到V->M的数据同步
			var result = __text;
			switch (node.type.toLowerCase()) {
				case "checkbox":
					result = {
						attributeName: "checked",
						eventNames: _isIE ? ["change", "click"] : ["change"]
					}
					break;
				case "radio":
					result = {
						// attributeName: "checked",
						attributeName: "value",
						eventNames: _isIE ? ["change", "click"] : ["change"]
					}
					break;
					// case "button":
					// case "reset":
					// case "submit":
			}
			return result
		},
		"select": {
			eventNames: ["change"],
			inner: function(e, vi, attrOuter, value /*for arguments*/ ) {
				var ele = this;
				var obj = vi.get(attrOuter)
				if (ele.multiple) {
					value = [];
					$.ftE(ele.options, function(option) {
						if (option.selected) {
							$.p(value, option.value);
						}
					})
				} else {
					value = ele.options[ele.selectedIndex].value;
				}
				if (obj && obj[_DM_extends_object_constructor] && obj.form) {
					arguments[3] = value;
					vi.set(attrOuter, obj.form.apply(ele, arguments))
				} else {
					vi.set(attrOuter, value)
				}
			}
		},
		"textarea": __text
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
				outerFormHandle;
			if (eventConfig) {
				typeof eventConfig === "function" && (eventConfig = eventConfig(currentNode));
				eventNames = eventConfig.eventNames;
				formCollection = _formCache[elementHashCode] || (_formCache[elementHashCode] = {});

				if (!eventConfig.inner) {
					function innerForHashCode(e, vi, attrOuter /**/ ) {
						var obj = vi.get(attrOuter)
						if (obj && obj[_DM_extends_object_constructor] && obj.form) {
							vi.set(attrOuter, obj.form.apply(this, arguments))
						} else {
							vi.set(attrOuter, this[eventConfig.attributeName])
						}
					};
					eventConfig.inner = _isIE ? function(e, vi, attrOuter) {
						if (!(_fixPropertychange && e.propertyName == "value")) {
							innerForHashCode.apply(this, arguments);
						}
					} : innerForHashCode;
				}
				$.ftE(eventNames, function(eventName) {
					if (!(outerFormHandle = formCollection[eventName])) {
						// outerFormHandle = function(e) {
						// 	var self = this;
						// 	eventConfig.before && eventConfig.before.call(this, e, vi, attrOuter)
						// 	eventConfig.inner.call(this, e, vi, attrOuter);
						// 	eventConfig.after && eventConfig.after.call(this, e, vi, attrOuter)
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