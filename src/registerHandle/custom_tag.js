V.rh("custom_tag", function(handle, index, parentHandle) {
	handle.display = _layout_display; //Custom rendering function
	_commentPlaceholder(handle, parentHandle);
});