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
            var model = model.buildModelByKey(key);
            self.combine(model);
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
            //重新定位触发器位置
            $.E(self._smartTriggers, function(smartTrigger) {
                var TEMP = smartTrigger.TEMP;
                var viewModel = TEMP.vM;
                var router_result = viewModel.model.$router(TEMP.sK);
                var topGetter = router_result.model,
                    matchKey = router_result.key || "";
                var currentTopGetter = TEMP.md;
                if (topGetter !== currentTopGetter) {
                    TEMP.md = topGetter
                    if (currentTopGetter) {
                        smartTrigger.unbind(currentTopGetter._triggerKeys)
                    }
                    if (topGetter) {
                        smartTrigger.matchKey = matchKey;
                        smartTrigger.bind(topGetter._triggerKeys);
                        // finallyRun.register(viewModel._id + TEMP.sK, function() {
                        //因为Model是惰性生成的，因此在Model存在的情况下已经可以进行更新DOM节点了
                        smartTrigger.event(topGetter._triggerKeys)
                        // });
                    }
                }
            });
            //递归重建
            $.E(self._childProxyModel, function(proxyModel) {
                //为“被收留者”重新定位到正确的Model，并重定位触发器位置
                proxyModel.follow(model, proxyModel._prefix);
            })
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
