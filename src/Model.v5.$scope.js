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
    /*
     * 通用寻址函数
     */
    //根据带routerKey的字符串进行查找model
    Model.$router = function(model, key) {
        var result = {
            model: model,
            key: key //|| ""
        };
        if (key) {
            var routerKey = $.st(key, ".");
            if (!routerKey) {
                routerKey = _split_laveStr;
                _split_laveStr = $FALSE;
            }
            var routerHandle = routerMap[routerKey];
            if (routerHandle) {
                model = routerHandle(model, _split_laveStr /*过滤后的key*/ );
                if (model) { //递归路由
                    result = Model.$router(model, _split_laveStr)
                } else { //找不到
                    result.model = model;
                    result.key = _split_laveStr;
                }
            }
        }
        return result;
    };
    var _get = DM_proto.get,
        _set = DM_proto.set,
        set = DM_proto.set = function(key) {
            var self = this,
                args = arguments /*$.s(arguments)*/ ,
                result;
            if (args.length > 1) {
                var router_result = Model.$router(self, key);
                if (self = router_result.model) {
                    (key = router_result.key) ? (args[0] = key) : $.sp.call(args, 0, 1)
                    result = _set.apply(self, args);
                }
            } else { //one argument
                result = _set.call(self, key);
            }
            return result
        },
        get = DM_proto.get = function(key) {
            var self = this,
                args = arguments /*$.s(arguments)*/ ,
                result;
            if (args.length > 0) {
                var router_result = Model.$router(self, key);
                if (self = router_result.model) {
                    (key = router_result.key) ? (args[0] = key) : $.sp.call(args, 0, 1)
                    result = _get.apply(self, args);
                }
            } else {
                result = _get.call(self);
            }
            return result;
        },
        _buildModelByKey = DM_proto.buildModelByKey,
        buildModelByKey = DM_proto.buildModelByKey = function(key) {
            var router_result = Model.$router(this, key);
            return _buildModelByKey.call(router_result.model, router_result.key);
        }
}());
