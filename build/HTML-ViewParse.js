!(function viewParse(global) {

'use strict';
var global = global || this;
var doc = document,
	shadowBody = doc.createElement("body"),
	shadowDIV = doc.createElement("div"),
	_placeholder = function(prefix) {
		return prefix || "@" + Math.random().toString(36).substring(2)
	},
	$NULL = null,
	$UNDEFINED,
	$TRUE = !$UNDEFINED,
	$FALSE = !$TRUE,

	_event_cache = {},
	_addEventListener = function(Element, eventName, eventFun, elementHash) {
		var args = $.s(arguments).splice(4),
			wrapEventFun = _event_cache[elementHash + $.hashCode(eventFun)] = function() {
				var wrapArgs = $.s(arguments);
				Array.prototype.push.apply(wrapArgs, args);
				eventFun.apply(Element, wrapArgs)
			};
		Element.addEventListener(eventName, wrapEventFun, $FALSE);
	},
	_removeEventListener = function(Element, eventName, eventFun, elementHash) {
		var wrapEventFun = _event_cache[elementHash + $.hashCode(eventFun)];
		wrapEventFun && Element.removeEventListener(eventName, wrapEventFun, $FALSE);
	},
	_attachEvent = function(Element, eventName, eventFun, elementHash) {
		var args = $.s(arguments).splice(4),
			wrapEventFun = _event_cache[elementHash + $.hashCode(eventFun)] = function() {
				var wrapArgs = $.s(arguments);
				Array.prototype.push.apply(wrapArgs, args);
				eventFun.apply(Element, wrapArgs)
			};
		Element.attachEvent("on" + eventName, wrapEventFun);
	},
	_detachEvent = function(Element, eventName, eventFun, elementHash) {
		var wrapEventFun = _event_cache[elementHash + $.hashCode(eventFun)];
		wrapEventFun && Element.detachEvent("on" + eventName, wrapEventFun);
	},
	_registerEvent = _isIE ? _attachEvent : _addEventListener,
	_cancelEvent = _isIE ? _detachEvent : _removeEventListener,
	
	$ = {
		id: 9,
		uidAvator: Math.random().toString(36).substring(2),
		hashCode: function(obj, prefix) {
			var uidAvator = (prefix || "") + $.uidAvator,
				codeID;
			if (!(codeID = obj[uidAvator])) {
				codeID = obj[uidAvator] = $.uid();
			}
			return codeID;
		},
		noop: function noop() {},
		valueOf: function(Obj) {
			if (Obj) {
				Obj = Obj.valueOf()
			}
			return Obj
		},
		uid: function() {
			return this.id = this.id + 1;
		},
		isString: function(str) {
			var start = str.charAt(0);
			return (start === str.charAt(str.length - 1)) && "\'\"".indexOf(start) !== -1;
		},
		trim: function(str) {
			str = str.replace(/^\s\s*/, '')
			var ws = /\s/,
				i = str.length;
			while (ws.test(str.charAt(--i)));
			return str.slice(0, i + 1);
		},
		p: function(arr, item) { //push
			var len = arr.length
			arr[len] = item;
			return len;
		},
		us: function(arr, item) { //unshift
			arr.splice(0, 0, item);
		},
		un: function(array) { //unique
			var a = array;
			for (var i = 0; i < a.length; ++i) {
				for (var j = i + 1; j < a.length; ++j) {
					if (a[i] === a[j])
						a.splice(j--, 1);
				}
			}
			return a;
		},
		s: function(likeArr) { //slice
			var array;
			if (typeof likeArr === "string") {
				return likeArr.split('');
			}
			try {
				array = Array.prototype.slice.call(likeArr, 0); //non-IE and IE9+
			} catch (ex) {
				array = [];
				for (var i = 0, len = likeArr.length; i < len; i++) {
					array.push(likeArr[i]);
				}
			}
			return array;
		},
		pI: function(arr, item) { //pushByID
			arr[item.id] = item;
			return item;
		},
		lI: function(arr) { //lastItem
			return arr[arr.length - 1];
		},
		iA: function(arr, afterItem, item) { //insertAfter
			for (var i = 0; i < arr.length; i += 1) {
				if (arr[i] === afterItem) {
					arr.splice(i + 1, 0, item);
					break;
				}
			}
			return i;
		},
		iO: function(arr, item) { //indexOf
			for (var i = 0; i < arr.length; i += 1) {
				if (arr[i] === item) {
					return i;
				}
			}
			return -1;
		},
		fI: function(obj, callback) { //forIn
			for (var i in obj) {
				callback(obj[i], i, obj);
			}
		},
		ftE: function(arr, callback, scope) { //fastEach
			for (var i = 0, len = arr.length; i < len; i += 1) {
				callback(arr[i], i);
			}
		},
		fE: function(arr, callback, i) { //forEach
			if (arr) {
				arr = $.s(arr);
				// return this._each($.s(arr), callback, i)
				for (i = i || 0; i < arr.length; i += 1) {
					if (callback(arr[i], i, arr) === $FALSE) break;
				}
			}
		},
		c: function(proto) { //create
			_Object_create_noop.prototype = proto;
			return new _Object_create_noop;
		},
		D: { //DOM
			C: function(info) { //Comment
				return document.createComment(info)
			},
			iB: function(parentNode, insertNode, beforNode) { //insertBefore
				// try{
				parentNode.insertBefore(insertNode, beforNode || $NULL);
				// }catch(e){}
			},
			ap: function(parentNode, node) { //append
				parentNode.appendChild(node);
			},
			cl: function(node, deep) { //clone
				return node.cloneNode(deep);
			},
			rC: function(parentNode, node) { //removeChild
				parentNode.removeChild(node)
			},
			re: function(parentNode, new_node, old_node) { //replace
				try {
					parentNode.replaceChild(new_node, old_node);
				} catch (e) {}
			}
		}
	},
	_Object_create_noop = function proto() {},
	_traversal = function(node, callback) {
		for (var i = 0, child_node, childNodes = node.childNodes; child_node = childNodes[i]; i += 1) {
			var result = callback(child_node, i, node);
			if (child_node.nodeType === 1 && result !== $FALSE) {
				_traversal(child_node, callback);
			}
		}
	};

function ArraySet() {
	var self = this;
	self.keys = [];
	self.store = {};
	return self;
};
ArraySet.prototype = {
	set: function(key, value) {
		var self = this,
			keys = self.keys,
			store = self.store;
		key = String(key);
		if (!(key in store)) {
			$.p(keys, key)
		}
		store[key] = value;
	},
	get: function(key) {
		return this.store[key];
	},
	forIn: function(callback) { //forEach ==> forIn
		var self = this,
			store = self.store;
		return $.ftE(self.keys, function(key, index) {
			callback(store[key], key, store);
		})
	},
	// ftE: function(callback) { //fastEach ==> forIn
	// 	var self = this,
	// 		store = self.store,
	// 		value;
	// 	return $.ftE(self.keys, function(key, index) {
	// 		value = store[key];
	// 		callback(value, key);
	// 	})
	// },
	has: function(key) {
		return key in this.store;
	}
};
function Try(tryFun,scope,errorCallback){
	errorCallback = errorCallback||$.noop;
	return function(){
		var result;
		try{
			result = tryFun.call(scope);
		}catch(e){
			errorCallback(e);
		}
		return result;
	}
};
/*
 * SmartTriggerSet constructor
 */

function SmartTriggerSet(data) {
	var self = this;
	self.keys = [];
	self.store = {};
	self.TEMP = data;
};
(SmartTriggerSet.prototype = $.c(ArraySet.prototype)).push = function(key, value) {
	var self = this,
		keys = self.keys,
		store = self.store,
		currentCollection;
	key = String(key);
	if (!(key in store)) {
		$.p(keys, key);
	}
	currentCollection = store[key] || (store[key] = []);
	if (value instanceof Array) {
		$.ftE(value,function(smartTriggerHandle){
			self.push(key,smartTriggerHandle);
		})
		// currentCollection.push.apply(currentCollection, value)
	} else if(value instanceof SmartTriggerHandle){
		$.p(currentCollection, value)
	}else{
		console.warn("type error,no SmartTriggerHandle instance!");
	}
	return currentCollection.length;
};
SmartTriggerSet.prototype.touchOff = function(key) {
	var self = this;
	$.ftE(self.get(key), function(smartTriggerHandle) {
		smartTriggerHandle.event(self);
	});
	return self;
};
/*
 * SmartTriggerHandle constructor
 */

function SmartTriggerHandle(key, triggerEvent, data) {
	var self = this,
		match = key;
	// if (!(match instanceof Function)) {
	// 	match = function(matchObj) {
	// 		return matchObj === key;
	// 	}
	// }
	// self.match = match;
	self.matchKey = String(key);
	self.TEMP = data;
	self.event = triggerEvent instanceof Function ? triggerEvent : $.noop;
	self.moveAble = SmartTriggerHandle.moveAble(self);
	self.smartTriggerSetCollection = [];
};
SmartTriggerHandle.moveAble = function(smartTriggerHandle) {
	return $TRUE;
};
SmartTriggerHandle.prototype = {
	// touchOff: function(matchKey) {
	// 	var self = this;
	// 	if (self.matchKey === matchKey) {
	// 		self.event()
	// 	}
	// 	return self;
	// },
	bind: function(smartTriggerSet, key) {
		var self = this;
		$.p(self.smartTriggerSetCollection, smartTriggerSet);
		smartTriggerSet.push(key === $UNDEFINED ? self.matchKey : key, self);
		return self;
	},
	unbind: function(smartTriggerSet) {
		var self = this,
			smartTriggerSetCollection = self.smartTriggerSetCollection,
			index = $.iO(smartTriggerSetCollection, smartTriggerSet);
		if (index !== -1) {
			smartTriggerSet.remove(self);
			smartTriggerSetCollection.splice(index, 1);
		}
		return self;
	}
};
/*
 * DataManager constructor
 */
// var _hasOwn = Object.prototype.hasOwnProperty;

// (function() {

function DataManager(baseData) {
	var self = this;
	if (!(self instanceof DataManager)) {
		return new DataManager(baseData);
	}
	baseData = baseData || {};
	self.id = $.uid();
	self._database = baseData;
	// self._cacheData = {};
	self._viewInstances = []; //to touch off
	self._parentDataManager // = $UNDEFINED; //to get data
	self._prefix // = $NULL; //冒泡时需要加上的前缀
	self._subsetDataManagers = []; //to touch off
	self._triggerKeys = new SmartTriggerSet({
		dataManager: self
	});
	DataManager._instances[self.id] = self;
};
(global.DataManager = DataManager)._instances = {};

var _DM_extends_object_constructor = _placeholder();
DataManager.Object = function(extendsObj) {
	extendsObj[_DM_extends_object_constructor] = $TRUE;
};

function _mix(sObj, nObj) {
	var obj_nx,
		obj_s,
		i;
	if (sObj instanceof Object && nObj instanceof Object) {
		for (var i in nObj) {
			obj_n = nObj[i];
			obj_s = sObj[i]; //||(sObj[i]={});
			if (obj_s && obj_s._DM_extends_object_constructor) { //拓展的DM_Object对象，通过接口实现操作
				obj_s.set(obj_n);
			} else if (obj_s !== obj_n) { //避免循环 Avoid Circular
				sObj[i] = _mix(obj_s, obj_n);
			}
			// DataManager.set(sObj, i, nObj);
		}
		return sObj;
	} else {
		return nObj;
	}
};

DataManager.session = {
	topGetter: $NULL,
	topSetter: $NULL,
	filterKey: $NULL,
	setStacks: []
};
var DM_proto = DataManager.prototype = {
	get: function(key) { //
		var self = DataManager.session.topGetter = this,
			result = self._database;
		if (arguments.length !== 0) {
			var arrKey = key.split("."),
				parent
			if (result != $UNDEFINED && result !== $FALSE) { //null|undefined|false
				do {
					result = result[arrKey.splice(0, 1)];//$.valueOf(result[arrKey.splice(0, 1)]);
				} while (result !== $UNDEFINED && arrKey.length);
			}
			/*
		//避免混淆，不使用智能作用域，否则关键字更新触发器无法准确绑定或者会照常大量计算
		if (arrKey.length && (parent = self._parentDataManager)) { //key不在对象中，查询父级
			result = parent.get(key);
		}*/
			DataManager.session.filterKey = key;
		}
		return result;
	},
	mix: function(key, nObj) {
		//mix Data 合并数据
		var self = this,
			keys,
			lastKey,
			cache_top_n_obj,
			cache_n_Obj;
		switch (arguments.length) {
			case 0:
				break;
			case 1:
				nObj = key;
				if (self._database !== nObj || nObj instanceof Object) {
					self._database = _mix(self._database, nObj);
				};
				key = "";
				break;
			default:
				var sObj = self.get(key)
				if (sObj && sObj[_DM_extends_object_constructor]) { //是DataManager.Object的拓展对象
					sObj.set(nObj); //调用拓展对象的接口
				} else {
					keys = key.split(".");
					lastKey = keys.pop();
					cache_top_n_obj = cache_n_Obj = {};
					$.ftE(keys, function(nodeKey) { //根据对象链生成可混合对象
						cache_n_Obj = (cache_n_Obj[nodeKey] = {});
					});
					cache_n_Obj[lastKey] = nObj;
					self._database = _mix(self._database, cache_top_n_obj);
				}
		}
		return self.touchOff(key);
	},
	set: function(key, nObj) {
		//replace Data 取代原有对象数据
		var self = DataManager.session.topSetter = this,
			lastKey;
		switch (arguments.length) {
			case 0:
				break;
			case 1:
				nObj = key;
				if (self._database !== nObj || nObj instanceof Object) {
					self._database = nObj;
				};
				key = "";
				break;
			default:
				var database = self._database || (self._database = {}),
					cache_n_Obj = database,
					arrKey = key.split("."),
					lastKey = arrKey.pop();
				$.ftE(arrKey, function(currentKey) {
					cache_n_Obj = cache_n_Obj[currentKey] || (cache_n_Obj[currentKey] = {})
				});
				cache_n_Obj[lastKey] = nObj;
		}
		DataManager.session.filterKey = key;

		// return self.touchOff(key);
		var result = self.getTopDataManager(key),
			setStacks = DataManager.session.setStacks,
			result_dm = result.dataManager,
			result_dm_id = result_dm.id;
		if ($.iO(setStacks, result_dm_id) === -1) {
			$.p(setStacks, result_dm_id);
			// console.log(result)
			result = result.key ? result_dm.set(result.key, nObj) : result_dm.set(nObj);
			// result = result_dm.touchOff(result.key)
			setStacks.pop();
		} else {
			// $.p(setStacks,self.id);
			result = self.touchOff(key);
			// setStacks.pop();
		}
		return result;
	},
	registerTrigger: function(key, trigger) {
		var self = this,
			triggerKeys = self._triggerKeys;
		if (typeof trigger === "function") {
			trigger = {
				key: key,
				event: trigger
			};
		} else {
			if (!("key" in trigger)) {
				trigger.key = key
			}
		}
		return "id" in trigger ? trigger.id : (trigger.id = (triggerKeys.push(key, trigger) - 1) + "-" + key);
	},
	removeTrigger: function(trigger_id) {
		var index = parseInt(trigger_id),
			key = trigger_id.replace(index + "-", ""),
			self = this,
			triggerKeys = self._triggerKeys,
			triggerCollection = triggerKeys.get(key) || [];
		triggerCollection.splice(index, 1);
	},
	getTopDataManager: function(key) {
		var self = this,
			parent = self._parentDataManager,
			result,
			prefix;
		if (parent) {
			prefix = self._prefix //||""
			key ? (prefix && (key = prefix + "." + key) /*else key = key*/ ) : (prefix && (key = prefix) /*key=""*/ );
			result = parent.getTopDataManager(key)
		} else {
			result = {
				dataManager: self,
				key: key
			};
		}
		return result;
	},
	touchOff: function(key) {
		var self = this,
			parent = self._parentDataManager,
			triggerKeys = self._triggerKeys,
			updateKey = [key],
			chidlUpdateKey = [],
			allUpdateKey,
			triggerCollection;
		//self
		triggerKeys.forIn(function(triggerCollection, triggerKey) {
			if ( /*triggerKey.indexOf(key ) === 0 || key.indexOf(triggerKey ) === 0*/ !key || key === triggerKey || triggerKey.indexOf(key + ".") === 0 || key.indexOf(triggerKey + ".") === 0) {
				// console.log("triggerKey:",triggerKey,"key:",key)
				$.p(updateKey,triggerKey)
				$.ftE(triggerCollection, function(smartTriggerHandle) {
					smartTriggerHandle.event(triggerKeys);
				})
			}
		});
		//child
		$.ftE(self._subsetDataManagers, function(childDataManager) {
			var prefix = childDataManager._prefix,
				childResult; // || "";
			if (!key) {
				childResult = childDataManager.set(prefix ? self.get(prefix) : self.get())
			} else if (!prefix) {
				childResult = childDataManager.set(key, self.get(key))
			} else if (key === prefix || prefix.indexOf(key + ".") === 0) {
				// childDataManager.touchOff(prefix.replace(key + ".", ""));
				childResult = childDataManager.set(self.get(prefix))
			} else if (key.indexOf(prefix + ".") === 0) {
				prefix = key.replace(prefix + ".", "")
				childResult = childDataManager.set(prefix, self.get(key))
				// childDataManager.touchOff("")
			}
			$.p(chidlUpdateKey,childResult);
		});
		/*debugger
		//parent
		if (parent) {
			var prefix = self._prefix,
				touchKey; //||"";
			if (prefix.indexOf(key + ".") === 0) {
				touchKey = prefix.replace(key + ".", "")
			} else if (!key || key === prefix || key.indexOf(prefix + ".") === 0) {
				touchKey = ""
			}
			if (touchKey !== $UNDEFINED) {
				var parent_sunsetDM = parent._subsetDataManagers,
					index = $.iO(parent_sunsetDM, self);
				parent_sunsetDM.splice(index, 1);
				parent.touchOff(touchKey);
				parent_sunsetDM.splice(index, 0, self);
			}
		}*/
		// allUpdateKey = $.s(updateKey);
		// $.ftE(chidlUpdateKey,function(childResult){
		// 	allUpdateKey.push.apply(allUpdateKey,childResult.allUpdateKey);
		// });
		return {
			key: key,
			// allUpdateKey: allUpdateKey,
			updateKey: updateKey,
			chidlUpdateKey: chidlUpdateKey
		}
	},
	_touchOffSubset: function(key) {},
	_collectTriKey: function(viewInstance) {},
	collect: function(dataManager) { /*收集dataManager的触发集*/
		var self = this,
			myTriggerKeys = self._triggerKeys,
			dmTriggerKeys = dataManager._triggerKeys;
		dmTriggerKeys.forIn(function(dmTriggerCollection, key) {
			myTriggerKeys.push(key, dmTriggerCollection);
			// $.ftE(dmTriggerCollection, function(smartTriggerHandle) {
			// 	smartTriggerHandle.event( /*new triggerKeySet*/ myTriggerKeys);
			// })
		});
		$.ftE(dataManager._subsetDataManagers, function(childDataManager) {
			dataManager.remove(childDataManager);
			$.p(self._subsetDataManagers, childDataManager);
		})
		return self;
	},
	subset: function(dataManager, prefix) { /*收集dataManager的触发集*/
		var self = this,
			myTriggerKeys = self._triggerKeys,
			dmTriggerKeys = dataManager._triggerKeys,
			dotPrefix = prefix ? prefix + "." : ""
		dataManager._prefix = prefix || "";
		dataManager._parentDataManager && dataManager._parentDataManager.remove(dataManager);
		dataManager._parentDataManager = self;
		var data = self.get(prefix);
		if (dataManager._database !== data) {
			dataManager.set(data)
		}
		$.p(self._subsetDataManagers, dataManager);
		/*
		
		dmTriggerKeys.forIn(function(dmTriggerCollection, key) {
			myTriggerKeys.push(dotPrefix + key, dmTriggerCollection);
		});*/
		return self;
	},
	remove: function(dataManager) {
		var self = this,
			subsetDataManagers = self._subsetDataManagers,
			index = $.iO(subsetDataManagers, dataManager);
		subsetDataManagers.splice(index, 1);
		return self;
	},
	destroy: function() {},
	buildGetter: function(key) {},
	buildSetter: function(key) {}
};
// }());
var newTemplateMatchReg = /\{\{([\w\W]+?)\}\}/g,
	// $TRUE = true,
	// $FALSE = false,
	// DoubleQuotedString = /"(?:\.|(\\\")|[^\""\n])*"/g, //双引号字符串
	// SingleQuotedString = /'(?:\.|(\\\')|[^\''\n])*'/g, //单引号字符串
	QuotedString = /"(?:\.|(\\\")|[^\""\n])*"|'(?:\.|(\\\')|[^\''\n])*'/g, //单引号字符串
	templateHandles = {
		"#if": $TRUE,
		"#else": $FALSE, //no arguments
		"/if": $FALSE,
		"@": $TRUE,
		"#each": $TRUE,
		"/each": $FALSE,
		"#with": $TRUE,
		"/with": $TRUE,
		"HTML": $TRUE,
		">": $TRUE,
		"layout": $TRUE
	},
	templateOperatorNum = {
		"!": 1,
		"~": 1,
		"++": 1,
		"--": 1,
		"+": 2,
		"-": 2,
		"*": 2,
		"/": 2,
		"&&": 2,
		"||": 2,
		"=": 2,
		"==": 2,
		"%": 2
	},
	parse = function(str) {
		var quotedString = [];
		var Placeholder = "_" + Math.random();
		str = str.replace(QuotedString, function(qs) {
			quotedString.push(qs)
			return Placeholder;
		});
		result = str.replace(newTemplateMatchReg, function(matchStr, innerStr, index) {
			// console.log(arguments)
			var fun_name = $.trim(innerStr).split(" ")[0];
			if (fun_name in templateHandles) {
				if (templateHandles[fun_name]) {
					var args = innerStr.replace(fun_name, "").split(","),
						result = "{" + fun_name + "(";
					$.ftE(args, function(arg) {
						// args.forEach(function(arg) {
						if (arg = $.trim(arg)) {
							result += parseIte(parseArg(arg));
						}
					});
					result += ")}"
					return result;
				} else {
					return "{" + fun_name + "()}";
				}
			} else {
				return parseIte(parseArg($.trim(innerStr))); //"{(" + innerStr + ")}";
			}
		})
		return result.replace(RegExp(Placeholder, "g"), function(p) {
			return quotedString.splice(0, 1)
		});
	},
	parseArg = function(argStr) {
		var allStack = [],
			inner = $TRUE;
		// console.log("argStr:", argStr);
		argStr.replace(/\(([\W\w]+?)\)/, function(matchSliceArgStr, sliceArgStr, index) {
			inner = $FALSE;
			var stack = parseStr(argStr.substring(0, index));
			allStack.push.apply(allStack, stack);
			// console.log();
			$.p(allStack, {
				// allStack.push({
				type: "arg",
				value: sliceArgStr,
				parse: parseIte(parseArg(sliceArgStr))
			})
			stack = parseStr(argStr.substring(index + matchSliceArgStr.length));
			allStack.push.apply(allStack, stack);
		});
		if (inner) {
			allStack.push.apply(allStack, parseStr(argStr));
		}
		// console.log(pointer, argStr.length)
		// stack = argStr.split(/([\W]+?)/);
		// console.log(allStack);
		// parseIte(stack);
		// return parseIte(stack); //argStr;
		return allStack;
	},
	parseStr = function(sliceArgStr) {
		var stack = [],
			pointer = 0;
		sliceArgStr.replace(/([^\w$\(\)]+)/g, function(matchOperator, operator, index, str) { //([\W]+)
			// console.log(arguments)
			operator = $.trim(operator);
			if (operator && operator !== ".") {
				$.p(stack, {
					// stack.push({
					type: "arg",
					value: str.substring(pointer, index)
				});
				$.p(stack, {
					// stack.push({
					type: "ope",
					value: operator,
					num: templateOperatorNum[operator] || 0,
				});
				pointer = index + matchOperator.length;
			}
			return matchOperator;
		});
		if (stack.length && !stack[0].value) {
			stack.splice(0, 1);
		}
		if (sliceArgStr.length - pointer) {
			$.p(stack, {
				// stack.push({
				type: "arg",
				value: sliceArgStr.substring(pointer, sliceArgStr.length)
			})
		}
		return stack;
	},
	parseIte = function(arr) {
		var result = "";
		$.ftE(arr, function(block, index) {
			// arr.forEach(function(block, index) {
			if (block.type === "arg") {
				!block.parse && (block.parse = "{(" + block.value + ")}");
				// console.log(block.parse, index)
			}
			if (!block.value) {
				block.ignore = $TRUE;
			}
		});
		$.ftE(arr, function(block, index) {
			// arr.forEach(function(block, index) {
			if (block.type === "ope") {
				var prev = arr[index - 1],
					next = arr[index + 1];
				// console.log(prev, index, next)
				if (block.num === 1) {
					if (prev && prev.type === "arg") { //a++
						block.parse = "{$" + block.value + "(" + prev.parse + ")}";
						prev.ignore = $TRUE;
					} else { //++a
						next.parse = "{" + block.value + "(" + next.parse + ")}"
						block.ignore = $TRUE;
					}
				} else if (block.num === 2) {
					next.parse = "{" + block.value + "(" + prev.parse + next.parse + ")}"
					prev.ignore = $TRUE;
					block.ignore = $TRUE;
				} else { //()
					// console.log(block)
					throw "Unknown type:" + block.value
				}
			}
		});
		$.ftE(arr, function(block) {
			// arr.forEach(function(block) {
			if (!block.ignore) {
				result += block.parse;
			}
		});
		return result; //arr;
	};


