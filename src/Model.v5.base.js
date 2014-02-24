/*
 * Model base
 * Model层对外的一些声明与Model层拓展的常用工具函数
 */

//绑定到全局中
//声明全局存储Model实例对象的区域，根据uid生成的唯一标示作为hash作为区分
(global.Model = Model)._instances = {};

/*
 * 所有Model拓展对象都要有的属性，生存期同页面内存，在重新载入脚本后就会刷新，确保程序在极大部分情况下正常运行
 */
//将一个对象标记为有重载等号操作符，并使用期自定义操作代替系统原生的赋值取值
var _DM_extends_object_constructor = _placeholder();
//备份
var _DM_extends_object_constructor_bak = _DM_extends_object_constructor;
//额外的标记号，用于扰乱_DM_extends_object_constructor
var _DM_extends_object_constructor_break = _placeholder("*");

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

//全局关键字配置
//TODO:暴露给API：.app(opction)进行配置
var __ModelConfig__ = Model.config = {
    //特殊作用域的节点配置
    prefix: {
        This: "$This",
        Parent: "$Parent",
        Top: "$Top",
        Private: "$Private",
        Js: "$Js",
        Index:"$Index",
        Path:"$Path"
    }
};

//操作缓存区
//这里实现思路类似$.st/lst，都是用一个外部静态缓存区进行缓存存储这些非return但是又很重要且频繁的过程变量，来避免重复计算。
Model.session = {
    // //.get操作时，由于特殊作用域关键字导致寻址方向的改变，所以此缓存实际get所对的真实model
    // //如，model.get("$PARENT.key")，这里key实际上归宿与model.parentModel，所以topGetter存储model.parentModel
    // topGetter: $NULL,
    // //同上，但是是针对set操作
    // topSetter: $NULL,
    // //在上面的例子中，在过滤掉关键字后的实际key值
    // filterKey: $NULL,
    //用于保存数据更新引发的递归中的堆栈数，本质上是为了在最后一层调用结束后运行所收集的finallyRun，所收集的主要来自View层各种handle处理内部
    finallyRunStacks: []
};

/*
 * Modeld的工具函数finallyRun，在set内部时有些操作必须提到set完成后才能运行，模拟线程安全
 */

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

/*
 * 根据key冒泡获取顶层的Model以及拼接的key路径
 */
var _getTopInfoByKey = Model.getTopInfoByKey = function(model, key) {
    var parent = model._parentModel,
        result,
        prefix;
    if (parent) {
        prefix = model._prefix //||"" ,all prefix has been filter $scope key
        key ? (prefix && (key = prefix + "." + key) /*else key = key*/ ) : (prefix && (key = prefix) /*key=""*/ );
        result = _getTopInfoByKey(parent, key)
    } else {
        result = {
            model: model,
            key: key
        };
    }
    return result;
}

/*
 * 用户记录set的堆栈层数，来实现强制变更数据而不通过判断相同与否再触发
 */
var _dm_force_update = 0;
