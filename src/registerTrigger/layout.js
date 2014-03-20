var _model_to_get_expression_length = {
    get: $.noop()
};
V.rt("#>", V.rt("#layout", function(handle, index, parentHandle) {
    // console.log(handle)
    var id = handle.id,
        childNodes = handle.childNodes,
        expression = Expression.get(handle.handleInfo.expression),
        // templateHandle_id = childNodes[0].id,
        // dataHandle_id = childNodes[1].id,
        // ifHandle = childNodes[2],
        // ifHandle_id = ifHandle.type === "handle" && ifHandle.id,
        comment_layout_id = parentHandle.childNodes[index + 1].id; //eachHandle --> eachComment --> endeachHandle --> endeachComment
    var uuid = $.uid();
    var triggerRouter = function(NodeList_of_ViewModel, proxyModel) {
        var handleArgs = expression.foo(proxyModel);
        var routerResult;
        switch (handleArgs.length) {
            case 0: //参数解析错误
                routerResult = $.noop;
                return;
            case 1: //单参数，第二参数默认为"$This"
                routerResult = _layout_trigger_1;
                break;
            case 2:
                routerResult = _layout_trigger_2;
                break;
            default: // case 3: //带条件表达式的参数
                routerResult = _layout_trigger_3_more;
                break;
        }
        trigger.handle_id = id;
        trigger.layout_id = comment_layout_id;
        trigger.expression = expression;
        return (trigger.event = routerResult).apply(trigger, arguments);
    }
    var trigger = {
        // cache_tpl_name:$UNDEFINED,
        key: expression.keys.length ? expression.keys : ".",
        event: triggerRouter
    }
    return trigger;
}));

var _layout_trigger_1 = function(NodeList_of_ViewModel, proxyModel, isAttr, viewModel_ID) {
    var self = this;
    var handleArgs = self.expression.foo(proxyModel);
    $.p(handleArgs, __ModelConfig__.prefix.This);
    return _layout_trigger_common.call(self, NodeList_of_ViewModel, proxyModel, viewModel_ID, handleArgs);
}
var _layout_trigger_2 = function(NodeList_of_ViewModel, proxyModel, isAttr, viewModel_ID) {
    var self = this;
    var handleArgs = self.expression.foo(proxyModel);
    return _layout_trigger_common.call(self, NodeList_of_ViewModel, proxyModel, viewModel_ID, handleArgs);
}
var _layout_trigger_3_more = function(NodeList_of_ViewModel, proxyModel, isAttr, viewModel_ID) {
    var self = this;
    var handleArgs = self.expression.foo(proxyModel);
    var isShow = handleArgs.splice(2, 1)[0];
    // console.info(isShow);
    var AllLayoutViewModel = V._instances[viewModel_ID]._ALVI,
        layoutViewModel = AllLayoutViewModel[self.handle_id];
    if (isShow) {
        layoutViewModel = _layout_trigger_common.call(self, NodeList_of_ViewModel, proxyModel, viewModel_ID, handleArgs);
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
var _layout_trigger_common = function(NodeList_of_ViewModel, proxyModel, viewModel_ID, handleArgs, handle_id, comment_layout_id) {
    var self = this;
    var handle_id = self.handle_id;
    var comment_layout_id = self.layout_id;

    var vm = V._instances[viewModel_ID];
    //VM所存储的集合
    var AllLayoutViewModel = vm._ALVI;
    //获取VM的缓存信息
    vm = vm.__layout || (vm.__layout = {});

    //模板的名称
    var new_templateHandle_name = handleArgs[0];
    //绑定的关键字
    var key = handleArgs[1];

    var module = V.modules[new_templateHandle_name];

    var layoutViewModel = AllLayoutViewModel[handle_id];
    if (new_templateHandle_name && key) {
        //如果模板的名称的值改变，销毁原有的vm
        if (layoutViewModel && layoutViewModel.vmName !== new_templateHandle_name) {
            layoutViewModel = layoutViewModel.destroy(); //layoutViewModel=null
        }
        //新建layoutViewModel
        if (!layoutViewModel) {
            module && module($UNDEFINED, {
                onInit: function(vm) {
                    //加锁，放置callback前的finallyRun引发的
                    layoutViewModel = AllLayoutViewModel[handle_id] = vm;
                },
                callback: function(vm) {
                    proxyModel.shelter(vm, key);
                    //初始化的数据
                    handleArgs[2] && vm.model.mix(handleArgs[2]);
                }
            });
        }
        //显示layoutViewModel
        if (layoutViewModel && !layoutViewModel._canRemoveAble) { //canInsertAble
            layoutViewModel.insert(NodeList_of_ViewModel[comment_layout_id].currentNode);
        }
    }
    return layoutViewModel;
}
