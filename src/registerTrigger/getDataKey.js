V.rt("@", function(handle, index, parentHandle) {
	var textHandle = handle.childNodes[0],
		textHandleId = textHandle.id,
		key = textHandle.node.data,
		trigger = { //const 
			key: key, //const trigger
			bubble: $TRUE
		};

	if (parentHandle.type !== "handle") { //as textHandle
		trigger.event = function(NodeList_of_ViewModel, model) {
			//trigger but no bind data
			NodeList_of_ViewModel[textHandleId].currentNode.data = key;
		}
	} else {
		trigger.event = function(NodeList_of_ViewModel, model) {
			NodeList_of_ViewModel[this.handleId]._data = key;
		}
	}
	return trigger;
});