V.registerTrigger("#if", function(handle, index, parentHandle) {
	// console.log(handle)
	var id = handle.id,
		ignoreHandleType = /handle|comment/,
		conditionHandleId = handle.childNodes[0].id,
		parentHandleId = parentHandle.id,

		comment_else_id, //#if inserBefore #else
		comment_endif_id, //#else inserBefore /if

		conditionDOM = handle._controllers,
		conditionStatus = true, //the #if block scope
		trigger,
		deep = 0;
	// console.log(parentHandle, index)
	$.forEach(parentHandle.childNodes, function(child_handle, i, childHandles) {

		if (child_handle.handleName === "#if") {
			deep += 1
		} else if (child_handle.handleName === "#else") {
			if (deep === 1) {
				conditionStatus = !conditionStatus;
				comment_else_id = $.lastItem(child_handle.childNodes).id;
			}
		} else if (child_handle.handleName === "/if") {
			deep -= 1
			if (!deep) {
				comment_endif_id = $.lastItem(child_handle.childNodes).id;
				return false;
			}
		} else if (child_handle.type !== "comment") {
			$.push(child_handle._controllers, id);
			$.push(conditionDOM[conditionStatus], child_handle.id);
		}
	}, index); // no (index + 1):scan itself:deep === 0 --> conditionStatus = !conditionStatus;

	trigger = {
		// key:"",//default is ""
		// chain: true,
		event: function(NodeList_of_ViewInstance, dataManager, triggerBy) {
			var conditionVal = !! NodeList_of_ViewInstance[conditionHandleId]._data,
				parentNode = NodeList_of_ViewInstance[parentHandleId].currentNode,
				markHandleId = comment_else_id, //if(true)
				markHandle; //default is undefined --> insertBefore === appendChild
			if (NodeList_of_ViewInstance[this.handleId]._data !== conditionVal || triggerBy) {
				NodeList_of_ViewInstance[this.handleId]._data = conditionVal;
				if (!conditionVal) {
					markHandleId = comment_endif_id;
				}
				if (markHandleId) {
					markHandle = NodeList_of_ViewInstance[markHandleId].currentNode;
				}
				$.forEach(conditionDOM[conditionVal], function(id) {
					var currentHandle = NodeList_of_ViewInstance[id],
						node = currentHandle.currentNode,
						placeholderNode = (NodeList_of_ViewInstance[id].placeholderNode = NodeList_of_ViewInstance[id].placeholderNode || $.DOM.Comment(id)),
						display = true;

					$.forEach(currentHandle._controllers, function(controller_id) {
						//Traverse all Logic Controller(if-else-endif) to determine whether each Controller are allowed to display it.
						var controllerHandle = NodeList_of_ViewInstance[controller_id]
						return display = display && ($.indexOf(controllerHandle._controllers[controllerHandle._data ? true : false], currentHandle.id) !== -1);
						//when display is false,abort traversing
					});
					if (display) {
						if (currentHandle.display) { //Custom Display Function,default is false
							currentHandle.display(true, NodeList_of_ViewInstance, dataManager, triggerBy)
						} else if (node) {
							$.DOM.replace(parentNode, node, placeholderNode)
						}
					}
				});
				$.forEach(conditionDOM[!conditionVal], function(id) {
					var currentHandle = NodeList_of_ViewInstance[id],
						node = currentHandle.currentNode,
						placeholderNode = (currentHandle.placeholderNode = currentHandle.placeholderNode || $.DOM.Comment(id));

					if (currentHandle.display) { //Custom Display Function,default is false
						currentHandle.display(false, NodeList_of_ViewInstance, dataManager, triggerBy)
					} else if (node) {
						$.DOM.replace(parentNode, placeholderNode, node)
					}
				})
			}
		}
	}

	return trigger;
});