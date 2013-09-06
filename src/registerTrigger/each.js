V.rt("#each", function(handle, index, parentHandle) {
	var id = handle.id,
		arrDataHandleKey = handle.childNodes[0].childNodes[0].node.data,
		comment_endeach_id = parentHandle.childNodes[index + 3].id, //eachHandle --> eachComment --> endeachHandle --> endeachComment
		trigger;

	trigger = {
		event: function(NodeList_of_ViewInstance, dataManager,eventTrigger,isAttr,viewInstance_ID) {
			var data = dataManager.get(arrDataHandleKey),
				allArrViewInstances = V._instances[viewInstance_ID]._AVI,
				arrViewInstances,
				divideIndex = data?data.length:0,
				eachModuleConstructor = V.eachModules[id],
				inserNew,
				comment_endeach_node = NodeList_of_ViewInstance[comment_endeach_id].currentNode;

			(arrViewInstances = allArrViewInstances[id]||(allArrViewInstances[id] = [])).len = divideIndex;

			$.forEach(data, function(eachItemData, index) {

				var viewInstance = arrViewInstances[index];
				if (!viewInstance) {
					viewInstance = arrViewInstances[index] = eachModuleConstructor();
					dataManager.subset(viewInstance); //reset arrViewInstance's dataManager
					inserNew = true;
				}
				if (!viewInstance._canRemoveAble) { //had being recovered into the packingBag
					inserNew = true;
				}

				viewInstance.set(eachItemData);

				if (inserNew&&!arrViewInstances.hidden) {
					viewInstance.insert(comment_endeach_node)
				}
			});

			$.forEach(arrViewInstances, function(eachItemHandle) {
				eachItemHandle.remove();
			}, divideIndex);
		}
	}
	return trigger
});