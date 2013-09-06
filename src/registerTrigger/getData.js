V.registerTrigger("", function(handle, index, parentHandle) {
	var textHandle = handle.childNodes[0],
		textHandleId = textHandle.id,
		key = textHandle.node.data,
		trigger;
	// console.log("getData:",key)
	if (parentHandle.type !== "handle") { //as textHandle
		if ($.isString(key)) { // single String
			trigger = { //const 
				key: ".", //const trigger
				bubble: true,
				event: function(NodeList_of_ViewInstance, dataManager) {
					NodeList_of_ViewInstance[textHandleId].currentNode.data = key.substring(1, key.length - 1);
					// trigger.event = $.noop;
				}
			};
		} else { //String for databese by key
			trigger = {
				key: key,
				event: function(NodeList_of_ViewInstance, dataManager, triggerBy, isAttr, vi) { //call by ViewInstance's Node
					// console.log("getData:",key,":",dataManager)
					var data;
					if (isAttr) {
						if (isAttr.key.indexOf("on") === 0) {
							data = String(dataManager.get(key)).replace(/"/g, '\\"').replace(/'/g, "\\'");
							// }else if(isAttr.key.indexOf("event-")===0&&_isIE){
							// 	data = String(dataManager.get(key)).replace(/\n/g, _ieEnterPlaceholder);
						} else {
							data = dataManager.get(key);
						}
					} else {
						data = dataManager.get(key)
					};
					// console.log(key,data,dataManager)
					NodeList_of_ViewInstance[textHandleId].currentNode.data = data;
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