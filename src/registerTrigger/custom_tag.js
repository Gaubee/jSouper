V.rt("custom_tag", function(handle, index, parentHandle) {
	// console.log(handle)
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
					customTagCode = customTagCode.replace(/\$\{__all_attrs__\}/g, function() {
						var result = ""
						for (var key in customTagNodeInfo) {
							if (key === "tagName" || key === "innerHTML" || key === "__node__") {
								continue;
							}
							if (customTagNodeInfo.hasOwnProperty(key)) {
								result += key + "=" + stringifyStr(customTagNodeInfo[key])+" ";
							}
						}
						return result;
					});//.replace(/\s\=\"\"/g,"");//浏览器自动补全属性
					customTagCode = customTagCode.replace(/\$\{([\w\W]+?)\}/g, function(matchStr, attributeName) {
						return customTagNodeInfo[attributeName] || "";
					});
				}
				//锁定标签，避免死循环解析
				// console.log("lock ",customTagNodeInfo.tagName);
				V._isCustonTagNodeLock[customTagNodeInfo.tagName] = true;
				var module_id = "custom_tag-" + id + "-" + uuid;
				var module = V.customTagModules[customTagCode] || (V.customTagModules[customTagCode] = jSouper.parseStr(customTagCode, module_id));
				var modulesInit = V.modulesInit[module_id];
				if (modulesInit) {
					V.modulesInit[module_id] = function(vm) {
						modulesInit.call(customTagNodeInfo, vm, customTagNodeInfo.__node__);
					}
				}
				//解锁
				V._isCustonTagNodeLock[customTagNodeInfo.tagName] = false;
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