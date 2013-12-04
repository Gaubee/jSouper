var _statusEventCache = {},
	_statusEvent = {
		"=": function(vi, key, value) {
			vi.set(key, value)
		},
		"+": function(vi, key, value) {
			var oldvalue = vi.get(key)||"";
			if (typeof oldvalue === "string") { //oldvalue is string ,not array or any type elses.
				if (oldvalue.indexOf(value) === -1) {
					vi.set(key, oldvalue + value)
				}
			}
		},
		"-": function(vi, key, value) {
			var oldvalue = vi.get(key)||"";
			if (oldvalue && typeof oldvalue === "string") { //oldvalue is string ,not array or any type elses.
				if (oldvalue.indexOf(value) !== -1) {
					vi.set(key, oldvalue.replace(value,""));
				}
			}
		},
		"?": function(vi, key, value){
			var oldvalue = vi.get(key)||"";
			if (typeof oldvalue === "string") { //oldvalue is string ,not array or any type elses.
				if (oldvalue.indexOf(value) !== -1) {
					vi.set(key, oldvalue.replace(value,""));
				}else{
					vi.set(key, oldvalue + value)
				}
			}
		}
	},
	__statusFun = function() {
		var self = this;
		self.ev(self.vi, self.ke, self.va)
	},
	_getValue = function(vi, key) {
		if ($.isString(key)) {
			var result = key.substring(1, key.length - 1)
		} else {
			result = vi.get(key)
		}
		return result;
	},
	statusListerAttribute = function(key, currentNode, parserNode, vi /*, dm_id*/ ) {
		var attrOuter = _getAttrOuter(parserNode),
			statusInfos = key.replace("status-", "").toLowerCase().split("-"),
			eventName = statusInfos.shift(), //Multi-status binding
			// statusFun = vi.get(attrOuter) || $.noop, //can remove able
			elementHashCode = $.hashCode(currentNode, "status" + statusInfos.join("-"));
		if (eventName.indexOf("on") === 0) {
			eventName = eventName.substring(2)
		}
		var args = [];
		var operatorKey = $.trim(attrOuter.replace(newTemplateMatchReg, function(matchTemp, matchKey) {
			if (!args[1]) {
				if (args[0]) {
					args[1] = $.trim(matchKey)
				} else {
					args[0] = $.trim(matchKey)
				}
			}
			return "";
		}));

		// 判定是否标准的status命令
		if (args.length === 2 && _statusEvent.hasOwnProperty(operatorKey)) {
			var statusCollection = _statusEventCache[elementHashCode];
			if (!statusCollection) { //init Collection
				statusCollection = _statusEventCache[elementHashCode] = {}
			}
			var wrapstatusFun = statusCollection[eventName]
			if (!wrapstatusFun) { //init status and register status
				wrapstatusFun = statusCollection[eventName] = function(e) {
					wrapstatusFun.ev(wrapstatusFun.vi,

						// status Key
						_getValue(vi, wrapstatusFun.ke),

						// status Value
						_getValue(vi, wrapstatusFun.va))
				}
				_registerEvent(currentNode, eventName, wrapstatusFun, elementHashCode);
			}
			// wrapstatusFun.op = operatorKey
			wrapstatusFun.ev = _statusEvent[operatorKey]
			wrapstatusFun.vi = vi
			wrapstatusFun.ke = args[0]
			wrapstatusFun.va = args[1]
		}
	};

V.ra(function(attrKey) {
	return attrKey.indexOf("status-") === 0;
}, function(attrKey) {
	return statusListerAttribute;
})