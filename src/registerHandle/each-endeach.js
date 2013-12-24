var _each_display = function(show_or_hidden, NodeList_of_ViewInstance, dataManager, /*triggerBy,*/ viewInstance_ID) {
    var handle = this,
        allArrViewInstances = V._instances[viewInstance_ID]._AVI,
        arrViewInstances = allArrViewInstances[handle.id] || (allArrViewInstances[handle.id] = []);

    //get comment_endeach_id
    var commentStartEachPlaceholderElement = NodeList_of_ViewInstance[$.lI(handle.childNodes).id].currentNode;
    var commentEndEachPlaceholderElement = NodeList_of_ViewInstance[NodeList_of_ViewInstance[handle.eh_id].childNodes[0].id].currentNode;

    arrViewInstances.hidden = !show_or_hidden;
    var fg = arrViewInstances.fragment || (arrViewInstances.fragment = doc.createDocumentFragment());

    if (show_or_hidden) {
        var fgCs = fg.childNodes;
        if (fgCs.length) {
            var placeholderNode = commentStartEachPlaceholderElement.nextSibling;
            var parentNode = commentStartEachPlaceholderElement.parentNode;
            $.D.iB(parentNode, fg, placeholderNode);
        }
    } else {
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
    $.fE(parentHandle.childNodes, function(childHandle, index) {
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
        // layer && console.log("inner each:", childHandle)
    }, index + 1);
    if (!handle.eh_id) {
        throw SyntaxError("#each can't find close-tag(/each).");
    }
    parentHandle.childNodes.splice(index + 1, endIndex - index - 1); //Pulled out
    V.eachModules[handle.id] = View(eachModuleHandle); //Compiled into new View module

    handle.display = _each_display; //Custom rendering function
    _commentPlaceholder(handle, parentHandle);
});
V.rh("/each", placeholderHandle);
