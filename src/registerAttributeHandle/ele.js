function eventFireElementEvent(key, currentNode, attrVM, vi /*, dm_id*/ , handle, triggerTable) {
	var elementEventName = key.replace("ele-", "").split("-").shift();
	//属性不支持大写，转化成峰驼式
	elementEventName = elementEventName.replace(/\_(\w)/g, function(matchStr, _char ) {
		return _char.toUpperCase();
	});
	var attrOuter = _getAttrOuter(attrVM);
	if (typeof currentNode[elementEventName] === "function" && attrOuter) {
		currentNode[elementEventName](attrOuter);
	}
};
//触发元素的原生函数，比如input.foucs()
V.ra(function(attrKey) {
	return attrKey.indexOf("ele-") === 0;
}, function(attrKey) {
	return eventFireElementEvent;
})