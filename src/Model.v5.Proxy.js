/*
 * Model的代理层
 * 小巧灵活的功能，为VM提供更强悍的Model适配引擎
 * 在v4版本中需要同时管理静态的数据与动态的代理，v5版本中将二者分离，从而带来更快更灵活稳定的体验
 */

function ProxyModel(entrust, model) {
    var self = this;

    //存储委托对象
    self.entrust = entrust;
    //双向绑定
    entrust.model = self;

    //委托对象的构造函数
    var EntrustConstructor = self.EntrustConstructor = entrust.constructor;

    //存储收留的pm对象
    self._childProxyModel = [];

    //“被收留者”的身份标记，动态生成，与model层的不同，这是保留最原始的key，且是代表VM关系的前缀。
    //Model层的prefix是代表数据结构上的
    // self._prefix

    //保存父级的PM，用来作用域寻址
    // self._parentPM

    //来自委托对象的触发器集合，需要委托对象实现静态_buildSmartTriggers接口
    self._smartTriggers = EntrustConstructor._buildSmartTriggers(entrust);
    /*
     * 存储Model对象
     * 这里只是单向存储model实例，model只存储触发器。不管你pm对象
     */
    // if (model) {
    model instanceof Model || (model = Model(model));
    self.follow(model)
        // }
};

var __ProxyModelProto__ = ProxyModel.prototype = {
    queryElement: function(matchFun) {
        var self = this;
        matchFun = _buildQueryMatchFun(matchFun);
        var result = self.entrust._queryElement(matchFun);
        $.E(self._childProxyModel, function(proxyModel) {
            result.push.apply(result, proxyModel.queryElement(matchFun));
        });
        return result;
    },
    //收留独立的代理层为model中的一份子，必要时会为其开辟新的子model块
    shelter: function(proxyModel, key) {
        var self = this;
        //校准参数，proxyModel为ProxyModel对象，而不是VM或者PM对象
        (proxyModel instanceof self.EntrustConstructor) && (proxyModel = proxyModel.model);
        if (proxyModel instanceof ProxyModel) {
            //标记为“被收留者”
            proxyModel._parentPM = self;
            proxyModel._prefix = key /*|| ""*/ ;
            // console.log("_prefix:", key);
            $.p(self._childProxyModel, proxyModel);
            proxyModel._followPM(self, key);
            /*//私有Model跟着触发更新
            var privateModel = proxyModel.model._privateModel;
            privateModel && privateModel.touchOff();*/
        }
    },
    //和指定的Model进行合并，吸附在指定Model上
    combine: function(model) {
        var self = this;
        self.model = model;
    },
    //进入指定的Model或者其的key指定的下属中
    follow: function(model, key) {
        var self = this;
        var router_result = ProxyModel.$router(self, key);
        key = router_result.key;
        self = router_result.pmodel;

        if (self && (model instanceof Model)) {
            var currentModel = model.buildModelByKey(key);
            self.combine(currentModel);
            self.rebuildTree();
            self.onfollow && self.onfollow();
        }
    },
    _followPM: function(pmodel, key) {
        var self = this;
        var router_result = ProxyModel.$router(pmodel, key);
        key = router_result.key;
        pmodel = router_result.pmodel;
        if (pmodel) {
            self.follow(pmodel.model, key);
        }
    },
    //PM版的Model路由构造器
    buildModelByKey: function(key) {
        var self = this;
        var router_result = ProxyModel.$router(self, key);
        key = router_result.key;
        self = router_result.pmodel;
        if (self) {
            return self.model.buildModelByKey(key);
        }
    },
    $router: function(key) {
        var self = this,
            model = self.model,
            result;
        if (model) {

            result = ProxyModel.$router(self, key);
            if (result.pmodel) {
                model = result.pmodel.model;
                key = result.key || "";
            }
            result = Model.$router(model, key);
        } else {
            result = {
                model: model,
                key: key
            }
        }
        return result;
    },
    /*
     * 整理委托者的触发器，为其重新定位到正确的Model
     */
    rebuildTree: function() {
        var self = this;
        var model = self.model;
        if (model) {
            //递归重建
            $.E(self._childProxyModel, function(proxyModel) {
                    //为“被收留者”重新定位到正确的Model，并重定位触发器位置
                    proxyModel.follow(model, proxyModel._prefix);
                })
                //重新定位触发器位置
            $.E(self._smartTriggers, function(smartTrigger) {
                smartTrigger.rebuild();
            });
        }
    }
};
/*
 * 为ProxyModel拓展Model类的功能
 */

