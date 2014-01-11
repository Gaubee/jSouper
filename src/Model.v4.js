/*
 * Model constructor
 * MVVM核心之一——Model层，，在浏览器端创建了一个小型的层次数据模型的数据库
 * 为解决多ViewModel统一的数据来源问题而生
 */

function Model(baseData) {
    var self = this;
    if (!(self instanceof Model)) {
        return new Model(baseData);
    }

    //生成唯一的标示符号
    self.id = $.uid();

    //不对baseData做特殊处理，支持任意类型包括空类型的数据，且数据类型可任意更改
    self._database = baseData;

    //用于缓存key所对应数组的长度，当数组长度发生改变，就需要向上缩减所要触发的key，确保所有集合的更新
    self.__arrayLen = {}; //cache array length with key

    //用于保存所绑定的所有ViewModel实例对象
    self._viewModels = []; //to touch off

    //父级Model
    self._parentModel // = $UNDEFINED; //to get data

    //相对于父级的前缀key，代表在父级中的位置
    self._prefix // = $NULL; //冒泡时需要加上的前缀

    //根据路（_prefix属性）径来动态寻找父级Model，在subset声明父子关系是会生成
    // self._smartSource // = $NULL; //store how to get parentModel

    //存储同步节点，通过collect model声明而来的节点，多者共享数据源
    self._siblingModels = [];

    //存储子model或者委托model（如array型的委托，
    //array型由于都拥有同样的前缀与一个索引号，所以可以用委托定位速度更快，详见_ArrayModel）
    self._subsetModels = []; //to touch off

    //以hash的形式（这里用uid生成的唯一ID）存储_ArrayModel，方便新的array型model快速定位自己的受委托者，并进入队列中
    self._collectModels = {};

    //存储SmartTriggerHandled实例对象，并在set后对其进行更新，即更新View上的绑定。
    self._triggerKeys = new SmartTriggerSet({
        model: self
    });

    //存储在全局集合中，方便跨Model访问，有些情况需要通过全局集合来获取
    //因为Model可能因为多余而被销毁（replace），所以直接使用引用是不可靠的，用标实获取全局集合中对象才是最实时且正确的对象
    Model._instances[self.id] = self;
};

//绑定到全局中
//声明全局存储Model实例对象的区域，根据uid生成的唯一标示作为hash作为区分
(global.Model = Model)._instances = {};

//所有Model拓展对象都要有的属性，生存期同页面内存，在重新载入脚本后就会刷新，确保程序在极大部分情况下正常运行
var _DM_extends_object_constructor = _placeholder();

//根据唯一标示来获取一个Model实例对象
// get Model instance by id
Model.get = function(id) {
    return Model._instances[id];
}

//混合两个对象的属性并返回混合后的对象

function _mix(sObj, nObj) {
    var obj_n,
        obj_s,
        i;
    //新旧对象都是非primitives的情况下才能进行混合属性
    if ($.isO(sObj) && $.isO(nObj)) {
        for (var i in nObj) {
            obj_n = nObj[i];
            obj_s = sObj[i];
            //拓展的DM_Object对象，通过接口实现操作
            if (obj_s && obj_s[_DM_extends_object_constructor]) {
                obj_s.set(obj_n);
            } else
            //避免死循环 Avoid Circular
            if (obj_s !== obj_n) {
                //递归混合
                sObj[i] = _mix(obj_s, obj_n);
            }
        }
        return sObj;
    } else {
        //否则直接返回新对象，覆盖旧对象
        return nObj;
    }
};

//获取所有的兄弟节点
function _getAllSiblingModels(self, result) {
    $.p(result || (result = []), self)
    var dmSublingModels = self._siblingModels;
    $.E(dmSublingModels, function(dm) {
        //因为兄弟节点的数量一般不会很多，所以直接用indexOf来做重复判断来得简单
        //TODO:如果有特殊需求则有待提高其性能
        if ($.iO(result, dm) === -1) {
            _getAllSiblingModels(dm, result);
        }
    });
    return result;
};

//全局关键字配置
//TODO:暴露给API：.app(opction)进行配置
var DM_config = Model.config = {
    //特殊作用域的节点配置
    prefix: {
        This: "$THIS",
        Parent: "$PARENT",
        Top: "$TOP"
    }
};

