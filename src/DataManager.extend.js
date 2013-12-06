// make an Object-Constructor to DataManager-Extend-Object-Constructor
var _dataManagerExtend = DataManager.extend = function(extendsName, extendsObjConstructor) {
	if (_dataManagerExtend.hasOwnProperty(extendsName)) {
		throw Error(extendsName + " is defined!");
	}
	var exObjProto = extendsObjConstructor.prototype
	exObjProto[_DM_extends_object_constructor] = $TRUE;
	_dataManagerExtend.set(exObjProto)
	_dataManagerExtend.get(exObjProto)
	DataManager[extendsName] = extendsObjConstructor
};
_dataManagerExtend.set = function(exObjProto) {
	var _set = exObjProto.set;
	exObjProto.set = function(dm, key, value) {
		return (this.value = _set.call(this, dm, key, value))
	}
}
_dataManagerExtend.get = function(exObjProto) {
	var _get = exObjProto.get;
	exObjProto.get = function(dm, key, value) {
		return (this.value = _get.call(this, dm, key, value))
	}
}