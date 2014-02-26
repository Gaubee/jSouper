;
(function() {
    function Observer(getFun, setFun, formFun) {
        var self = this;
        if (!(self instanceof Observer)) {
            return new Observer(getFun, setFun, formFun)
        }
        self._get = getFun || $.noop
        self._set = setFun || $.noop
        self._form = formFun || $.noop
        self._id = $.uid()
    }

    // 存储处理过的依赖关系集，在set运作后链式触发 TODO：注意处理循环依赖
    var observerCache = Observer.cache = {
        //dm_id:{key:[{dm_id:dm,dm_key:"",abandon:false}...]}
        _: {}
    };

    // 原始的DM-get方法
    var _dm_normal_get = __ModelProto__.get

    // 带收集功能的DM-get
    var _dm_collect_get = function(key) {
        var self = this;
        var result = _dm_normal_get.apply(self, arguments)

        //当前收集层
        var _current_collect_layer = _get_collect_stack[_get_collect_stack.length - 1]
        /*
         * 存储相关的依赖信息
         * 保存的都是Model顶部的信息，不使用最临近，因为临近的可能有同prefix的Model，
         * TODO：新版本的可以使用最临近
         * 会导致保存的信息片面，或者易损
         */
        //获取最顶层的信息
        var router_result = Model.$router(self, key);
        var keyInfo = Model.getTopInfoByKey(router_result.model, router_result.key);
        _current_collect_layer && $.p(_current_collect_layer, {
            //rely object
            dm_id: keyInfo.model.id,
            dm_key: keyInfo.key
        })
        return result;
    }

    // 用于搜集依赖的堆栈数据集
    var _get_collect_stack = []

    // 委托 set\get\form
    // this ==> model but not Observer-instance
    Observer.prototype = {
        set: function(dm, key, value, currentKey) {
            return this._set.call(dm, key, value, currentKey)
        },
        get: function(dm, key, value, currentKey) {
            var observerCache_ = observerCache._
            /*
             * dm collect get mode
             */
            __ModelProto__.get = _dm_collect_get;

            //生成一层收集层
            $.p(_get_collect_stack, [])

            //运行原生get
            var result = this._get.call(dm, key, value, currentKey)

            /*
             * dm normal get mode
             */
            //回收最近一层依赖
            var _current_collect_layer = _get_collect_stack.pop()

            //获取上次收集的依赖，将上次依赖进行回退
            var _oldObserverObj = this.observerObj
            //舍弃上一次的依赖关系
            if (_oldObserverObj) {
                $.E(_oldObserverObj._parent, function(parent) {
                    var abandon_index = $.iO(parent, _oldObserverObj);
                    $.sp.call(parent, abandon_index, 1)
                })
                //force GC
                delete _oldObserverObj._parent
            }

            //获取顶层信息
            var keyInfo = Model.getTopInfoByKey(dm, key);
            var dm_id = keyInfo.model.id
            var key = keyInfo.key;
            //保存最近一层依赖
            var _newObserverObj = this.observerObj = {
                _parent: [],
                dm_id: dm_id,
                dm_key: key
            }

            //将依赖关系你想逆向转换
            $.E(_current_collect_layer, function(relyObj) {
                var observerObjCollect = observerCache[relyObj.dm_id] || (observerCache[relyObj.dm_id] = {})
                var observerObjs = observerObjCollect[relyObj.dm_key] || (observerObjCollect[relyObj.dm_key] = [])

                //避免重复收集
                if ($.iO(observerObjs, _newObserverObj) === -1) {
                    var index = $.p(observerObjs, _newObserverObj)
                    $.p(_newObserverObj._parent, observerObjs)
                }
            })

            //确保是最后一层的了再恢复
            if (_get_collect_stack.length === 0) {
                __ModelProto__.get = _dm_normal_get;
            }

            return result;
        },
        form: function(dm, key, value) {
            return this._form.apply(dm, arguments)
        },
        toString: function() {
            return this.value;
        }
    }

    var _dm_normal_touchOff = __ModelProto__.touchOff;
    __ModelProto__.touchOff = function() {
        var self = this;
        var result = _dm_normal_touchOff.apply(self, arguments)
        var observerObjCollect = observerCache[self.id]
        if (observerObjCollect) {
            var key = result.key
            var observerObjs = /*observerObjCollect[""]||*/ observerObjCollect[key];
            if (!observerObjs) {
                while (!observerObjs) {
                    key = $.lst(key, ".");
                    if (key !== false) {
                        observerObjs = observerObjCollect[key];
                    } else {
                        break;
                    }
                }
            }
            observerObjs && $.E(observerObjs, function(observerObj, abandon_index) {
                var model = Model.get(observerObj.dm_id);
                //直接使用touchOff无法触发自动更新
                model.touchOff(observerObj.dm_key)
            })
        }
        return result;
    }

    //Model.extend
    _modelExtend("Observer", Observer)
}())
