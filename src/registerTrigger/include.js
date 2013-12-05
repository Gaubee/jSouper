var _cache_xhrConifg = {};
var _require_module = function(url, handleFun) {
	var xhrConifg = _cache_xhrConifg.hasOwnProperty(url) && _cache_xhrConifg[url]
	if (xhrConifg) {
		$.p(xhrConifg.success._, handleFun)
	} else {
		var handleQuene = function(status, xhr) {
			$.ftE(handleQuene._, function(handleFun) {
				handleFun(status, xhr);
			})
		}
		handleQuene._ = [handleFun];
		xhrConifg = _cache_xhrConifg[url] = {
			url: url,
			success: handleQuene,
			error: function() {
				throw new Error("module " + url + " is undefined.")
			},
			complete:function(){
				//GC
				_cache_xhrConifg[url] = $NULL;
			}
		}
		$.ajax(xhrConifg)
	}
}
V.rt("#include", function(handle, index, parentHandle) {
	var templateHandle_id = handle.childNodes[0].id;

	//base on layout
	var trigger = V.triggers["#layout"](handle, index, parentHandle)

	// Ajax NodeList_of_ViewInstance[templateHandle_id]._data
	var _event = trigger.event;
	trigger.event = function(NodeList_of_ViewInstance, dataManager, /*eventTrigger,*/ isAttr, viewInstance_ID) {
		var url = NodeList_of_ViewInstance[templateHandle_id]._data;
		var args = arguments
		if (!V.modules[url]) {
			_require_module(url,function(status,xhr){
				V.modules[url] = ViewParser.parseStr(xhr.responseText)
				_event.apply(this, args);
			})
		} else {
			_event.apply(this, args);
		}
	}
	return trigger;
});