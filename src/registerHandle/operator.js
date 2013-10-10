var _operator_handle  = function(handle, index, parentHandle) {
	var textHandle = handle.childNodes[0].childNodes[0];
	if (parentHandle.type !== "handle") {
		if (textHandle) {
			$.iA(parentHandle.childNodes, handle, textHandle);
			return $.noop;
		}
	}
};
$.fE("+-*/%", function(operator) {
	V.rh(operator, _operator_handle)
});