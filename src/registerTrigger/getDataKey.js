V.rt("@", function(handle, index, parentHandle) {
	var textHandle = handle.childNodes[0],
		textHandleId = textHandle.id,
		key = textHandle.node.data,
		trigger = { //const 
			key: key, //const trigger
			bubble: $TRUE
		};

	if (parentHandle.type !== "handle") { //as textHandle
		trigger.event = function(NodeList_of_ViewInstance, dataManager) {
			//trigger but no bind data
			NodeList_of_ViewInstance[textHandleId].currentNode.data = key;
		}
	} else {
		trigger.event = function(NodeList_of_ViewInstance, dataManager) {
			NodeList_of_ViewInstance[this.handleId]._data = key;
		}
	}
	return trigger;
});