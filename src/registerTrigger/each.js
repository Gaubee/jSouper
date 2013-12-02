var eachConfig = {
	$I: "$INDEX"
}
V.rt("#each", function(handle, index, parentHandle) {
	var id = handle.id,
		arrDataHandle_id = handle.childNodes[0].id,
		comment_endeach_id = parentHandle.childNodes[index + 3].id, //eachHandle --> eachComment --> endeachHandle --> endeachComment
		trigger;
	trigger = {
		// smartTrigger:$NULL,
		// key:$NULL,
		// key:$.isString(arrDataHandleKey)?arrDataHandleKey.substring(1,arrDataHandleKey.length-1):arrDataHandleKey+".length",
		event: function(NodeList_of_ViewInstance, dataManager, /*eventTrigger,*/ isAttr, viewInstance_ID) {
			var arrDataHandleKey = NodeList_of_ViewInstance[arrDataHandle_id]._data,
				data = dataManager.get(arrDataHandleKey),
				// arrTriggerKey = arrDataHandleKey + ".length",
				viewInstance = V._instances[viewInstance_ID],
				allArrViewInstances = viewInstance._AVI,
				arrViewInstances = allArrViewInstances[id] || (allArrViewInstances[id] = []),
				showed_vi_len = arrViewInstances.len,
				new_data_len = data ? data.length : 0,
				eachModuleConstructor = V.eachModules[id],
				inserNew,
				comment_endeach_node = NodeList_of_ViewInstance[comment_endeach_id].currentNode;
			if (showed_vi_len !== new_data_len) {
				arrViewInstances.len = new_data_len; //change immediately,to avoid the `subset` trigger the `rebuildTree`,and than trigger each-trigger again.

				var _rebuildTree = dataManager.rebuildTree,
					_touchOff = DM_proto.touchOff;
				dataManager.rebuildTree = $.noop //doesn't need rebuild every subset
				DM_proto.touchOff = $.noop; //touchOff会遍历整个子链，会造成爆炸性增长。

				if (showed_vi_len > new_data_len) {
					$.fE(arrViewInstances, function(eachItemHandle) {
						// eachItemHandle.dataManager._eachIgonre = $TRUE;
						eachItemHandle.remove();
					}, new_data_len);
				} else {
					data != $UNDEFINED && $.ftE($.s(data), function(eachItemData, index) {
						//TODO:if too mush vi will be create, maybe asyn
						var viewInstance = arrViewInstances[index];
						if (!viewInstance) {
							viewInstance = arrViewInstances[index] = eachModuleConstructor(eachItemData);
							var viDM = viewInstance.dataManager
							viDM._isEach = viewInstance._isEach = {
								index: index,
								eachVIs: arrViewInstances
							}
							// viDM._index = index;
							// viDM._pprefix = arrDataHandleKey;
							// debugger
							dataManager.subset(viDM, arrDataHandleKey + "." + index ); //+"."+index //reset arrViewInstance's dataManager
						}
						viewInstance.insert(comment_endeach_node)
						// viewInstance.dataManager._eachIgonre = $FALSE;
					}, showed_vi_len); //showed_vi_len||0
				}
				// dataManager.rebuildTree = _rebuildTree
				// dataManager.rebuildTree();
				DM_proto.touchOff = _touchOff;
				(dataManager.rebuildTree = _rebuildTree).call(dataManager);
			}
		}
	}
	return trigger
});