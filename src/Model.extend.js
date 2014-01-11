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
_modelExtend.set = function(exObjProto) {
	var _set = exObjProto.set;
	exObjProto.set = function(dm, key, value) {
		return (this.value = _set.call(this, dm, key, value))
	}
}
_modelExtend.get = function(exObjProto) {
	var _get = exObjProto.get;
	exObjProto.get = function(dm, key, value) {
		return (this.value = _get.call(this, dm, key, value))
	}
}