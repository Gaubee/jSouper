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

var _vm_remove = __ViewModelProto__.remove;
var _eachVM_remove = function() {
    var self = this;
    var arrayViewModel = self._arrayViewModel;
    var model = self.getModel();
    var parentModel = model._parentModel;
    var arrayModelsMap = parentModel._childModels._
    var arrayBaseKey = $.lst(model._prefix, ".");
    var data = parentModel.get(arrayBaseKey);
    var oldIndex = parseInt(_split_laveStr);
    var arrayViewModel = self._arrayViewModel;
    var remover = arrayViewModel[--arrayViewModel.len];
    var result = (remover.remove = _vm_remove).call(remover);
    $.sp.call(data, oldIndex, 1);
    var keyBuilder = arrayBaseKey ? function(index) {
            return arrayBaseKey + "." + index;
        } : function(index) {
            return String(index);
        };
    $.E($.s(data), function(value, index) {
        var currentModel = arrayModelsMap[keyBuilder(index)];
        currentModel._database = value;
        currentModel._touchOff();
    }, oldIndex);
    parentModel._touchOff(keyBuilder("length"));
    return result;
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

                        (eachViewModel.remove = _vm_remove).call(eachViewModel);
                        //挂起停止更新
                        eachViewModel.getModel().__hangup();
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
                            //VM不存在，新建
                            if (!viewModel) {
                                eachModuleConstructor( /*eachItemData*/ $UNDEFINED, {
                                    onInit: function(vm) {
                                        viewModel = arrViewModels[index] = vm;
                                        vm._arrayViewModel = arrViewModels;
                                    },
                                    callback: function(vm) {
                                        if (!arrayModel._childModels._[index]) {
                                            arrayModel.__buildChildModel(String(index));
                                        }
                                        proxyModel.shelter(vm, newPrefix); //+"."+index //reset arrViewModel's model
                                    }
                                });
                            } else {
                                var model = viewModel.getModel();
                                model.__hangdown();
                                model._database = eachItemData;
                                model._touchOff();
                            }
                            viewModel.remove = _eachVM_remove;
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
