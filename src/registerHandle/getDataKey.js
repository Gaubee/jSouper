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

		return function(NodeList_of_ViewModel) {
			var nextNodeInstance = nextHandle && NodeList_of_ViewModel[nextHandle.id].currentNode,
				textNodeInstance = NodeList_of_ViewModel[textHandle.id].currentNode,
				parentNodeInstance = NodeList_of_ViewModel[parentHandle.id].currentNode
				parentNodeInstance&&$.D.iB(parentNodeInstance, textNodeInstance, nextNodeInstance); //Manually insert node
		}
	}
});