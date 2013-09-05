var withTrigger = function(handle, index, parentHandle) {
	// console.log(handle)
	var id = handle.id,
		dataHandle_id = handle.childNodes[0].id,
		comment_with_id = parentHandle.childNodes[index + 3].id, //eachHandle --> eachComment --> endeachHandle --> endeachComment
		trigger;
		
	trigger = {
		event: function(NodeList_of_ViewInstance, dataManager, eventTrigger, isAttr, viewInstance_ID) {
			var data = NodeList_of_ViewInstance[dataHandle_id]._data,
				AllLayoutViewInstance = V._instances[viewInstance_ID]._WVI,
				withViewInstance = AllLayoutViewInstance[id],// || (AllLayoutViewInstance[id] = V.withModules[id](data).insert(NodeList_of_ViewInstance[comment_with_id].currentNode)),
				inserNew;
			if (!withViewInstance) {
				console.log(NodeList_of_ViewInstance[comment_with_id].currentNode)
				withViewInstance = AllLayoutViewInstance[id] = V.withModules[id]();
				dataManager.subset(data,withViewInstance)
				console.log(withViewInstance)
				withViewInstance.insert(NodeList_of_ViewInstance[comment_with_id].currentNode)
			}
			console.log(data)
			withViewInstance.set(data);
		}
	}
	return trigger;
}

V.registerTrigger("#with", withTrigger);