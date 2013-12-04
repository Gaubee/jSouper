/*
 * user defined handle function like Handlebarsjs
 */
function registerHandle(handleName, handleFun) {
	templateHandles[handleName]= $TRUE;
	V.rh(handleName, function(handle, index, parentHandle) {
		var endCommentHandle = _commentPlaceholder(handle, parentHandle, "html_end_" + handle.id),
			startCommentHandle = _commentPlaceholder(handle, parentHandle, "html_start_" + handle.id);
	});
	V.rt(handleName, function(handle, index, parentHandle) {
		var handleChilds = handle.childNodes,
			beginCommentId,// = handleChilds[handleChilds.length - 1].id,
			endCommentId,// = handleChilds[handleChilds.length - 2].id,
			cacheNode = $.D.cl(shadowDIV),
			trigger,
			argumentsIdSet = [];
		$.ftE(handleChilds, function(handle_arg) {
			$.p(argumentsIdSet, handle_arg.id);
		});
		beginCommentId = argumentsIdSet[argumentsIdSet.length-1]
		endCommentId = argumentsIdSet[argumentsIdSet.length-2]
		trigger = {
			// key:"",//default key === ""
			bubble: true,
			event: function(NodeList_of_ViewInstance, dataManager, /*triggerBy,*/ isAttr, viewInstance_ID) {
				var startCommentNode = NodeList_of_ViewInstance[beginCommentId].currentNode,
					endCommentNode = NodeList_of_ViewInstance[endCommentId].currentNode,
					parentNode = endCommentNode.parentNode,
					brotherNodes = parentNode.childNodes,
					argumentsDataSet = [],
					index = -1;

				for (var i = 0, len = argumentsIdSet.length - 2, handle_arg_data, argumentsDataSet; i < len; i += 1) {
					$.p(argumentsDataSet,NodeList_of_ViewInstance[argumentsIdSet[i]]._data)
				};
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
					$.D.rC(parentNode, node); //remove
				}, index);

				cacheNode.innerHTML = handleFun.apply(V._instances[viewInstance_ID],argumentsDataSet)
				$.fE(cacheNode.childNodes, function(node, i) {
					$.D.iB(parentNode, node, endCommentNode);
				});
			}
		}
		return trigger;
	});
	return ViewParser;
}
registerHandle("HTML",function () {
	return Array.prototype.join.call(arguments,"");
})
