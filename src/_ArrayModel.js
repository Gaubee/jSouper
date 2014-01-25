/*
 * _ArrayModel constructor
 * to mamage #each model
 */

function _ArrayModel(perfix, id) {
    var self = this;
    self._id = id;
    self._prefix = perfix;
    self._DMs = [];
}
var _ArrDM_proto = _ArrayModel.prototype;

//用于优化抽离的vi运行remove引发的$INDEX大变动的问题
var _remove_index; // = 0;

$.fI(DM_proto, function(fun, funName) {
    _ArrDM_proto[funName] = function() {
        var args = arguments;
        $.E(this._DMs, function(_each_model) {
            _each_model[funName].apply(_each_model, args)
        })
    }
})
_ArrDM_proto.set = function(key, nObj) { //只做set方面的中间导航垫片，所以无需进行特殊处理
    var self = this;
    var args = arguments;
    var DMs = this._DMs;
    var result;
    switch (args.length) {
        case 0:
            return;
        case 1:
            if (key) {
                nObj = $.isA(key) ? key : $.s(key);
                // self.length(nObj.length);
                $.E(nObj, function(nObj_item, i) {
                    var DM = DMs[i];
                    //针对remove的优化
                    if (DM) { //TODO:WHY?
                        if (nObj_item !== DM._database) { //强制优化，但是$INDEX关键字要缓存判定更新
                            DM._database = nObj_item;
                            DM.touchOff("");
                        } else if (DM.__cacheIndex !== DM._index) {
                            DM.__cacheIndex = DM._index;
                            DM.touchOff("DM_config.prefix.Index");
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
            var model = DMs[index];
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
_ArrDM_proto.push = function(model) {
    var self = this,
        pperfix = self._prefix;
    var DMs = this._DMs;
    var index = String(model._index = DMs.length)
    $.p(DMs, model)
    model._arrayModel = self;
    model._parentModel = self._parentModel;
    model._prefix = pperfix ? pperfix + "." + index : index;
}
_ArrDM_proto.remove = function(model) {
    var index = model._index
    var self = this;
    var pperfix = self._prefix;
    var DMs = self._DMs;
    $.sp.call(DMs, index, 1);
    model._prefix = pperfix ? pperfix + "." + index : index;

    // DMs.splice(index, 1);
    $.E(DMs, function(model, i) {
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
_ArrDM_proto.queryElement = function(matchFun) {
    var result = [];
    $.E(this._DMs, function(_each_model) {
        result.push.apply(result, _each_model.queryElement(matchFun));
    });
    return result;
}
_ArrDM_proto.lineUp = function(model) {
    this.remove(model);
    this.push(model);
}
DM_proto.lineUp = function() {
    this._arrayModel && this._arrayModel.lineUp(this)
}
