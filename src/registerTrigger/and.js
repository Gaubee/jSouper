V.registerTrigger("and", function(handle, index, parentHandle) {
	var childHandlesId = [],
		trigger;
	$.forEach(handle.childNodes, function(child_handle) {
		if (child_handle.type === "handle") {
			$.push(childHandlesId, child_handle.id);
		}
	});
	trigger = {
		// key:"",//default key === ""
		bubble: true,
		event: function(NodeList_of_ViewInstance, dataManager) {
			var and = true;
			$.forEach(childHandlesId, function(child_handle_id) { //Compared to other values
				and = !! NodeList_of_ViewInstance[child_handle_id]._data
				if (!and) {
					return false; //stop forEach
				}
			});
			NodeList_of_ViewInstance[this.handleId]._data = and;
		}
	}
	return trigger;
});
V.registerTrigger("&&",V.triggers["and"]);