var _commentPlaceholder = function(handle, parentHandle,commentText) {
		commentText = commentText||(handleName + handle.id);
	var handleName = handle.handleName,
		commentNode = $.DOM.Comment(commentText),
		commentHandle = CommentHandle(commentNode); // commentHandle as Placeholder

	$.push(handle.childNodes, commentHandle);
	$.insertAfter(parentHandle.childNodes, handle, commentHandle); //Node position calibration//no "$.insert" Avoid sequence error
	return commentHandle;
};
var placeholderHandle = function(handle, index, parentHandle) {
	var commentHandle = _commentPlaceholder(handle, parentHandle);
};