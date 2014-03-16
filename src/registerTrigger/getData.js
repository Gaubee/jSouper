V.rt("", function(handle, index, parentHandle) {
    var textHandle = handle.childNodes[0],
        textHandleId = textHandle.id,
        key = textHandle.node.data,
        trigger = {
            key: ".", //const trigger
            bubble: $TRUE
        };
    //作为一个textNode节点来显示字符串
    if (parentHandle.type !== "handle") { //as textHandle
        if ($.isSWrap(key)) { // single String
            trigger.event = function(NodeList_of_ViewModel, model) {
                var handleNode = NodeList_of_ViewModel[textHandleId];
                handleNode._data = handleNode.currentNode.data = key.substring(1, key.length - 1);
                //trigger.event = $.noop;
            };
        } else if ($.isStoN(key)) { // single Number
            trigger.event = function(NodeList_of_ViewModel, model) {
                var handleNode = NodeList_of_ViewModel[textHandleId];
                handleNode._data = handleNode.currentNode.data = parseFloat(key);
                //trigger.event = $.noop;
            };
        } else { //String for databese by key
            trigger.key = key;
            trigger.event = function(NodeList_of_ViewModel, model, /* triggerBy,*/ isAttr /*, vi*/ ) { //call by ViewModel's Node
                var data = model.get(key),
                    nodeHandle = NodeList_of_ViewModel[textHandleId];
                if (isAttr) {
                    //字符串事件：IE浏览器直接编译，故不需要转义，其他浏览器需要以字符串绑定到属性中。需要转义，否则会出现引号冲突
                    if (isAttr.key.indexOf("on") === 0 && !_isIE) {
                        data = String(data).replace(/"/g, '\\"').replace(/'/g, "\\'");
                    }
                }
                // data = String(data);
                if (nodeHandle._data !== data) {
                    nodeHandle._data = nodeHandle.currentNode.data = (data === $UNDEFINED ? "" : data);
                }
            }
        }
        //作为一个handle的参数
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
        } else if ($.isStoN(key)) { // single Number
            trigger.event = function(NodeList_of_ViewModel, model) {
                NodeList_of_ViewModel[this.handleId]._data = parseFloat(key);
                //trigger.event = $.noop;
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
