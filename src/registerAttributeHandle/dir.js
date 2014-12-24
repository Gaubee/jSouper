V.ra(function(attrKey, ele) {
	return attrKey === "className" || (attrKey === "value" && ele.tagName === "INPUT");
}, function(attrKey, element) {
	if (element.tagName === (V.namespave + "select").toUpperCase()) {
		return _AttributeHandleEvent.select;
	}
	return _AttributeHandleEvent.dir;
});