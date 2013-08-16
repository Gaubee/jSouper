var global = this;
var shadowBody = document.createElement("body");
var shadowDIV = document.createElement("div");

var $ = {
	id: 100,
	uidAvator: Math.random().toString(36).substring(2),
	noop:function(){},
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
	push: function(arr, item) {
		arr[arr.length] = item;
		return item;
	},
	unshift: function(arr, item) {
		arr.splice(0, 0, item);
	},
	slice: function(likeArr) {
		var array;
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
	pushByID: function(arr, item) {
		arr[item.id] = item;
		return item;
	},
	lastItem: function(arr) {
		return arr[arr.length - 1];
	},
	insert: function(arr, index, item) {
		arr.splice(index, 0, item);
	},
	insertAfter: function(arr, afterItem, item) {
		for (var i = 0; i < arr.length; i += 1) {
			if (arr[i] === afterItem) {
				arr.splice(i + 1, 0, item);
				break;
			}
		}
		return i;
	},
	indexOf: function(arr, item) {
		for (var i = 0; i < arr.length; i += 1) {
			if (arr[i] === item) {
				return i;
			}
		}
		return -1;
	},
	bind: function(fun, oThis) {
		if (typeof fun !== "function") {
			throw new TypeError("Function.prototype.bind - what is trying to be bound is not callable");
		}

		var aArgs = Array.prototype.slice.call(arguments, 2),
			fToBind = fun,
			fn = {},
			fNOP = fun.constructor.name,
			fBound = fun.name;
		fn[fNOP] = function() {};
		fn[fBound] = function() {
			return fToBind.apply(this instanceof fn[fNOP] && oThis ? this : oThis,
				aArgs.concat(Array.prototype.slice.call(arguments)));
		};
		fn[fBound].toString = function toString() {
			return fun.toString()
		};
		fn[fNOP].prototype = fun.prototype;
		fn[fBound].prototype = new fn[fNOP]();

		return fn[fBound];
	},
	forIn: function(obj, callback) {
		for (var i in obj) {
			callback(obj[i], i, obj);
		}
	},
	reverseEach: function(arr, callback, i) {
		if (!arr) return;
		return this._each($.slice(arr).reverse(), callback, arr.length - 1 - i)
	},
	forEach: function(arr, callback, i) {
		if (!arr) return;
		return this._each($.slice(arr), callback, i)
	},
	_each: function(arr, callback, i) {
		for (i = i || 0; i < arr.length; i += 1) {
			if (callback(arr[i], i, arr) === false) break;
		}
	},
	create: function(proto) {
		_Object_create_noop.prototype = proto;
		return new _Object_create_noop;
	},
	DOM: {
		Comment: function(info) {
			return document.createComment(info)
		},
		insertBefore: function(parentNode, insertNode, beforNode) {
			// try{
			parentNode.insertBefore(insertNode, beforNode || null);
			// }catch(e){}
		},
		append: function(parentNode, node) {
			parentNode.appendChild(node);
		},
		clone: function(node, deep) {
			return node.cloneNode(deep);
		},
		removeChild: function(node, parentNode) {
			parentNode = parentNode || node.parentNode;
			if (parentNode) {
				parentNode.removeChild(node)
			}
		},
		replace: function(parentNode, new_node, old_node) {
			try {
				parentNode.replaceChild(new_node, old_node);
			} catch (e) {}
		},
		traversal: _traversal
	}
};
var _Object_create_noop = function proto() {};

var _traversal = function(node, callback) {
	for (var i = 0, child_node, childNodes = node.childNodes; child_node = childNodes[i]; i += 1) {
		var result = callback(child_node, i, node);
		if (child_node.nodeType === 1 && result !== false) {
			_traversal(child_node, callback);
		}
	}
};