// var testStr = "{{  a.b  }} "; //==>{(a.b)}
// var testStr = "{{  --a--  }} "; //==>{$--({--({(a)})})} 
// var testStr = "{{  #if bool}} {{name}} {{/if}}"; //==>{#if({(bool)})} {(name)} {/if()}
// var testStr = "{{  !a.x + (++b)  }}"; //==>{+({!({(a.x)})}{++({(b)})})}
// var testStr = "{{  #if !a.x + (++b) +x.v  }} {{name}} {{/if}}"; //==>{#if({+({+({!({(a.x)})}{++({(b)})})}{(x.v)})})} {(name)} {/if()}
// var testStr = "{{ a || b}}"; //==>{||({(a)}{(b)})}
// var testStr = "{{ a && b}}"; //==>{&&({(a)}{(b)})}
// var testStr = "{{@ hehe }}"; //==>{@({(hehe)})}
// var testStr = "{{HTML gaubee }}"; //==>{@({(hehe)})}
// var testStr = "<p>{{HTML gaubee }}</p>"; //==>{@({(hehe)})}
// var testStr = "<p>{{#if a=='asdsd'}}{{'hehe'}}{{/if}}</p>"; //==>{@({(hehe)})}

// var testStr = "{{a='x'}}"; //==>{=({(a)}{('x')})}
// var testStr = "{{> 'tepl',data}}"; //==>{>({('tepl')}{(data)})}
// var testStr = "{{$THIS.name*Gaubee}}"
// console.log(parse(testStr));
var _isIE = !window.dispatchEvent,//!+"\v1",
	//by RubyLouvre(司徒正美)
	//setAttribute bug:http://www.iefans.net/ie-setattribute-bug/
	IEfix = {
		acceptcharset: "acceptCharset",
		accesskey: "accessKey",
		allowtransparency: "allowTransparency",
		bgcolor: "bgColor",
		cellpadding: "cellPadding",
		cellspacing: "cellSpacing",
		"class": "className",
		colspan: "colSpan",
		// checked: "defaultChecked",
		selected: "defaultSelected",
		"for": "htmlFor",
		frameborder: "frameBorder",
		hspace: "hSpace",
		longdesc: "longDesc",
		maxlength: "maxLength",
		marginwidth: "marginWidth",
		marginheight: "marginHeight",
		noresize: "noResize",
		noshade: "noShade",
		readonly: "readOnly",
		rowspan: "rowSpan",
		tabindex: "tabIndex",
		valign: "vAlign",
		vspace: "vSpace",
		DOMContentLoaded:"readystatechange"
	},
	/*
The full list of boolean attributes in HTML 4.01 (and hence XHTML 1.0) is (with property names where they differ in case):

checked             (input type=checkbox/radio)
selected            (option)
disabled            (input, textarea, button, select, option, optgroup)
readonly            (input type=text/password, textarea)
multiple            (select)
ismap     isMap     (img, input type=image)

defer               (script)
declare             (object; never used)
noresize  noResize  (frame)
nowrap    noWrap    (td, th; deprecated)
noshade   noShade   (hr; deprecated)
compact             (ul, ol, dl, menu, dir; deprecated)
//------------anyother answer
all elements: hidden
script: async, defer
button: autofocus, formnovalidate, disabled
input: autofocus, formnovalidate, multiple, readonly, required, disabled, checked
keygen: autofocus, disabled
select: autofocus, multiple, required, disabled
textarea: autofocus, readonly, required, disabled
style: scoped
ol: reversed
command: disabled, checked
fieldset: disabled
optgroup: disabled
option: selected, disabled
audio: autoplay, controls, loop, muted
video: autoplay, controls, loop, muted
iframe: seamless
track: default
img: ismap
form: novalidate
details: open
object: typemustmatch
marquee: truespeed
//----
editable
draggable
*/
	_AttributeHandle = function(attrKey) {
		var assign;
		var attrHandles = V.attrHandles,
			result;
		// console.log("attrKey:",attrKey)
		$.fE(attrHandles, function(attrHandle) {
			// console.log(attrHandle.match)
			if (attrHandle.match(attrKey)) {
				result = attrHandle.handle(attrKey);
				return $FALSE
			}
		});
		return result || _AttributeHandleEvent.com;
	},
	_templateMatchRule= /\{[\w\W]*?\{[\w\W]*?\}[\s]*\}/,
	attributeHandle = function(attrStr, node, handle, triggerTable) {
		var attrKey = $.trim(attrStr.substring(0, attrStr.search("="))),
			attrValue = node.getAttribute(attrKey);
		attrKey = attrKey.toLowerCase()
		attrKey = attrKey.indexOf(V.prefix) ? attrKey : attrKey.replace(V.prefix, "")
		attrKey = (_isIE && IEfix[attrKey]) || attrKey
		if (_matchRule.test(attrValue)||_templateMatchRule.test(attrValue)) {

			var attrViewInstance = (V.attrModules[handle.id + attrKey] = V.parse(attrValue))(),
				_shadowDIV = $.D.cl(shadowDIV), //parserNode
				_attributeHandle = _AttributeHandle(attrKey);
			attrViewInstance.append(_shadowDIV);
			attrViewInstance._isAttr = {
				key: attrKey
			}

			var attrTrigger = {
				event: function(NodeList, dataManager, eventTrigger, isAttr, viewInstance_ID) { /*NodeList, dataManager, eventTrigger, self._isAttr, self._id*/
					var currentNode = NodeList[handle.id].currentNode,
						viewInstance = V._instances[viewInstance_ID];
					if (currentNode) {
						dataManager.collect(attrViewInstance);
						$.fE(attrViewInstance._triggers, function(key) {
							attrViewInstance.touchOff(key);
						});
						_attributeHandle(attrKey, currentNode, _shadowDIV, viewInstance, dataManager, handle, triggerTable);
						dataManager.remove(attrViewInstance); //?
					}
				}
			}
			$.fE(attrViewInstance._triggers, function(key) {
				$.us(triggerTable[key] || (triggerTable[key] = []), attrTrigger);
			});

		}
	};