//操作缓存区
//这里实现思路类似$.st/lst，都是用一个外部静态缓存区进行缓存存储这些非return但是又很重要且频繁的过程变量，来避免重复计算。
Model.session = {
    //.get操作时，由于特殊作用域关键字导致寻址方向的改变，所以此缓存实际get所对的真实model
    //如，model.get("$PARENT.key")，这里key实际上归宿与model.parentModel，所以topGetter存储model.parentModel
    topGetter: $NULL,
    //同上，但是是针对set操作
    topSetter: $NULL,
    //在上面的例子中，在过滤掉关键字后的实际key值
    filterKey: $NULL,

    //用于保存数据更新引发的递归中的堆栈数，本质上是为了在最后一层调用结束后运行所收集的finallyRun，所收集的主要来自View层各种handle处理内部
    finallyRunStacks: []
};

//这里保存finallyRun的处理函数集合
// to avoid `set` in setting 
var _finallyQuene = Model._finallyQuene = [];
//一个hash存储区，确保不重复注册处理函数
var _finallyQuene_hash = {};
var finallyRun = Model.finallyRun = function(fun) {
    if (fun) {
        //直接通过toString来注册
        finallyRun.register(fun, fun);
    } else {
        //将事件队列完全推出直到运行结束，不用$.E(ach)因为队列可能动态增长
        while (_finallyQuene.length) {
            var funid = _finallyQuene.shift();
            fun = _finallyQuene_hash[funid];
            _finallyQuene_hash[funid] = $NULL;
            fun && fun();
        }
    }
}
//使用唯一标示注册事件
finallyRun.register = function(id, fun) {
    if (!_finallyQuene_hash[id]) {
        $.p(_finallyQuene, id);
    }
    _finallyQuene_hash[id] = fun;
}

//在get、set时忽略Model拓展类型的get、set，直接返回Model拓展实例对象
var _dm_get_source // =$FALSE //get Source ignore extend-Object
var _dm_set_source // =$FALSE //set Source ignore extend-Object

//set时强制更新，不论是否相同，因为有事数据源的更新并非来自set本身，所以无法直接作出判断
//TODO: replace `_dm_force_update` by setting stack
var _dm_force_update //= $FALSE;  //ignore equal

