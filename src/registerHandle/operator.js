var _operator_handle  = function(handle, index, parentHandle) {
	var textHandle = handle.childNodes[0].childNodes[0];
	if (parentHandle.type !== "handle") {
		if (textHandle) {
			$.iA(parentHandle.childNodes, handle, textHandle);
			return $.noop;
		}
	}
},
_operator_list = "+ - * / % == === != !== > < && || ^ >> << & |".split(" ");
$.E(_operator_list, function(operator) {
	V.rh(operator, _operator_handle)
});