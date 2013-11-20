V.rt("#>", V.rt("#layout", function(handle, index, parentHandle) {
	// console.log(handle)
	var id = handle.id,
		childNodes = handle.childNodes,
		templateHandle_id = childNodes[0].id,
		dataHandle_id = childNodes[1].id,
		ifHandle = childNodes[2],
		ifHandle_id = ifHandle.type==="handle" && ifHandle.id,
		comment_layout_id = parentHandle.childNodes[index + 1].id, //eachHandle --> eachComment --> endeachHandle --> endeachComment
		trigger;

	trigger = {
		event: function(NodeList_of_ViewInstance, dataManager, /*eventTrigger,*/ isAttr, viewInstance_ID) {
			var AllLayoutViewInstance = V._instances[viewInstance_ID]._ALVI;
			if (!AllLayoutViewInstance[id]) {
				var key = NodeList_of_ViewInstance[dataHandle_id]._data,
					layoutViewInstance = AllLayoutViewInstance[id] = V.modules[NodeList_of_ViewInstance[templateHandle_id]._data]().insert(NodeList_of_ViewInstance[comment_layout_id].currentNode);
				dataManager.subset(layoutViewInstance, key);
			}
		}
	}
	if (ifHandle_id) {
		trigger.event = function(NodeList_of_ViewInstance, dataManager, /*eventTrigger,*/ isAttr, viewInstance_ID){
			var isShow = $.trim(String(NodeList_of_ViewInstance[ifHandle_id]._data)).replace(_booleanFalseRegExp,""),
				AllLayoutViewInstance = V._instances[viewInstance_ID]._ALVI,
				layoutViewInstance = AllLayoutViewInstance[id];
			// console.log(isShow,":",NodeList_of_ViewInstance[ifHandle_id]._data)
			if(isShow){
				if (!layoutViewInstance) {
					var key = NodeList_of_ViewInstance[dataHandle_id]._data;
					if(dataManager.get(key)){
						// console.log(key,":",dataManager.get(key))
						layoutViewInstance = AllLayoutViewInstance[id] = V.modules[NodeList_of_ViewInstance[templateHandle_id]._data]();
						dataManager.subset(layoutViewInstance, key);
					}
				}
				if(layoutViewInstance&&!layoutViewInstance._canRemoveAble){
					console.log("show",layoutViewInstance._id)
					layoutViewInstance.insert(NodeList_of_ViewInstance[comment_layout_id].currentNode);
				}
				// console.log(isShow,layoutViewInstance.get())
			}else{
				if(layoutViewInstance&&layoutViewInstance._canRemoveAble){
					console.log("hidden",layoutViewInstance._id)
					layoutViewInstance.remove();
				}
			}
		}
	}
	return trigger;
}));