var DM_proto = Model.prototype = {
    getSource: function() {
        _dm_get_source = $TRUE;
        var result = this.get.apply(this, arguments)
        _dm_get_source = $FALSE;
        return result;
    },
    get: function(key) {
        //直接定义了topGetter，在保证正确的情况下尽可能早地定义
        var self = Model.session.topGetter = this,
            result = self._database,
            filterKey;
        //TODO:在终点直接默认filterKey的undefined为""，避免过多无用判断
        if (key === $UNDEFINED || key === "") {
            filterKey = "";
        } else {
            //强制转换成字符串，避免错误。
            // key = String(key);//这里占时不强制转换，好捕捉错误

            //不直接非空判断（if(result)），确保约束，String、Bumber、Boolean还是有属性的
            if (result != $UNDEFINED) { //null|undefined
                //开始按"."做寻址分割分离key
                var perkey = $.st(key, ".");

                //perkey出现异常（为空或者结束）或者result已经取不到有意义的值时才停止循环
                while (perkey && result != $UNDEFINED) {
                    //如果当前层是拓展类型层且不是取源操作，调用getter
                    if (result[_DM_extends_object_constructor] && !_dm_get_source) {
                        //拓展类型的getter，这点遵守使用和默认的defineGetter一样的原则，每一次取值都要运行getter函数，而不直接用缓存
                        result = result.get(self, key, result.value);
                    }
                    //获取下一层
                    result = result[perkey];
                    perkey = $.st(_split_laveStr, ".");
                }
                //最后一层，老式浏览器不支持String类型用下标索引，所以统一使用charAt搞定
                //lastKey
                result = $.isS(result) ? result.charAt(_split_laveStr) : (result != $UNDEFINED ? result[_split_laveStr] : result);
            }

            filterKey = key;
        }
        //如果最后一层是拓展类，且非取源操作，运行getter
        if (result && result[_DM_extends_object_constructor] && !_dm_get_source) {
            result = result.get(self, key, result.value);
        }
        //filterKey应该在拓展类的getter运行后定义，避免被覆盖，因为其中可能有其它get函数
        Model.session.filterKey = filterKey;
        return result;
    },
    mixSource: function() {
        _dm_get_source = $TRUE;
        _dm_set_source = $TRUE;
        var result = this.mix.apply(this, arguments)
        _dm_get_source = $FALSE;
        _dm_set_source = $FALSE;
        return result;
    },
    mix: function(key, nObj) {
        //mix Data 合并数据
        //TODO:复合操作，直接移动到ViewModel层，Model层只提供最基本的get、set
        var self = this,
            result;
        if (arguments.length) {
            result = self.get(key);
            result = self.set(key, _mix(result, nObj));
        }
        return result;
    },
    setSource: function() {
        _dm_set_source = $TRUE;
        var result = this.set.apply(this, arguments)
        _dm_set_source = $FALSE;
        return result;
    },

    /*
     *操作数据源并触发更新
     * (String, Object) String：所要更新的数据源路由点；Object：所要替换的数据
     * (Object) 同.set("$THIS"/"",Object)，更新整个数据源
     * 注意，如果所被更新的是Model拓展类，会强制调用setter方法
     */
    set: function(key, nObj) {
        //replace Data 取代原有对象数据
        var self = Model.session.topSetter = this,
            lastKey,
            argumentLen = arguments.length;

        //参数长度检查
        if (argumentLen === 0) {
            return;
        } else if (argumentLen === 1) {
            //调整参数指向
            nObj = key;
            key = "";
        }

        var result = self.getTopModel(key), //Leader:find the model matched by key
            finallyRunStacks = Model.session.finallyRunStacks,
            result_dm = result.model,
            result_dm_id = result_dm.id;
        if ($.iO(finallyRunStacks, result_dm_id) === -1) { //maybe have many fork by the ExtendsClass
            $.p(finallyRunStacks, result_dm_id);
            result = result_dm.set(result.key, nObj);
            // result = result_dm.touchOff(result.key)
            finallyRunStacks.pop();
            !finallyRunStacks.length && Model.finallyRun();
        } else {
            if (!key) { //argumentLen === 1

                var sObj = self._database;
                if (sObj && sObj[_DM_extends_object_constructor] && !_dm_set_source) {
                    sObj.set(self, "", nObj);
                } else if (sObj !== nObj || _dm_force_update) {
                    self._database = nObj;
                } else if (!$.isO(nObj)) { //sObj === nObj && no-object
                    return;
                };
            } else { //argumentLen >= 1
                //find Object by the key-dot-path and change it
                if (_dm_force_update || nObj !== DM_proto.get.call(self, key)) {
                    //[@Gaubee/blog/issues/45](https://github.com/Gaubee/blog/issues/45)
                    var database = self._database || (self._database = {}),
                        sObj,
                        cache_n_Obj = database,
                        cache_cache_n_Obj;

                    var perkey = $.st(key, ".");
                    var back_perkey;
                    while (perkey) {
                        back_perkey = perkey;
                        cache_cache_n_Obj = cache_n_Obj;
                        if (cache_n_Obj[_DM_extends_object_constructor]) {
                            cache_n_Obj.set(self, key, nObj);
                            break;
                        }
                        cache_n_Obj = cache_n_Obj[perkey] || (cache_n_Obj[perkey] = {})
                        perkey = $.st(_split_laveStr, ".");
                    }
                    if (!perkey) {
                        if ((sObj = cache_n_Obj[_split_laveStr]) && sObj[_DM_extends_object_constructor] && !_dm_set_source) {
                            sObj.set(self, key, nObj) //call ExtendsClass API
                        } else if ($.isO(cache_n_Obj)) {
                            cache_n_Obj[_split_laveStr] = nObj;
                        } else if (cache_cache_n_Obj) {
                            (cache_cache_n_Obj[back_perkey] = {})[_split_laveStr] = nObj
                        } else { //arrKey.length === 0,and database instanceof no-Object
                            (self._database = {})[_split_laveStr] = nObj
                        }
                    }
                } else if (!$.isO(nObj)) { //no any change, if instanceof Object and ==,just run touchOff
                    return;
                }
            }
            //TODO:set中的filterKey已经在return中存在，无需再有
            Model.session.filterKey = key;
            // debugger
            result = self.touchOff(key);
        }
        // console.log(result)
        return result;
    },
    registerTrigger: function(key, trigger) {
        var self = this,
            triggerKeys = self._triggerKeys;
        if (typeof trigger === "function") {
            trigger = {
                key: key,
                event: trigger
            };
        } else {
            if (!("key" in trigger)) {
                trigger.key = key
            }
        }
        return "id" in trigger ? trigger.id : (trigger.id = (triggerKeys.push(key, trigger) - 1) + "-" + key);
    },
    removeTrigger: function(trigger_id) {
        var index = parseInt(trigger_id),
            key = trigger_id.replace(index + "-", ""),
            self = this,
            triggerKeys = self._triggerKeys,
            triggerCollection = triggerKeys.get(key) || [];
        triggerCollection.splice(index, 1);
    },
    getTopModel: function(key) {
        var self = this,
            parent = self._parentModel,
            result,
            prefix;
        if (parent) {
            prefix = self._prefix //||"" ,all prefix has been filter $scope key
            key ? (prefix && (key = prefix + "." + key) /*else key = key*/ ) : (prefix && (key = prefix) /*key=""*/ );
            result = parent.getTopModel(key)
        } else {
            result = {
                model: self,
                key: key
            };
        }
        return result;
    },
    touchOff: function(key) {
        key === $UNDEFINED && (key = "");
        var self = this;
        var result;

        var linkKey = "",
            __arrayLen = self.__arrayLen,
            __arrayData;

        //简单的判定是否可能是数组类型的操作并且可能影响到长度
        if (/[^\w]\.?length/.test(key) || /[^\w]\.?[\d]+[^\w]\.?/.test(key)) {
            var arrKey = key.split("."),
                lastKey = arrKey.pop();

            //寻找长度开始变动的那一层级的数据开始_touchOffSibling
            arrKey && $.E(arrKey, function(maybeArrayKey) {
                linkKey = linkKey ? linkKey + "." + maybeArrayKey : maybeArrayKey;
                if ($.isA(__arrayData = DM_proto.get.call(self, linkKey)) && __arrayLen[linkKey] !== __arrayData.length) {
                    // console.log(linkKey,__arrayData.length, __arrayLen[linkKey])
                    __arrayLen[linkKey] = __arrayData.length
                    result = self._touchOffSibling(linkKey)
                }
            })
        }
        if (!result && $.isA(__arrayData = self._database /*get()*/ ) && __arrayLen[""] !== __arrayData.length) {
            __arrayLen[""] = __arrayData.length
            key = "";
        }
        result || (result = self._touchOffSibling(key))
        return result;
    },
    _touchOffSibling: function(key) { //always touchoff from toppest dm
        var self = this,
            database = self._database;
        $.E($.s(_getAllSiblingModels(self)), function(dm) {
            dm._database = database; //maybe on-obj
            dm._touchOff(key)
        })
        return {
            key: key
        }
    },
    _touchOff: function(key) {
        var self = this,
            triggerKeys = self._triggerKeys;
        //self
        triggerKeys.forIn(function(triggerCollection, triggerKey) {
            //!triggerKey==true;
            if (!key || !triggerKey || key === triggerKey || triggerKey.indexOf(key + ".") === 0 || key.indexOf(triggerKey + ".") === 0) {
                $.E(triggerCollection, function(smartTriggerHandle) {
                    smartTriggerHandle.event(triggerKeys);
                })
            }
        });
        //child
        $.E(self._subsetModels, function(childModel) {
            // debugger
            var prefix = childModel._prefix,
                childResult; // || "";
            _dm_force_update = $TRUE; //TODO: use Stack 
            if (!key) { //key === "",touchoff all
                childResult = childModel.set(self.get(prefix))
            } else if (!prefix) { //prefix==="" equal to $THIS
                childResult = childModel.set(key, self.get(key))
            } else if (key === prefix || prefix.indexOf(key + ".") === 0) { //prefix is a part of key,just maybe had been changed
                // childModel.touchOff(prefix.replace(key + ".", ""));
                childResult = childModel.set(self.get(prefix))
            } else if (key.indexOf(prefix + ".") === 0) { //key is a part of prefix,must had be changed
                prefix = key.replace(prefix + ".", "")
                childResult = childModel.set(prefix, self.get(key))
            }
            _dm_force_update = $FALSE;
            //如果不进行锁定，当数组因为其子对象被修改，
            //改动信息就需要冒泡到顶层，等同于强制触发数组的所有关键字，通知所有子对象检查自身是否发生变化。
            //所以锁定是效率所需。
            // $.p(chidlUpdateKey, childResult);
        });
    },
    rebuildTree: $.noop,
    getTop: function() { //get DM tree top
        var self = this,
            next;
        while (next = self._parentModel) {
            self = next;
        }
        return self;
    },
    _pushToSubSetDM: function(model, prefixKey) {
        model._parentModel = this;
        model._prefix = prefixKey
        return $.p(this._subsetModels, model);
    },
    _pushToCollectDM: function(model, pprefixKey, id) {
        var self = this,
            collectModels = self._collectModels;
        var hash = pprefixKey + id;
        var collectModel = collectModels[hash];
        if (!collectModel) {
            collectModel = collectModels[hash] = new _ArrayModel(pprefixKey);
            self._pushToSubSetDM(collectModel, pprefixKey)
        }
        collectModel.push(model)
    },
    collect: function(model) {
        // debugger
        var self = this;
        var finallyRunStacks = Model.session.finallyRunStacks;

        finallyRunStacks.push(self.id);
        if (self !== model) {
            if ($.iO(self._siblingModels, model) === -1) {
                $.p(self._siblingModels, model);
                $.p(model._siblingModels, self);
                self.rebuildTree()
                model._database = self._database;
            } else {
                model = $NULL;
            }
        }
        finallyRunStacks.pop();
        if (model && !finallyRunStacks.length) {
            //self === model || finallyRunStacks === 0
            self.getTop().touchOff();
            Model.finallyRun();
        }
        return self;
    },
    subset: function(model, prefixKey) {
        var self = this,
            finallyRunStacks = Model.session.finallyRunStacks;
        model.remove();
        if (model._isEach) {
            self._pushToCollectDM(model,
                //prefixkey === "[0-9]+?" ==> $THIS.0 ==> return ""; 
                //else return prefixkey.split(".").pop().join(".")
                $.lst(prefixKey, ".") || "",
                // in dif handle
                model._isEach.eachId)
        } else {
            self._pushToSubSetDM(model, prefixKey)
        }
        model.rebuildTree()

        //注意：each会置空touchOff使其无效，导致each运行时页面数据无法更新，
        //所以each对象内部的数据自身获取临时数据进行更新完成后，再移除touchOff
        model._database = self.get(prefixKey);
        finallyRunStacks.push(self.id)
        self.getTop().touchOff("");
        finallyRunStacks.pop();
        !finallyRunStacks.length && Model.finallyRun();
        return self;
    },
    remove: function(model) {
        var self = this;
        if (model) {
            if (model._isEach) {
                arrayModel = model._arrayModel;
                arrayModel && arrayModel.remove(model)
            } else {
                var subsetModels = self._subsetModels,
                    index = $.iO(subsetModels, model);
                subsetModels.splice(index, 1);
                model._parentModel = $UNDEFINED;
            }
        } else {
            model = self._parentModel;
            if (model) {
                model.remove(self);
            }
        }
        return self;
    },
    replaceAs: function(model) {
        var self = this;
        $.E(self._subsetModels, function(subsetDM) {
            subsetDM._parentModel = model;
            $.p(model._subsetModels, subsetDM)
        });
        var new_siblingModels = model._siblingModels;
        $.E(_getAllSiblingModels(self), function(sublingDM) {
            var siblingModels = sublingDM._siblingModels;
            $.rm(siblingModels, self)
            if ($.iO(new_siblingModels, sublingDM) === -1) {
                $.p(new_siblingModels, sublingDM)
            }
            if ($.iO(siblingModels, model) === -1) {
                $.p(siblingModels, model)
            }
        });
        $.rm(new_siblingModels, self)
        $.E(self._viewModels, function(viewModel) {
            viewModel.model = model;
            $.p(model._viewModels, viewModel)
        });
        self._triggerKeys.forIn(function(smartTriggerSet, key) {
            model._triggerKeys.push(key, smartTriggerSet)
        })
        model.set(model._database);
        Model._instances[self.id] = model;
        self.destroy()
        return $NULL;
    },
    destroy: function() {
        for (var i in this) {
            delete this[i]
        }
    }
    /*,
    buildGetter: function(key) {},
    buildSetter: function(key) {}*/
};
