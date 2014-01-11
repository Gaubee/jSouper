V.rt("#teleporter", function(handle, index, parentHandle) {
    var teleporterNameHandle = handle.childNodes[0];
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
            if (!viewModel._teleporters[teleporterName]) {
                viewModel._teleporters[teleporterName] = {
                	//placeholder comment node
                    ph: NodeList_of_ViewModel[placeholderHandle.id].currentNode
                }
            }
            /*else{
            	trigger.event = $.noop;
            }*/
        }
    }
    return trigger;
});
