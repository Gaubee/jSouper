var _cache_xhrConifg = {};
var _require_module = function(url, handleFun) {
    var xhrConifg = _cache_xhrConifg.hasOwnProperty(url) && _cache_xhrConifg[url]
    if (xhrConifg) {
        $.p(xhrConifg.success._, handleFun)
    } else {
        var handleQuene = function(status, xhr) {
            $.E(handleQuene._, function(handleFun) {
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
    $.E(scriptNodeList, function(scriptNode) {
        if ((!scriptNode.type || scriptNode.type === "text/javascript") && !scriptNode[_runScripted]) {
            var scripttext =scriptNode.text;
            // console.log("scripttext:",scripttext,scriptNode.src)
            var newScript = doc.createElement("script");
            //TODO:clone attribute;
            newScript.text = scripttext;
            newScript.src = scriptNode.src;
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
    var layoutViewModel;

    // Ajax NodeList_of_ViewModel[templateHandle_id]._data
    var _event = trigger.event;
    var _uid = $.uid();
    trigger.event = function(NodeList_of_ViewModel, model, /*eventTrigger,*/ isAttr, viewModel_ID) {
        var url = NodeList_of_ViewModel[templateHandle_id]._data;
        var args = arguments
        if (!_include_lock[_uid]) {
            _include_lock[_uid] = $TRUE;
            if (!V.modules[url]) {
                _require_module(url, function(status, xhr) {
                    V.modules[url] = jSouper.parseStr(xhr.responseText);
                    layoutViewModel = _event.apply(trigger, args);
                    if (layoutViewModel && !layoutViewModel._runScripted) {
                        layoutViewModel._runScripted = $TRUE;
                        _runScript(layoutViewModel.handleNodeTree.node);
                        _include_lock[_uid] = $FALSE;
                    }
                    var _display_args = _include_display_arguments[handle.id];
                    if (_display_args) {
                        _include_display.apply(handle,_display_args);
                    }
                })
            } else {
                layoutViewModel = _event.apply(trigger, args);
                if (!layoutViewModel._runScripted) {
                    layoutViewModel._runScripted = $TRUE;
                    _runScript(layoutViewModel.topNode());
                }
                _include_lock[_uid] = $FALSE;
            }
        }
    }
    return trigger;
});
