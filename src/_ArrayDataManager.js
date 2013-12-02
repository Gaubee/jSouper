/*
 * _ArrayDataManager constructor
 * to mamage #each datamanager
 */

function _ArrayDataManager(perfix) {
	this._prefix = perfix;
	this._showed_len = 0;
	this._DMs = [];
}
var _ArrDM_proto = _ArrayDataManager.prototype
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
			nObj = $.s(key);
			// self.length(nObj.length);
			$.ftE(DMs, function(datamanager, i) {
				datamanager.set(nObj[i])
			})
			break;
		default:
			var arrKeys = key.split(".");
			var index = arrKeys.shift();
			var datamanager = DMs[index]
			if (arrKeys.length) {
				result = datamanager.set(arrKeys.join("."), nObj)
			} else {
				result = datamanager.set(nObj)
			}
	}
	return result;
}
_ArrDM_proto.length = function(length) {
	var self = this;
	var showed_len = self._showed_len;
	var DMs = this._DMs;
/*	if (length === $UNDEFINED) {
		return showed_len;
	} else {
		if (showed_len < length) {
			$.ftE(DMs, function(datamanager) {
				datamanager._canCGable = $TRUE
			}, length)
		} else if (length > showed_len) {
			$.ftE(DMs, function() {
				datamanager._canCGable = $TRUE
			}, showed_len)
		}
	}*/
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
	DMs.splice(index, 1);
	$.ftE(DMs, function(datamanager, i) {
		var index = String(datamanager._index -= 1);
		datamanager._prefix = pperfix ? pperfix + "." + index : index;
	}, index)
	var oldData = datamanager._parentDataManager.get(pperfix);
	oldData.splice(index, 1);
	datamanager._parentDataManager.set(pperfix, oldData)
	datamanager._arrayDataManager = datamanager._parentDataManager = $UNDEFINED;
}