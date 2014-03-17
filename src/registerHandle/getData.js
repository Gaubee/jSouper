// var _noParameters = _placeholder();
V.rh("", function(handle, index, parentHandle) {
	var textHandle = handle.childNodes[0];
	if (!textHandle) {//{()} 无参数
		$.p(handle.childNodes,textHandle = new TextHandle(doc.createTextNode("")))
	}
	// 校准类型
	textHandle.asArg = $TRUE;
	if (parentHandle.type !== "handle") { //is textNode
		if (textHandle) {
			$.iA(parentHandle.childNodes, handle, textHandle);
			//Node position calibration
			//textHandle's parentNode will be rewrited. (by using $.insertAfter)
			return $.noop;
		}
	}// else {console.log("ignore:",textHandle) if (textHandle) {textHandle.ignore = $TRUE; } }  //==> ignore Node's childNodes will be ignored too.
});