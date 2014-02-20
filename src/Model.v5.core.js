/*
 * Model constructor
 * MVVM核心之一——Model层，，在浏览器端创建了一个小型的层次数据模型的数据库
 * 为解决多ViewModel统一的数据来源问题而生
 * v5版本去除了subset、collect等重建树结构的方法。将ViewModel和Model分离，中间使用ModelProty来进行代理
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

    // //用于保存所绑定的所有ViewModel实例对象
    // self._viewModels = []; //to touch off

    //父级Model
    self._parentModel // = $UNDEFINED; //to get data

    //私有数据集
    self._privateModel // = $UNDEFINED;

    //相对于父级的前缀key，代表在父级中的位置
    self._prefix // = $NULL; //冒泡时需要加上的前缀

    //根据路（_prefix属性）径来动态寻找父级Model，在subset声明父子关系是会生成
    // self._smartSource // = $NULL; //store how to get parentModel

    //存储子model或者委托model（如array型的委托，
    //array型由于都拥有同样的前缀与一个索引号，所以可以用委托定位速度更快，详见_ArrayModel）
    self._childModels = []; //to touch off

    //以hash的形式（这里用uid生成的唯一ID）存储_ArrayModel，方便新的array型model快速定位自己的受委托者，并进入队列中
    self._arrayModelMap = {};

    //存储SmartTriggerHandled实例对象，并在set后对其进行更新，即更新View上的绑定。
    self._triggerKeys = new SmartTriggerSet({
        model: self
    });

    //存储在全局集合中，方便跨Model访问，有些情况需要通过全局集合来获取
    //因为Model可能因为多余而被销毁（replace），所以直接使用引用是不可靠的，用标实获取全局集合中对象才是最实时且正确的对象
    Model._instances[self.id] = self;
};

/*
 * 核心方法
 */
