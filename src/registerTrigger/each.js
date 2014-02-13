DM_config.prefix.Index = "$INDEX";
var _extend_DM_get_Index = (function() {
    var $Index_set = function(key) {
        var self = this;
        var indexKey = DM_config.prefix.Index;
        if (key === indexKey) {
            Model.session.topSetter = self;
            Model.session.filterKey = "";
            throw Error(indexKey + " is read only.")
        } else {
            return DM_proto.set.apply(self, arguments)
        }
    }
    var $Index_get = function(key) {
        var self = this;
        var indexKey = DM_config.prefix.Index;
        if (key === indexKey) {
            Model.session.topGetter = self;
            Model.session.filterKey = "";
            return parseInt(self._index);
        } else {
            return DM_proto.get.apply(self, arguments)
        }
    };

    function _extend_DM_get_Index(model) {
        // if(model._isEach)
        model.set = $Index_set
        model.get = $Index_get
    };
    return _extend_DM_get_Index;
}());
var Arr_sort = Array.prototype.sort;

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

    var _rebuildTree = DM_proto.rebuildTree,
        _touchOff = DM_proto.touchOff;
    trigger = {
        // smartTrigger:$NULL,
        // key:$NULL,
        event: function(NodeList_of_ViewModel, model, /*eventTrigger,*/ isAttr, viewModel_ID) {
            var data = NodeList_of_ViewModel[arrDataHandle_id]._data,
                // arrTriggerKey = arrDataHandle_Key + ".length",
                viewModel = V._instances[viewModel_ID],
                allArrViewModels = viewModel._AVI,
                arrViewModels = allArrViewModels[id] || (allArrViewModels[id] = []),
                showed_vi_len = arrViewModels.len,
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

            if (showed_vi_len !== new_data_len) {
                arrViewModels.len = new_data_len; //change immediately,to avoid the `subset` trigger the `rebuildTree`,and than trigger each-trigger again.

                //沉默相关多余操作的API，提升效率
                DM_proto.rebuildTree = $.noop //doesn't need rebuild every subset

                //关闭touchOff会影响关于smartKey
                DM_proto.touchOff = $.noop; //subset的touchOff会遍历整个子链，会造成爆炸性增长。

                if (showed_vi_len > new_data_len) {
                    $.e(arrViewModels, function(eachItemHandle) {
                        var isEach = eachItemHandle._isEach;
                        //移除each标志避免排队
                        eachItemHandle._isEach = $FALSE;
                        eachItemHandle.remove();
                        //恢复原有each标志
                        eachItemHandle._isEach = isEach;
                    }, new_data_len);
                } else {
                    //undefined null false "" 0 ...
                    if (data) {
                        var fragment = $.D.cl(fr);
                        var elParentNode = comment_endeach_node.parentNode;
                        $.E($.s(data), function(eachItemData, index) {
                            //TODO:if too mush vi will be create, maybe asyn
                            var viewModel = arrViewModels[index];
                            //VM不存在，新建
                            if (!viewModel) {
                                eachModuleConstructor(eachItemData, {
                                    onInit: function(vm) {
                                        viewModel = arrViewModels[index] = vm
                                    },
                                    callback: function(vm) {
                                        vm._arrayVI = arrViewModels;
                                        var viDM = vm.model;
                                        viDM._isEach = vm._isEach = {
                                            //_index在push到Array_DM时才进行真正定义，由于remove会重新更正_index，所以这个参数完全交给Array_DM管理
                                            // _index: index,
                                            eachId: id,
                                            eachVIs: arrViewModels
                                        }
                                        model.subset(viDM, arrDataHandle_Key + "." + index); //+"."+index //reset arrViewModel's model
                                        _extend_DM_get_Index(viDM)
                                    }
                                });
                                var viDM = viewModel.model;
                                //强制刷新，保证这个对象的内部渲染正确，在subset后刷新，保证smartkey的渲染正确
                                _touchOff.call(viDM, "");
                                viDM.__cacheIndex = viDM._index;
                            }
                            //自带的inser，针对each做特殊优化
                            // viewModel.insert(comment_endeach_node)
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
                //回滚沉默的功能
                (DM_proto.rebuildTree = _rebuildTree).call(model);
                (DM_proto.touchOff = _touchOff).call(model);
            }
        }
    }
    return trigger
});
