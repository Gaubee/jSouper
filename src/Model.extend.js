// make an Object-Constructor to Model-Extend-Object-Constructor
var _modelExtend = Model.extend = function(extendsName, extendsObjConstructor) {
    if (_modelExtend.hasOwnProperty(extendsName)) {
        throw Error(extendsName + " is defined!");
    }
    var exObjProto = extendsObjConstructor.prototype
    exObjProto[_DM_extends_object_constructor] = $TRUE;
    _modelExtend.set(exObjProto)
    _modelExtend.get(exObjProto)
    Model[extendsName] = extendsObjConstructor
};
//get的结果并不保存到this.value，原则上setter、getter本身就不能通过return保存。
//这里为了方便，仅仅运行setter可以通过return保存，避免混乱
//如果需要缓存，开发者需要知识额外定义缓冲变量进行缓存
_modelExtend.set = function(exObjProto) {
    var _set = exObjProto.set;
    exObjProto.set = function(dm, key, value, currentKey) {
        return (this.value = _set.call(this, dm, key, value, currentKey))
    }
}
_modelExtend.get = function(exObjProto) {
    var _get = exObjProto.get;
    exObjProto.get = function(dm, key, value, currentKey) {
        return _get.call(this, dm, key, value, currentKey);
    }
}
