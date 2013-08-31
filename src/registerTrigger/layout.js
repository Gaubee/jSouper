layoutTrigger = function(handle, index, parentHandle) {
	// console.log(handle)
	var id = handle.id,
		arrDataHandleKey = handle.childNodes[0].childNodes[0].node.data,
		comment_layout_id = parentHandle.childNodes[index + 1].id, //eachHandle --> eachComment --> endeachHandle --> endeachComment
		trigger;
	console.log(arrDataHandleKey)
	trigger = {
		event: function(NodeList_of_ViewInstance, dataManager, eventTrigger, isAttr, viewInstance_ID) {
			var data = dataManager.get(arrDataHandleKey),
				allArrViewInstances,
				arrViewInstances, // = NodeList_of_ViewInstance[id].arrViewInstances= NodeList_of_ViewInstance[id].arrViewInstances||[],
				divideIndex = -1,
				inserNew;
			// console.log(viewInstance_ID,id)
			// AllLayoutViewInstance = V._instances[viewInstance_ID]._ALVI;
			// layoutViewInstance = AllLayoutViewInstance[id] || (AllLayoutViewInstance[id] = []);
			// layoutViewInstance.insert(NodeList_of_ViewInstance[comment_layout_id].currentNode)
			console.log(data);
		}
	}
	return trigger;
}

V.registerTrigger("#layout", layoutTrigger);
V.registerTrigger(">", layoutTrigger);