/*
 * View constructor
 */

function View(arg) {
	var self = this;
	if (!(self instanceof View)) {
		return new View(arg);
	}
	self.handleNodeTree = arg;
	self._handles = [];
	self._triggerTable = {};
	// self._triggers = {};
	// (self._triggers = [])._ = {}; //storage key word and _ storage trigger instance


	_buildHandler.call(self);
	_buildTrigger.call(self);

	return function(data) {
		return _create.call(self, data);
	}
};

function _buildHandler(handleNodeTree) {
	var self = this,
		handles = self._handles
		handleNodeTree = handleNodeTree || self.handleNodeTree;
	_traversal(handleNodeTree, function(item_node, index, handleNodeTree) {
		item_node.parentNode = handleNodeTree;
		if (item_node.type === "handle") {
			var handleFactory = V.handles[item_node.handleName];
			if (handleFactory) {
				var handle = handleFactory(item_node, index, handleNodeTree)
				handle && $.p(handles, handle);
			}
		}
	});
};
var _attrRegExp = /(\S+)=["']?((?:.(?!["']?\s+(?:\S+)=|[>"']))+.)["']?/g;


function _buildTrigger(handleNodeTree, dataManager) {
	var self = this, //View Instance
		triggerTable = self._triggerTable;
	handleNodeTree = handleNodeTree || self.handleNodeTree;
	_traversal(handleNodeTree, function(handle, index, parentHandle) {
		if (handle.type === "handle") {
			var triggerFactory = V.triggers[handle.handleName];
			if (triggerFactory) {
				var trigger = triggerFactory(handle, index, parentHandle);
				if (trigger) {
					var key = trigger.key || (trigger.key = "");
					trigger.handleId = trigger.handleId || handle.id;
					//unshift list and In order to achieve the trigger can be simulated bubble
					$.us((triggerTable[key]||(triggerTable[key]  =  [])), trigger); //Storage as key -> array
					$.p(handle._triggers, trigger); //Storage as array
				}
			}
		} else if (handle.type === "element") {
			var node = handle.node,
				nodeHTMLStr = node.outerHTML.replace(node.innerHTML, ""),
				attrs = nodeHTMLStr.match(_attrRegExp);

			$.fE(attrs, function(attrStr) {
				attributeHandle(attrStr, node, handle, triggerTable);

			});
		}
	});
};

function _create(data) { //data maybe basedata or dataManager
	var self = this,
		NodeList_of_ViewInstance = {}, //save newDOM  without the most top of parentNode -- change with append!!
		topNode = $.c(self.handleNodeTree);
	topNode.currentNode = $.D.cl(shadowBody);
	$.pI(NodeList_of_ViewInstance, topNode);

	_traversal(topNode, function(node, index, parentNode) {
		node = $.pI(NodeList_of_ViewInstance, $.c(node));
		if (!node.ignore) {
			var currentParentNode = NodeList_of_ViewInstance[parentNode.id].currentNode || topNode.currentNode;
			var currentNode = node.currentNode = $.D.cl(node.node);
			$.D.ap(currentParentNode, currentNode);
		} else {

			_traversal(node, function(node) { //ignore Node's childNodes will be ignored too.
				node = $.pI(NodeList_of_ViewInstance, $.c(node));
			});
			return $FALSE
		}
	});


	$.fE(self._handles, function(handle) {
		handle.call(self, NodeList_of_ViewInstance);
	});
	return ViewInstance(self.handleNodeTree, NodeList_of_ViewInstance, self._triggerTable, data);
};
/*
 * View Instance constructor
 */

(function DM_extends_fot_VI() {
	DM_proto.rebuildTree = function(key) {
		var self = this,
			DMSet = self._subsetDataManagers;
		// $.p(DMSet, self); //add self into cycle
		// _touchOff.call(self,key);
		$.ftE(self._viewInstances, function(childViewInstance) {
			var smartTriggerCollection =
				$.ftE(childViewInstance._smartTriggers, function(smartTrigger) {
					var TEMP = smartTrigger.TEMP;
					TEMP.dataManager.get(TEMP.sourceKey);
					var topGetter = DataManager.session.topGetter;
					if (topGetter !== TEMP.dataManager) {
						smartTrigger.bind(topGetter._triggerKeys);
						TEMP.dataManager = topGetter;
					}
					smartTrigger.event(topGetter._triggerKeys);
				})
		})
		$.ftE(self._subsetDataManagers, function(childDataManager) {
			$.ftE(childDataManager._viewInstances, function(childViewInstance) {
				var smartTriggerCollection =
					$.ftE(childViewInstance._smartTriggers, function(smartTrigger) {
						if (smartTrigger.moveAble) {
							var TEMP = smartTrigger.TEMP;
							TEMP.dataManager.get(TEMP.sourceKey);
							var topGetter = DataManager.session.topGetter;
							if (topGetter !== TEMP.dataManager) {
								smartTrigger.unbind(TEMP.dataManager._triggerKeys).bind(topGetter._triggerKeys);
								TEMP.dataManager = topGetter;
								smartTrigger.event(topGetter._triggerKeys);
							}
						}
					})
			})
		})
		// DMSet.pop(); //remove self
	}
	var _collect = DM_proto.collect;
	DM_proto.collect = function(viewInstance) {
		var self = this,
			smartTriggers = viewInstance._smartTriggers;
		if (viewInstance instanceof DataManager) {
			_collect.call(self, viewInstance)
		} else if (viewInstance instanceof ViewInstance) {
			var vi_DM = viewInstance.dataManager;
			viewInstance.dataManager = self;
			if (vi_DM) {
				_collect.call(self, vi_DM)
				vi_DM.remove(viewInstance);
				// viewInstance.dataManager = self;
			} else {
				// viewInstance.dataManager = self;
				var viewInstanceTriggers = viewInstance._triggers;
				$.ftE(viewInstanceTriggers, function(sKey) {
					self.get(sKey);
					var baseKey = DataManager.session.filterKey,
						topGetterTriggerKeys = DataManager.session.topGetter._triggerKeys,
						smartTrigger = new SmartTriggerHandle(
							baseKey, //match key

							function(smartTriggerSet) { //event
								viewInstance.touchOff(sKey);
							}, { //TEMP data
								viewInstance: viewInstance,
								dataManager: self,
								// triggerSet: topGetterTriggerKeys,
								sourceKey: sKey
							}
						);
					$.p(smartTriggers, smartTrigger);
					smartTrigger.bind(topGetterTriggerKeys); // topGetterTriggerKeys.push(baseKey, smartTrigger);
					// smartTrigger.event(topGetterTriggerKeys);
				});
			}
			$.p(viewInstance.dataManager._viewInstances, viewInstance);
			self.rebuildTree();
		}
		return self;
	};
	var _subset = DM_proto.subset;
	DM_proto.subset = function(viewInstance, prefix) {
		var self = this;
		if (viewInstance instanceof DataManager) {
			_subset.call(self, viewInstance, prefix);
		} else {
			var vi_DM = viewInstance.dataManager;
			if (vi_DM) {
				_subset.call(self, vi_DM, prefix);
			} else {
				var data = self.get(prefix),
					filterKey = DataManager.session.filterKey;
				console.log(filterKey)
				if (filterKey) {
					vi_DM = DataManager(data);
					vi_DM.collect(viewInstance);
					_subset.call(/*DataManager.session.topGetter*/self/*be lower*/, vi_DM, filterKey);//!!!
				} else {
					self.collect(viewInstance);
				}
				self.rebuildTree();
			}
			self.rebuildTree();
		}
	};
}());
var ViewInstance = function(handleNodeTree, NodeList, triggerTable, data) {
	if (!(this instanceof ViewInstance)) {
		return new ViewInstance(handleNodeTree, NodeList, triggerTable, data);
	}
	var self = this,
		dataManager;
	self._isAttr = $FALSE; //if no null --> Storage the attribute key and current.
	self._isEach = $FALSE; //if no null --> Storage the attribute key and current.
	self.dataManager; //= dataManager;
	self.handleNodeTree = handleNodeTree;
	self.DOMArr = $.s(handleNodeTree.childNodes);
	self.NodeList = NodeList;
	var el = self.topNode(); //NodeList[handleNodeTree.id].currentNode;
	self._packingBag = el;
	V._instances[self._id = $.uid()] = self;
	self._open = $.D.C(self._id + " _open");
	self._close = $.D.C(self._id + " _close");
	self._canRemoveAble = $FALSE;
	self._AVI = {};
	self._ALVI = {};
	self._WVI = {};
	$.D.iB(el, self._open, el.childNodes[0]);
	$.D.ap(el, self._close);
	(self._triggers = [])._ = {};
	// self._triggers._u = [];//undefined key,update every time
	self.TEMP = {};

	$.fI(triggerTable, function(tiggerCollection, key) {
		if (".".indexOf(key) !== 0) {
			$.p(self._triggers, key);
		}
		self._triggers._[key] = tiggerCollection;
	});
	$.fE(triggerTable["."], function(tiggerFun) { //const value
		tiggerFun.event(NodeList, dataManager);
	});

	if (!(data instanceof DataManager)) {
		dataManager = DataManager(data);
	}
	self._smartTriggers = [];
	dataManager.collect(self);
};

function _bubbleTrigger(tiggerCollection, NodeList, dataManager, eventTrigger) {
	var self = this,
		result;
	$.fE(tiggerCollection, function(trigger) { //TODO:测试参数长度和效率的平衡点，减少参数传递的数量
		result = trigger.event(NodeList, dataManager, eventTrigger, self._isAttr, self._id);
		if (result !== $FALSE && trigger.bubble) {
			var parentNode = NodeList[trigger.handleId].parentNode;
			parentNode && _bubbleTrigger.call(self, parentNode._triggers, NodeList, dataManager, trigger);
		}
	});
};

function _replaceTopHandleCurrent(self, el) {
	self._canRemoveAble = $TRUE;
	self.topNode(el);
};
ViewInstance.prototype = {
	reDraw: function() {
		var self = this,
			dataManager = self.dataManager;

		$.fE(self._triggers, function(key) {
			dataManager._touchOffSubset(key)
		});
		return self;
	},
	append: function(el) {
		var self = this,
			handleNodeTree = self.handleNodeTree,
			NodeList = self.NodeList,
			AllLayoutViewInstance = self._ALVI,
			AllWithViewInstance = self._WVI,
			viewInstance,
			currentTopNode = NodeList[handleNodeTree.id].currentNode;

		$.fE(currentTopNode.childNodes, function(child_node) {
			$.D.ap(el, child_node);
		});
		_replaceTopHandleCurrent(self, el);

		$.ftE(NodeList[handleNodeTree.id].childNodes, function(child_node) {
			if (viewInstance = AllLayoutViewInstance[child_node.id] || AllWithViewInstance[child_node.id]) {
				_replaceTopHandleCurrent(viewInstance, el)
			}
		});

		return self;
	},
	insert: function(el) {
		var self = this,
			handleNodeTree = self.handleNodeTree,
			NodeList = self.NodeList,
			AllLayoutViewInstance = self._ALVI,
			AllWithViewInstance = self._WVI,
			viewInstance,
			currentTopNode = self.topNode(), //NodeList[handleNodeTree.id].currentNode,
			elParentNode = el.parentNode;

		$.fE(currentTopNode.childNodes, function(child_node) {
			$.D.iB(elParentNode, child_node, el);
		});
		_replaceTopHandleCurrent(self, elParentNode);

		$.ftE(NodeList[handleNodeTree.id].childNodes, function(child_node) {
			if (viewInstance = AllLayoutViewInstance[child_node.id] || AllWithViewInstance[child_node.id]) {
				_replaceTopHandleCurrent(viewInstance, elParentNode)
			}
		});
		return self;
	},
	remove: function() {
		var self = this,
			el = this._packingBag
		if (self._canRemoveAble) {
			var handleNodeTree = self.handleNodeTree,
				NodeList = self.NodeList,
				currentTopNode = self.topNode(), //NodeList[handleNodeTree.id].currentNode,
				openNode = self._open,
				closeNode = self._close,
				startIndex = 0;

			$.fE(currentTopNode.childNodes, function(child_node, index) {
				if (child_node === openNode) {
					startIndex = index
				}
			});
			$.fE(currentTopNode.childNodes, function(child_node, index) {
				// console.log(index,child_node,el)
				$.D.ap(el, child_node);
				if (child_node === closeNode) {
					return $FALSE;
				}
			}, startIndex);
			_replaceTopHandleCurrent(self, el);
			this._canRemoveAble = $FALSE; //Has being recovered into the _packingBag,can't no be remove again. --> it should be insert
		}
		return self;
	},
	get: function get() {
		var dm = this.dataManager;
		return dm.get.apply(dm, $.s(arguments));
	},
	set: function set() {
		var dm = this.dataManager;
		return dm.set.apply(dm, $.s(arguments))
	},
	topNode: function(newCurrentTopNode) {
		var self = this,
			handleNodeTree = self.handleNodeTree,
			NodeList = self.NodeList;
		if (newCurrentTopNode) {
			NodeList[handleNodeTree.id].currentNode = newCurrentTopNode
		} else {
			return NodeList[handleNodeTree.id].currentNode
		}
	},
	touchOff: function(key) {
		var self = this,
			dataManager = self.dataManager,
			NodeList = self.NodeList;
		// key!==$UNDEFINED?_bubbleTrigger.call(self, self._triggers._[key], NodeList, dataManager):_bubbleTrigger.call(self, self._triggers._u, NodeList, dataManager)
		_bubbleTrigger.call(self, self._triggers._[key], NodeList, dataManager)
	}
};

/*
 * parse function
 */
var _parse = function(node) {//get all childNodes
	var result = [];
	for (var i = 0, child_node, childNodes = node.childNodes; child_node = childNodes[i]; i += 1) {
		switch (child_node.nodeType) {
			case 3:
				if ($.trim(child_node.data)) {
					$.p(result, new TextHandle(child_node))
				}
				break;
			case 1:
				if (child_node.tagName.toLowerCase() === "span" && child_node.getAttribute("type") === "handle") {
					var handleName = child_node.getAttribute("handle");
					if (handleName !== $NULL) {
						$.p(result, new TemplateHandle(handleName, child_node))
					}
				} else {
					$.p(result, new ElementHandle(child_node))
				}
				break;
		}
	}
	return result;
};

/*
 * Handle constructor
 */
function Handle(type, opction) {
	var self = this;
	if (!(self instanceof Handle)) {
		return new Handle(type,opction);
	}
	if (type) {
		self.type = type;
	}
	$.fI(opction, function(val,key) {
		self[key] = val;
	});
};
Handle.init = function(self,weights){
	self.id = $.uid();//weights <= 1
	if (weights<2)return;
	self._controllers = [];//weights <= 2
	self._controllers[$TRUE] = [];//In the #if block scope
	self._controllers[$FALSE] = [];//In the #else block scope
	if (weights<3)return;
	self._triggers = [];//weights <= 3
};
Handle.prototype = {
	nodeType:0,
	ignore: $FALSE, //ignore Handle --> no currentNode
	display: $FALSE, //function of show or hidden DOM
	childNodes:[],
	parentNode: $NULL,
	type: "handle"
};

/*
 * TemplateHandle constructor
 */
function TemplateHandle(handleName, node) {
	var self = this;
	self.handleName = $.trim(handleName);
	self.childNodes = _parse(node);
	Handle.init(self,3);
};
TemplateHandle.prototype = Handle("handle", {
	ignore: $TRUE,
	nodeType: 1
})

/*
 * ElementHandle constructor
 */
function ElementHandle(node) {
	var self = this;
	self.node = node;
	self.childNodes = _parse(node);
	Handle.init(self,3);
};
ElementHandle.prototype = Handle("element", {
	nodeType: 1
})

/*
 * TextHandle constructor
 */
function TextHandle(node) {
	var self = this;
	self.node = node;
	Handle.init(self,2);
};
TextHandle.prototype = Handle("text", {
	nodeType: 3
})

/*
 * CommentHandle constructor
 */
function CommentHandle(node) {
	var self = this;
	self.node = node;
	Handle.init(self,1);
};
CommentHandle.prototype = Handle("comment", {
	nodeType: 8
})
/*
 * parse rule
 */
var placeholder = {
	"<": "&lt;",
	">": "&gt;",
	"{": _placeholder(),
	"(": _placeholder(),
	")": _placeholder(),
	"}": _placeholder()
},
	_Rg = function(s) {
		return RegExp(s, "g")
	},
	placeholderReg = {
		"<": /</g,
		">": />/g,
		"/{": /\\\{/g,
		"{": _Rg(placeholder["{"]),
		"/(": /\\\(/g,
		"(": _Rg(placeholder["("]),
		"/)": /\\\)/g,
		")": _Rg(placeholder[")"]),
		"/}": /\\\}/g,
		"}": _Rg(placeholder["}"])
	}, _head = /\{([\w\W]*?)\(/g,
	_footer = /\)[\s]*\}/g,
	parseRule = function(str) {
		var parseStr = str
			.replace(/</g, placeholder["<"])
			.replace(/>/g, placeholder[">"])
			.replace(placeholderReg["/{"], placeholder["{"])
			.replace(placeholderReg["/("], placeholder["("])
			.replace(placeholderReg["/)"], placeholder[")"])
			.replace(placeholderReg["/}"], placeholder["}"])
			.replace(_head, "<span type='handle' handle='$1'>")
			.replace(_footer, "</span>")
			.replace(placeholderReg["{"], "{")
			.replace(placeholderReg["("], "(")
			.replace(placeholderReg[")"], ")")
			.replace(placeholderReg["}"], "}");
		return parseStr;
	},
	_matchRule = /\{[\w\W]*?\([\w\W]*?\)[\s]*\}/,
	/*
	 * expores function
	 */

	V = {
		prefix: "attr-",
		parse: function(htmlStr) {
			var _shadowBody = $.D.cl(shadowBody);
			_shadowBody.innerHTML = htmlStr;
			var insertBefore = [];
			_traversal(_shadowBody, function(node, index, parentNode) {
				if (node.nodeType === 3) {
					$.p(insertBefore, {
						baseNode: node,
						parentNode: parentNode,
						insertNodesHTML: parseRule(node.data)
					});
				}
			});

			$.fE(insertBefore, function(item) {
				var node = item.baseNode,
					parentNode = item.parentNode,
					insertNodesHTML = item.insertNodesHTML;
				shadowDIV.innerHTML = insertNodesHTML;
				//Using innerHTML rendering is complete immediate operation DOM, 
				//innerHTML otherwise covered again, the node if it is not, 
				//then memory leaks, IE can not get to the full node.
				$.fE(shadowDIV.childNodes, function(refNode) {
					$.D.iB(parentNode, refNode, node)
				})
				$.D.rC(parentNode, node);
			});
			_shadowBody.innerHTML = _shadowBody.innerHTML;
			var result = new ElementHandle(_shadowBody);
			return View(result);
		},
		rt: function(handleName, triggerFactory) {
			return V.triggers[handleName] = triggerFactory;
		},
		rh: function(handleName, handle) {
			return V.handles[handleName] = handle
		},
		ra: function(match, handle) {
			var attrHandle = V.attrHandles[V.attrHandles.length] = {
				match: $NULL,
				handle: handle
			}
			if (typeof match === "function") {
				attrHandle.match = match;
			} else {
				attrHandle.match = function(attrKey) {
					return attrKey === match;
				}
			}
		},
		triggers: {},
		handles: {},
		attrHandles: [],
		modules: {},
		attrModules: {},
		eachModules: {},
		withModules: {},
		_instances: {},

		// Proto: DynamicComputed /*Proto*/ ,
		Model: DataManager
	};
var ViewParser = global.ViewParser = {
	scans: function() {
		$.fE(document.getElementsByTagName("script"), function(scriptNode) {
			if (scriptNode.getAttribute("type") === "text/template") {
				V.modules[scriptNode.getAttribute("name")] = V.parse(scriptNode.innerHTML);
			}
		});
	},
	parseStr: function(htmlStr) {
		return V.parse(parse(str))
	},
	parseNode: function(htmlNode) {
		return V.parse(parse(htmlNode.innerHTML))
	},
	parse: function(html) {
		if (html instanceof Object) {
			return this.parseNode(html)
		}
		return this.parseStr(html)
	},
	modules: V.modules,
	config: {
		appName: 'HVP',
		data: {}
	},
	ready: (function() {
		var ready = "DOMContentLoaded", //_isIE ? "DOMContentLoaded" : "readystatechange",
			ready_status = $FALSE,
			callbackFunStacks = [];

		_registerEvent(doc, (_isIE && IEfix[ready]) || ready, function() {
			$.ftE(callbackFunStacks, function(callbackObj) {
				callbackObj.callback.call(callbackObj.scope)
			})
			ready_status = $TRUE;
		});
		return function(callbackFun, scope) {
			if (ready_status) {
				callbackFun.call(scope);
			} else {
				$.p(callbackFunStacks, {
					callback: callbackFun,
					scope: scope
				})
			}
		}
	}())
};
(function() {

	var scriptTags = document.getElementsByTagName("script"),
		HVP_config = ViewParser.config,
		userConfigStr = scriptTags[scriptTags.length - 1].innerHTML;
	ViewParser.ready(Try(function() {
		userConfig = $.trim(userConfigStr) ? eval("(" + userConfigStr + ")") : {};
		for (var i in userConfig) { //mix
			HVP_config[i] = userConfig[i];
		}
	}, function(e) {
		throw "config error:" + e.message;
	}));
	ViewParser.ready(function() {
		var HVP_config = ViewParser.config,
			App = document.getElementById(HVP_config.appName); //configable
		if (App) {
			var template = global[HVP_config.appName] =ViewParser.parseNode(App)(/*HVP_config.data*/); //App.getAttribute("template-data")//json or url or configable
			template.set(HVP_config.data);
			App.innerHTML = "";
			template.append(App);
		}
		ViewParser.scans();
	})
}());
V.rh("HTML", function(handle, index, parentHandle) {
	var endCommentHandle = _commentPlaceholder(handle, parentHandle, "html_end_" + handle.id),
		startCommentHandle = _commentPlaceholder(handle, parentHandle, "html_start_" + handle.id);
});
var _commentPlaceholder = function(handle, parentHandle, commentText) {
	var handleName = handle.handleName,
		commentText = commentText || (handleName + handle.id),
		commentNode = $.D.C(commentText),
		commentHandle = new CommentHandle(commentNode); // commentHandle as Placeholder

	$.p(handle.childNodes, commentHandle);
	$.iA(parentHandle.childNodes, handle, commentHandle);
	//Node position calibration
	//no "$.insert" Avoid sequence error
	return commentHandle;
};
var placeholderHandle = function(handle, index, parentHandle) {
	var commentHandle = _commentPlaceholder(handle, parentHandle);
};
var _each_display = function(show_or_hidden, NodeList_of_ViewInstance, dataManager, triggerBy, viewInstance_ID) {
	var handle = this,
		parentHandle = handle.parentNode,
		comment_endeach_id,
		allArrViewInstances = V._instances[viewInstance_ID]._AVI,
		arrViewInstances = allArrViewInstances[handle.id];
	$.fE(parentHandle.childNodes, function(child_handle, index, cs) { //get comment_endeach_id
		if (child_handle.id === handle.id) {
			comment_endeach_id = cs[index + 3].id;
			return $FALSE;
		}
	});
	// console.log(comment_endeach_id,viewInstance_ID)
	arrViewInstances && (arrViewInstances.hidden = !show_or_hidden);
	if (show_or_hidden) {
		$.fE(arrViewInstances, function(viewInstance, index) {
			// console.log(comment_endeach_id,NodeList_of_ViewInstance[comment_endeach_id],handle,parentHandle)
			viewInstance.insert(NodeList_of_ViewInstance[comment_endeach_id].currentNode)
			// console.log(handle.len)
			if (arrViewInstances.len === index + 1) {
				return $FALSE;
			}
		});
	} else {
		$.fE(arrViewInstances, function(viewInstance) {
			// console.log(viewInstance)
			viewInstance.remove();
		})
	}
};
V.rh("#each", function(handle, index, parentHandle) {
	//The Nodes between #each and /each will be pulled out , and not to be rendered.
	//which will be combined into new View module.
	var _shadowBody = $.D.cl(shadowBody),
		eachModuleHandle = new ElementHandle(_shadowBody),
		endIndex = 0;

	// handle.arrViewInstances = [];//Should be at the same level with currentNode
	// handle.len = 0;
	var layer = 1;
	$.fE(parentHandle.childNodes, function(childHandle, index) {
		endIndex = index;
		if (childHandle.handleName === "#each") {
			layer += 1
		}
		if (childHandle.handleName === "/each") {
			layer -= 1;
			if (!layer) {
				return $FALSE
			}
		}
		$.p(eachModuleHandle.childNodes, childHandle);
		// layer && console.log("inner each:", childHandle)
	}, index + 1);
	// console.log("----",handle.id,"-------")
	parentHandle.childNodes.splice(index + 1, endIndex - index - 1); //Pulled out
	V.eachModules[handle.id] = View(eachModuleHandle); //Compiled into new View module

	handle.display = _each_display; //Custom rendering function
	_commentPlaceholder(handle, parentHandle);
});
V.rh("/each", placeholderHandle);
// var _noParameters = _placeholder();
V.rh("", function(handle, index, parentHandle) {
	var textHandle = handle.childNodes[0];
	if (!textHandle) {//{()} 无参数
		textHandle = $.p(handle.childNodes,new TextHandle(doc.createTextNode("")))
	}
	if (parentHandle.type !== "handle") { //is textNode
		if (textHandle) {
			$.iA(parentHandle.childNodes, handle, textHandle);
			//Node position calibration
			//textHandle's parentNode will be rewrited. (by using $.insertAfter)
			return $.noop;
		}
	}// else {console.log("ignore:",textHandle) if (textHandle) {textHandle.ignore = $TRUE; } }  //==> ignore Node's childNodes will be ignored too.
});
V.rh("@", function(handle, index, parentHandle) {
	var textHandle = handle.childNodes[0];
	var i = 0;
	do {
		i += 1;
		var nextHandle = parentHandle.childNodes[index + i];
	} while (nextHandle && nextHandle.ignore);
	if (textHandle) { //textNode as Placeholder

		$.iA(parentHandle.childNodes, handle, textHandle);
		//Node position calibration
		//no "$.insert" Avoid sequence error

		return function(NodeList_of_ViewInstance) {
			var nextNodeInstance = nextHandle && NodeList_of_ViewInstance[nextHandle.id].currentNode,
				textNodeInstance = NodeList_of_ViewInstance[textHandle.id].currentNode,
				parentNodeInstance = NodeList_of_ViewInstance[parentHandle.id].currentNode
				$.D.iB(parentNodeInstance, textNodeInstance, nextNodeInstance); //Manually insert node
		}
	}
});
V.rh("/if", V.rh("#else", V.rh("#if", placeholderHandle)));
var _layout_display = function(show_or_hidden, NodeList_of_ViewInstance, dataManager, triggerBy, viewInstance_ID) {
	var handle = this,
		commentPlaceholderElement,
		layoutViewInstance = V._instances[viewInstance_ID]._ALVI[handle.id];
	if (!layoutViewInstance) {
		return;
	}
	$.fE(handle.parentNode.childNodes, function(child_handle, index, cs) { //get comment_endeach_id
		if (child_handle.id === handle.id) {
			commentPlaceholderElement = NodeList_of_ViewInstance[cs[index + 1].id].currentNode
			return $FALSE;
		}
	});
	console.log(show_or_hidden, viewInstance_ID, layoutViewInstance)
	if (show_or_hidden) {
		layoutViewInstance.insert(commentPlaceholderElement);
	} else {
		layoutViewInstance.remove();
	}

};
V.rh(">", V.rh("#layout", function(handle, index, parentHandle) {
	handle.display = _layout_display; //Custom rendering function
	_commentPlaceholder(handle, parentHandle);
}));
var _with_display = function(show_or_hidden, NodeList_of_ViewInstance, dataManager, triggerBy, viewInstance_ID) {
	var handle = this,
		parentHandle = handle.parentNode,
		comment_endwith_id,
		AllLayoutViewInstance = V._instances[viewInstance_ID]._WVI,
		withViewInstance = AllLayoutViewInstance[handle.id];
	if (!withViewInstance) {
		return;
	}
	$.fE(parentHandle.childNodes, function(child_handle, index, cs) { //get comment_endwith_id
		if (child_handle.id === handle.id) {
			comment_endwith_id = cs[index + 3].id;
			return $FALSE;
		}
	});
	console.log(show_or_hidden,NodeList_of_ViewInstance[comment_endwith_id].currentNode)
	if (show_or_hidden) {
		withViewInstance.insert(NodeList_of_ViewInstance[comment_endwith_id].currentNode)
	} else {
		withViewInstance.remove();
	}
};
V.rh("#with", function(handle, index, parentHandle) {
	//The Nodes between #with and /with will be pulled out , and not to be rendered.
	//which will be combined into new View module.
	var _shadowBody = $.D.cl(shadowBody),
		withModuleHandle = new ElementHandle(_shadowBody),
		endIndex = 0;

	// handle.arrViewInstances = [];//Should be at the same level with currentNode
	var layer = 1;
	$.fE(parentHandle.childNodes, function(childHandle, index) {
		endIndex = index;
		// console.log(childHandle,childHandle.handleName)
		if (childHandle.handleName === "#with") {
			layer += 1
		}
		if (childHandle.handleName === "/with") {
			layer -= 1;
			if (!layer) {
				return $FALSE
			}
		}
		$.p(withModuleHandle.childNodes, childHandle);
	}, index + 1);
	// console.log("----",handle.id,"-------")
	parentHandle.childNodes.splice(index + 1, endIndex - index - 1); //Pulled out
	V.withModules[handle.id] = View(withModuleHandle); //Compiled into new View module

	handle.display = _with_display; //Custom rendering function
	_commentPlaceholder(handle, parentHandle);
});
V.rh("/with", placeholderHandle);
V.rt("HTML", function(handle, index, parentHandle) {
	var handleChilds = handle.childNodes,
		htmlTextHandlesId = handleChilds[0].id,
		beginCommentId = handleChilds[handleChilds.length - 1].id,
		endCommentId = handleChilds[handleChilds.length - 2].id,
		cacheNode =  $.D.cl(shadowDIV),
		trigger;
	trigger = {
		// key:"",//default key === ""
		bubble: true,
		event: function(NodeList_of_ViewInstance, dataManager) {
			var htmlText = NodeList_of_ViewInstance[htmlTextHandlesId]._data,
				startCommentNode = NodeList_of_ViewInstance[beginCommentId].currentNode,
				endCommentNode = NodeList_of_ViewInstance[endCommentId].currentNode,
				parentNode = endCommentNode.parentNode,
				brotherNodes = parentNode.childNodes,
				index = -1;
			$.fE(brotherNodes, function(node, i) {
				index = i;
				if (node === startCommentNode) {
					return $FALSE;
				}
			});
			index = index + 1;
			$.fE(brotherNodes, function(node, i) {
				if (node === endCommentNode) {
					return $FALSE;
				}
				$.D.rC(parentNode,node);//remove
			}, index);
			cacheNode.innerHTML = htmlText;
			$.fE(cacheNode.childNodes, function(node, i) {
				$.D.iB(parentNode, node, endCommentNode);
			});
		}
	}
	return trigger;
});
function _handle_on_event_string(isAttr, data) {
	if (isAttr) {
		//IE浏览器直接编译，故不需要转义，其他浏览器需要以字符串绑定到属性中。需要转义，否则会出现引号冲突
		if (isAttr.key.indexOf("on") === 0 && !_isIE) { //W#C标准，onXXX属性事件使用string，消除差异
			data = String(data).replace(/"/g, '\\"').replace(/'/g, "\\'");
		}
	}
	return data;
}
V.rt("&&", V.rt("and", function(handle, index, parentHandle) {
	var childHandlesId = [],
		trigger;
	$.fE(handle.childNodes, function(child_handle) {
		if (child_handle.type === "handle") {
			$.p(childHandlesId, child_handle.id);
		}
	});
	trigger = {
		// key:"",//default key === ""
		bubble: $TRUE,
		event: function(NodeList_of_ViewInstance, dataManager) {
			var and = $TRUE;
			$.fE(childHandlesId, function(child_handle_id) { //Compared to other values
				and = !! NodeList_of_ViewInstance[child_handle_id]._data
				if (!and) {
					return $FALSE; //stop forEach
				}
			});
			NodeList_of_ViewInstance[this.handleId]._data = and;
		}
	}
	return trigger;
}));
var eachConfig = {
	$I: "$INDEX"
}
V.rt("#each", function(handle, index, parentHandle) {
	var id = handle.id,
		arrDataHandleKey = handle.childNodes[0].childNodes[0].node.data,
		comment_endeach_id = parentHandle.childNodes[index + 3].id, //eachHandle --> eachComment --> endeachHandle --> endeachComment
		trigger;

	trigger = {
		event: function(NodeList_of_ViewInstance, dataManager, eventTrigger, isAttr, viewInstance_ID) {
			var data = dataManager.get(arrDataHandleKey),
				allArrViewInstances = V._instances[viewInstance_ID]._AVI,
				arrViewInstances,
				divideIndex = data ? data.length : 0,
				eachModuleConstructor = V.eachModules[id],
				inserNew,
				comment_endeach_node = NodeList_of_ViewInstance[comment_endeach_id].currentNode;

			(arrViewInstances = allArrViewInstances[id] || (allArrViewInstances[id] = [])).len = divideIndex;
			// console.log(data)
			$.fE(data, function(eachItemData, index) {

				var viewInstance = arrViewInstances[index];
				if (!viewInstance) {
					viewInstance = arrViewInstances[index] = eachModuleConstructor(eachItemData);
					viewInstance._isEach = {
						index:index,
						brotherVI:arrViewInstances
					}
					dataManager.subset(viewInstance,arrDataHandleKey+"."+index);//+"."+index //reset arrViewInstance's dataManager
					inserNew = $TRUE;
				} else {
					viewInstance.set(eachItemData);
				}
				viewInstance.set(eachConfig.$I, index)
				if (!viewInstance._canRemoveAble) { //had being recovered into the packingBag
					inserNew = $TRUE;
				}


				if (inserNew && !arrViewInstances.hidden) {
					viewInstance.insert(comment_endeach_node)
				}
			});
			$.fE(arrViewInstances, function(eachItemHandle) {
				eachItemHandle.remove();
			}, divideIndex);
		}
	}
	return trigger
});
V.rt("==", V.rt("equa", function(handle, index, parentHandle) { //Equal
	var childHandlesId = [],
		trigger;
	$.fE(handle.childNodes, function(child_handle) {
		if (child_handle.type === "handle") {
			$.p(childHandlesId, child_handle.id);
		}
	});
	trigger = {
		// key:"",//default key === ""
		bubble: $TRUE,
		event: function(NodeList_of_ViewInstance, dataManager) {
			var equal,
				val = NodeList_of_ViewInstance[childHandlesId[0]]._data; //first value
			$.fE(childHandlesId, function(child_handle_id) { //Compared to other values
				equal = (NodeList_of_ViewInstance[child_handle_id]._data == val);
				if (equal) {
					return $FALSE; //stop forEach
				}
			}, 1); //start from second;
			NodeList_of_ViewInstance[this.handleId]._data = !! equal;
		}
	}
	return trigger;
}));
V.rt("", function(handle, index, parentHandle) {
	var textHandle = handle.childNodes[0],
		textHandleId = textHandle.id,
		key = textHandle.node.data,
		trigger;

	if (parentHandle.type !== "handle") { //as textHandle
		if ($.isString(key)) { // single String
			trigger = { //const 
				key: ".", //const trigger
				bubble: $TRUE,
				event: function(NodeList_of_ViewInstance, dataManager) {
					NodeList_of_ViewInstance[textHandleId].currentNode.data = key.substring(1, key.length - 1);
				}
			};
		} else { //String for databese by key
			trigger = {
				key: key,
				event: function(NodeList_of_ViewInstance, dataManager, triggerBy, isAttr, vi) { //call by ViewInstance's Node
					var data = dataManager.get(key),
						currentNode = NodeList_of_ViewInstance[textHandleId].currentNode;
					if (isAttr) {
						//IE浏览器直接编译，故不需要转义，其他浏览器需要以字符串绑定到属性中。需要转义，否则会出现引号冲突
						if (isAttr.key.indexOf("on") === 0 && !_isIE) {
							data = String(data).replace(/"/g, '\\"').replace(/'/g, "\\'");
						}
					}
					currentNode.data = data;
				}
			}
		}
	} else { //as stringHandle
		if ($.isString(key)) { // single String
			trigger = { //const 
				key: ".", //const trigger
				bubble: $TRUE,
				event: function(NodeList_of_ViewInstance, dataManager) {
					NodeList_of_ViewInstance[this.handleId]._data = key.substring(1, key.length - 1);
				}
			};
		} else { //String for databese by key
			trigger = {
				key: key,
				bubble: $TRUE,
				event: function(NodeList_of_ViewInstance, dataManager) {
					NodeList_of_ViewInstance[this.handleId]._data = dataManager.get(key);
				}
			};
		}
	}
	return trigger;
});
V.rt("@", function(handle, index, parentHandle) {
	var textHandle = handle.childNodes[0],
		textHandleId = textHandle.id,
		key = textHandle.node.data,
		trigger;

	trigger = { //const 
		key: key, //const trigger
		bubble: $TRUE,
		event: function(NodeList_of_ViewInstance, dataManager) {
			//trigger but no bind data
			NodeList_of_ViewInstance[textHandleId].currentNode.data = key;
		}
	};
	return trigger;
});
V.rt("#if", function(handle, index, parentHandle) {
	// console.log(handle)
	var id = handle.id,
		ignoreHandleType = /handle|comment/,
		conditionHandleId = handle.childNodes[0].id,
		parentHandleId = parentHandle.id,

		comment_else_id, //#if inserBefore #else
		comment_endif_id, //#else inserBefore /if

		conditionDOM = handle._controllers,
		conditionStatus = $TRUE, //the #if block scope
		trigger,
		deep = 0;

	$.fE(parentHandle.childNodes, function(child_handle, i, childHandles) {

		if (child_handle.handleName === "#if") {
			deep += 1
		} else if (child_handle.handleName === "#else") {
			if (deep === 1) {
				conditionStatus = !conditionStatus;
				comment_else_id = $.lI(child_handle.childNodes).id;
			}
		} else if (child_handle.handleName === "/if") {
			deep -= 1
			if (!deep) {
				comment_endif_id = $.lI(child_handle.childNodes).id;
				return $FALSE;
			}
		} else if (child_handle.type !== "comment") {
			$.p(child_handle._controllers, id);
			$.p(conditionDOM[conditionStatus], child_handle.id);
		}
	}, index); // no (index + 1):scan itself:deep === 0 --> conditionStatus = !conditionStatus;

	trigger = {
		// key:"",//default is ""
		event: function(NodeList_of_ViewInstance, dataManager, triggerBy, isAttr, viewInstance_ID) {
			var conditionVal = !! NodeList_of_ViewInstance[conditionHandleId]._data,
				parentNode = NodeList_of_ViewInstance[parentHandleId].currentNode,
				markHandleId = comment_else_id, //if(true)
				markHandle; //default is undefined --> insertBefore === appendChild
			
			if (NodeList_of_ViewInstance[this.handleId]._data !== conditionVal || triggerBy) {
				NodeList_of_ViewInstance[this.handleId]._data = conditionVal;
				if (!conditionVal) {
					markHandleId = comment_endif_id;
				}
				if (markHandleId) {
					markHandle = NodeList_of_ViewInstance[markHandleId].currentNode;
				}
				$.fE(conditionDOM[conditionVal], function(id) {
					var currentHandle = NodeList_of_ViewInstance[id],
						node = currentHandle.currentNode,
						placeholderNode = (NodeList_of_ViewInstance[id].placeholderNode = NodeList_of_ViewInstance[id].placeholderNode || $.D.C(id)),
						display = $TRUE;

					$.fE(currentHandle._controllers, function(controller_id) {
						//Traverse all Logic Controller(if-else-endif) to determine whether each Controller are allowed to display it.
						var controllerHandle = NodeList_of_ViewInstance[controller_id]
						return display = display && ($.iO(controllerHandle._controllers[controllerHandle._data ? $TRUE : $FALSE], currentHandle.id) !== -1);
						//when display is false,abort traversing
					});
					if (display) {
						if (currentHandle.display) { //Custom Display Function,default is false
							currentHandle.display($TRUE, NodeList_of_ViewInstance, dataManager, triggerBy, viewInstance_ID)
						} else if (node) {
							$.D.re(parentNode, node, placeholderNode)
						}
					}
				});
				$.fE(conditionDOM[!conditionVal], function(id) {
					var currentHandle = NodeList_of_ViewInstance[id],
						node = currentHandle.currentNode,
						placeholderNode = (currentHandle.placeholderNode = currentHandle.placeholderNode || $.D.C(id));

					if (currentHandle.display) { //Custom Display Function,default is false
						currentHandle.display($FALSE, NodeList_of_ViewInstance, dataManager, triggerBy, viewInstance_ID)
					} else if (node) {
						$.D.re(parentNode, placeholderNode, node)
					}
				})
			}
		}
	}

	return trigger;
});
V.rt(">", V.rt("#layout", function(handle, index, parentHandle) {
	// console.log(handle)
	var id = handle.id,
		childNodes = handle.childNodes,
		templateHandle_id = childNodes[0].id,
		dataHandle_id = childNodes[1].id,
		comment_layout_id = parentHandle.childNodes[index + 1].id, //eachHandle --> eachComment --> endeachHandle --> endeachComment
		trigger;

	trigger = {
		event: function(NodeList_of_ViewInstance, dataManager, eventTrigger, isAttr, viewInstance_ID) {
			var data = NodeList_of_ViewInstance[dataHandle_id]._data,
				AllLayoutViewInstance = V._instances[viewInstance_ID]._ALVI,
				layoutViewInstance = AllLayoutViewInstance[id],
				inserNew;
			if (!layoutViewInstance) {
				layoutViewInstance = AllLayoutViewInstance[id] = V.modules[NodeList_of_ViewInstance[templateHandle_id]._data]().insert(NodeList_of_ViewInstance[comment_layout_id].currentNode);
				dataManager.subset(layoutViewInstance);
			}
			layoutViewInstance.set(data);
		}
	}
	return trigger;
}));
V.rt("!", V.rt("nega", function(handle, index, parentHandle) { //Negate
	var nageteHandlesId = handle.childNodes[0].id,
		trigger;
	trigger = {
		// key:"",//default key === ""
		bubble: $TRUE,
		event: function(NodeList_of_ViewInstance, dataManager) {
			NodeList_of_ViewInstance[this.handleId]._data = !NodeList_of_ViewInstance[nageteHandlesId]._data; //first value
		}
	}
	return trigger;
}));
V.rt("||",V.rt("or", function(handle, index, parentHandle) {
	var childHandlesId = [],
		trigger;
	$.fE(handle.childNodes, function(child_handle) {
		if (child_handle.type === "handle") {
			$.p(childHandlesId, child_handle.id);
		}
	});
	trigger = {
		// key:"",//default key === ""
		bubble: $TRUE,
		event: function(NodeList_of_ViewInstance, dataManager) {
			var handleId = this.handleId;
			NodeList_of_ViewInstance[handleId]._data = $FALSE;
			$.fE(childHandlesId, function(child_handle_id) { //Compared to other values
				if (NodeList_of_ViewInstance[child_handle_id]._data) {
					NodeList_of_ViewInstance[handleId]._data = $TRUE;
					return $FALSE; //stop forEach
				}
			});
		}
	}
	return trigger;
}));

V.rt("#with", function(handle, index, parentHandle) {
	// console.log(handle)
	var id = handle.id,
		dataHandle_id = handle.childNodes[0].id,
		comment_with_id = parentHandle.childNodes[index + 3].id, //eachHandle --> eachComment --> endeachHandle --> endeachComment
		trigger;

	trigger = {
		event: function(NodeList_of_ViewInstance, dataManager, eventTrigger, isAttr, viewInstance_ID) {
			var data = NodeList_of_ViewInstance[dataHandle_id]._data,
				AllLayoutViewInstance = V._instances[viewInstance_ID]._WVI,
				withViewInstance = AllLayoutViewInstance[id], // || (AllLayoutViewInstance[id] = V.withModules[id](data).insert(NodeList_of_ViewInstance[comment_with_id].currentNode)),
				inserNew;
			if (!withViewInstance) {
				withViewInstance = AllLayoutViewInstance[id] = V.withModules[id](data);
				dataManager.subset(withViewInstance,NodeList_of_ViewInstance[dataHandle_id].childNodes[0].node.data);
				withViewInstance.insert(NodeList_of_ViewInstance[comment_with_id].currentNode);
			}
			withViewInstance.set(data);
		}
	}
	return trigger;
});
var _testDIV = $.D.cl(shadowDIV),
	_getAttrOuter = Function("n", "return n." + (("textContent" in _testDIV) ? "textContent" : "innerText") + "||''"),
	_booleanFalseRegExp = /false|undefined|null|NaN/;

var _AttributeHandleEvent = {
	event: function(key, currentNode, parserNode) { //on开头的事件绑定，IE需要绑定Function类型，现代浏览器绑定String类型（_AttributeHandleEvent.com）
		var attrOuter = _getAttrOuter(parserNode);
		try {
			var attrOuterEvent = Function(attrOuter); //尝试编译String类型数据
		} catch (e) {
			attrOuterEvent = $.noop; //失败使用空函数替代
		}
		currentNode.setAttribute(key, attrOuterEvent);
	},
	style: function(key, currentNode, parserNode) {
		var attrOuter = _getAttrOuter(parserNode);
		currentNode.style.setAttribute('cssText', attrOuter);
	},
	com: function(key, currentNode, parserNode) {
		var attrOuter = _getAttrOuter(parserNode);
		if (currentNode.getAttribute(key) !== attrOuter) {
			currentNode.setAttribute(key, attrOuter)
		}
	},
	dir: function(key, currentNode, parserNode) {
		var attrOuter = _getAttrOuter(parserNode);
		if (currentNode[key] !== attrOuter) {
			currentNode[key] = attrOuter;
		}
	},
	bool: function(key, currentNode, parserNode) {
		var attrOuter = $.trim(_getAttrOuter(parserNode).replace(_booleanFalseRegExp, ""));

		if (attrOuter) { // currentNode.setAttribute(key, key);
			currentNode[key] = key;
		} else { // currentNode.removeAttribute(key);
			currentNode[key] = $FALSE;
		}
	}
};
var _boolAssignment = ["checked", "selected", "disabled", "readonly", "multiple", "defer", "declare", "noresize", "nowrap", "noshade", "compact", "truespeed", "async", "typemustmatch", "open", "novalidate", "ismap", "default", "seamless", "autoplay", "controls", "loop", "muted", "reversed", "scoped", "autofocus", "required", "formnovalidate", "editable", "draggable", "hidden"];
V.ra(function(attrKey){
	return $.iO(_boolAssignment,attrKey) !==-1;
}, function() {
	return _AttributeHandleEvent.bool;
})
var iecheck = function(key, currentNode, parserNode) {
	var attrOuter = $.trim(_getAttrOuter(parserNode).replace(_booleanFalseRegExp, ""));

	if (attrOuter) {
		_asynAttributeAssignment(currentNode, "defaultChecked", key);
		// currentNode.defaultChecked = true;
	} else {
		_asynAttributeAssignment(currentNode, "defaultChecked", $FALSE);
		// currentNode.defaultChecked = false;
	}
	(this._attributeHandle = _AttributeHandleEvent.bool)(key, currentNode, parserNode);
}
V.ra("checked", function() {
	return _isIE ? iecheck : _AttributeHandleEvent.com;
})
var _dirAssignment = RegExp(["className","value"].join("|"),"gi")
V.ra(function(attrKey){
	return _dirAssignment.test(attrKey);
}, function() {
	return _AttributeHandleEvent.dir;
})

var _elementCache = {},
	eventListerAttribute = function(key, currentNode, parserNode, vi, dm) {
		var attrOuter = _getAttrOuter(parserNode),
			eventName = key.replace("event-on", "").replace("event-", ""),
			eventFun = dm.get(attrOuter), //在重用函数的过程中会出现问题
			elementHashCode = $.hashCode(currentNode, "event"),
			eventCollection,
			oldEventFun;
		if (eventFun) {
			eventCollection = _elementCache[elementHashCode] || (_elementCache[elementHashCode] = {});
			if (oldEventFun = eventCollection[eventName]) {
				_cancelEvent(currentNode, eventName, oldEventFun, elementHashCode)
			}
			_registerEvent(currentNode, eventName, eventFun, elementHashCode, vi); //只能定位到属性操作的VI，需要重新构架！！如果完成这个，则_isEach的each元素需要全新的ViewInstance方法，包括remove等来调整次序
			eventCollection[eventName] = eventFun;
		}
	};

V.ra(function(attrKey) {
	return attrKey.indexOf("event-") === 0;
}, function(attrKey) {
	return eventListerAttribute;
})
/*
 *form-bind只做绑定form处理事件，value绑定需要另外通过attr-value={(XX)}来绑定，避免重复
 */
var _formCache = {},
	_formKey = {
		"input": function(node) {//需阻止默认事件，比如Checked需要被重写，否则数据没有变动而Checked因用户点击而变动，没有达到V->M的数据同步
			var result = "value";
			switch (node.type.toLowerCase()) {
				case "checkbox":
					return {
						attributeName:"checked",
						eventNames:["change"]
					}
				case "button":
				case "reset":
				case "submit":
			}
			return {
				attributeName: "value",
				eventNames: _isIE ? ["propertychange", "keyup"] : ["input", "keyup"]
			};
		},
		"button": "innerHTML"
	}, _noopFormHandle = function(e, newValue) {
		return newValue
	},
	formListerAttribute = function(key, currentNode, parserNode, vi, dm, handle, triggerTable) {
		var attrOuter = _getAttrOuter(parserNode),
			eventConfig = _formKey[currentNode.tagName.toLowerCase()] || {
				attributeName: "innerHTML",
				eventNames: ["click"]
			},
			eventNames,
			elementHashCode = $.hashCode(currentNode, "form"),
			formCollection,
			oldFormHandle,
			newFormHandle,
			obj = dm.get(attrOuter, $NULL);
		typeof eventConfig === "function" && (eventConfig = eventConfig(currentNode));
		eventNames = eventConfig.eventNames;

		formCollection = _formCache[elementHashCode] || (_formCache[elementHashCode] = {});
		$.ftE(eventNames, function(eventName) {
			if (oldFormHandle = formCollection[eventName]) {
				_cancelEvent(currentNode, eventName, oldFormHandle, elementHashCode)
			}
			if (obj instanceof Proto) {
				var baseFormHandle = obj.form === $NULL ? _noopFormHandle : obj.form;
				newFormHandle = function(e) {
					dm.set(attrOuter, baseFormHandle.call(this, e, this[eventConfig.attributeName], vi))
				};
				_registerEvent(currentNode, eventName, newFormHandle, elementHashCode);
			} else if (typeof obj === "string") {
				newFormHandle = function(e) {
					dm.set(attrOuter, this[eventConfig.attributeName])
				};
				_registerEvent(currentNode, eventName, newFormHandle, elementHashCode);
			}
			formCollection[eventName] = newFormHandle;
		});
	};
V.ra("bind-form", function(attrKey) {
	return formListerAttribute;
});
var _event_by_fun = (function() {
	var testEvent = Function(""),
		attrKey = "onclick";

	_testDIV.setAttribute(attrKey, testEvent);
	if (typeof _testDIV.getAttribute(attrKey) === "string") {
		return $FALSE;
	}
	return $TRUE;
}());
V.ra(function(attrKey){
	attrKey.indexOf("on") === 0;
},function () {
	return _event_by_fun&&_AttributeHandleEvent.event;
})
V.ra("style",function () {
	return _isIE&&_AttributeHandleEvent.style;
})
var relyStack = [], //用于搜集依赖的堆栈数据集
	allRelyContainer = {}, //存储处理过的依赖关系集，在set运作后链式触发 TODO：注意处理循环依赖
	chain_update_rely = function(id, updataKeys) {
		var relyContainer = allRelyContainer[id]; // || (allRelyContainer[this.id] = {});

		relyContainer && $.ftE(updataKeys, function(updataKey) { //触发依赖
			var leaderArr;
			if (leaderArr = relyContainer[updataKey]) {
				$.ftE(leaderArr, function(leaderObj) {
					var leader = leaderObj.dm,
						key = leaderObj.key;
					chain_update_rely(leader.id, leader.set(key, leader._getSource(key).get())) //递归:链式更新
				})
			}
		})
	}

	function Observer(obs) { //动态计算类
		var self = this;
		if (!(this instanceof Observer)) {
			return new Observer(obs);
		}
		DataManager.Object(self);
		if (obs instanceof Function) {
			self._get = Try(obs, self);
			self.set = $.noop; //默认更新value并触发更新
			self._form = $NULL;
		} else {
			self._get = obs.get || function() {
				return self._value
			};
			self.set = Try(obs.set, self) || $.noop;
			self._form = Try(obs.form, self) || $NULL;
		}
		self._value;
		self._valueOf = Observer._initGetData;
		self._toString = Observer._getData;
	};
Observer._initGetData = function() {
	var self = this;
	self.valueOf = self.toString = Observer._getData;
	return self._value = self.get();
};
Observer._getData = function() {
	return this._value
};
Observer.collect = function(leader_id, follower_id) {
	//allRelyContainer;
};
Observer.pickUp = function(leader, leader_key, relySet) {
	var leader_id = leader.id;
	$.ftE(relySet, function(relyNode) { //处理依赖结果
		var relyId = relyNode.id,
			relyKey = relyNode.key,
			relyContainer = allRelyContainer[relyId] || (allRelyContainer[relyId] = {});

		if (!(leader_id === relyId && leader_key === relyKey)) { //避免直接的循环依赖
			cache = relyContainer[relyKey];
			if (!cache) {
				cache = relyContainer[relyKey] = [];
				cache._ = {};
			}
			var cache_key = cache._[leader_key] || (cache._[leader_key] = "|");

			if (cache_key.indexOf("|" + leader_id + "|") === -1) {
				$.p(cache, {
					dm: leader,
					key: leader_key
				});
				cache._[leader_key] += leader_id + "|";
			}
		}
	});
};
Observer.prototype = {
	get: function() {

		var self = this,
			dm = DataManager.session.topGetter,
			key = DataManager.session.filterKey,
			result;
		$.p(relyStack, []); //开始收集

		result = self._value = self._get();

		var relySet = relyStack.pop(); //获取收集结果
		console.log(relySet); //debugger;
		relySet.length && Observer.pickUp(dm, key, relySet);

		return result;
	}/*,
	toString: Observer._initGetData,
	valueOf: Observer._initGetData*/
};

(function() {
	var _get = DM_proto.get,
		_set = DM_proto.set,
		_collect = DM_proto.collect;
	DM_proto.get = function() {
		var result = _get.apply(this, $.s(arguments));
		// console.log(result)
		if (result instanceof Observer) {
			result = result.get()
		}
		if (relyStack.length) {
			$.p($.lI(relyStack), {
				id: DataManager.session.topGetter.id,
				// dataManager: DataManager.session.topGetter,
				key: DataManager.session.filterKey
			})
		}
		return result;
	};
	DM_proto.set = function() {
		var self= this,
			result = _set.apply(this, $.s(arguments)),
			relyContainer = allRelyContainer[self.id];
		if (relyContainer) {
			// console.log(result,relyContainer)
			$.ftE(result.updateKey,function(updateKey){
				var relyObjects = relyContainer[updateKey];
				relyObjects&&$.ftE(relyObjects,function(relyObject){
					relyObject.dm.touchOff(relyObject.key)
				});
			});
		}
		return result;
	};
	DM_proto.collect = function(dataManager) {
		var result = _collect.apply(this, $.s(arguments));
		if (dataManager instanceof DataManager) {
			Observer.collect(this.id, dataManager.id);
		}
		return result;
	}
}());
var _cacheGet = Observer.get;
function StaticObserver(obs) { //静态计算类（只收集一次的依赖，适合于简单的计算属性，没有逻辑嵌套）
	var observerInstance = new Observer(obs);
	observerInstance.get = StaticObserver.staticGet;
}
StaticObserver.staticGet = function() { //转化成静态计算类
	var self = this,
		result = _cacheGet.apply(self, $.s(arguments));
	self.get = self._get; //剥离依赖收集器
	return result;
};

}(this));