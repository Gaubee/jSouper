layoutTrigger = function(handle, index, parentHandle) {
	// console.log(handle)
	var id = handle.id,
		childNodes = handle.childNodes,
		templateHandleKey = childNodes[0].childNodes[0].node.data,
		dataHandle_id = childNodes[1].id,
		comment_layout_id = parentHandle.childNodes[index + 1].id, //eachHandle --> eachComment --> endeachHandle --> endeachComment
		trigger;
		
	if ($.isString(templateHandleKey)) {
		templateHandleKey = templateHandleKey.substring(1, templateHandleKey.length - 1);
	};
	trigger = {
		event: function(NodeList_of_ViewInstance, dataManager, eventTrigger, isAttr, viewInstance_ID) {
			// console.log(NodeList_of_ViewInstance[comment_layout_id].currentNode,templateHandleKey)
			var data = NodeList_of_ViewInstance[dataHandle_id]._data,
				AllLayoutViewInstance = V._instances[viewInstance_ID]._ALVI,
				layoutViewInstance = AllLayoutViewInstance[id] || (AllLayoutViewInstance[id] = V.modules[templateHandleKey](data).insert(NodeList_of_ViewInstance[comment_layout_id].currentNode)),
				inserNew;
			layoutViewInstance.set(data);
			// layoutViewInstance.NodeList[layoutViewInstance.handleNodeTree.id].currentNode = NodeList_of_ViewInstance[comment_layout_id].currentNode.parentNode
		}
	}
	return trigger;
}

V.registerTrigger("#layout", layoutTrigger);
V.registerTrigger(">", layoutTrigger);