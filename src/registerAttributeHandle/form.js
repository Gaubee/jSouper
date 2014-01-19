/*
 *form-bind只做绑定form处理事件，value绑定需要另外通过attr-value={(XX)}来绑定，避免重复
 */
var _formCache = {},
	__text = {
		attributeName: "value",
		eventNames: ["input","change"]
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
			//设置初值，表单如果不选择进行直接的提交也需要有初始值
			init: function(currentNode, vi, attrOuter) {
				//---init value
				var _init_hashCode = $.hashCode(currentNode, "init"),
					DM_finallyRun = Model.finallyRun;
				if (!DM_finallyRun[_init_hashCode]) {
					var _init_finallyRun = DM_finallyRun[_init_hashCode] = function() {
						var options = currentNode.options
						if (options.length) {
							//待存在options后，则进行初始化bind-form的值
							//并确保只运行一次。
							DM_finallyRun[_init_hashCode] = $FALSE;
							var value = [];
							$.E(options,function(optionNode){
								if(optionNode.selected&&optionNode.value){
									$.p(value,optionNode.value)
								}
							})
							if (value.length) {
								// console.log(value)
								if (!currentNode.multiple) {
									value = value[0]
								}
								// console.log(attrOuter,value)
								vi.set(attrOuter,value)
							}
						}else{
							//当each运作后是继续允许进入finallyRun队列
							_init_finallyRun._inQuene = $FALSE
						}
					}
				}
			},
			inner: function(e, vi, attrOuter, value /*for arguments*/ ) {
				// console.log(e.target.tagName==="OPTION")
				var ele = this;
				var obj = vi.get(attrOuter);
				var args = arguments;

				if (ele.multiple) {
					value = [];
					$.E(ele.options, function(option) {
						if (option.selected && option.value) {
							$.p(value, option.value);
						}
					})
				} else {
					value = ele.options[ele.selectedIndex].value;
				}
				if (obj && obj[_DM_extends_object_constructor] && obj.form) {
					args[3] = value;
					vi.set(attrOuter, obj.form.apply(ele, args))
				} else {
					vi.set(attrOuter, value)
					// console.log(ele.options)
				}
			}
		},
		"textarea": __text
	},
	formListerAttribute = function(key, currentNode, parserNode, vi, /*dm_id,*/ handle, triggerTable) {
		var attrOuter = _getAttrOuter(parserNode),
			eventNameHashCode = $.hashCode(currentNode, "bind-form");
			// console.log(attrOuter)
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
				eventConfig = $.c(eventConfig); //wrap eventConfig to set inner in diffrent eventConfig
				formCollection = _formCache[elementHashCode] || (_formCache[elementHashCode] = {});
				if (eventConfig.init) {
					eventConfig.init(currentNode, vi, attrOuter)
				}
				if (!eventConfig.inner) {
					eventConfig.inner = function(e, vi, attrOuter /**/ ) {
						var obj = vi.get(attrOuter)
						if (obj && obj[_DM_extends_object_constructor] && obj.form) {
							vi.set(attrOuter, obj.form.apply(this, arguments))
						} else {
							vi.set(attrOuter, this[eventConfig.attributeName])
						}
					};
				}
				$.E(eventNames, function(eventName) {
					eventConfig.key = attrOuter;
					eventConfig.vi = vi;
					if (!(outerFormHandle = formCollection[eventName])) {
						outerFormHandle = function(e) {
							var self = this;
							eventConfig.before && eventConfig.before.call(this, e, eventConfig.vi, eventConfig.key)
							eventConfig.inner.call(this, e, eventConfig.vi, eventConfig.key);
							eventConfig.after && eventConfig.after.call(this, e, eventConfig.vi, eventConfig.key)
						}
						// outerFormHandle = Function('o' /*eventConfig*/ , 'return function(e){var s=this;' + (eventConfig.before ? 'o.before.call(s,e,o.vi, o.key);' : '') + 'o.inner.call(s,e,o.vi, o.key);' + (eventConfig.after ? 'o.after.call(s,e,o.vi, o.key);' : '') + '}')(eventConfig);
						outerFormHandle.eventConfig = eventConfig
						_registerEvent(currentNode, eventName, outerFormHandle, elementHashCode);
						formCollection[eventName] = outerFormHandle;
					} else {
						for (var i in eventConfig) {
							outerFormHandle.eventConfig[i] = eventConfig[i];
							// try{outerFormHandle.call(currentNode)}catch(e){};
						}
					}

				});
			}
		}
	};
V.ra("form", function(attrKey) {
	return formListerAttribute;
});