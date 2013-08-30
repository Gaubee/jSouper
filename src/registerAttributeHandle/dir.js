var _dirAssignment = ["className","value"];
V.registerAttrHandle(function(attrKey){
	return $.indexOf(_dirAssignment,attrKey) !==-1;
}, function() {
	return _AttributeHandleEvent.dir;
})