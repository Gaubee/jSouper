var _dirAssignment = " className value ";
V.ra(function(attrKey) {
    return _dirAssignment.indexOf(" " + attrKey + " ") !== -1;
}, function(attrKey, element) {
    if (element.tagName === (V.namespave + "select").toUpperCase()) {
        return _AttributeHandleEvent.select;
    }
    return _AttributeHandleEvent.dir;
})
