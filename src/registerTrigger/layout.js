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
            var templateHandle_name = self[id];
            // console.log(new_templateHandle_name,templateHandle_name)
            var module = V.modules[new_templateHandle_name];
            if (!module) {
                return
            }
            if (new_templateHandle_name && (new_templateHandle_name !== templateHandle_name)) {
                // console.log(uuid, new_templateHandle_name, templateHandle_name, !! module)
                self[id] = new_templateHandle_name;
                var layoutViewModel = AllLayoutViewModel[id];
                layoutViewModel && layoutViewModel.destory();
                //console.log(new_templateHandle_name, id);
                var key = NodeList_of_ViewModel[dataHandle_id]._data;
                module($UNDEFINED, {
                    callback: function(vm) {
                        layoutViewModel = AllLayoutViewModel[id] = vm;
                        //使用回调，可以使其script[type='text/vm']脚本运行时能取到渲染完成的VM
                        vm._layoutName = new_templateHandle_name;
                        model.subset(vm, key);
                        vm.insert(NodeList_of_ViewModel[comment_layout_id].currentNode);
                    }
                });
            } else {
                layoutViewModel = AllLayoutViewModel[id];
            }
            return layoutViewModel;
        }
    }

    // var _simulationInitVm;
    if (ifHandle_id) {
        trigger.event = function(NodeList_of_ViewModel, model, /*eventTrigger,*/ isAttr, viewModel_ID) {
            var isShow = _booleanFalseRegExp(NodeList_of_ViewModel[ifHandle_id]._data),
                AllLayoutViewModel = V._instances[viewModel_ID]._ALVI,
                layoutViewModel = AllLayoutViewModel[id];
            if (isShow) {
                if (!layoutViewModel) {
                    var key = NodeList_of_ViewModel[dataHandle_id]._data;
                    var module = V.modules[NodeList_of_ViewModel[templateHandle_id]._data];
                    if (!module) {
                        return
                    }
                    module($UNDEFINED, {
                        callback: function(vm) {
                            layoutViewModel = AllLayoutViewModel[id] = vm;
                            model.subset(vm, key);
                        }
                    });
                }
                if (!layoutViewModel._canRemoveAble) {
                    layoutViewModel.insert(NodeList_of_ViewModel[comment_layout_id].currentNode);
                }
            } else {
                if (layoutViewModel) {
                    layoutViewModel._canRemoveAble && layoutViewModel.remove();
                }
                /*else if (!_simulationInitVm) {
                    //强制运行一次getter，因为vm没有初始化
                    //如果是初始化条件又依赖于其内部（Observer等），恐怕无法自动触发
                    //所以这里手动地简单模拟一次layoutViewModel已经初始化的情况
                    _simulationInitVm = $TRUE;

                    //model这时的数据源可能还没绑定，所以用注册finallyRun来实现
                    //可能因为subset的值，会被replaceAs，所以在finallyRun中用id取真model实例
                    var modelId = model.id;
                    Model.finallyRun.register("layoutMoniInt" + id, function() {
                        var key = NodeList_of_ViewModel[dataHandle_id]._data;
                        model = Model._instances[modelId];
                        model.get(key);
                    })
                }*/
            }
            return layoutViewModel;
        }
    }
    return trigger;
}));
