var _include_display_arguments = {};
function _include_display(show_or_hidden, NodeList_of_ViewInstance, dataManager, /*triggerBy,*/ viewInstance_ID) {
	var handle = this,
		id = handle.id,
		includeViewInstance = V._instances[viewInstance_ID]._ALVI[id];
	if (!includeViewInstance) {
		_include_display_arguments[id] = arguments;
		return;
	}
	//get comment_endeach_id
	var commentPlaceholderElement = NodeList_of_ViewInstance[$.lI(handle.childNodes).id].currentNode;
	if (show_or_hidden) {
		if(!includeViewInstance._canRemoveAble){//can-insert-able
			includeViewInstance.insert(commentPlaceholderElement);
		}
	} else {
		includeViewInstance.remove();
	}
};
V.rh("#include", function(handle, index, parentHandle) {
	handle.display = _include_display; //Custom rendering function
	_commentPlaceholder(handle, parentHandle);
});