$.E([ /*"set", "get", */ "touchOff"], function(handleName) {
    __ProxyModelProto__[handleName] = function() {
        var self = this;
        var model = self.model;
        if (model) {
            return model[handleName].apply(model, arguments)
        }
    }
});

/*
 * 路由寻址ProxyModel
 */
(function(argument) {

    var routerMap = ProxyModel._routerMap = {
        "$Private": function(pmodel, key) {
            var _privateVM = V.parse("")();

            function _innerPrivateRouter(pmodel, key) {
                return pmodel._ppModel || (pmodel._ppModel = new ProxyModel(_privateVM, new Model));
            };
            routerMap.$Private = _innerPrivateRouter;
            return _innerPrivateRouter(pmodel, key)
        },
        //VM中的作用域按xmp范围来算，也就是一个xmp就算是一个function
        "$Caller": function(pmodel, key) {
            return pmodel._parentPM;
        },
        "$App": function(pmodel, key) {
            return jSouper.App && jSouper.App.model;
        }
    };
    //根据带routerKey的字符串进行查找并生成model
    ProxyModel.$router = function(pmodel, key) {
        var result = {
            pmodel: pmodel,
            key: key //|| ""
        };
        if (key) {
            var routerKey = $.st(key, ".");
            //及时缓存剩余的键值
            var remainingKey = _split_laveStr;
            if (!routerKey) {
                routerKey = remainingKey;
                remainingKey = $FALSE;
            }
            var routerHandle = routerMap[routerKey];
            if (routerHandle) {
                pmodel = routerHandle(pmodel, remainingKey /*过滤后的key*/ );
                if (pmodel) { //递归路由
                    result = ProxyModel.$router(pmodel, remainingKey)
                } else { //找不到
                    result.pmodel = pmodel;
                    result.key = remainingKey;
                }
            }
        }
        return result;
    };
    /*
     * 为ProxyModel拓展Model类set、get的功能
     */
    var _set = __ProxyModelProto__.set = function(key, obj) {
        var self = this,
            args = arguments /*$.s(arguments)*/ ,
            model = self.model,
            result;
        if (model) {
            if (args.length > 1) {
                //查找关键字匹配的Model
                var router_result = ProxyModel.$router(self, key);
                if (router_result.pmodel) {
                    key = router_result.key;
                    key ? (args[0] = key) : $.sp.call(args, 0, 1)
                    if (self !== router_result.pmodel) {
                        self = router_result.pmodel;
                        if (self instanceof Model) {
                            result = self.set.apply(self, args);
                        } else {
                            result = _set.apply(self, args);
                        }
                    } else {
                        result = model.set.apply(model, args);
                    }
                }
            } else { //one argument
                result = model.set(key);
            }
        }
        return result
    };
    var _get = __ProxyModelProto__.get = function(key, key_map) { //key_map用来替换key节点的匹配对象
        var self = this,
            args = arguments /*$.s(arguments)*/ ,
            model = self.model,
            result;
        if (model) {
            if (args.length > 0) {
                //查找关键字匹配的Model
                var router_result = ProxyModel.$router(self, key);
                if (router_result.pmodel) {
                    key = router_result.key;
                    key ? (args[0] = key) : $.sp.call(args, 0, 1)
                    if (self !== router_result.pmodel) {
                        self = router_result.pmodel;
                        if (self instanceof Model) {
                            result = self.get.apply(self, args);
                        } else {
                            result = _get.apply(self, args);
                        }
                    } else {
                        result = model.get.apply(model, args);
                    }
                }
            } else {
                result = model.get();
            }
        }
        return result;
    };
    // //多种模式
    // //1. 字符串，用来模糊匹配className `icon-hehe` => "icon-hehe"
    // //2. hash对象，用来混合对象 a[hehe] => a[vm.get("hehe")]
    // //3. 普通匹配，最优先
    // var _smartGet = __ProxyModelProto__.getSmart = function(key) {
    //     var self = this,
    //         args = arguments /*$.s(arguments)*/ ,
    //         model = self.model,
    //         result;
    //     if (model) {
    //         if (args.length) {
    //             result = self.get(key);
    //             if (!result) {
    //                 var _pls_map = {};
    //                 key = key.replace(/\[([\s\S]*?)\]/g, function(matchStr, hashKey, index) {
    //                     var _is_end = (hashKey.length + index.length) == key.length;
    //                     var _pl = _placeholder("");
    //                     _pls_map[_pl] = String(self.getSmart(hashKey));
    //                     return "." + _pl + _is_end ? "" : ".";
    //                 });
    //                 result = self.get(key, _pls_map);
    //             }
    //         } else {
    //             result = model.get();
    //         }
    //     }
    //     return result || key;
    // }
}());
/*
 * 增加ProxyModel的数据操作的功能
 */

