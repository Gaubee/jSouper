function _teleporter_display(show_or_hidden, NodeList_of_ViewInstance, dataManager, /*triggerBy,*/ viewInstance_ID) {
    var handle = this;
    var placeholderHandle = $.lI(handle.childNodes);
    var commentPlaceholderElement = NodeList_of_ViewInstance[placeholderHandle.id].currentNode;

    console.log(NodeList_of_ViewInstance[handle.id])
    var teleporterNameHandle = handle.childNodes[0];
    if (placeholderHandle === teleporterNameHandle) { //no first argument;
        var teleporterName = "index"
    } else {
        teleporterName = teleporterNameHandle.childNodes[0].node.data;
        teleporterName = teleporterName.substr(1, teleporterName.length - 2);
    }

    var teleporter = V._instances[viewInstance_ID]._teleporters[teleporterName];
    var teleporterViewInstance = teleporter.vi;

    console.log(show_or_hidden ? "display:" : "remove:", teleporterViewInstance);

    if (teleporterViewInstance) {
        if (show_or_hidden) {
            if(!teleporterViewInstance._canRemoveAble){//can-insert-able
                teleporterViewInstance.insert(commentPlaceholderElement);
            }
        } else {
            teleporterViewInstance.remove()
        }
    }

    //使用存储显示信息
    teleporter.show_or_hidden = show_or_hidden;
};
V.rh("#teleporter", function(handle, index, parentHandle) {
    handle.display = _teleporter_display; //Custom rendering function
    _commentPlaceholder(handle, parentHandle);
});
