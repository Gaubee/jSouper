_AttributeHandleEvent.select = function(key, currentNode, parserNode, vi) { //select selected
	var attrOuter = _getAttrOuter(parserNode),
		data = vi.get(attrOuter),
		selectHashCode = $.hashCode(currentNode, "selected"),
		options = currentNode.options;
	currentNode[selectHashCode] = attrOuter;
	// console.log(attrOuter, selectHashCode)
	if (data instanceof Array) {
		if (currentNode.multiple) {
			$.ftE(options, function(optionNode) {
				optionNode.selected = ($.iO(data, optionNode.value) !== -1)
			})
		}else{
			$.fE(options, function(optionNode) {
				if(optionNode.selected = ($.iO(data, optionNode.value) !== -1)){
					return $FALSE
				}
			})
		}
	} else {
		$.ftE(options, function(optionNode) {
			optionNode.selected = (data === optionNode.value)
		})
	}
}
var _triggersEach = V.triggers["#each"];
V.rt("#each", function(handle, index, parentHandle) {
	var trigger = _triggersEach(handle, index, parentHandle);
	if (parentHandle.type === "element" && parentHandle.node.tagName === "SELECT") {
		if (_isIE) {
			//IE需要强制触发相关于option的属性来强制使其渲染更新DOM
			//使用clone的节点问题？是否和clone出来的HTML5节点的问题一样？
			var _ieFix_triggerEvent = trigger.event;
			trigger.event = function(NodeList_of_ViewInstance, dataManager, /*eventTrigger,*/ isAttr, viewInstance_ID) {
				var result = _ieFix_triggerEvent.apply(this, arguments);
				var currentNode_options = NodeList_of_ViewInstance[parentHandle.id].currentNode.options;
				currentNode_options.length += 1;
				currentNode_options.length -= 1;
				return result;
			}
		}
		//数组的赋值与绑定相关联，实时更新绑定值。
		var _triggerEvent = trigger.event;
		trigger.event = function(NodeList_of_ViewInstance, dataManager, /*eventTrigger,*/ isAttr, viewInstance_ID) {
			var result = _triggerEvent.apply(this, arguments);
			var currentNode = NodeList_of_ViewInstance[parentHandle.id].currentNode,
				selectHashCode = $.hashCode(currentNode, "selected"),
				touchKey = currentNode[selectHashCode],
				DM_finallyRun = DataManager.finallyRun;
			// console.log(touchKey);
			if (touchKey) { //value-map
				var finallyRun;
				if (!(finallyRun = DM_finallyRun[selectHashCode])) {
					DM_finallyRun(DM_finallyRun[selectHashCode] = finallyRun = function() {
						finallyRun.dataManager.touchOff(finallyRun.touchKey)
						DM_finallyRun[selectHashCode] = $FALSE;
					})
				}
				finallyRun.dataManager = dataManager;
				finallyRun.touchKey = touchKey;
			}else{
				//如果没有指定绑定的selected值，那么为bind-from配置默认选中值
				var _init_hashCode = $.hashCode(currentNode, "init"),
					_init_finallyRun = DM_finallyRun[_init_hashCode];
				if(_init_finallyRun&&!_init_finallyRun._inQuene){
					DM_finallyRun(_init_finallyRun)
					_init_finallyRun._inQuene = $TRUE;
				}
			}
			return result;
		}
	}
	return trigger;
})