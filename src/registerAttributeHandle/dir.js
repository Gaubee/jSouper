V.ra(function(attrKey, ele) {
		return attrKey === "className" || (attrKey === "value" && _tagNameIsArr(ele, ["select", "input"]));
	},
	function(attrKey, element) {
		if (_tagNameIs(element, "select")) {
			return _AttributeHandleEvent.select;
		}
		return _AttributeHandleEvent.dir;
	});