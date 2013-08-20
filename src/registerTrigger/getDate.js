V.registerTrigger("", function(handle, index, parentHandle) {
	var textHandle = handle.childNodes[0],
		textHandleId = textHandle.id,
		key = textHandle.node.data,
		trigger;
	// console.log("getData:",key)
	if (parentHandle.type !== "handle") { //as textHandle
		trigger = {
			key: key,
			event: function(NodeList_of_ViewInstance, dataManager, triggerBy, isAttr, vi) { //call by ViewInstance's Node
				// console.log("getData:",key,":",dataManager)
				if (isAttr&&isAttr.key.indexOf("on")===0) {
					NodeList_of_ViewInstance[textHandleId].currentNode.data = String(dataManager.get(key)).replace(/"/g, '\\"').replace(/'/g, "\\'");
				} else {
					NodeList_of_ViewInstance[textHandleId].currentNode.data = dataManager.get(key)
				}
			}
		}
	} else { //as stringHandle
		if ($.isString(key)) { // single String
			trigger = { //const 
				key: ".", //const trigger
				bubble: true,
				event: function(NodeList_of_ViewInstance, dataManager) {
					NodeList_of_ViewInstance[this.handleId]._data = key.substring(1, key.length - 1);
				}
			};
		} else { //String for databese by key
			trigger = {
				key: key,
				bubble: true,
				event: function(NodeList_of_ViewInstance, dataManager) {
					NodeList_of_ViewInstance[this.handleId]._data = dataManager.get(key);
				}
			};
		}
	}
	return trigger;
});