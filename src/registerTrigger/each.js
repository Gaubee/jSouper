//each - VM的onremove事件
var _eachVM_onremove = function() {
    var self = this;
    var arrayViewModel = self._arrayViewModel;
    //对Model做相应的重新排列
    var model = self.getModel();
    var parentModel = model._parentModel;
    var arrayModelsMap = parentModel._childModels._
    var oldIndex = parseInt(model._prefix);
    //获取数据，更改ArrayModel队列元素的下标
    var data = parentModel.get();

    //挂起停止更新
    //当前移除的Model放入队列末尾，具体的_prefix在insert时在做决定
    model.__hangup();

    $.E($.s(data), function(value, index) {
        var currentModel = arrayModelsMap[String(index)];
        //往前挪
        arrayModelsMap[currentModel._prefix = String(index - 1)] = currentModel;
    }, oldIndex + 1);
    //清除指定的数据
    $.sp.call(data, oldIndex, 1);

    //移除VM并排队到队尾作为备用
    arrayViewModel.splice(oldIndex, 1);

    //废弃的VM和model暂时不同在一起，在insert时再统一
    $.p(arrayViewModel, self);

    //不应该偷懒直接使用touchOff，因为上一级可能还有绑定到数组内部的key，必须冒泡更新
    parentModel.set(data);
}

V.rt("#each", function(handle, index, parentHandle) {
    var id = handle.id;
    var arrDataHandle = handle.childNodes[0];
    var arrDataHandle_id = arrDataHandle.id;
    var arrDataHandle_Key = arrDataHandle.childNodes[0].node.data;
    var arrDataHandle_sort = handle.childNodes[1];
    // console.log(arrDataHandle_sort)
    if (arrDataHandle_sort.type === "handle") {
        var arrDataHandle_sort_id = arrDataHandle_sort.id;
    }
    var comment_endeach_id = parentHandle.childNodes[index + 3].id; //eachHandle --> eachComment --> endeachHandle --> endeachComment
    var trigger;

    var arrayModel;
    trigger = {
        // smartTrigger:$NULL,
        // key:$NULL,
        event: function(NodeList_of_ViewModel, proxyModel, /*eventTrigger,*/ isAttr, viewModel_ID) {
            var data = NodeList_of_ViewModel[arrDataHandle_id]._data,
                // arrTriggerKey = arrDataHandle_Key + ".length",
                viewModel = V._instances[viewModel_ID],
                allArrViewModels = viewModel._AVI,
                arrViewModels = allArrViewModels[id];
            if (!arrViewModels) { //第一次初始化，创建最一层最近的Model来模拟ArrayModel
                arrViewModels = allArrViewModels[id] = [];
                arrayModel = proxyModel.model.buildModelByKey(arrDataHandle_Key);
            }
            var showed_vi_len = arrViewModels.len,
                new_data_len = data ? data.length : 0,
                eachModuleConstructor = V.eachModules[id],
                inserNew,
                comment_endeach_node = NodeList_of_ViewModel[comment_endeach_id].currentNode;

            /*+ Sort*/
            if (arrDataHandle_sort_id && data) {
                var sort_handle = NodeList_of_ViewModel[arrDataHandle_sort_id]._data
                var type = typeof sort_handle
                if (/function|string/.test(type)) {
                    var old_sort = $.s(data);
                    data = data;
                    try {
                        if (type === "function") {
                            data.sort(sort_handle);
                        } else { //string
                            sort_handle = $.trim(sort_handle);
                            if ($.st(sort_handle, " ") === "by") {
                                var sort_key = $.st($.trim(_split_laveStr), " ");
                                sort_handle = $.trim(_split_laveStr);
                                /asc|desc/.test(sort_handle) && data.sort(function(a, b) {
                                    return a[sort_key] > b[sort_key]
                                })
                            }
                            if (sort_handle === "asc") {
                                data.sort()
                            } else if (sort_handle === "desc") {
                                data.sort().reverse()
                            }
                        }
                    } catch (e) {
                        throw TypeError("#each-data's type error.")
                    }
                    $.E(old_sort, function(value, index) {
                        if (data[index] !== value) {
                            var setSort = finallyRun[id];
                            if (!setSort) {
                                setSort = finallyRun[id] = function() {
                                    setSort.vi.set(arrDataHandle_Key, data)
                                    finallyRun[id] = $NULL;
                                }
                                finallyRun(setSort)
                            }
                            setSort.vi = viewModel
                        }
                    })
                }
            }
            /*- Sort*/
            /*+ Insert Remove*/

            if (showed_vi_len !== new_data_len) {
                arrViewModels.len = new_data_len; //change immediately,to avoid the `subset` trigger the `rebuildTree`,and than trigger each-trigger again.

                if (showed_vi_len > new_data_len) { /*  Remove*/
                    $.E($.s(arrViewModels), function(eachViewModel) {
                        //挂起停止更新
                        eachViewModel.getModel().__hangup();
                        //onremove的效益发生在通过vm的remove来影响数据的改变，并做一定的优化，避免大量的更新
                        eachViewModel.onremove = $UNDEFINED;
                        //这里的remove是通过数据改变来影响vm，因此要溢出onremove函数
                        eachViewModel.remove();
                    }, new_data_len);
                } else { /*  Insert*/
                    //undefined null false "" 0 ...
                    if (data) {
                        var fragment = $.D.cl(fr);
                        var elParentNode = comment_endeach_node.parentNode;
                        $.E($.s(data), function(eachItemData, index) {
                            //TODO:if too mush vi will be create, maybe asyn
                            var viewModel = arrViewModels[index];
                            var newPrefix = arrDataHandle_Key + "." + index;
                            var strIndex = String(index);
                            //VM不存在，新建
                            if (!viewModel) {
                                eachModuleConstructor( /*eachItemData*/ $UNDEFINED, {
                                    onInit: function(vm) {
                                        viewModel = arrViewModels[index] = vm;
                                        vm._arrayViewModel = arrViewModels;
                                    },
                                    callback: function(vm) {
                                        if (!arrayModel._childModels._[index]) {
                                            arrayModel.__buildChildModel(strIndex);
                                        }
                                        proxyModel.shelter(vm, newPrefix); //+"."+index //reset arrViewModel's model
                                    }
                                });
                            } else {
                                var model = viewModel.getModel();
                                model.__hangdown({
                                    pk: strIndex
                                });
                            }
                            viewModel.onremove = _eachVM_onremove;
                            //自带的inser，针对each做特殊优化
                            var currentTopNode = viewModel.topNode();

                            $.e(currentTopNode.childNodes, function(child_node) {
                                $.D.ap(fragment, child_node);
                            });

                            _moveChild(viewModel, elParentNode);
                            viewModel._canRemoveAble = $TRUE;

                        }, showed_vi_len);

                        //统一插入
                        $.D.iB(elParentNode, fragment, comment_endeach_node);

                    }
                }
            }
            /*- Inser Remove*/
        }
    }
    return trigger
});
