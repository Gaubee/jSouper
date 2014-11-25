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
		expression = Expression.get(handle.handleInfo.expression),
		comment_layout_id = parentHandle.childNodes[index + 1].id; //eachHandle --> eachComment --> endeachHandle --> endeachComment
	var handleArgs = expression.foo();
	var customTagName = handleArgs[0];
	var customTagNodeId = handleArgs[1];
	var uuid = $.uid();
	var customTagCode;
	var trigger = {
		// cache_tpl_name:$UNDEFINED,
		key: ".",
		event: function(NodeList_of_ViewModel, proxyModel, /*eventTrigger,*/ isAttr, viewModel_ID) {
			var AllCustomTagVM = V._instances[viewModel_ID]._CVI;
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
					customTagCode = customTagCode.replace(/\$\{([\w\W]+?)\}\=\"\"|\$\{([\w\W]+?)\}/g, function(matchStr, x, attributeName) {
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
				V._isCustonTagNodeLock[customTagName] = true;
				var module_id = "custom_tag-" + id + "-" + uuid;
				var module = V.customTagModules[customTagCode] || (V.customTagModules[customTagCode] = jSouper.parseStr(customTagCode, module_id));
				var modulesInit = V.modulesInit[module_id];
				var vmInit = V.customTagsInit[customTagName];
				if (modulesInit || vmInit) {
					V.modulesInit[module_id] = function(vm) {
						modulesInit && modulesInit.call(customTagNodeInfo, vm, customTagNodeInfo.__node__);
						vmInit && vmInit.call(customTagNodeInfo, vm, customTagNodeInfo.__node__);
					}
				}
				//解锁
				V._isCustonTagNodeLock[customTagName] = false;
				module($UNDEFINED, {
					onInit: function(vm) {
						//加锁，放置callback前的finallyRun引发的
						customTagVm = AllCustomTagVM[id] = vm;
					},
					callback: function(vm) {
						proxyModel.shelter(vm, "");
					}
				});
			}
			//显示layoutViewModel
			if (customTagVm && !customTagVm._canRemoveAble) { //canInsertAble
				customTagVm.insert(NodeList_of_ViewModel[comment_layout_id].currentNode);
			}
			var _display_args = _customTag_display_arguments[id];
			if (_display_args) {
				_customTag_display.apply(handle, _display_args);
			}
		}
	}
	return trigger;
});