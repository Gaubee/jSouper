var _extend_DM_get_Index = (function() {
    var $Index_set = function(key) {
        var self = this;
        var indexKey = __ModelConfig__.prefix.Index;
        if (key === indexKey) {
            // Model.session.topSetter = self;
            // Model.session.filterKey = "";
            throw Error(indexKey + " is read only.")
        } else {
            return __ModelProto__.set.apply(self, arguments)
        }
    }
    var $Index_get = function(key) {
        var self = this;
        var indexKey = __ModelConfig__.prefix.Index;
        if (key === indexKey) {
            // Model.session.topGetter = self;
            // Model.session.filterKey = "";
            return parseInt(self._index);
        } else {
            return __ModelProto__.get.apply(self, arguments)
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

//each - VM的onremove事件
var _eachVM_onremove = function() {
    var self = this;
    //对Model做相应的重新排列
    var model = self.getModel();
    var parentModel = model._parentModel;
    var arrayModelsMap = parentModel._childModels._
    //$Parent._prefix
    var arrayBaseKey = $.lst(model._prefix, ".");
    var oldIndex = parseInt(_split_laveStr);
    //获取数据
    var data = parentModel.get(arrayBaseKey);
    var keyBuilder = arrayBaseKey ? function(index) {
            return arrayBaseKey + "." + index;
        } : function(index) {
            return String(index);
        };
    var prefixIndex = __ModelConfig__.prefix.Index;
    var prefixPath = __ModelConfig__.prefix.Path;
    $.E(data, function(value, index) {
        var currentModel = arrayModelsMap[keyBuilder(index)];
        //往前挪
        arrayModelsMap[currentModel._prefix = keyBuilder(index - 1)] = currentModel;
        //前缀发生改变，触发$Index和$Path的更新
        currentModel._touchOff(prefixIndex);
        currentModel._touchOff(prefixPath);
    }, oldIndex + 1);
    arrayModelsMap[model._prefix = keyBuilder(data.length)] = model;


    //移除VM并排队到队位作为备用
    self._arrayViewModel.splice(oldIndex, 1)
    $.p(self._arrayViewModel, self);

    //VM移除完成后，长度发生改变，触发length的更新
    data.splice(oldIndex, 1);
    parentModel._touchOff(keyBuilder("length"));

    console.log(model._prefix);
    // self.model.lineUp();
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

    // var _rebuildTree = __ModelProto__.rebuildTree,
    //     _touchOff = __ModelProto__.touchOff;
    trigger = {
        // smartTrigger:$NULL,
        // key:$NULL,
        event: function(NodeList_of_ViewModel, proxyModel, /*eventTrigger,*/ isAttr, viewModel_ID) {
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

                if (showed_vi_len > new_data_len) {
                    $.e(arrViewModels, function(eachItemHandle) {
                        eachItemHandle.remove();
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
                                eachModuleConstructor( /*eachItemData*/ $UNDEFINED, {
                                    onInit: function(vm) {
                                        viewModel = arrViewModels[index] = vm
                                    },
                                    callback: function(vm) {
                                        vm._arrayViewModel = arrViewModels;
                                        proxyModel.shelter(vm, arrDataHandle_Key + "." + index); //+"."+index //reset arrViewModel's model
                                        vm.onremove = _eachVM_onremove;
                                    }
                                });
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
                // //回滚沉默的功能
                // (__ModelProto__.rebuildTree = _rebuildTree).call(model);
                // (__ModelProto__.touchOff = _touchOff).call(model);
            }
        }
    }
    return trigger
});
