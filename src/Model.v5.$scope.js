/*
 * 为Model拓展出智能作用域寻址的功能
 * 目前有五种作用域寻址：
 * 1. $THIS 当前作用域寻址
 * 2. $PARENT 父级作用域寻址
 * 3. $TOP 顶级作用域寻址
 * 4. $PRIVATE 私有数据库寻址
 * 5. $JS 全局数据寻址
 */
;
(function() {
    var routerMap = Model._routerMap = {
        "$Private": function(model, key) {
            return model._privateModel || (model._privateModel = new Model);
        },
        "$Js": function(model, key) {
            return _jSouperBase.$JS;
        },
        "$Parent": function(model, key) {
            return model._parentModel;
        },
        "$This": function(model, key) {
            return model;
        },
        "$Top": function(model, key) {
            var next;
            while (next = model._parentModel) {
                model = next;
            }
            return model;
        }
    }
    //根据带routerKey的字符串进行查找model
    Model.$router = function(model, key) {
        var result = {
            model: model,
            key: key //|| ""
        };
        if (key) {
            var routerKey = $.st(key, ".");
            var routerHandle = routerMap[_split_laveStr];
            if (routerHandle) {
                model = routerHandle(model, key);
                if (model) { //递归路由
                    result = Model.$router(model, routerKey)
                } else { //找不到
                    result.model = model;
                    result.key = routerKey;
                }
            }
        }
        return result;
    };
    var _get = DM_proto.get,
        _set = DM_proto.set,
        prefix = DM_config.prefix,
        _rebuildTree = DM_proto.rebuildTree,
        _subset = DM_proto.subset,
        _setterRouter = {
            "$Private": function(self, args, key) {
                return set.apply(self._privateModel || (self._privateModel = new Model), args);
            },
            "$Js": function(self, args, key) {
                return set.apply(_jSouperBase.$JS, args);
            },
            "$Parent": function(self, args, key) {
                if (self = self._parentModel) {
                    return set.apply(self, args);
                }
                /* else {
                    Model.session.filterKey = $UNDEFINED;
                    Model.session.topSetter = $UNDEFINED;
                    key = ""
                }*/
            },
            "$This": function(self, args, key) {
                result = set.apply(self, args);
            },
            "$Top": function(self, args, key) {
                var next;
                while (next = self._parentModel) {
                    self = next;
                }
                result = set.apply(self, args);
            }
        },
        set = DM_proto.set = function(key) {
            var self = this,
                args = arguments /*$.s(arguments)*/ ,
                result;
            if (args.length > 1) {
                var router_result = Model.$router(self, key);
                if (self = router_result.model) {
                    (key = router_result.key) ?(args[0] = key):$.sp.call(args, 0, 1)
                    result = _set.apply(self, args);
                }
                // var routerKey = $.st(key, ".");
                // var routerHandle = _setterRouter[_split_laveStr];
                // if (routerHandle) {
                //     if (routerKey) {
                //         args[0] = routerKey;
                //     } else {
                //         $.sp.call(args, 0, 1)
                //     }
                //     result = routerHandle(self, args, key);
                // } else {
                //     result = _set.apply(self, args);
                // }
            } else { //one argument
                result = _set.apply(self, args);
            }

            result || (result = {
                key: key
            });

            //更新调用堆栈层数，如果是0,则意味着冒泡到顶层的调用即将结束，是最后一层set
            // result.stacks = Model.session.finallyRunStacks.length
            return result
        },

        _getterRouter = {
            "$Private": function(self, args, key) {
                return get.apply(self._privateModel || (self._privateModel = new Model), args);
            },
            "$Js": function(self, args, key) {
                return get.apply(_jSouperBase.$JS, args);
            },
            "$Parent": function(self, args, key) {
                if (self = self._parentModel) {
                    return get.apply(self, args);
                } else {
                    Model.session.filterKey = $UNDEFINED;
                    Model.session.topGetter = $UNDEFINED;
                    key = ""
                }
            },
            "$This": function(self, args, key) {
                result = get.apply(self, args);
            },
            "$Top": function(self, args, key) {
                var next;
                while (next = self._parentModel) {
                    self = next;
                }
                result = get.apply(self, args);
            }
        },
        get = DM_proto.get = function(key) {
            var self = this,
                args = arguments /*$.s(arguments)*/ ,
                result;
            if (args.length > 0) {
                var routerKey = $.st(key, ".");
                var routerHandle = _getterRouter[_split_laveStr];
                if (routerHandle) {
                    if (routerKey) {
                        args[0] = routerKey;
                    } else {
                        $.sp.call(args, 0, 1)
                    }
                    result = routerHandle(self, args, key);
                } else {
                    result = _get.apply(self, args);
                }
            } else { //one argument
                // result = _get.apply(self, args);
                result = _get.call(self);
            }
            return result;
        };

    function _getAllSmartModels(self, result) {
        result ? $.p(result, self) : (result = []);
        var dmSmartModels = self._smartDMs_id;
        dmSmartModels && $.E(dmSmartModels, function(dm) {
            dm = Model.get(dm);
            if ($.iO(result, dm) === -1) {
                _getAllSmartModels(dm, result);
            }
        });
        // console.table(result)
        return result;
    };
    DM_proto.rebuildTree = function() {
        var self = this,
            smartSource;
        $.E(_getAllSmartModels(self), function(dm) {
            if (smartSource = dm._smartSource) {
                var smart_prefix = smartSource.prefix,
                    smart_model = Model.get(smartSource.dm_id);
                // console.log(smart_prefix)
                if (smart_prefix.indexOf(prefix.Parent) === 0 || smart_prefix.indexOf(prefix.Top) === 0) {
                    var data = smart_model.get(smart_prefix);
                    var topGetter = Model.session.topGetter
                    if (topGetter !== smartSource.topGetter && (smartSource.topGetter = topGetter)) {
                        smart_model.subset(dm, smart_prefix);
                    }
                }
            }
        })
        return _rebuildTree.call(self);
    };
}());
