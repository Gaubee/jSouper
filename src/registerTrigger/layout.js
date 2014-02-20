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
    var triggerEvent = function(NodeList_of_ViewModel, proxyModel, /*eventTrigger,*/ isAttr, viewModel_ID) {
        //VM所存储的集合
        var AllLayoutViewModel = V._instances[viewModel_ID]._ALVI;
        //模板的名称
        var new_templateHandle_name = NodeList_of_ViewModel[templateHandle_id]._data;
        //获取VM的缓存信息
        var self = V._instances[viewModel_ID];
        self = self.__layout || (self.__layout = {});

        var templateHandle_name = self[id];
        // console.log(new_templateHandle_name,templateHandle_name)
        var module = V.modules[new_templateHandle_name];
        if (!module) {
            return
        }
        //如果模板的名称的值改变，销毁原有的vm
        var layoutViewModel = AllLayoutViewModel[id];
        if (new_templateHandle_name) {
            if (layoutViewModel && layoutViewModel.vmName !== new_templateHandle_name) {
                layoutViewModel = layoutViewModel.destroy(); //layoutViewModel=null
            }
            if (!layoutViewModel) {
                var key = NodeList_of_ViewModel[dataHandle_id]._data;
                module($UNDEFINED, {
                    onInit: function(vm) {
                        //加锁，放置callback前的finallyRun引发的
                        layoutViewModel = AllLayoutViewModel[id] = vm;
                    },
                    callback: function(vm) {
                        proxyModel.shelter(vm, key);
                    }
                });


            }
        }

        if (!layoutViewModel._canRemoveAble) { //canInsertAble
            layoutViewModel.insert(NodeList_of_ViewModel[comment_layout_id].currentNode);
        }
        return layoutViewModel;
    };
    trigger = {
        // cache_tpl_name:$UNDEFINED,
        key: ".",
        event: triggerEvent
    }

    // var _simulationInitVm;
    if (ifHandle_id) {
        trigger.event = function(NodeList_of_ViewModel, model, /*eventTrigger,*/ isAttr, viewModel_ID) {
            var isShow = _booleanFalseRegExp(NodeList_of_ViewModel[ifHandle_id]._data);
            var AllLayoutViewModel = V._instances[viewModel_ID]._ALVI,
                layoutViewModel = AllLayoutViewModel[id];
            if (isShow) {
                layoutViewModel = triggerEvent.apply(this, arguments);
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
