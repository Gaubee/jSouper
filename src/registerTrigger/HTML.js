V.rt("HTML", function(handle, index, parentHandle) {
	var handleChilds = handle.childNodes,
		htmlTextHandlesId = handleChilds[0].id,
		beginCommentId = handleChilds[handleChilds.length - 1].id,
		endCommentId = handleChilds[handleChilds.length - 2].id,
		cacheNode =  $.D.cl(shadowDIV),
		trigger;
	trigger = {
		// key:"",//default key === ""
		bubble: true,
		event: function(NodeList_of_ViewInstance, dataManager) {
			var htmlText = NodeList_of_ViewInstance[htmlTextHandlesId]._data,
				startCommentNode = NodeList_of_ViewInstance[beginCommentId].currentNode,
				endCommentNode = NodeList_of_ViewInstance[endCommentId].currentNode,
				parentNode = endCommentNode.parentNode,
				brotherNodes = parentNode.childNodes,
				index = -1;
			$.fE(brotherNodes, function(node, i) {
				index = i;
				if (node === startCommentNode) {
					return $FALSE;
				}
			});
			index = index + 1;
			$.fE(brotherNodes, function(node, i) {
				if (node === endCommentNode) {
					return $FALSE;
				}
				$.D.rC(parentNode,node);//remove
			}, index);
			cacheNode.innerHTML = htmlText;
			$.fE(cacheNode.childNodes, function(node, i) {
				$.D.iB(parentNode, node, endCommentNode);
			});
		}
	}
	return trigger;
});