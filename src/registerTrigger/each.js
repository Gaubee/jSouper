V.registerTrigger("#each", function(handle, index, parentHandle) {
	// console.log(handle)
	var id = handle.id,
		arrDataHandleKey = handle.childNodes[0].childNodes[0].node.data,
		comment_endeach_id = parentHandle.childNodes[index + 3].id, //eachHandle --> eachComment --> endeachHandle --> endeachComment
		trigger;

	trigger = {
		event: function(NodeList_of_ViewInstance, dataManager,eventTrigger,isAttr,viewInstance_ID) {
			var data = dataManager.get(arrDataHandleKey),
				allArrViewInstances,
				arrViewInstances,// = NodeList_of_ViewInstance[id].arrViewInstances= NodeList_of_ViewInstance[id].arrViewInstances||[],
				divideIndex = -1,
				inserNew;
			// console.log(viewInstance_ID,id)
			allArrViewInstances = V._instances[viewInstance_ID]._AVI;
			arrViewInstances = allArrViewInstances[id] = allArrViewInstances[id]||[];
			// console.log(arrDataHandleKey,data)
			$.forEach(data, function(eachItemData, index) {
				// console.log(arrViewInstances[index])
				var viewInstance = arrViewInstances[index];
				if (!viewInstance) {
					viewInstance = arrViewInstances[index] = V.eachModules[id]();
					dataManager.subset({}, viewInstance); //reset arrViewInstance's dataManager
					inserNew = true;
				}
				if (!viewInstance._canRemoveAble) { //had being recovered into the packingBag
					inserNew = true;
				}

				// console.log(eachItemData)
				viewInstance.set(eachItemData);

				if (inserNew) {
					viewInstance.insert(NodeList_of_ViewInstance[comment_endeach_id].currentNode)
					// console.log(NodeList_of_ViewInstance[id]._controllers)
				}
				divideIndex = index;
			});
			// console.log(divideIndex)
			divideIndex += 1;
			// console.log(arrViewInstances)
			$.forEach(arrViewInstances, function(eachItemHandle) {
				// calibrate the top of handle's currentNode
				// console.log(eachItemHandle.NodeList[eachItemHandle.handleNodeTree.id].currentNode,NodeList_of_ViewInstance[parentHandle.id].currentNode )
				// eachItemHandle.NodeList[eachItemHandle.handleNodeTree.id].currentNode = NodeList_of_ViewInstance[parentHandle.id].currentNode;
				eachItemHandle.remove();
			}, divideIndex);
			var lengthKey = arrDataHandleKey + ".length";
			// console.log(lengthKey);
			// divideIndex +=1;
			// if (dataManager.get(lengthKey) !== divideIndex) {
			// 	dataManager.set(lengthKey, divideIndex)
			// 	handle.len = divideIndex
			// }
		}
	}
	return trigger
});