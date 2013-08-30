var iecheck = function(key, currentNode, parserNode) {
	var attrOuter = $.trim(_getAttrOuter(parserNode).replace(_booleanFalseRegExp, ""));

	if (attrOuter) {
		_asynAttributeAssignment(currentNode, "defaultChecked", key);
		// currentNode.defaultChecked = true;
	} else {
		_asynAttributeAssignment(currentNode, "defaultChecked", false);
		// currentNode.defaultChecked = false;
	}
	(this._attributeHandle = _AttributeHandleEvent.bool)(key, currentNode, parserNode);
}
V.registerAttrHandle("checked", function() {
	return _isIE ? iecheck : _AttributeHandleEvent.com;
})