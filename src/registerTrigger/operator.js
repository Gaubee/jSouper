var _tryToNumberHash = _placeholder("tTN");
var _tryToNumber = global[_tryToNumberHash] = function(str) {
    if ($.isStoN(str)) {
        str = parseFloat(str);
    }
    return str
}
var _operator_handle_builder = function(handle, index, parentHandle) {
    var firstParameter_id = handle.childNodes[0].id,
        textHandle_id = handle.childNodes[0].childNodes[0].id,
        secondParameter = handle.childNodes[1],
        trigger = {
            bubble: true //build in global,can't use $TRUE
        };
    // console.log(handle.childNodes[0].parentNode, handle.parentNode)
    if (parentHandle.type !== "handle") { //as textHandle
        trigger.event = function(NodeList_of_ViewModel /*, model, triggerBy, isAttr, vi*/ ) { //call by ViewModel's Node
            var result = _tryToNumber(NodeList_of_ViewModel[firstParameter_id]._data) + _tryToNumber(secondParameter ? NodeList_of_ViewModel[secondParameter.id]._data : 0),
                textHandle = NodeList_of_ViewModel[textHandle_id],
                currentNode = textHandle.currentNode;
            if (currentNode) {
                currentNode.data = result;
            } else {
                textHandle._data = result
            }
        }
    } else {
        trigger.event = function(NodeList_of_ViewModel /*, model, triggerBy, isAttr, vi*/ ) { //call by ViewModel's Node
            var result = _tryToNumber(NodeList_of_ViewModel[firstParameter_id]._data) + _tryToNumber(secondParameter ? NodeList_of_ViewModel[secondParameter.id]._data : 0);
            NodeList_of_ViewModel[this.handleId]._data = result;
        }
    }

    return trigger;
}
var _operator_handle_build_str = String(_operator_handle_builder),
    _operator_handle_build_arguments = _operator_handle_build_str.match(/\(([\w\W]+?)\)/)[1],
    _operator_handle_build_str = _operator_handle_build_str.substring(_operator_handle_build_str.indexOf("{") + 1, _operator_handle_build_str.length - 1),
    _operator_handle_build_factory = function(operator) {
        var result = _operator_handle_build_str.replace(/\+/g, operator).replace(/_tryToNumber/g, _tryToNumberHash);
        result = Function(_operator_handle_build_arguments, result);
        return result
    };
$.E(_operator_list, function(operator) {
    V.rt(operator, _operator_handle_build_factory(operator))
});
V.rt("&lt;", V.triggers["<"]);
V.rt("&gt;", V.triggers[">"]);
