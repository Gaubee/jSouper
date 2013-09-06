var _event_by_fun = (function() {
	var testEvent = Function(""),
		attrKey = "onclick";

	_testDIV.setAttribute(attrKey, testEvent);
	if (typeof _testDIV.getAttribute(attrKey) === "string") {
		return $FALSE;
	}
	return $TRUE;
}());
V.ra(function(attrKey){
	attrKey.indexOf("on") === 0;
},function () {
	return _event_by_fun&&_AttributeHandleEvent.event;
})