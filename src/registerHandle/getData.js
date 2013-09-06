V.rh("", function(handle, index, parentHandle) {
	var textHandle = handle.childNodes[0];
	if (parentHandle.type !== "handle") { //is textNode
		var nextHandle = _commentPlaceholder(handle, parentHandle, "text " + handle.id);
		if (textHandle) { //textNode as Placeholder

			$.iA(parentHandle.childNodes, handle, textHandle);
			//Node position calibration
			//no "$.insert" Avoid sequence error

			return function(NodeList_of_ViewInstance) {
				var nextNodeInstance = NodeList_of_ViewInstance[nextHandle.id].currentNode,
					textNodeInstance = NodeList_of_ViewInstance[textHandle.id].currentNode,
					parentNodeInstance = NodeList_of_ViewInstance[parentHandle.id].currentNode
					$.D.iB(parentNodeInstance, textNodeInstance, nextNodeInstance); //Manually insert node
			}
		}

	} else {
		if (textHandle) {
			textHandle.ignore = $TRUE;
		}
	}
});