_AttributeHandleEvent.select = function(key, currentNode, parserNode, vi) { //select selected
	var attrOuter = _getAttrOuter(parserNode),
		data = vi.get(attrOuter),
		selectHashCode = $.hashCode(currentNode, "selected");
	currentNode[selectHashCode] = attrOuter;
	// console.log(attrOuter,typeof data, currentNode, selectHashCode)
	if (data instanceof Array) {
		$.ftE(currentNode.options, function(option) {
			option.selected = ($.iO(data, option.value) !== -1)
		})
	} else {
		$.ftE(currentNode.options, function(option) {
			option.selected = data === option.value
		})
	}
}
// var _triggersEach = V.triggers["#each"],
// 	_touchOffLock; //不好的字段设计可能会造成死循环，使用锁避免重复注册触发事件。
// V.rt("#each", function(handle, index, parentHandle) {
// 	var trigger = _triggersEach(handle, index, parentHandle);
// 	if (parentHandle.type === "element" && parentHandle.node.tagName.toLowerCase() === "select") {
// 		var _triggerEvent = trigger.event;
// 		trigger.event = function(NodeList_of_ViewInstance, dataManager, /*eventTrigger,*/ isAttr, viewInstance_ID) {
// 			var result = _triggerEvent.apply(this, arguments);
// 			if (!_touchOffLock) {
// 				var currentNode = NodeList_of_ViewInstance[parentHandle.id].currentNode,
// 					touchKey = currentNode[$.hashCode(currentNode, "selected")];
// 				_touchOffLock = $TRUE;
// 				touchKey && dataManager.touchOff(touchKey)
// 				_touchOffLock = $FALSE;
// 			}
// 			return result;
// 		}
// 	}
// 	return trigger;
// })