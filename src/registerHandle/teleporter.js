function _teleporter_display(show_or_hidden, NodeList_of_ViewModel, model, /*triggerBy,*/ viewModel_ID) {
    var handle = this;
    var placeholderHandle = $.lI(handle.childNodes);
    var commentPlaceholderElement = NodeList_of_ViewModel[placeholderHandle.id].currentNode;

    console.log(NodeList_of_ViewModel[handle.id])
    var teleporterNameHandle = handle.childNodes[0];
    if (placeholderHandle === teleporterNameHandle) { //no first argument;
        var teleporterName = "index"
    } else {
        teleporterName = teleporterNameHandle.childNodes[0].node.data;
        teleporterName = teleporterName.substr(1, teleporterName.length - 2);
    }

    var teleporter = V._instances[viewModel_ID]._teleporters[teleporterName];
    var teleporterViewModel = teleporter.vi;

    console.log(show_or_hidden ? "display:" : "remove:", teleporterViewModel);

    if (teleporterViewModel) {
        if (show_or_hidden) {
            if(!teleporterViewModel._canRemoveAble){//can-insert-able
                teleporterViewModel.insert(commentPlaceholderElement);
            }
        } else {
            teleporterViewModel.remove()
        }
    }

    //使用存储显示信息
    teleporter.show_or_hidden = show_or_hidden;
};
V.rh("#teleporter", function(handle, index, parentHandle) {
    handle.display = _teleporter_display; //Custom rendering function
    _commentPlaceholder(handle, parentHandle);
});
