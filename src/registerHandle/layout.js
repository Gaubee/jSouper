var _layout_display = function(show_or_hidden, NodeList_of_ViewInstance, dataManager, triggerBy, viewInstance_ID) {
	var handle = this,
		commentPlaceholderElement,
		layoutViewInstance = V._instances[viewInstance_ID]._ALVI[handle.id];
	if (!layoutViewInstance) {
		return;
	}
	$.forEach(handle.parentNode.childNodes, function(child_handle, index, cs) { //get comment_endeach_id
		if (child_handle.id === handle.id) {
			commentPlaceholderElement = NodeList_of_ViewInstance[cs[index + 1].id].currentNode
			return false;
		}
	});
	console.log(show_or_hidden, viewInstance_ID, layoutViewInstance)
	if (show_or_hidden) {
		layoutViewInstance.insert(commentPlaceholderElement);
	} else {
		layoutViewInstance.remove();
	}

};
V.rh(">", V.rh("#layout", function(handle, index, parentHandle) {
	handle.display = _layout_display; //Custom rendering function
	_commentPlaceholder(handle, parentHandle);
}));