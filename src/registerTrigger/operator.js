var _operator_handle_builder = function(handle, index, parentHandle){
	var firstParameter_id = handle.childNodes[0].id,
		textHandle_id = handle.childNodes[0].childNodes[0].id,
		secondParameter = handle.childNodes[1],
		trigger = {
			bubble: true//build in global,can't use $TRUE
		};
	// console.log(handle.childNodes[0].parentNode, handle.parentNode)

	if (parentHandle.type !== "handle") { //as textHandle
		trigger.event = function(NodeList_of_ViewInstance /*, dataManager, triggerBy, isAttr, vi*/ ) { //call by ViewInstance's Node
			var result =  NodeList_of_ViewInstance[firstParameter_id]._data+(secondParameter ? NodeList_of_ViewInstance[secondParameter.id]._data : 0) ,
				currentNode = NodeList_of_ViewInstance[textHandle_id].currentNode;
			currentNode.data = result;
		}
	} else {
		trigger.event = function(NodeList_of_ViewInstance /*, dataManager, triggerBy, isAttr, vi*/ ) { //call by ViewInstance's Node
			var result =  NodeList_of_ViewInstance[firstParameter_id]._data+(secondParameter ? NodeList_of_ViewInstance[secondParameter.id]._data : 0) ;
			NodeList_of_ViewInstance[this.handleId]._data = result;
		}
	}

	return trigger;
}
var _operator_handle_build_str = String(_operator_handle_builder),
	_operator_handle_build_arguments = _operator_handle_build_str.match(/\(([\w\W]+?)\)/)[1],
	_operator_handle_build_str = _operator_handle_build_str.substring(_operator_handle_build_str.indexOf("{")+1,_operator_handle_build_str.length-1),
	_operator_handle_build_factory = function(operator) {
		var result= Function(_operator_handle_build_arguments, _operator_handle_build_str.replace(/\+/g, operator))
		return result
	};
$.ftE(_operator_list, function(operator) {
	V.rt(operator, _operator_handle_build_factory(operator))
});