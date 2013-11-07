'use strict';
var global = global || this /*strict model use "global" else than "this"*/ ;

var doc = document,
	_isIE = !global.dispatchEvent, //!+"\v1",
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
	_box,
	_fixEvent = function(event) { //@Rybylouvre
		var target = event.target = event.srcElement;
		event.which = a.charCode != $NULL ? event.charCode : event.keyCode;
		if (/mouse|click/.test(event.type)) {
			if (_box) {
				_box = target.ownerDocument || doc;
				_box = "BackCompat" === _box.compatMode ? _box.body : _box.documentElement;
			}
			event.pageX = event.clientX + ~~_box.scrollLeft - ~~_box.clientLeft;
			event.pageY = event.clientY + ~~_box.scrollTop - ~~_box.clientTop;
		}
		event.preventDefault = function() { //for ie
			event.returnValue = $FALSE
		};
		event.stopPropagation = function() { //for ie
			event.cancelBubble = $TRUE
		};
		// return event
	},
	_fixMouseEvent = function(event) {
		_fixEvent(event);
		if (_box) {
			_box = target.ownerDocument || doc;
			_box = "BackCompat" === _box.compatMode ? _box.body : _box.documentElement;
		}
		event.pageX = event.clientX + ~~_box.scrollLeft - ~~_box.clientLeft;
		event.pageY = event.clientY + ~~_box.scrollTop - ~~_box.clientTop;
	},
	_registerEventBase = function(Element, eventName, eventFun, elementHash) {
		var result = eventFun;
		if (_isIE) {
			/*if (/mouse|click/.test(eventName)) {
				result = function(e) { //in DOM2,e always exits
					var result = eventFun.call(Element, e.target || _fixMouseEvent(e));
					(result === $FALSE) && (e.preventDefault() || e.stopPropagation());
					return result;
				}
			} else {
				result = function(e) { //in DOM2,e always exits
					var result = eventFun.call(Element, e.target || _fixEvent(e));
					(result === $FALSE) && (e.preventDefault() || e.stopPropagation());
					return result;
				}
			}*/
			result = (Function('n,f,_' /*element_node,eventFun,_fix[Mouse]Event*/ , 'return function(e){var r=f.call(n,e.target||_(e));(f===false)&&(e.preventDefault()||e.stopPropagation());return f;}')(Element, eventFun, (/mouse|click/.test(eventName)) ? _fixMouseEvent : _fixEvent))
		}
		_event_cache[elementHash + $.hashCode(eventFun)] = result;
		return result;
	},
	_addEventListener = function(Element, eventName, eventFun, elementHash) {
		Element.addEventListener(eventName, _registerEventBase(Element, eventName, eventFun, elementHash), $FALSE);
	},
	_removeEventListener = function(Element, eventName, eventFun, elementHash) {
		var wrapEventFun = _event_cache[elementHash + $.hashCode(eventFun)];
		wrapEventFun && Element.removeEventListener(eventName, wrapEventFun, $FALSE);
	},
	_attachEvent = function(Element, eventName, eventFun, elementHash) {
		Element.attachEvent("on" + eventName, _registerEventBase(Element, eventFun, elementHash));
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
				codeID = obj[uidAvator] = uidAvator+$.uid();
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
		sp: Array.prototype.splice,
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
		ftE: function(arr, callback, index) { //fastEach
			for (var i = index || 0, len = arr.length; i < len; i += 1) {
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
		rm: function(arr, item) {
			var index = $.iO(arr, item);
			arr.splice(index, 1);
			return arr;
		},
		// b: function(fun,scope){//Function.prototype.bind
		// 	return function() {
		// 		return fun.apply(scope, _s.call(arguments));
		// 	}
		// },
		c: function(proto) { //quitter than Object.create , use same memory
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
			cl: function(node, deep) { //clone,do not need detached clone
				return node.cloneNode(deep);
			},
			rC: function(parentNode, node) { //removeChild
				parentNode.removeChild(node)
			},
			re: function(parentNode, new_node, old_node) { //replace
				try {
					parentNode.replaceChild(new_node, old_node);
				} catch (e) {}
			},
			rm: _isIE ? function() {
				//@大城小胖 http://fins.iteye.com/blog/172263
				var d = doc.createElement("div");
				return function(n) {
					if (n && n.tagName != 'BODY') {
						d.appendChild(n);
						d.innerHTML = '';
					}
				}
			}() : function(n) {
				if (n && n.parentNode && n.tagName != 'BODY') {
					delete n.parentNode.removeChild(n);
				}
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
	has: function(key) {
		return key in this.store;
	}
};

function Try(tryFun, scope, errorCallback) {
	errorCallback = errorCallback || function(e) {
		if (console) {
			console.error(e)
		} else {
			throw e
		};
	};
	return function() {
		var result;
		try {
			result = tryFun.apply(scope, arguments /*$.s(arguments)*/ );
		} catch (e) {
			errorCallback(e);
		}
		return result;
	}
};