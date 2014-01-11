V.rt("", function(handle, index, parentHandle) {
    var textHandle = handle.childNodes[0],
        textHandleId = textHandle.id,
        key = textHandle.node.data,
        trigger;

    if (parentHandle.type !== "handle") { //as textHandle
        if ($.isSWrap(key)) { // single String
            trigger = { //const 
                key: ".", //const trigger
                bubble: $TRUE,
                event: function(NodeList_of_ViewModel, model) {
                    NodeList_of_ViewModel[textHandleId].currentNode.data = key.substring(1, key.length - 1);
                    //trigger.event = $.noop;
                }
            };
        } else { //String for databese by key
            trigger = {
                key: key,
                event: function(NodeList_of_ViewModel, model, /* triggerBy,*/ isAttr /*, vi*/ ) { //call by ViewModel's Node
                    var data = model.get(key),
                        nodeHandle = NodeList_of_ViewModel[textHandleId],
                        currentNode = nodeHandle.currentNode;
                    if (isAttr) {
                        //IE浏览器直接编译，故不需要转义，其他浏览器需要以字符串绑定到属性中。需要转义，否则会出现引号冲突
                        if (isAttr.key.indexOf("on") === 0 && !_isIE) {
                            data = String(data).replace(/"/g, '\\"').replace(/'/g, "\\'");
                        }
                    }
                    // data = String(data);
                    if (nodeHandle._data !== data) {
                        nodeHandle._data = data;
                        currentNode.data = data === $UNDEFINED ? "" : data;
                    }
                }
            }
        }
    } else { //as stringHandle
        if ($.isSWrap(key)) { // single String
            trigger = { //const 
                key: ".", //const trigger
                bubble: $TRUE,
                event: function(NodeList_of_ViewModel, model) {
                    NodeList_of_ViewModel[this.handleId]._data = key.substr(1, key.length - 2);
                    //trigger.event = $.noop;
                }
            };
        } else { //String for databese by key
            trigger = {
                key: key,
                bubble: $TRUE,
                event: function(NodeList_of_ViewModel, model) {
                    NodeList_of_ViewModel[this.handleId]._data = model.get(key);
                }
            };
        }
    }
    return trigger;
});
