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
        event: function(NodeList_of_ViewInstance, dataManager, /*eventTrigger,*/ isAttr, viewInstance_ID) {
            var viewInstance = V._instances[viewInstance_ID];
            if (!viewInstance._teleporters[teleporterName]) {
                viewInstance._teleporters[teleporterName] = {
                	//placeholder comment node
                    ph: NodeList_of_ViewInstance[placeholderHandle.id].currentNode
                }
            }
            /*else{
            	trigger.event = $.noop;
            }*/
        }
    }
    return trigger;
});
