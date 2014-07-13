function _customTag_display(show_or_hidden, NodeList_of_ViewModel, model, /*triggerBy,*/ viewModel_ID) {
	var handle = this,
		customTagVm = V._instances[viewModel_ID]._CVI[handle.id];
	if (!customTagVm) {
		return;
	}
	//get comment_endeach_id
	var commentPlaceholderElement = NodeList_of_ViewModel[$.lI(handle.childNodes).id].currentNode;
	if (show_or_hidden) {
		if(!customTagVm._canRemoveAble){//can-insert-able
			customTagVm.insert(commentPlaceholderElement);
		}
	} else {
		customTagVm.remove();
	}
};
V.rh("custom_tag", function(handle, index, parentHandle) {
	handle.display = _customTag_display; //Custom rendering function
	_commentPlaceholder(handle, parentHandle);
});