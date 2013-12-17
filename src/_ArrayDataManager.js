/*
 * _ArrayDataManager constructor
 * to mamage #each datamanager
 */

function _ArrayDataManager(perfix, id) {
    var self = this;
    self._id = id;
    self._prefix = perfix;
    self._DMs = [];
}
var _ArrDM_proto = _ArrayDataManager.prototype;

//用于优化抽离的vi运行remove引发的$INDEX大变动的问题
var _remove_index; // = 0;

$.fI(DM_proto, function(fun, funName) {
    _ArrDM_proto[funName] = function() {
        var args = arguments;
        $.ftE(this._DMs, function(_each_dataManager) {
            _each_dataManager[funName].apply(_each_dataManager, args)
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
                nObj = key instanceof Array ? key : $.s(key);
                // self.length(nObj.length);
                $.ftE(nObj, function(nObj_item, i) {
                    var DM = DMs[i];
                    //针对remove的优化
                    if (nObj_item !== DM._database) { //强制优化，但是$INDEX关键字要缓存判定更新
                        DM._database = nObj_item;
                        DM.touchOff("");
                    } else if (DM.__cacheIndex !== DM._index) {
                        DM.__cacheIndex = DM._index;
                        DM.touchOff("DM_config.prefix.Index");
                    } else { //确保子集更新
                        DM.touchOff("");
                    }
                }, _remove_index)
            }
            break;
        default:
            //TODO: don't create Array to save memory
            var arrKeys = key.split(".");
            var index = arrKeys.shift();
            var datamanager = DMs[index];
            if (!datamanager) {
                return
            }
            if (arrKeys.length) {
                result = datamanager.set(arrKeys.join("."), nObj)
            } else {
                result = datamanager.set(nObj)
            }
    }
    return result;
}
_ArrDM_proto.push = function(datamanager) {
    var self = this,
        pperfix = self._prefix;
    var DMs = this._DMs;
    var index = String(datamanager._index = DMs.length)
    datamanager._prefix = pperfix ? pperfix + "." + index : index;
    $.p(DMs, datamanager)
    datamanager._arrayDataManager = self;
    datamanager._parentDataManager = self._parentDataManager;
}
_ArrDM_proto.remove = function(datamanager) {
    var index = datamanager._index
    var self = this;
    var pperfix = self._prefix;
    var DMs = self._DMs;
    $.sp.call(DMs, index, 1);
    // DMs.splice(index, 1);
    $.ftE(DMs, function(datamanager, i) {
        var index = String(datamanager._index -= 1);
        datamanager._prefix = pperfix ? pperfix + "." + index : index;
    }, index)
    var parentDataManager = datamanager._parentDataManager
    var oldData = pperfix ? parentDataManager.get(pperfix) : parentDataManager._database /*get()*/ ;
    if (oldData) {
        // 对象的数据可能是空值，导致DM实际长度与数据长度不一致，直接splice会错位，所以需要纠正
        $.sp.call(oldData, index, 1)
        _remove_index = index;
        parentDataManager.set(pperfix, oldData);
        _remove_index = 0;
        datamanager._arrayDataManager = datamanager._parentDataManager = $UNDEFINED;
    }
}
_ArrDM_proto.lineUp = function(datamanager) {
    this.remove(datamanager);
    this.push(datamanager);
}
DM_proto.lineUp = function() {
    this._arrayDataManager && this._arrayDataManager.lineUp(this)
}
