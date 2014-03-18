V.rt("#if", function(handle, index, parentHandle) {
    // console.log(handle)
    debugger
    var id = handle.id,
        ignoreHandleType = /handle|comment/,
        expression = Expression.get(handle.handleInfo.expression),
        parentHandleId = parentHandle.id,

        comment_else_id, //#if inserBefore #else
        comment_endif_id, //#else inserBefore /if

        conditionDOM = handle._controllers,
        conditionStatus = $TRUE, //the #if block scope
        trigger,
        deep = 0;

    $.e(parentHandle.childNodes, function(child_handle, i, childHandles) {
        if (child_handle.handleName === "#if") {
            deep += 1
        } else if (child_handle.handleName === "#else") {
            if (deep === 1) {
                conditionStatus = !conditionStatus;
                comment_else_id = $.lI(child_handle.childNodes).id;
            }
        } else if (child_handle.handleName === "/if") {
            deep -= 1
            if (!deep) {
                comment_endif_id = $.lI(child_handle.childNodes).id;
                return $FALSE;
            }
        } else if (child_handle.type !== "comment") {
            //保存这个节点的控制器，可能有多个if-else嵌套
            $.p(child_handle._controllers, id);
            $.p(conditionDOM[conditionStatus], child_handle.id);
        }
    }, index); // no (index + 1):scan itself:deep === 0 --> conditionStatus = !conditionStatus;

    trigger = {
        // key:"",//default is ""
        event: function(NodeList_of_ViewModel, model, /*triggerBy,*/ isAttr, viewModel_ID) {
            //要显示的类型，true为if-else，false为else-endif
            var conditionVal = expression.foo(model),//NodeList_of_ViewModel[conditionHandleId]._data,
                parentNode = NodeList_of_ViewModel[parentHandleId].currentNode,
                markHandleId = comment_else_id, //if(true)
                markHandle; //default is undefined --> insertBefore === appendChild

            //获取PrimitiveValue
            conditionVal && (conditionVal = conditionVal.valueOf());
            //转化为Boolean值
            conditionVal = !! conditionVal;

            if (NodeList_of_ViewModel[this.handleId]._data !== conditionVal /*|| triggerBy*/ ) {
                NodeList_of_ViewModel[this.handleId]._data = conditionVal;
                if (!conditionVal) {
                    markHandleId = comment_endif_id;
                }
                if (markHandleId) {
                    markHandle = NodeList_of_ViewModel[markHandleId].currentNode;
                }

                //显示
                $.e(conditionDOM[conditionVal], function(id) {
                    var currentHandle = NodeList_of_ViewModel[id],
                        node = currentHandle.currentNode,
                        placeholderNode = NodeList_of_ViewModel[id].placeholderNode || (NodeList_of_ViewModel[id].placeholderNode = $.D.C(id)),
                        display = $TRUE;

                    //遍历所有逻辑控制器（if-else语句-ENDIF）来确定每个控制器是否允许显示它。
                    $.e(currentHandle._controllers, function(controller_id) {
                        //Traverse all Logic Controller(if-else-endif) to determine whether each Controller are allowed to display it.
                        var controllerHandle = NodeList_of_ViewModel[controller_id]
                        //控制器中的显示时候包含当前元素
                        return display = display && ($.iO(controllerHandle._controllers[ !! controllerHandle._data], currentHandle.id) !== -1);
                        //when display is false,abort traversing
                    });
                    if (display) {
                        if (currentHandle.display) { //Custom Display Function,default is false
                            currentHandle.display($TRUE, NodeList_of_ViewModel, model, /*triggerBy, */ viewModel_ID)
                        } else if (node && placeholderNode.parentNode === parentNode) {
                            //parentNode.replaceChild(node/*new*/, placeholderNode/*old*/)
                            $.D.re(parentNode, node, placeholderNode)
                        }
                    }
                });

                //隐藏
                $.e(conditionDOM[!conditionVal], function(id) {
                    var currentHandle = NodeList_of_ViewModel[id],
                        node = currentHandle.currentNode,
                        placeholderNode = (currentHandle.placeholderNode = currentHandle.placeholderNode || $.D.C(id));

                    if (currentHandle.display) { //Custom Display Function,default is false
                        currentHandle.display($FALSE, NodeList_of_ViewModel, model, /*triggerBy,*/ viewModel_ID)
                    } else if (node && node.parentNode === parentNode) {
                        //parentNode.replaceChild(placeholderNode/*new*/, node/*old*/)
                        $.D.re(parentNode, placeholderNode, node)
                    }
                })
            }
        }
    }

    return trigger;
});
