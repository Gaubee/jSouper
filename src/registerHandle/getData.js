V.rh("", function(handle, index, parentHandle) {
	var textHandle = handle.childNodes[0];
	if (parentHandle.type !== "handle") { //is textNode
		if (textHandle) {
			$.iA(parentHandle.childNodes, handle, textHandle);
			//Node position calibration
			//textHandle's parentNode will be rewrited. (by using $.insertAfter)
			return $.noop;
		}
	}// else {console.log("ignore:",textHandle) if (textHandle) {textHandle.ignore = $TRUE; } }  //==> ignore Node's childNodes will be ignored too.
});