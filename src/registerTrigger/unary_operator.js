var _unary_operator_handle_builder = function(handle, index, parentHandle){
	var firstParameter_id = handle.childNodes[0].id,
		textHandle_id = handle.childNodes[0].childNodes[0].id,
		trigger = {
			bubble: true//build in global,can't use $TRUE
		};

	if (parentHandle.type !== "handle") { //as textHandle
		trigger.event = function(NodeList_of_ViewModel /*, model, triggerBy, isAttr, vi*/ ) { //call by ViewModel's Node
			var result =  +NodeList_of_ViewModel[firstParameter_id]._data,
				currentNode = NodeList_of_ViewModel[textHandle_id].currentNode;
			currentNode.data = result;
		}
	} else {
		trigger.event = function(NodeList_of_ViewModel /*, model, triggerBy, isAttr, vi*/ ) { //call by ViewModel's Node
			var result =  +NodeList_of_ViewModel[firstParameter_id]._data;
			NodeList_of_ViewModel[this.handleId]._data = result;
		}
	}

	return trigger;
}
var _unary_operator_handle_build_str = String(_unary_operator_handle_builder),
	_unary_operator_handle_build_arguments = _unary_operator_handle_build_str.match(/\(([\w\W]+?)\)/)[1],
	_unary_operator_handle_build_str = _unary_operator_handle_build_str.substring(_unary_operator_handle_build_str.indexOf("{")+1,_unary_operator_handle_build_str.length-1),
	_unary_operator_handle_build_factory = function(operator) {
		var result= Function(_unary_operator_handle_build_arguments, _unary_operator_handle_build_str.replace(/\+/g, operator))
		return result
	};
$.E(_unary_operator_list, function(operator) {
	V.rt(operator, _unary_operator_handle_build_factory(operator))
});