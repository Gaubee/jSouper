V.rt("#>", V.rt("#layout", function(handle, index, parentHandle) {
    // console.log(handle)
    var id = handle.id,
        childNodes = handle.childNodes,
        templateHandle_id = childNodes[0].id,
        dataHandle_id = childNodes[1].id,
        ifHandle = childNodes[2],
        ifHandle_id = ifHandle.type === "handle" && ifHandle.id,
        comment_layout_id = parentHandle.childNodes[index + 1].id, //eachHandle --> eachComment --> endeachHandle --> endeachComment
        trigger;
    var uuid = $.uid();
    trigger = {
        // cache_tpl_name:$UNDEFINED,
        key: ".",
        event: function(NodeList_of_ViewInstance, dataManager, /*eventTrigger,*/ isAttr, viewInstance_ID) {
            var AllLayoutViewInstance = V._instances[viewInstance_ID]._ALVI;
            var new_templateHandle_name = NodeList_of_ViewInstance[templateHandle_id]._data;
            var self = V._instances[viewInstance_ID];
            self = self.__layout || (self.__layout = {});
            var templateHandle_name = self.cache_tpl_name;
            // console.log(new_templateHandle_name,templateHandle_name)
            var module = V.modules[new_templateHandle_name];
            if (!module) {
                return
            }
            if (new_templateHandle_name && (new_templateHandle_name !== templateHandle_name)) {
                // console.log(uuid, new_templateHandle_name, templateHandle_name, !! module)
                self.cache_tpl_name = new_templateHandle_name;
                layoutViewInstance && layoutViewInstance.destory();
                //console.log(new_templateHandle_name, id);
                var key = NodeList_of_ViewInstance[dataHandle_id]._data,
                    layoutViewInstance = AllLayoutViewInstance[id] = module().insert(NodeList_of_ViewInstance[comment_layout_id].currentNode);
                layoutViewInstance._layoutName = new_templateHandle_name;
                dataManager.subset(layoutViewInstance, key);
            } else {
                layoutViewInstance = AllLayoutViewInstance[id];
            }
            return layoutViewInstance;
        }
    }
    if (ifHandle_id) {
        trigger.event = function(NodeList_of_ViewInstance, dataManager, /*eventTrigger,*/ isAttr, viewInstance_ID) {
            var isShow = $.trim(String(NodeList_of_ViewInstance[ifHandle_id]._data)).replace(_booleanFalseRegExp, ""),
                AllLayoutViewInstance = V._instances[viewInstance_ID]._ALVI,
                layoutViewInstance = AllLayoutViewInstance[id];
            if (isShow) {
                if (!layoutViewInstance) {
                    var key = NodeList_of_ViewInstance[dataHandle_id]._data;
                    if (dataManager.get(key)) {
                        var module = V.modules[NodeList_of_ViewInstance[templateHandle_id]._data];
                        if (!module) {
                            return
                        }
                        layoutViewInstance = AllLayoutViewInstance[id] = module();
                        dataManager.subset(layoutViewInstance, key);
                    }
                }
                if (layoutViewInstance && !layoutViewInstance._canRemoveAble) {
                    layoutViewInstance.insert(NodeList_of_ViewInstance[comment_layout_id].currentNode);
                }
            } else {
                if (layoutViewInstance && layoutViewInstance._canRemoveAble) {
                    layoutViewInstance.remove();
                }
            }
            return layoutViewInstance;
        }
    }
    return trigger;
}));
