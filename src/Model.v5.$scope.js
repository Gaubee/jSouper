/*
 * 为Model拓展出智能作用域寻址的功能
 * 目前有五种作用域寻址：
 * 1. $THIS 当前作用域寻址
 * 2. $PARENT 父级作用域寻址
 * 3. $TOP 顶级作用域寻址
 * 4. $PRIVATE 私有数据库寻址
 * 5. $JS 全局数据寻址

 * 6. $Index 数组类型的下标
 * 7. $Path 当前Model到顶层Model的前缀集合
 */
;
(function() {
    /*
     * 路由寻址Model
     */
    var routerMap = Model._routerMap = {
        "$Private": function(model, key) {
            return model._privateModel || (model._privateModel = new Model);
        },
        "$Js": function(model, key) {
            return _jSouperBase.$JS;
        },
        "$Parent": function(model, key) {
            //将prefix进行缩减
            var prefixKey = model._prefix;
            var result;
            if (prefixKey) {
                var parentModel = model._parentModel;
                if (prefixKey = $.lst(prefixKey, ".")) { //和上一级之间还隔了好几个"."
                    result = parentModel.buildModelByKey(prefixKey /*+ "." + key*/ );
                } else { //只有一级的前缀，则直接返回
                    result = parentModel;
                }
            }
            return result;
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
    /*
     * 通用寻址函数
     */
    //根据带routerKey的字符串进行查找并生成model
    Model.$router = function(model, key) {
        var result = {
            model: model,
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
                model = routerHandle(model, remainingKey /*过滤后的key*/ );
                if (model) { //递归路由
                    result = Model.$router(model, remainingKey)
                } else { //找不到
                    result.model = model;
                    result.key = remainingKey;
                }
            }
        }
        return result;
    };
    /*
     * 自定义字段的set、get
     */
    Model._defineKeyMap = {
        "$Index": {
            set: function() {
                console.error("$Index is read only.");
            },
            get: function(model, key) {
                $.lst(model._prefix, ".")
                return _split_laveStr;
            }
        },
        "$Path": {
            set: function() {
                console.error("$Path is read only.");
            },
            get: function(model) {
                var result = model._prefix;
                var next;
                while (next = model._parentModel) {
                    model = next;
                    result = model._prefix + result ? ("." + result) : "";
                }
                return result;
            }
        }
    }
    Model.$defineKey = function(model, key) {
        var result = {
            definer: $NULL,
            key: key
        }
        var defineKey = $.st(key, ".");
        var remainingKey = _split_laveStr;
        if (!defineKey) {
            defineKey = remainingKey;
            remainingKey = $FALSE;
        }
        var definer = Model._defineKeyMap[defineKey];
        if (definer) {
            result.definer = definer
            result.key = remainingKey
        }
        return result;
    }
    var _get = __ModelProto__.get,
        _set = __ModelProto__.set,
        set = __ModelProto__.set = function(key) {
            var self = this,
                args = arguments /*$.s(arguments)*/ ,
                result;
            if (args.length > 1) {
                //查找关键字匹配的Model
                var router_result = Model.$router(self, key);
                if (self = router_result.model) {
                    if (key = router_result.key) {
                        //查找通用自定义关键字
                        var define_result = Model.$defineKey(self, key);
                        var definer = define_result.definer
                        if (definer) {
                            result = definer.set(self, define_result.key)
                        }
                    }
                    if (!definer) {
                        key ? (args[0] = key) : $.sp.call(args, 0, 1)
                        result = _set.apply(self, args);
                    }
                }
            } else { //one argument
                result = _set.call(self, key);
            }
            return result
        },
        get = __ModelProto__.get = function(key) {
            var self = this,
                args = arguments /*$.s(arguments)*/ ,
                result;
            if (args.length > 0) {
                //查找关键字匹配的Model
                var router_result = Model.$router(self, key);
                if (self = router_result.model) {
                    if (key = router_result.key) {
                        //查找通用自定义关键字
                        var define_result = Model.$defineKey(self, key);
                        var definer = define_result.definer
                        if (definer) {
                            result = definer.get(self, define_result.key)
                        }
                    }
                    if (!definer) {
                        key ? (args[0] = key) : $.sp.call(args, 0, 1)
                        result = _get.apply(self, args);
                    }
                }
            } else {
                result = _get.call(self);
            }
            return result;
        },
        _buildModelByKey = __ModelProto__.buildModelByKey,
        buildModelByKey = __ModelProto__.buildModelByKey = function(key) {
            var router_result = Model.$router(this, key);
            return _buildModelByKey.call(router_result.model, router_result.key);
        }
}());
