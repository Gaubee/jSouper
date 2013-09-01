var _each_display = function(show_or_hidden, NodeList_of_ViewInstance, dataManager, triggerBy,viewInstance_ID) {
	var handle = this,
		parentHandle = handle.parentNode,
		comment_endeach_id,
		allArrViewInstances = V._instances[viewInstance_ID]._AVI,
		arrViewInstances = allArrViewInstances[handle.id];
	$.forEach(parentHandle.childNodes, function(child_handle, index, cs) { //get comment_endeach_id
		if (child_handle.id === handle.id) {
			comment_endeach_id = cs[index + 3].id;
			return false;
		}
	});
	if (show_or_hidden) {
		$.forEach(arrViewInstances, function(viewInstance, index) {
			// console.log(comment_endeach_id,NodeList_of_ViewInstance[comment_endeach_id],handle,parentHandle)
			viewInstance.insert(NodeList_of_ViewInstance[comment_endeach_id].currentNode)
			// console.log(handle.len)
			if (handle.len === index + 1) {
				return false;
			}
		})
	} else {
		$.forEach(arrViewInstances, function(viewInstance) {
			// console.log(viewInstance)
			viewInstance.remove();
		})
	}
};
V.registerHandle("#each", function(handle, index, parentHandle) {
	//The Nodes between #each and /each will be pulled out , and not to be rendered.
	//which will be combined into new View module.
	var _shadowBody = $.DOM.clone(shadowBody),
		eachModuleHandle = ElementHandle(_shadowBody),
		endIndex = 0;

	// handle.arrViewInstances = [];//Should be at the same level with currentNode
	handle.len = 0;
	var layer = 1;
	$.forEach(parentHandle.childNodes, function(childHandle, index) {
		endIndex = index;
		// console.log(childHandle.handleName)
		if (childHandle.handleName === "#each") {
			layer+=1
		}
		if (childHandle.handleName === "/each") {
			layer-=1;
			if (!layer) {
				return false
			}
		}
		$.push(eachModuleHandle.childNodes, childHandle);
	}, index + 1);
	// console.log("----",handle.id,"-------")
	parentHandle.childNodes.splice(index + 1, endIndex - index - 1); //Pulled out
	V.eachModules[handle.id] = View(eachModuleHandle); //Compiled into new View module

	handle.display = _each_display; //Custom rendering function
	_commentPlaceholder(handle, parentHandle);
});
V.registerHandle("/each", placeholderHandle);