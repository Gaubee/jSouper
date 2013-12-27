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
            complete: function() {
                //GC
                _cache_xhrConifg[url] = $NULL;
            }
        }
        $.ajax(xhrConifg)
    }
};
var _runScripted = _placeholder("run-");

function _runScript(node) {
    var scriptNodeList = node.getElementsByTagName('script');
    $.ftE(scriptNodeList, function(scriptNode) {
        if ((!scriptNode.type || scriptNode.type === "text/javascript") && !scriptNode[_runScripted]) {
            var newScript = doc.createElement("script");
            //TODO:clone attribute;
            newScript.text = scriptNode.text;
            newScript[_runScripted] = $TRUE;
            // console.log(scriptNode)
            scriptNode.parentNode.replaceChild(newScript, scriptNode);
        }
    })
}
var _include_lock = {};
V.rt("#include", function(handle, index, parentHandle) {
    var templateHandle_id = handle.childNodes[0].id;

    //base on layout
    var trigger = V.triggers["#layout"](handle, index, parentHandle);
    var layoutViewInstance;

    // Ajax NodeList_of_ViewInstance[templateHandle_id]._data
    var _event = trigger.event;
    var _uid = $.uid();
    trigger.event = function(NodeList_of_ViewInstance, dataManager, /*eventTrigger,*/ isAttr, viewInstance_ID) {
        var url = NodeList_of_ViewInstance[templateHandle_id]._data;
        var args = arguments
        if (!_include_lock[_uid]) {
            _include_lock[_uid] = $TRUE;
            if (!V.modules[url]) {
                _require_module(url, function(status, xhr) {
                    V.modules[url] = ViewParser.parseStr(xhr.responseText)
                    layoutViewInstance = _event.apply(trigger, args);
                    if (layoutViewInstance && !layoutViewInstance._runScripted) {
                        layoutViewInstance._runScripted = $TRUE;
                        _runScript(layoutViewInstance.handleNodeTree.node);
                        _include_lock[_uid] = $FALSE;
                    }
                })
            } else {
                layoutViewInstance = _event.apply(trigger, args);
                if (!layoutViewInstance._runScripted) {
                    layoutViewInstance._runScripted = $TRUE;
                    _runScript(layoutViewInstance.topNode());
                }
                _include_lock[_uid] = $FALSE;
            }
        }
    }
    return trigger;
});
