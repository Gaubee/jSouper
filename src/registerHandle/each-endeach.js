var _each_display = function(show_or_hidden, NodeList_of_ViewModel, model, /*triggerBy,*/ viewModel_ID) {
    var handle = this,
        allArrViewModels = V._instances[viewModel_ID]._AVI,
        arrViewModels = allArrViewModels[handle.id] || (allArrViewModels[handle.id] = []);

    //get comment_endeach_id
    var commentStartEachPlaceholderElement = NodeList_of_ViewModel[$.lI(handle.childNodes).id].currentNode;
    var commentEndEachPlaceholderElement = NodeList_of_ViewModel[NodeList_of_ViewModel[handle.eh_id].childNodes[0].id].currentNode;

    arrViewModels.hidden = !show_or_hidden;
    var fg = arrViewModels.fragment || (arrViewModels.fragment = doc.createDocumentFragment());

    if (show_or_hidden) {
        var fgCs = fg.childNodes;
        if (fgCs.length) {
            var placeholderNode = commentStartEachPlaceholderElement.nextSibling;
            var parentNode = commentStartEachPlaceholderElement.parentNode;
            $.D.iB(parentNode, fg, placeholderNode);
        }
    } else if (fg.childNodes.length === 0) {//处于隐藏状态的话无需再次隐藏，隐藏状态中的fg至少会有commentEndEachPlaceholderElement节点
        var currentNode = commentStartEachPlaceholderElement.nextSibling;
        while (currentNode !== commentEndEachPlaceholderElement) {
            var nextNode = currentNode.nextSibling
            $.D.ap(fg, currentNode);
            currentNode = nextNode;
        }
        $.D.ap(fg, currentNode);
    }
};
V.rh("#each", function(handle, index, parentHandle) {
    //The Nodes between #each and /each will be pulled out , and not to be rendered.
    //which will be combined into new View module.
    var _shadowBody = fragment( /*"body"*/ ), //$.D.cl(shadowBody),
        eachModuleHandle = new ElementHandle(_shadowBody),
        endIndex = 0;

    var layer = 1;
    $.e(parentHandle.childNodes, function(childHandle, index) {
        endIndex = index;
        if (childHandle.handleName === "#each") {
            layer += 1
        }
        if (childHandle.handleName === "/each") {
            layer -= 1;
            if (!layer) {
                //save end-handle-id to get comment-placeholder
                handle.eh_id = childHandle.id;
                return $FALSE
            }
        }
        $.p(eachModuleHandle.childNodes, childHandle);
        childHandle.node && $.D.ap(eachModuleHandle.node, childHandle.node);
        // layer && console.log("inner each:", childHandle)
    }, index + 1);
    if (!handle.eh_id) {
        throw SyntaxError("#each can't find close-tag(/each).");
    }
    parentHandle.childNodes.splice(index + 1, endIndex - index - 1); //Pulled out
    // console.log(eachModuleHandle);
    V.eachModules[handle.id] = View(eachModuleHandle, "each-" + handle.id + "-" + handle.eh_id); //Compiled into new View module

    handle.display = _each_display; //Custom rendering function
    _commentPlaceholder(handle, parentHandle);
});
V.rh("/each", placeholderHandle);