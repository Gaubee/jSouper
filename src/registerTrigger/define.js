V.rt("define", function(handle, index, parentHandle) {
	var handleChilds = handle.childNodes,
		statusKeyHandleId = handleChilds[0].id,
		textHandle_id = handleChilds[0].childNodes[0].id,
		valueHandleId = handleChilds[1].id,
		trigger = {
			bubble: $TRUE,
			name: "define"
		};
	// console.log(handle.childNodes[0].parentNode, handle.parentNode)

	if (parentHandle.type !== "handle") { //as textHandle
		trigger.event = function(NodeList_of_ViewInstance, dataManager /*, triggerBy*/ , isAttr, viewInstance_ID) { //call by ViewInstance's Node
			var key = NodeList_of_ViewInstance[statusKeyHandleId]._data,
				result = NodeList_of_ViewInstance[valueHandleId]._data,
				currentNode = NodeList_of_ViewInstance[textHandle_id].currentNode,
				uid_hash = viewInstance_ID + key,
				viewInstance = V._instances[viewInstance_ID],
				finallyRun;
			// console.log(key,":",result,viewInstance.id);
			if (key !== $UNDEFINED) {
				if (!(finallyRun = DataManager.finallyRun[uid_hash])) {
					DataManager.finallyRun(DataManager.finallyRun[uid_hash] = finallyRun = function() {
						viewInstance = finallyRun.viewInstance
						// if (finallyRun.key==="dd") {debugger};
						//已经被remove的VI，就不应该触发define
						if (viewInstance._canRemoveAble) {
							viewInstance.set(finallyRun.key, finallyRun.result)
						}
						DataManager.finallyRun[uid_hash] = $FALSE; //can push into finally quene
					})
				}
				finallyRun.viewInstance = viewInstance
				finallyRun.key = key
				finallyRun.result = result
			}
			result = String(result);
			// if (result==="1 ==> 6undefined1") {debugger};
			if (currentNode.data !== result) {
				currentNode.data = result;
			}
		}
	} else {
		trigger.event = function(NodeList_of_ViewInstance, dataManager /*, triggerBy*/ , isAttr, viewInstance_ID) { //call by ViewInstance's Node
			var key = NodeList_of_ViewInstance[statusKeyHandleId]._data,
				result = NodeList_of_ViewInstance[valueHandleId]._data;

			DataManager.finallyRun(function() {
				console.log(key, result)
				//key!==$UNDEFINED&&dataManager.set(key,result)
			}, 0)
			NodeList_of_ViewInstance[this.handleId]._data = result;
		}
	}

	return trigger;
});