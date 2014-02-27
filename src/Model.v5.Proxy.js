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

    //来自委托对象的触发器集合，需要委托对象实现静态_buildSmartTriggers接口
    self._smartTriggers = EntrustConstructor._buildSmartTriggers(entrust);
    /*
     * 存储Model对象
     * 这里只是单向存储model实例，model只存储触发器。不管你pm对象
     */
    if (model) {
        model instanceof Model || (model = Model(model));
        self.follow(model)
    }
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
            proxyModel._prefix = key /*|| ""*/ ;
            $.p(self._childProxyModel, proxyModel);
            proxyModel.follow(self.model, key);
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
        if (model instanceof Model) {
            var currentModel = model.buildModelByKey(key);
            self.combine(currentModel);
            self.rebuildTree();
        }
    },
    $router: function(key) {
        var self = this,
            model = self.model,
            result;
        if (model) {
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

$.E(["set", "get", "touchOff"], function(handleName) {
    __ProxyModelProto__[handleName] = function() {
        var self = this;
        var model = self.model;
        if (model) {
            return model[handleName].apply(model, arguments)
        }
    }
});
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
        var self = this.model;
        if (self) {
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
    var self = this.model;
    if (self) {
        var result,
            args = $.s(arguments);
        args.shift();
        if (args.length) { //arguments>=2
            args.unshift(self.get(key_of_obj));
            result = _jSouperBase.extend.apply($NULL, args);
            self.set(key_of_obj, result);
        }
        return result;
    }
}
