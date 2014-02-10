V.rt("#teleporter", function(handle, index, parentHandle) {
    var teleporterNameHandle = handle.childNodes[0];
    var booleanHandle = handle.childNodes[1];
    if (booleanHandle.type==="handle") {
        var booleanHandle_id = booleanHandle.id;
    }
    var placeholderHandle = $.lI(handle.childNodes);
    if (placeholderHandle === teleporterNameHandle) { //no first argument;
        var teleporterName = "index"
    } else {
        teleporterName = teleporterNameHandle.childNodes[0].node.data;
        teleporterName = teleporterName.substr(1, teleporterName.length - 2);
    }
    var trigger = {
        key: ".",
        event: function(NodeList_of_ViewModel, model, /*eventTrigger,*/ isAttr, viewModel_ID) {
            var viewModel = V._instances[viewModel_ID];
            var teleporters = viewModel._teleporters
            var teleporter = teleporters[teleporterName];
            //初始化传送配置
            if (!teleporter) {
               teleporter = teleporters[teleporterName] = {
                	//placeholder comment node
                    ph: NodeList_of_ViewModel[placeholderHandle.id].currentNode,
                    display:$TRUE
                }
            }
            //第二参数，由第三方控制显示与否，同layout
            if (booleanHandle_id&&teleporter.vi&&teleporter.show_or_hidden !== $FALSE) {
                if (teleporter.display = NodeList_of_ViewModel[booleanHandle_id]._data) {
                    teleporter.vi.insert(teleporter.ph);
                }else{
                    teleporter.vi.remove();
                }
            }
            /*else{
            	trigger.event = $.noop;
            }*/
        }
    }
    return trigger;
});
