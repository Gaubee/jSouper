V.rh("@", function(handle, index, parentHandle) {
	var textHandle = handle.childNodes[0];
	var i = 0;
	do {
		i += 1;
		var nextHandle = parentHandle.childNodes[index + i];
	} while (nextHandle && nextHandle.ignore);
	if (textHandle) { //textNode as Placeholder

		$.iA(parentHandle.childNodes, handle, textHandle);
		//Node position calibration
		//no "$.insert" Avoid sequence error

		return function(NodeList_of_ViewInstance) {
			var nextNodeInstance = nextHandle && NodeList_of_ViewInstance[nextHandle.id].currentNode,
				textNodeInstance = NodeList_of_ViewInstance[textHandle.id].currentNode,
				parentNodeInstance = NodeList_of_ViewInstance[parentHandle.id].currentNode
				parentNodeInstance&&$.D.iB(parentNodeInstance, textNodeInstance, nextNodeInstance); //Manually insert node
		}
	}
});