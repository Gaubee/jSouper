/*
 * ArrayModel constructor
 * to mamage #each model
 */
//将一个普通的Model转化为ArrayModel
Model.toArrayModel = function() {

}
//将一个ArrayModel转化为Model
Model.toModel = function() {

}

function ArrayModel(perfix, id) {
    var self = this;
    self._id = id;
    self._prefix = perfix;
    self._arrayModels = [];
}
var __ArrayModelProto__ = ArrayModel.prototype = $.c(__ModelProto__);

//用于优化抽离的vi运行remove引发的$INDEX大变动的问题
var _remove_index; // = 0;

// $.fI(__ModelProto__, function(fun, funName) {
//     __ArrayModelProto__[funName] = function() {
//         var args = arguments;
//         $.E(this._arrayModels, function(_each_model) {
//             _each_model[funName].apply(_each_model, args)
//         })
//     }
// })
__ArrayModelProto__.set = function(key, nObj) { //只做set方面的中间导航垫片，所以无需进行特殊处理
    var self = this;
    var args = arguments;
    var arrayModels = this._arrayModels;
    var result;
    switch (args.length) {
        case 0:
            return;
        case 1:
            if (key) {
                nObj = $.isA(key) ? key : $.s(key);
                // self.length(nObj.length);
                $.E(nObj, function(nObj_item, i) {
                    var DM = arrayModels[i];
                    //针对remove的优化
                    if (DM) { //TODO:WHY?
                        if (nObj_item !== DM._database) { //强制优化，但是$INDEX关键字要缓存判定更新
                            DM._database = nObj_item;
                            DM.touchOff("");
                        } else if (DM.__cacheIndex !== DM._index) {
                            DM.__cacheIndex = DM._index;
                            DM.touchOff("__ModelConfig__.prefix.Index");
                        } else { //确保子集更新
                            DM.touchOff("");
                        }
                    }
                }, _remove_index)
            }
            break;
        default:
            //TODO: don't create Array to save memory
            var arrKeys = key.split(".");
            var index = arrKeys.shift();
            var model = arrayModels[index];
            if (!model) {
                return
            }
            if (arrKeys.length) {
                result = model.set(arrKeys.join("."), nObj)
            } else {
                result = model.set(nObj)
            }
    }
    return result;
}
__ArrayModelProto__.push = function(model) {
    var self = this,
        pperfix = self._prefix;
    var arrayModels = this._arrayModels;
    var index = String(model._index = arrayModels.length)
    $.p(arrayModels, model)
    model._arrayModel = self;
    model._parentModel = self._parentModel;
    model._prefix = pperfix ? pperfix + "." + index : index;
}
__ArrayModelProto__.remove = function(model) {
    var index = model._index
    var self = this;
    var pperfix = self._prefix;
    var arrayModels = self._arrayModels;
    $.sp.call(arrayModels, index, 1);
    model._prefix = pperfix ? pperfix + "." + index : index;

    // arrayModels.splice(index, 1);
    $.E(arrayModels, function(model, i) {
        var index = String(model._index -= 1);
        model._prefix = pperfix ? pperfix + "." + index : index;
    }, index)
    var parentModel = model._parentModel
    var oldData = pperfix ? parentModel.get(pperfix) : parentModel._database /*get()*/ ;
    if (oldData) {
        // 对象的数据可能是空值，导致DM实际长度与数据长度不一致，直接splice会错位，所以需要纠正
        $.sp.call(oldData, index, 1)
        _remove_index = index;
        parentModel.set(pperfix, oldData);
        _remove_index = 0;
        model._arrayModel = model._parentModel = $UNDEFINED;
    }
}
__ArrayModelProto__.queryElement = function(matchFun) {
    var result = [];
    $.E(this._arrayModels, function(_each_model) {
        result.push.apply(result, _each_model.queryElement(matchFun));
    });
    return result;
}
__ArrayModelProto__.lineUp = function(model) {
    this.remove(model);
    this.push(model);
}
__ModelProto__.lineUp = function() {
    this._arrayModel && this._arrayModel.lineUp(this)
}
