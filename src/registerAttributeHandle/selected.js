_AttributeHandleEvent.select = function(key, currentNode, parserNode, vi) { //select selected
	var attrOuter = _getAttrOuter(parserNode),
		data = vi.get(attrOuter),
		selectHashCode = $.hashCode(currentNode, "selected");
	currentNode[selectHashCode] = attrOuter;
	// console.log(attrOuter,typeof data, currentNode, selectHashCode)
	if (data instanceof Array) {
		$.ftE(currentNode.options, function(option) {
			option.selected = ($.iO(data, option.value) !== -1)
		})
	} else {
		$.ftE(currentNode.options, function(option) {
			option.selected = data === option.value
		})
	}
}