V.rt("status", function(handle, index, parentHandle) {
	var handleChilds = handle.childNodes,
		statusKeyHandleId = handleChilds[0].id,
		textHandle_id = handleChilds[0].childNodes[0].id,
		valueHandleId = handleChilds[1].id,
		trigger = {
			bubble: $TRUE
		};
	// console.log(handle.childNodes[0].parentNode, handle.parentNode)

	if (parentHandle.type !== "handle") { //as textHandle
		trigger.event = function(NodeList_of_ViewInstance, dataManager /*, triggerBy, isAttr, vi*/ ) { //call by ViewInstance's Node
			var key = NodeList_of_ViewInstance[statusKeyHandleId]._data,
				result = NodeList_of_ViewInstance[valueHandleId]._data,
				currentNode = NodeList_of_ViewInstance[textHandle_id].currentNode;
			
			DataManager.finallyRun(function(){
				console.log(key,result)
				//key!==$UNDEFINED&&dataManager.set(key,result)
			},0)
			currentNode.data = result;
		}
	} else {
		trigger.event = function(NodeList_of_ViewInstance, dataManager /*, triggerBy, isAttr, vi*/ ) { //call by ViewInstance's Node
			var key = NodeList_of_ViewInstance[statusKeyHandleId]._data,
				result = NodeList_of_ViewInstance[valueHandleId]._data;
			
			DataManager.finallyRun(function(){
				console.log(key,result)
				//key!==$UNDEFINED&&dataManager.set(key,result)
			},0)
			NodeList_of_ViewInstance[this.handleId]._data = result;
		}
	}

	return trigger;
});