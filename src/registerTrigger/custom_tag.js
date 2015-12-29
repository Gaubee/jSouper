var custom_instructions = {
	// - ： 表示将匹配到的属性移除
	__1: function(attrName) {
		return "ele-remove_attribute-" + Math.random().toString(36).substr(2) + "-" + attrName + "={{" + __ModelConfig__.prefix.This + "&&'" + attrName + "'}} ";
	},
	"--": function(customTagNodeInfo, attributeName, attrNameList) {
		var result = "";
		$.E(attrNameList, function(attrName) {
			if (attrName === attributeName) {
				result += custom_instructions.__1(attrName);
			}
		});
		return result;
	},
	"^-": function(customTagNodeInfo, attributeName, attrNameList) {
		var result = "";
		$.E(attrNameList, function(attrName) {
			if (!attrName.indexOf(attributeName)) {
				result += custom_instructions.__1(attrName);
			}
		});
		return result;
	},
	"$-": function(customTagNodeInfo, attributeName, attrNameList) {
		var result = "";
		$.E(attrNameList, function(attrName) {
			if (attrName.indexOf(attributeName) === attrName.length - attributeName.length) {
				result += custom_instructions.__1(attrName);
			}
		});
		return result;
	},
	"*-": function(customTagNodeInfo, attributeName, attrNameList) {
		var result = "";
		$.E(attrNameList, function(attrName) {
			if (attrName.indexOf(attributeName) !== -1) {
				result += custom_instructions.__1(attrName);
			}
		});
		return result;
	},
	// + ： 表示将匹配到的属性加入
	__2: function(customTagNodeInfo, attributeName) {
		return attributeName + "=" + stringifyStr(customTagNodeInfo[attributeName]) + " ";
	},
	"^+": function(customTagNodeInfo, attributeName, attrNameList) {
		var result = "";
		$.E(attrNameList, function(attrName) {
			if (!attrName.indexOf(attributeName)) {
				result += custom_instructions.__2(customTagNodeInfo, attributeName);
			}
		});
		return result;
	},
	"$+": function(customTagNodeInfo, attributeName, attrNameList) {
		var result = "";
		$.E(attrNameList, function(attrName) {
			if (attrName.indexOf(attributeName) === attrName.length - attributeName.length) {
				result += custom_instructions.__2(customTagNodeInfo, attributeName);
			}
		});
		return result;
	},
	"*+": function(customTagNodeInfo, attributeName, attrNameList) {
		var result = "";
		$.E(attrNameList, function(attrName) {
			if (attrName.indexOf(attributeName) !== -1) {
				result += custom_instructions.__2(customTagNodeInfo, attributeName);
			}
		});
		return result;
	}
}
V.rt("custom_tag", function(handle, index, parentHandle) {
	// console.log(handle)1
	var id = handle.id,
		childNodes = handle.childNodes,
		expression = Expression.get(handle.handleInfo.expression);
	var comment_layout_id = parentHandle.childNodes[index + 1].id; //eachHandle --> eachComment --> endeachHandle --> endeachComment
	var handleArgs = expression.foo();
	var customTagName = handleArgs[0];
	var customTagNodeId = handleArgs[1];
	var uuid = $.uid();
	var customTagCode;
	var _modulesInit_wrap_lock = _placeholder("modulesInit-wrap-lock");
	var trigger = {
		// cache_tpl_name:$UNDEFINED,
		key: ".",
		event: function(NodeList_of_ViewModel, proxyModel, /*eventTrigger,*/ isAttr, viewModel_ID) {
			var currentVM = V._instances[viewModel_ID];
			var AllCustomTagVM = currentVM._CVI;
			var customTagVm = AllCustomTagVM[id];
			if (!customTagVm) {
				//初始化编译标签
				var customTagNodeInfo = V._customTagNode[customTagNodeId];
				if (!customTagCode) {
					customTagCode = V.customTags[customTagName];

					customTagCode = customTagCode.replace(/\$\{__all_attrs__\}\=\"\"|\$\{__all_attrs__\}/g, function() { //浏览器自动补全属性
						var result = ""
						for (var key in customTagNodeInfo) {
							if (key === "tagName" || key === "innerHTML" || key === "__node__") {
								continue;
							}
							if (customTagNodeInfo.hasOwnProperty(key)) {
								result += key + "=" + stringifyStr(customTagNodeInfo[key]) + " ";
							}
						}
						return result;
					}); //.replace(/\s\=\"\"/g,"");//浏览器自动补全属性
					// console.log(customTagCode);
					var attrNameList = [];
					for (var _name in customTagNodeInfo) {
						if (_name === "tagName" || _name === "innerHTML" || _name === "__node__") {
							continue;
						}
						attrNameList.push(_name);
					}
					customTagCode = customTagCode.replace(/\$\{([\s\S]+?)\}|\$\{([\s\S]+?)\}\=\"\"/g, function(matchStr, x, attributeName) {
						attributeName || (attributeName = x); //两个匹配任选一个
						var instruction_type = attributeName.charAt(1);
						if (/\-|\+/.test(instruction_type)) {
							var instruction_handle = custom_instructions[attributeName.charAt(0) + instruction_type];
							if (instruction_handle) {
								return instruction_handle(customTagNodeInfo, attributeName.substr(2), attrNameList); // ? customTagNodeInfo[attributeName] : "";
							}
						}
						return customTagNodeInfo[attributeName] || "";
					});
				}
				//锁定标签，避免死循环解析
				// console.log("lock ",customTagName);
				V._isCustonTagNodeLock[customTagName] = $TRUE;
				var module_id = "custom_tag-" + id + "-" + uuid;
				var module = V.customTagModules[customTagCode] || (V.customTagModules[customTagCode] = jSouper.parseStr(customTagCode, module_id));
				var modulesInit = V.modulesInit[module_id];
				var vmInit = V.customTagsInit[customTagName];
				if (!(modulesInit && modulesInit[_modulesInit_wrap_lock])) {
					if (modulesInit || vmInit) {
						var _new_modulesInit = V.modulesInit[module_id] = function(vm) { //把模块“匿名初始函数”与“自定义初始函数”一起包裹成型的模块“匿名初始函数”
							modulesInit && modulesInit.call(customTagNodeInfo, vm, customTagNodeInfo.__node__);
							vmInit && vmInit.call(customTagNodeInfo, vm, customTagNodeInfo.__node__);
						};
						_new_modulesInit[_modulesInit_wrap_lock] = $TRUE;
					}
				}
				//解锁
				V._isCustonTagNodeLock[customTagName] = $FALSE;
				module($UNDEFINED, {
					isCustomVM: $TRUE,
					onInit: function(vm) {
						//加锁，放置callback前的finallyRun引发的
						// vm.model._is_custom_vm = true;
						customTagVm = AllCustomTagVM[id] = vm;
					},
					callback: function(vm) {
						//在继承数据前，先显示layoutViewModel
						// console.log("_display_args:", _display_args);
						var _display_args = _customTag_display_arguments[id];
						if (_display_args) {
							_customTag_display.apply(handle, _display_args);
						} else if (customTagVm && !customTagVm._canRemoveAble) { //canInsertAble
							//默认显示，因为触发模式是一次性的，所以无需顾虑
							customTagVm.insert(NodeList_of_ViewModel[comment_layout_id].currentNode);
						}
						//然后再把display完全交给_customTag_display来处理，来触发隐藏还是显示
						proxyModel.shelter(vm, "");
					}
				});
			}
		}
	}
	return trigger;
});