var DM_proto = Model.prototype = {
    getSource: function() {
        _DM_extends_object_constructor = _DM_extends_object_constructor_break;
        var self = this,
            result = self.get.apply(self, arguments);
        _DM_extends_object_constructor = _DM_extends_object_constructor_bak;
        return result;
    },
    setSource: function() {
        _DM_extends_object_constructor = _DM_extends_object_constructor_break;
        var self = this,
            result = self.set.apply(self, arguments);
        _DM_extends_object_constructor = _DM_extends_object_constructor_bak;
        return result;
    },
    get: function(key) {
        //直接定义了topGetter，在保证正确的情况下尽可能早地定义
        var self = /* Model.session.topGetter = */ this,
            result = self._database,
            filterKey;
        //TODO:在终点直接默认filterKey的undefined为""，避免过多无用判断
        if (key === $UNDEFINED || key === "") {
            /*filterKey = "";*/
        } else {
            //强制转换成字符串，避免错误。
            // key = String(key);//这里占时不强制转换，好捕捉错误

            //不直接非空判断（if(result)），确保约束，String、Bumber、Boolean还是有属性的
            if (result != $UNDEFINED) { //null|undefined
                //开始按"."做寻址分割分离key
                var perkey = $.st(key, ".");

                //perkey出现异常（为空或者结束）或者result已经取不到有意义的值时才停止循环
                while (perkey && result != $UNDEFINED) {
                    //获取下一层
                    result = result[perkey];
                    perkey = $.st(_split_laveStr, ".");

                    //放在取值后面代表着是从第一层开始查找，第0层也就是_database直接当成最后一层来做
                    //如果当前层是拓展类型层且不是取源操作，调用getter
                    if (result && result[_DM_extends_object_constructor] /* && !_dm_get_source*/ ) {
                        //拓展类型的getter，这点遵守使用和默认的defineGetter一样的原则，每一次取值都要运行getter函数，而不直接用缓存
                        result = result.get(self, key, result.value, key.substr(0, key.length - (((perkey /*perkey === false*/ .length) + 1 /*perkey不为false时，要换算成'.'.length+length*/ ) || 0) - _split_laveStr.length - 1) /*currentKey*/ );
                    }
                }
                //最后一层，老式浏览器不支持String类型用下标索引，所以统一使用charAt搞定
                //lastKey
                result = $.isS(result) ? result.charAt(_split_laveStr) : (result != $UNDEFINED ? result[_split_laveStr] : result);
            }

            /*filterKey = key;*/
        }
        //如果最后一层是拓展类，且非取源操作，运行getter
        if (result && result[_DM_extends_object_constructor] /* && !_dm_get_source*/ ) {
            result = result.get(self, key, result.value, key);
        }
        /*//filterKey应该在拓展类的getter运行后定义，避免被覆盖，因为其中可能有其它get函数
        Model.session.filterKey = filterKey;*/

        /*//在最后再进行一次定义，理由同上
        Model.session.topGetter = self;*/
        return result;
    },
    /*
     *操作数据源并触发更新
     * (String, Object) String：所要更新的数据源路由点；Object：所要替换的数据
     * (Object) 同.set("$THIS"/"",Object)，更新整个数据源
     * 注意，如果所被更新的是Model拓展类，会强制调用setter方法
     // * v5版本中的set不再对数据进行判断相同与否。如果非指针相同的话，那么这个数据为末端数据，不会造成大量的触发更新
     // * 其次可以将v4以前的缓存机制融入进来
     */
    set: function(key, nObj) {
        //replace Data 取代原有对象数据
        var self = /*Model.session.topSetter = */ this,
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

        //获取数据的最高层存储区，由上向下更新
        var result = _getTopInfoByKey(self, key), //Leader:find the model matched by key
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
                if (sObj && sObj[_DM_extends_object_constructor] /*&& !_dm_set_source*/ ) {
                    sObj.set(self, "", nObj, "");
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
                        cache_n_Obj = cache_n_Obj[perkey] || (cache_n_Obj[perkey] = {})
                        //放在取值后面代表着是从第一层开始，第0层也就是_database直接当成最后一层来做
                        if (cache_n_Obj[_DM_extends_object_constructor]) {
                            cache_n_Obj.set(self, key, nObj, key.substr(0, key.length - _split_laveStr.length - 1) /*currentKey*/ );
                            break;
                        }
                        perkey = $.st(_split_laveStr, ".");
                    }
                    //最后一层，而非中途中断（遇到ExtendModel）的情况
                    if (perkey === $FALSE) {
                        if ((sObj = cache_n_Obj[_split_laveStr]) && sObj[_DM_extends_object_constructor] /*&& !_dm_set_source*/ ) {
                            sObj.set(self, key, nObj, key) //call ExtendsClass API
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
            /*//TODO:set中的filterKey已经在return中存在，无需再有
            Model.session.filterKey = key;*/
            result = self.touchOff(key);
        }
        return result;
    },
    /*
     * 根据key的路由生成相应的Model，如果是向上（由特殊前缀，在$scope模块进行实现），介于TopModel之间，可强制生成
     */
    buildModelByKey: function(key) {
        var self = this;
        var result,
            //寻址的过程中可能找到自己的子model
            result_child;
        if (key) {
            $.e(self._childModels, function(childModel) {
                var prefixKey = childModel._prefix;
                var _continue = $FALSE;
                //prefixKey == key
                if (prefixKey === key) {
                    result = childModel;
                }
                //key > prefixKey
                else if (key.indexOf(prefixKey + ".") === 0) {
                    result = childModel.buildModelByKey(key.substr(prefixKey.length + 1));
                }
                //prefixKey > key
                else if (prefixKey.indexOf(key + ".") === 0) {
                    result_child = childModel;
                } else {
                    _continue = $TRUE;
                }
                return _continue;
            });
            //如果这个key与其它分支不同一路，则开辟新的分支
            if (!result) {
                result = self.__buildChildModel(key);
                //如果有子model则进行收取，免得用sockchild实现
                result_child && result_child.__follow(result, result_child._prefix.substr(key.length + 1))
            }
        } else {
            result = self;
        }
        return result;
    },
    __buildChildModel: function(key) {
        var self = this;
        //生成一个新的子Model，绑定一系列关系
        var childModel = new Model;
        childModel._prefix = key;
        childModel._parentModel = self;
        childModel._database = self.get(key);
        $.p(self._childModels, childModel);
        // //聚拢关于这个key的父Model
        // self.sock(key);
        return childModel;
    },
    // /*
    //  * 整理子Model，认领父子关系
    //  */
    // sockChilds: function() {
    //     var self = this;
    // },
    /*
     * 获取最顶层的Model
     */
    topModel: function() { //get DM tree top
        var self = this,
            next;
        while (next = self._parentModel) {
            self = next;
        }
        return self;
    },
    touchOff: function(key) {
        key === $UNDEFINED && (key = "");
        var self = this;
        var result;

        var linkKey = "",
            __arrayLen = self.__arrayLen,
            __arrayData;

        //简单的判定是否可能是数组类型的操作并且可能影响到长度
        if (/[^\w]\.?length/.test(key) || /[^\w]\.?[\d]+([^\w]\.?|$)/.test(key)) {

            key.replace(/[^\w]\.?([\d]+)([^\w]\.?|$)/g, function(matchKey, num, endKey, index) {
                var maybeArrayKey = key.substr(0, index);
                //寻找长度开始变动的那一层级的数据开始_touchOffSibling
                if ($.isA(__arrayData = DM_proto.get.call(self, maybeArrayKey)) && __arrayLen[maybeArrayKey] !== __arrayData.length) {
                    // console.log(maybeArrayKey,__arrayData.length, __arrayLen[maybeArrayKey])
                    __arrayLen[maybeArrayKey] = __arrayData.length
                    result = self._touchOffSibling(maybeArrayKey)
                }
            })
        }
        if (!result && $.isA(__arrayData = self._database /*get()*/ ) && __arrayLen[""] !== __arrayData.length) {
            __arrayLen[""] = __arrayData.length
            key = "";
        }
        result || (result = self._touchOff(key))
        return result;
    },
    _touchOff: function(key) {
        var self = this,
            triggerKeys = self._triggerKeys;
        //self
        if (key) {
            triggerKeys.forIn(function(triggerCollection, triggerKey) {
                if (!triggerKey ||
                    key === triggerKey || !triggerKey.indexOf(key + ".") /*=== 0 */ || !key.indexOf(triggerKey + ".") /* === 0*/ ) {
                    $.E(triggerCollection, function(smartTriggerHandle) {
                        smartTriggerHandle.event(triggerKeys);
                    })
                }
            });
        } else {
            triggerKeys.forIn(function(triggerCollection, triggerKey) {
                // if (!key ) {
                $.E(triggerCollection, function(smartTriggerHandle) {
                    smartTriggerHandle.event(triggerKeys);
                })
                // }
            });
        }
        //child
        var childModel,
            childModels = self._childModels,
            i = childModels.length - 1;
        var prefix,
            childResult,
            result;
        if (key) {
            for (; childModel = childModels[i]; i--) {
                prefix = childModel._prefix;
                result = $FALSE;
                _dm_force_update += 1;
                if (!key) { //key === "",touchoff all
                    childResult = childModel.set(self.get(prefix))
                } else if (!prefix) { //prefix==="" equal to $THIS//TODO:可优化，交由collect处理
                    childResult = childModel.set(key, self.get(key))
                } else if (key === prefix || prefix.indexOf(key + ".") === 0) { //prefix is a part of key,just maybe had been changed
                    // childModel.touchOff(prefix.replace(key + ".", ""));
                    childResult = childModel.set(self.get(prefix))
                } else if (key.indexOf(prefix + ".") === 0) { //key is a part of prefix,must had be changed
                    prefix = key.replace(prefix + ".", "")
                    childResult = childModel.set(prefix, self.get(key))
                } else {
                    result = $TRUE;
                }
                _dm_force_update -= 1;
                if (result) {
                    continue;
                } else {
                    break;
                }
            };
        } else { //key为$This的话直接触发所有，无需break

            for (; childModel = childModels[i]; i--) {
                _dm_force_update += 1;
                childResult = childModel.set(self.get(childModel._prefix))
                _dm_force_update -= 1;
            };
        }
        //private
        self._privateModel && self._privateModel.touchOff(key);

        return {
            key: key
        }
    },
    /*
     * 将指定Model移除数据树，使得独立，旗下的子Model也要跟着移除
     * TODO:根据key进行remove
     */
    remove: function(remover) {
        var self = this;
        if (remover || (remover = self)) {
            if (remover._isEach) {
                arrayModel = remover._arrayModel;
                arrayModel && arrayModel.remove(remover)
            } else {
                var parentModel = remover._parentModel;
                if (parentModel) {
                    var childModels = parentModel._childModels;
                    childModels.splice($.iO(childModels, remover), 1);
                    remover._parentModel = $UNDEFINED;
                }
            }
        }
    },
    /*
     * 代码片段，成为指定model的子model
     * 使用此代码片段前要先进行remove！
     */
    __follow: function(model, key) {
        var self = this;
        self.remove();
        self._parentModel = model;
        $.p(model._childModels, self);
    },
    destroy: function() {
        for (var i in this) {
            delete this[i]
        }
    }
    // buildGetter: function(key) {},
    // buildSetter: function(key) {} 
};
