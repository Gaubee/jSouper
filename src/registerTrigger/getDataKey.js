V.registerTrigger("@", function(handle, index, parentHandle) {
	var textHandle = handle.childNodes[0],
		textHandleId = textHandle.id,
		key = textHandle.node.data,
		trigger;

	trigger = { //const 
		key: key, //const trigger
		bubble: true,
		event: function(NodeList_of_ViewInstance, dataManager) {
			NodeList_of_ViewInstance[textHandleId].currentNode.data = key;
			// trigger.event = $.noop;
		}
	};
	return trigger;
});