//no var ,for #include to use
function _layout_display(show_or_hidden, NodeList_of_ViewInstance, dataManager, /*triggerBy,*/ viewInstance_ID) {
	var handle = this,
		layoutViewInstance = V._instances[viewInstance_ID]._ALVI[handle.id];
	if (!layoutViewInstance) {
		return;
	}
	//get comment_endeach_id
	var commentPlaceholderElement = NodeList_of_ViewInstance[$.lI(handle.childNodes).id].currentNode;
	if (show_or_hidden) {
		if(!layoutViewInstance._canRemoveAble){//can-insert-able
			layoutViewInstance.insert(commentPlaceholderElement);
		}
	} else {
		layoutViewInstance.remove();
	}
};
V.rh("#>", V.rh("#layout", function(handle, index, parentHandle) {
	handle.display = _layout_display; //Custom rendering function
	_commentPlaceholder(handle, parentHandle);
}));