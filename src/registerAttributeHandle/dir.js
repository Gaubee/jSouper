var _dirAssignment = "|className|value|";
V.ra(function(attrKey){
	return _dirAssignment.indexOf("|"+attrKey+"|")!==-1;
}, function() {
	return _AttributeHandleEvent.dir;
})