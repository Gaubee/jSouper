var _include_display_arguments = {};
function _include_display(show_or_hidden, NodeList_of_ViewModel, model, /*triggerBy,*/ viewModel_ID) {
	var handle = this,
		id = handle.id,
		includeViewModel = V._instances[viewModel_ID]._ALVI[id];
	if (!includeViewModel) {
		_include_display_arguments[id] = arguments;
		return;
	}
	//get comment_endeach_id
	var commentPlaceholderElement = NodeList_of_ViewModel[$.lI(handle.childNodes).id].currentNode;
	if (show_or_hidden) {
		if(!includeViewModel._canRemoveAble){//can-insert-able
			includeViewModel.insert(commentPlaceholderElement);
		}
	} else {
		includeViewModel.remove();
	}
};
V.rh("#include", function(handle, index, parentHandle) {
	handle.display = _include_display; //Custom rendering function
	_commentPlaceholder(handle, parentHandle);
});