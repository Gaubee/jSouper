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
        event: function(NodeList_of_ViewModel, model, /*eventTrigger,*/ isAttr, viewModel_ID) {
            var AllLayoutViewModel = V._instances[viewModel_ID]._ALVI;
            var new_templateHandle_name = NodeList_of_ViewModel[templateHandle_id]._data;
            var self = V._instances[viewModel_ID];
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
                layoutViewModel && layoutViewModel.destory();
                //console.log(new_templateHandle_name, id);
                var key = NodeList_of_ViewModel[dataHandle_id]._data,
                    layoutViewModel = AllLayoutViewModel[id] = module().insert(NodeList_of_ViewModel[comment_layout_id].currentNode);
                layoutViewModel._layoutName = new_templateHandle_name;
                model.subset(layoutViewModel, key);
            } else {
                layoutViewModel = AllLayoutViewModel[id];
            }
            return layoutViewModel;
        }
    }
    if (ifHandle_id) {
        trigger.event = function(NodeList_of_ViewModel, model, /*eventTrigger,*/ isAttr, viewModel_ID) {
            var isShow = _booleanFalseRegExp(NodeList_of_ViewModel[ifHandle_id]._data),
                AllLayoutViewModel = V._instances[viewModel_ID]._ALVI,
                layoutViewModel = AllLayoutViewModel[id];
            if (isShow) {
                if (!layoutViewModel) {
                    var key = NodeList_of_ViewModel[dataHandle_id]._data;
                    if (model.get(key)) {
                        var module = V.modules[NodeList_of_ViewModel[templateHandle_id]._data];
                        if (!module) {
                            return
                        }
                        layoutViewModel = AllLayoutViewModel[id] = module();
                        model.subset(layoutViewModel, key);
                    }
                }
                if (layoutViewModel && !layoutViewModel._canRemoveAble) {
                    layoutViewModel.insert(NodeList_of_ViewModel[comment_layout_id].currentNode);
                }
            } else {
                if (layoutViewModel && layoutViewModel._canRemoveAble) {
                    layoutViewModel.remove();
                }
            }
            return layoutViewModel;
        }
    }
    return trigger;
}));
