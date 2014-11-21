function eventFireElementEvent (key, currentNode, attrVM, vi /*, dm_id*/ ,handle, triggerTable) {
	var elementEventName = key.replace("ele-","");
	var attrOuter = _getAttrOuter(attrVM);
	if (typeof currentNode[elementEventName] === "function"&&attrOuter) {
		currentNode[elementEventName]();
	}
}
//触发元素的原生函数，比如input.foucs()
V.ra(function(attrKey) {
	return attrKey.indexOf("ele-") === 0;
}, function(attrKey) {
	return eventFireElementEvent;
})