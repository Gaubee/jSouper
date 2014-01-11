function _layout_display(show_or_hidden, NodeList_of_ViewModel, model, /*triggerBy,*/ viewModel_ID) {
	var handle = this,
		layoutViewModel = V._instances[viewModel_ID]._ALVI[handle.id];
	if (!layoutViewModel) {
		return;
	}
	//get comment_endeach_id
	var commentPlaceholderElement = NodeList_of_ViewModel[$.lI(handle.childNodes).id].currentNode;
	if (show_or_hidden) {
		if(!layoutViewModel._canRemoveAble){//can-insert-able
			layoutViewModel.insert(commentPlaceholderElement);
		}
	} else {
		layoutViewModel.remove();
	}
};
V.rh("#>", V.rh("#layout", function(handle, index, parentHandle) {
	handle.display = _layout_display; //Custom rendering function
	_commentPlaceholder(handle, parentHandle);
}));