var __setTool = {
    //可用做forEach
    map: $.map,
    //可用做remove
    filter: $.filter,
    push: function( /*baseArr*/ ) {
        var args = $.s(arguments),
            result = $.s(args.shift());
        Array.prototype.push.apply(result, args);
        return result;
    },
    pop: function(baseArr) {
        baseArr = $.s(baseArr);
        baseArr.pop();
        return baseArr;
    },
    _boolAvator: _placeholder(),
    toggle: function(baser, toggler) {
        if ($.isA(baser) || ($.isO(baser) && typeof baser.length === "number" && (baser = $.s(baser)))) { //数组型或类数组型
            var index = baser.indexOf(toggler);
            index === -1 ? baser.push(toggler) : baser.splice(index, 1);
        } else if ($.isS(baser)) { //字符串型
            baser.indexOf(toggler) === -1 ? baser += toggler : (baser = baser.replace(toggler, ""));
        } else { //其余都用Boolean型处理
            if ((baser instanceof Boolean) && baser.hasOwnProperty(__setTool._boolAvator)) {
                baser = baser[__setTool._boolAvator];
            } else {
                var boolBaser = new Boolean(!baser);
                boolBaser[__setTool._boolAvator] = baser;
                baser = boolBaser;
            }
        }
        return baser;
    }
};

function __setToolFun(type) {
    var handle = __setTool[type];
    return function(key_of_object) {
        var self = this;
        if (self.model) {
            var result,
                args = $.s(arguments);
            args[0] = self.get(key_of_object);
            result = handle.apply($NULL, args);
            self.set(key_of_object, result)
            return result
        }
    }
}

$.fI(__setTool, function(handle, key) {
    __ProxyModelProto__[key] = __setToolFun(key);
});

__ProxyModelProto__.mix = function(key_of_obj) {
    //mix Data 合并数据
    //TODO:复合操作，直接移动到ViewModel层，Model层只提供最基本的get、set
    var self = this;
    if (self.model) {
        var result,
            args = $.s(arguments);
        switch (args.length) {
            case 0:
                return;
            case 1:
                key_of_obj = "";
                break;
            default:
                args.shift();
        }
        args.unshift(self.get(key_of_obj));
        result = _jSouperBase.extend.apply($NULL, args);
        self.set(key_of_obj, result);
        return result;
    }
}