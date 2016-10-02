/*
 * user defined handle function like Handlebarsjs
 */
function registerHandle(handleName, handleFun) {

	function _display(show_or_hidden, NodeList_of_ViewModel, model, /*triggerBy,*/ viewModel_ID) {
		var handle = this;
		var handleChilds = handle.childNodes,
			startCommentNode = NodeList_of_ViewModel[handleChilds[1].id].currentNode,
			endCommentNode = NodeList_of_ViewModel[handleChilds[0].id].currentNode;
		var fg = handle.fg || (handle.fg = doc.createDocumentFragment());
		var parentNode = endCommentNode.parentNode,
			index = -1;
		if (show_or_hidden) {
			$.D.iB(parentNode, fg, endCommentNode);
		} else if (fg.childNodes.length === 0) { //隐藏
			//只留endCommentNode作为占位符
			var currentNode = startCommentNode;
			do {
				var removerNode = currentNode;
				currentNode = currentNode.nextSibling;
				$.D.ap(fg, removerNode);
			} while (currentNode && currentNode !== endCommentNode);
		}
	};
	templateHandles[handleName] = $TRUE;
	V.rh(handleName, function(handle, index, parentHandle) {
		handle.display = _display;
		var endCommentHandle = _commentPlaceholder(handle, parentHandle, "html_end_" + handle.id),
			startCommentHandle = _commentPlaceholder(handle, parentHandle, "html_start_" + handle.id);
	});
	V.rt(handleName, function(handle, index, parentHandle) {
		var handleChilds = handle.childNodes,
			beginCommentId, // = handleChilds[handleChilds.length - 1].id,
			endCommentId, // = handleChilds[handleChilds.length - 2].id,
			cacheNode = fragment(), //$.D.cl(shadowDIV),
			trigger,
			argumentsIdSet = [];
		var expression = Expression.get(handle.handleInfo.expression);
		$.E(handleChilds, function(handle_arg) {
			$.p(argumentsIdSet, handle_arg.id);
		});
		beginCommentId = argumentsIdSet[argumentsIdSet.length - 1]
		endCommentId = argumentsIdSet[argumentsIdSet.length - 2]
		trigger = {
			// key:"",//default key === ""
			key: expression.keys.length ? expression.keys : ".",
			bubble: true,
			event: function(NodeList_of_ViewModel, model, /*triggerBy,*/ isAttr, viewModel_ID) {
				var startCommentNode = NodeList_of_ViewModel[beginCommentId].currentNode,
					endCommentNode = NodeList_of_ViewModel[endCommentId].currentNode,
					// argumentsDataSet = [],
					index = -1;
				// debugger
				// //FIX Polymer.js BUG
				// endCommentNode.__dom && endCommentNode.parentNode && (
				// 	endCommentNode.__dom.parentNode = endCommentNode.parentNode)
				// startCommentNode.__dom && startCommentNode.parentNode && (
				// 	startCommentNode.__dom.parentNode = startCommentNode.parentNode)

				var handleArgs = expression.foo(V._instances[viewModel_ID]);

				//先移除无用内容
				var currentNode = startCommentNode.nextSibling;
				var parentNode = currentNode && currentNode.parentNode;
				while (currentNode && currentNode !== endCommentNode) { //在fg里面的话可能是null
					var removerNode = currentNode;
					currentNode = currentNode.nextSibling;
					$.D.rC(parentNode, removerNode); //remove
				}

				cacheNode.innerHTML = handleFun.apply(V._instances[viewModel_ID], handleArgs)
					// $.e(cacheNode.childNodes, function(node, i) {
					// 	$.D.iB(parentNode, node, endCommentNode);
					// });
				var currentNode = cacheNode.childNodes[0];
				var iANode = startCommentNode;
				var parentNode = iANode.parentNode;
				while (currentNode) {
					var insertNode = currentNode;
					currentNode = currentNode.nextSibling;
					$.D.iA(parentNode, insertNode, iANode);
					iANode = insertNode;
				}
			}
		}
		return trigger;
	});
	return jSouper;
}
registerHandle("HTML", function() {
	return Array.prototype.join.call(arguments, "");
})
