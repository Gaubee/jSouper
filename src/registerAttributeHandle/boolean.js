var _boolAssignment = "|checked|selected|disabled|readonly|multiple|defer|declare|noresize|nowrap|noshade|compact|truespeed|async|typemustmatch|open|novalidate|ismap|default|seamless|autoplay|controls|loop|muted|reversed|scoped|autofocus|required|formnovalidate|editable|draggable|hidden|";
V.ra(function(attrKey) {
	return _boolAssignment.indexOf("|" + attrKey + "|") !== -1;
}, function(attrKey, element) {
	var result = _AttributeHandleEvent.bool
	switch (element.type.toLowerCase()) {
		case "radio":
			(attrKey === "checked") && (result = _AttributeHandleEvent.radio)
			break
		case "select-one":
			(attrKey === "selected") && (result = _AttributeHandleEvent.select)
			break
	}
	return result;
})