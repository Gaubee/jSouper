V.rt("#define", function(handle, index, parentHandle) {
    var handleChilds = handle.childNodes,
        statusKeyHandleId = handleChilds[0].id,
        textHandle_id = handleChilds[0].childNodes[0].id,
        valueHandleId = handleChilds[1].id,
        trigger = {
            bubble: $TRUE,
            name: "define"
        };
    // console.log(handle.childNodes[0].parentNode, handle.parentNode)

    if (parentHandle.type !== "handle") { //as textHandle
        trigger.event = function(NodeList_of_ViewModel, model /*, triggerBy*/ , isAttr, viewModel_ID) { //call by ViewModel's Node
            var key = NodeList_of_ViewModel[statusKeyHandleId]._data,
                result = NodeList_of_ViewModel[valueHandleId]._data,
                currentNode = NodeList_of_ViewModel[textHandle_id].currentNode,
                uid_hash = viewModel_ID + key,
                viewModel = V._instances[viewModel_ID],
                finallyRun;
            // console.log(key,":",result,viewModel.id);
            if (key !== $UNDEFINED) {
                if (!(finallyRun = Model.finallyRun[uid_hash])) {
                    Model.finallyRun.register(uid_hash, Model.finallyRun[uid_hash] = finallyRun = function() {
                        viewModel = finallyRun.viewModel
                        // if (finallyRun.key==="dd") {debugger};
                        //已经被remove的VI，就不应该触发define
                        // if (viewModel._canRemoveAble) {
                        viewModel.set(finallyRun.key, finallyRun.result)
                        // }
                        Model.finallyRun[uid_hash] = $FALSE; //can push into finally quene
                    })
                }
                finallyRun.viewModel = viewModel
                finallyRun.key = key
                finallyRun.result = result
            }
            result = String(result);
            // if (currentNode.data !== result) {
            //     currentNode.data = result;
            // }
        }
    } else {
        trigger.event = function(NodeList_of_ViewModel, model /*, triggerBy*/ , isAttr, viewModel_ID) { //call by ViewModel's Node
            var key = NodeList_of_ViewModel[statusKeyHandleId]._data,
                result = NodeList_of_ViewModel[valueHandleId]._data;

            Model.finallyRun(function() {
                console.log(key, result)
                //key!==$UNDEFINED&&model.set(key,result)
            }, 0)
            NodeList_of_ViewModel[this.handleId]._data = result;
        }
    }

    return trigger;
});
