V.registerTrigger("HTML", function(handle, index, parentHandle) {
	var handleChilds = handle.childNodes,
		htmlTextHandlesId = handleChilds[0].id,
		beginCommentId = handleChilds[handleChilds.length - 1].id,
		endCommentId = handleChilds[handleChilds.length - 2].id,
		trigger;
	trigger = {
		// key:"",//default key === ""
		bubble: true,
		TEMP: {
			cacheNode: $.DOM.clone(shadowDIV)
		},
		event: function(NodeList_of_ViewInstance, dataManager) {
			var htmlText = NodeList_of_ViewInstance[htmlTextHandlesId]._data,
				cacheNode = this.TEMP.cacheNode,
				startCommentNode = NodeList_of_ViewInstance[beginCommentId].currentNode,
				endCommentNode = NodeList_of_ViewInstance[endCommentId].currentNode,
				parentNode = endCommentNode.parentNode,
				brotherNodes = parentNode.childNodes,
				index = -1;
			$.forEach(brotherNodes, function(node, i) {
				index = i;
				if (node === startCommentNode) {
					return false;
				}
			});
			index = index + 1;
			$.forEach(brotherNodes, function(node, i) {
				if (node === endCommentNode) {
					return false;
				}
				parentNode.removeChild(node);
			}, index);
			cacheNode.innerHTML = htmlText;
			$.forEach(cacheNode.childNodes, function(node, i) {
				$.DOM.insertBefore(parentNode, node, endCommentNode);
			});
		}
	}
	return trigger;
});