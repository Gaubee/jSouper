V.rt(">", V.rt("#layout", function(handle, index, parentHandle) {
	// console.log(handle)
	var id = handle.id,
		childNodes = handle.childNodes,
		templateHandle_id = childNodes[0].id,
		dataHandle_id = childNodes[1].id,
		comment_layout_id = parentHandle.childNodes[index + 1].id, //eachHandle --> eachComment --> endeachHandle --> endeachComment
		trigger;

	trigger = {
		event: function(NodeList_of_ViewInstance, dataManager, eventTrigger, isAttr, viewInstance_ID) {
			var data = NodeList_of_ViewInstance[dataHandle_id]._data,
				AllLayoutViewInstance = V._instances[viewInstance_ID]._ALVI,
				layoutViewInstance = AllLayoutViewInstance[id] || (AllLayoutViewInstance[id] = V.modules[NodeList_of_ViewInstance[templateHandle_id]._data](data).insert(NodeList_of_ViewInstance[comment_layout_id].currentNode)),
				inserNew;
			layoutViewInstance.set(data);
		}
	}
	return trigger;
}));