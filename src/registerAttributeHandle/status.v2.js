Model.config.prefix.Get = "$GET";
var _statusEventCache = {},
	_statusEvent = {
		"=": function(vi, key, value) {
			vi.set(key, value)
		},
		"+": function(vi, key, value) {
			var oldvalue = vi.get(key) || "";
			if ($.isS(oldvalue)) { //oldvalue is string ,not array or any type elses.
				if (oldvalue.indexOf(value) === -1) {
					vi.set(key, oldvalue + value)
				}
			}
		},
		"-": function(vi, key, value) {
			var oldvalue = vi.get(key) || "";
			if (oldvalue && $.isS(oldvalue)) { //oldvalue is string ,not array or any type elses.
				if (oldvalue.indexOf(value) !== -1) {
					vi.set(key, oldvalue.replace(value, ""));
				}
			}
		},
		"?": function(vi, key, value) {
			var oldvalue = vi.get(key) || "";
			if ($.isS(oldvalue)) { //oldvalue is string ,not array or any type elses.
				if (oldvalue.indexOf(value) !== -1) {
					vi.set(key, oldvalue.replace(value, ""));
				} else {
					vi.set(key, oldvalue + value)
				}
			}
		}
	},
	_getStatusKey = function(vi, key) {
		var _$Get = __ModelConfig__.prefix.Get + ".";
		if ($.st(key, _$Get) !== false) {
			key = vi.get(_split_laveStr);
		}
		return key;
	},
	_getStatusValue = function(vi, value) {
		if ($.isSWrap(value)) {
			value = value.substr(1, value.length - 2)
		} else {
			value = vi.get(value)
		}
		return value;
	},
	statusListerAttribute = function(key, currentNode, parserNode, vi /*, dm_id*/ ) {
		var attrOuter = _getAttrOuter(parserNode);
		$.st(key, "-"); //"status - eventName-..."
		var statusInfos = _split_laveStr,
			eventName = $.st(statusInfos, "-") || statusInfos, //Multi-event binding
			elementHashCode = $.hashCode(currentNode, "status" + statusInfos);
		// console.log(statusInfos,eventName)
		if (eventName.indexOf("on") === 0) {
			eventName = eventName.substr(2)
		}
		var fitstPartCommand = $.st(attrOuter, ">");
		var argusPartCommand = $.trim(_split_laveStr);

		var syntax_error;
		try {
			var operatorKey = fitstPartCommand.substr(-1)
			var triggerKey = $.trim(fitstPartCommand.substr(0, fitstPartCommand.length - 1))
			var operatorHandel = _statusEvent[operatorKey];
		} catch (e) {
			syntax_error = e
		}
		//简单判断指令格式是否正确
		if (syntax_error || !(triggerKey && argusPartCommand && operatorHandel)) {
			console.error("SyntaxError: Status-Operator command parser error.")
		} else {
			var statusCollection = _statusEventCache[elementHashCode] || /*init Collection*/ (_statusEventCache[elementHashCode] = {});
			var wrapStatusFun = statusCollection[statusInfos]
			if (!wrapStatusFun) { //init status and register status
				wrapStatusFun = statusCollection[statusInfos] = function(e) {
					var vi = wrapStatusFun.vi;
					var statusKey = _getStatusKey(vi, wrapStatusFun.ke);
					if (statusKey) {
						var statusValue = _getStatusValue(vi, wrapStatusFun.va);
						if ($.isS(statusValue)) {
							wrapStatusFun.ev(vi, statusKey, statusValue)
						}
					}
				}
				_registerEvent(currentNode, eventName, wrapStatusFun, elementHashCode);
			}
			wrapStatusFun.ev = operatorHandel
			wrapStatusFun.vi = vi
			wrapStatusFun.ke = triggerKey
			wrapStatusFun.va = argusPartCommand
		}
	};

V.ra(function(attrKey) {
	return attrKey.indexOf("status-") === 0;
}, function(attrKey) {
	return statusListerAttribute;
})