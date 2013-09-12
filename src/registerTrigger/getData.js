V.rt("", function(handle, index, parentHandle) {
	var textHandle = handle.childNodes[0],
		textHandleId = textHandle.id,
		key = textHandle.node.data,
		trigger;

	if (parentHandle.type !== "handle") { //as textHandle
		if ($.isString(key)) { // single String
			trigger = { //const 
				key: ".", //const trigger
				bubble: $TRUE,
				event: function(NodeList_of_ViewInstance, dataManager) {
					NodeList_of_ViewInstance[textHandleId].currentNode.data = key.substring(1, key.length - 1);
				}
			};
		} else { //String for databese by key
			trigger = {
				key: key,
				event: function(NodeList_of_ViewInstance, dataManager, triggerBy, isAttr, vi) { //call by ViewInstance's Node
					var data = dataManager.get(key),
						currentNode = NodeList_of_ViewInstance[textHandleId].currentNode;
					if (isAttr) {
						//IE浏览器直接编译，故不需要转义，其他浏览器需要以字符串绑定到属性中。需要转义，否则会出现引号冲突
						if (isAttr.key.indexOf("on") === 0 && !_isIE) {
							data = String(data).replace(/"/g, '\\"').replace(/'/g, "\\'");
						}
					}
					currentNode.data = data;
				}
			}
		}
	} else { //as stringHandle
		if ($.isString(key)) { // single String
			trigger = { //const 
				key: ".", //const trigger
				bubble: $TRUE,
				event: function(NodeList_of_ViewInstance, dataManager) {
					NodeList_of_ViewInstance[this.handleId]._data = key.substring(1, key.length - 1);
				}
			};
		} else { //String for databese by key
			trigger = {
				key: key,
				bubble: $TRUE,
				event: function(NodeList_of_ViewInstance, dataManager) {
					NodeList_of_ViewInstance[this.handleId]._data = dataManager.get(key);
				}
			};
		}
	}
	return trigger;
});
V.rt("$THIS", function(handle, index, parentHandle) {
	var textHandle = handle.childNodes[0],
		textHandleId = textHandle.id,
		key = textHandle.node.data || DataManager.config.$THIS,
		trigger;

	if (parentHandle.type !== "handle") { //as textHandle
		trigger = {
			key: key,
			event: function(NodeList_of_ViewInstance, dataManager, triggerBy, isAttr, vi) { //call by ViewInstance's Node
				var data = dataManager.getThis(key),
					currentNode = NodeList_of_ViewInstance[textHandleId].currentNode;
				currentNode.data = _handle_on_event_string(isAttr, data);
			}
		}
	} else { //as stringHandle
		trigger = {
			key: key,
			bubble: $TRUE,
			event: function(NodeList_of_ViewInstance, dataManager) {
				NodeList_of_ViewInstance[this.handleId]._data = dataManager.getThis(key);
			}
		};
	}
	return trigger;
});
V.rt("$PARENT", function(handle, index, parentHandle) {
	var textHandle = handle.childNodes[0],
		textHandleId = textHandle.id,
		key = textHandle.node.data || DataManager.config.$PARENT,
		trigger;

	if (parentHandle.type !== "handle") { //as textHandle
		trigger = {
			key: key,
			event: function(NodeList_of_ViewInstance, dataManager, triggerBy, isAttr, vi) { //call by ViewInstance's Node
				var data = dataManager.getParent(key),
					currentNode = NodeList_of_ViewInstance[textHandleId].currentNode;
				currentNode.data = _handle_on_event_string(isAttr, data);
			}
		}
	} else { //as stringHandle
		trigger = {
			key: key,
			bubble: $TRUE,
			event: function(NodeList_of_ViewInstance, dataManager) {
				NodeList_of_ViewInstance[this.handleId]._data = dataManager.getParent(key);
			}
		};
	}
	return trigger;
});
V.rt("$TOP", function(handle, index, parentHandle) {
	var textHandle = handle.childNodes[0],
		textHandleId = textHandle.id,
		key = textHandle.node.data || DataManager.config.$TOP,
		trigger;

	if (parentHandle.type !== "handle") { //as textHandle
		trigger = {
			key: key,
			event: function(NodeList_of_ViewInstance, dataManager, triggerBy, isAttr, vi) { //call by ViewInstance's Node
				var data = dataManager.getTop(key),
					currentNode = NodeList_of_ViewInstance[textHandleId].currentNode;
				currentNode.data = _handle_on_event_string(isAttr, data);
			}
		}
	} else { //as stringHandle
		trigger = {
			key: key,
			bubble: $TRUE,
			event: function(NodeList_of_ViewInstance, dataManager) {
				NodeList_of_ViewInstance[this.handleId]._data = dataManager.getTop(key);
			}
		};
	}
	return trigger;
});