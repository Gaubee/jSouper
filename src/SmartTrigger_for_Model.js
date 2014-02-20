/*
 * SmartTriggerHandle constructor
 * 用于View层中声明的绑定做包裹。
 * 在每个ViewModel实例中都有着这些包裹过的SmartTriggerHandle实例对象的引用
 * 在ViewModel实例的Model在数据集合中的位置发生相对变动时(subset/collect的操作引起的)，将回收这些SmartTriggerHandle实例对象并重新绑定
 */

function SmartTriggerHandle(key, triggerEvent, data) {
    var self = this;

    self.matchKey = key;
    self.event = triggerEvent instanceof Function ? triggerEvent : $.noop;
    self.TEMP = data;

    //根据key开判断是否需要在Model相对变动时你，进行重新绑定。
    //现在默认都重新绑定。到后期再进行优化
    self.moveAble = SmartTriggerHandle.moveAble(self);

    //托管自己的SmartTriggerSet实例集合
    self.STS_Collection = [];
};
SmartTriggerHandle.moveAble = function(smartTriggerHandle) {
    return $TRUE;
};
SmartTriggerHandle.prototype = {
    //托管到到一个SmartTriggerSet实例中
    bind: function(smartTriggerSet, key) {
        var self = this;
        $.p(self.STS_Collection, smartTriggerSet);
        //如果没有指定绑定关键字，则默认使用配置中的匹配关键字
        smartTriggerSet.push(key === $UNDEFINED ? self.matchKey : key, self);
        return self;
    },
    //解除SmartTriggerSet实例的托管
    unbind: function(smartTriggerSet) {
        var self = this,
            STS_Collection = self.STS_Collection,
            index = $.iO(STS_Collection, smartTriggerSet);
        //托管方和被托管方双边都需要互相移除
        if (index !== -1) {
            smartTriggerSet.remove(self);
            STS_Collection.splice(index, 1);
        }
        return self;
    }
};

/*
 * SmartTriggerSet constructor
 * 用于管理SmartTriggerHandle的管理器
 * 自定义数据类型，方便遍历操作
 */

function SmartTriggerSet(data) {
    var self = this;
    self.keys = [];
    self.store = {};
    self.TEMP = data;
};

SmartTriggerSet.prototype = {

    //按关键字存储对象，如果对象是数组格式，则与当前集合进行合并
    push: function(key, value) {
        var self = this,
            keys = self.keys,
            store = self.store,
            currentCollection;
        key = String(key);
        self.id = $.uid();
        if (!(key in store)) {
            $.p(keys, key);
        }
        //若集合为空，则立刻生成
        currentCollection = store[key] || (store[key] = []);
        if (value instanceof SmartTriggerHandle) {
            $.p(currentCollection, value);
        } else if ($.isA(value)) {
            //数组类型，一个个存储，确保每一个对象都正确（instanceof SmartTriggerHandle）
            $.E(value, function(smartTriggerHandle) {
                self.push(key, smartTriggerHandle);
            });
        } else {
            console.warn("type error,no SmartTriggerHandle instance!");
        }
        return currentCollection.length;
    },
    remove: function(smartTriggerHandle) {
        var self = this,
            key = smartTriggerHandle.matchKey,
            store = self.store,
            currentCollection = store[key];
        if (currentCollection) {
            var index = $.iO(currentCollection, smartTriggerHandle);
            (index !== -1) && $.sp.call(currentCollection, index, 1);
        }
        return self;
    },
    //触发所有子集的事件
    touchOff: function(key) {
        var self = this;
        $.E(self.get(key), function(smartTriggerHandle) {
            smartTriggerHandle.event(self);
        });
        return self;
    },

    /*
     * 不针对smartTriggerHandle的操作
     */

    set: function(key, value) { //TODO：使用率很低，考虑是否废弃
        var self = this,
            keys = self.keys,
            store = self.store;
        key = String(key);
        if (!(key in store)) {
            $.p(keys, key)
        }
        store[key] = value;
    },
    //返回所对应关键字的对象，这边都是数组类型
    get: function(key) {
        return this.store[key];
    },
    //遍历方法forEach ==> forIn
    forIn: function(callback) { //TODO：使用率很低，考虑是否废弃
        var self = this,
            store = self.store;
        return $.E(self.keys, function(key, index) {
            callback(store[key], key, store);
        })
    },
    //判断是否存在所指定key的对象
    has: function(key) {
        return this.store.hasOwnProperty(key);
    }
}
