V.rh("define", function(handle, index, parentHandle) {
	if(parentHandle.type !== "handle"){
		$.iA(parentHandle.childNodes,handle,handle.childNodes[0].childNodes[0]);
		return $.noop
	}
});