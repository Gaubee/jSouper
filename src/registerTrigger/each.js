var eachConfig = {
	$I: "$INDEX"
}
V.rt("#each", function(handle, index, parentHandle) {
	var id = handle.id,
		arrDataHandle_id = handle.childNodes[0].id,
		comment_endeach_id = parentHandle.childNodes[index + 3].id, //eachHandle --> eachComment --> endeachHandle --> endeachComment
		trigger;
	// ;
	trigger = {
		// smartTrigger:$NULL,
		// key:$NULL,
		// key:$.isString(arrDataHandleKey)?arrDataHandleKey.substring(1,arrDataHandleKey.length-1):arrDataHandleKey+".length",
		event: function(NodeList_of_ViewInstance, dataManager, /*eventTrigger,*/ isAttr, viewInstance_ID) {
			var arrDataHandleKey = NodeList_of_ViewInstance[arrDataHandle_id]._data,
				data = dataManager.get(arrDataHandleKey),
				arrTriggerKey = arrDataHandleKey + ".length",
				viewInstance = V._instances[viewInstance_ID],
				allArrViewInstances = viewInstance._AVI,
				arrViewInstances,
				divideIndex = data ? data.length : 0,
				eachModuleConstructor = V.eachModules[id],
				inserNew,
				comment_endeach_node = NodeList_of_ViewInstance[comment_endeach_id].currentNode;

			(arrViewInstances = allArrViewInstances[id] || (allArrViewInstances[id] = [])).len = divideIndex;
			// debugger
			// console.log(arrDataHandleKey, data)
			// if (arrTriggerKey !== trigger.key) {
			// 	debugger
			// 	trigger.key = arrTriggerKey;
			// 	trigger.smartTrigger&&trigger.smartTrigger.remove(trigger.smartTrigger.TEMP.dataManager._triggerKeys)
			// 	trigger.smartTrigger = viewInstance._collectTrigger(trigger,arrTriggerKey)
			// }
			// console.log(data)
			$.fE(data, function(eachItemData, index) {

				var viewInstance = arrViewInstances[index];
				if (!viewInstance) {
					viewInstance = arrViewInstances[index] = eachModuleConstructor(eachItemData);
					viewInstance._isEach = {
						index: index,
						brotherVI: arrViewInstances
					}
					dataManager.subset(viewInstance, arrDataHandleKey + "." + index); //+"."+index //reset arrViewInstance's dataManager
					inserNew = $TRUE;
				}
				/* else {
					viewInstance.set(eachItemData);
				}*/
				// viewInstance.set(eachConfig.$I, index)
				if (!viewInstance._canRemoveAble) { //had being recovered into the packingBag
					inserNew = $TRUE;
				}


				if (inserNew && !arrViewInstances.hidden) {
					viewInstance.insert(comment_endeach_node)
				}
			});
			$.fE(arrViewInstances, function(eachItemHandle) {
				// console.log(eachItemHandle)
				eachItemHandle.remove();
			}, divideIndex);
		}
	}
	return trigger
});