!(function viewParse(global) {

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
	self._triggers = {}; //bey key word


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
		// console.log(item_node, index, handleNodeTree)
		item_node.parentNode = handleNodeTree;
		if (item_node.type === "handle") {
			var handleFactory = V.handles[item_node.handleName];
			if (handleFactory) {
				var handle = handleFactory(item_node, index, handleNodeTree)
				// handle&&$.push(handles, $.bind(handle,item_node));
				handle && $.push(handles, handle);
			}
		}
	});
};
var _attrRegExp = /(\S+)=["']?((?:.(?!["']?\s+(?:\S+)=|[>"']))+.)["']?/g;
var _isIE = !+"\v1";
var _event_by_fun = true;
//by RubyLouvre(司徒正美)
//setAttribute bug:http://www.iefans.net/ie-setattribute-bug/
var IEfix = {
	acceptcharset: "acceptCharset",
	accesskey: "accessKey",
	allowtransparency: "allowTransparency",
	bgcolor: "bgColor",
	cellpadding: "cellPadding",
	cellspacing: "cellSpacing",
	"class": "className",
	colspan: "colSpan",
	checked: "defaultChecked",
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
	vspace: "vSpace"
};
var _comment_reg = /<!--[\w\W]*?-->/g;
function _buildTrigger(handleNodeTree) {
	var self = this,
		triggers = self._triggers;
	handleNodeTree = handleNodeTree || self.handleNodeTree;
	_traversal(handleNodeTree, function(handle, index, parentHandle) {
		// handle.parentNode = parentHandle;
		if (handle.type === "handle") {
			var triggerFactory = V.triggers[handle.handleName];
			if (triggerFactory) {
				var trigger = triggerFactory(handle, index, parentHandle);
				// cos
				if (trigger) {
					var key = trigger.key = trigger.key || "";
					// console.log
					trigger.handleId = trigger.handleId || handle.id;
					//unshift list and In order to achieve the trigger can be simulated bubble
					$.unshift((triggers[key] = triggers[key] || []), trigger); //Storage as key -> array
					$.push(handle._triggers, trigger); //Storage as array
				}
			}
		} else if (handle.type === "element") {
			var node = handle.node,
				nodeHTMLStr = node.outerHTML.replace(node.innerHTML, ""),
				attrs = nodeHTMLStr.match(_attrRegExp);

			// console.log("element attrs:", attrs)
			$.forEach(attrs, function(attrStr) {
				// console.log("attr item:", attrStr)
				var attrInfo = attrStr.search("="),
					attrKey = $.trim(attrStr.substring(0, attrInfo)),
					attrValue = node.getAttribute(attrKey)
					attrKey = attrKey.toLowerCase()
					attrKey = attrKey.indexOf(V.prefix) ? attrKey : attrKey.replace(V.prefix, "")
					attrKey = (_isIE && IEfix[attrKey]) || attrKey

				if (_matchRule.test(attrValue)) {
					var attrViewInstance = (V.attrModules[handle.id + attrKey] = V.parse(attrValue))(),
						_shadowDIV = $.DOM.clone(shadowDIV);
					attrViewInstance.append(_shadowDIV);
					$.forIn(attrViewInstance._triggers, function(triggerCollection, key) {
						if (key && key !== ".") {
							$.forEach(triggerCollection, function(trigger) {
								var _newTrigger = $.create(trigger);
								_newTrigger.bubble = false; //this kind of Parent Handle can not be bubbling trigger.
								_newTrigger.event = function(NodeList, database, eventTrigger) {
									$.forIn(attrViewInstance._triggers, function(attrTriggerCollection, attrTriggerKey) {
										attrViewInstance.set(attrTriggerKey, database[attrTriggerKey]);
									});

									var currentNode = NodeList[handle.id].currentNode,
										attrOuter = _shadowDIV.innerText;
									if (attrOuter === undefined) {
										attrOuter = _shadowDIV.innerHTML.replace(_comment_reg,"");
									}
									if (attrKey === "style" && _isIE) {
										currentNode.style.setAttribute('cssText', attrOuter);
									} else if (attrKey.indexOf("on") === 0 && _event_by_fun) {
										try{
											var attrOuterEvent  = Function(attrOuter);
										}catch(e){
											attrOuterEvent = $.noop;
										}
										currentNode.setAttribute(attrKey, attrOuterEvent);
										if (typeof currentNode.getAttribute(attrKey) === "string") {
											_event_by_fun = false;
											currentNode.setAttribute(attrKey, attrOuter);
										}
									} else {
										currentNode.setAttribute(attrKey, attrOuter);
									}
								};

								$.unshift((triggers[key] = triggers[key] || []), _newTrigger); //Storage as key -> array
								$.push(handle._triggers, _newTrigger); //Storage as array
							})
						}
					});
				}
			});
		}
	});
};

function _create(data) {
	var self = this,
		NodeList_of_ViewInstance = {}, //save newDOM  without the most top of parentNode -- change with append!!
		topNode = $.create(self.handleNodeTree);
	topNode.currentNode = $.DOM.clone(shadowBody);
	$.pushByID(NodeList_of_ViewInstance, topNode);

	_traversal(topNode, function(node, index, parentNode) {
		node = $.pushByID(NodeList_of_ViewInstance, $.create(node));
		if (!node.ignore) {
			var currentParentNode = NodeList_of_ViewInstance[parentNode.id].currentNode || topNode.currentNode;
			var currentNode = node.currentNode = $.DOM.clone(node.node);
			$.DOM.append(currentParentNode, currentNode);
		} else {

			_traversal(node, function(node) { //ignore Node's childNodes will be ignored too.
				node = $.pushByID(NodeList_of_ViewInstance, $.create(node));
			});
			return false
		}
	});


	$.forEach(self._handles, function(handle) {
		handle.call(self, NodeList_of_ViewInstance);
	});

	return ViewInstance(self.handleNodeTree, NodeList_of_ViewInstance, self._triggers, data);
};
/*
 * View Instance constructor
 */

var ViewInstance = function(handleNodeTree, NodeList, triggers, database) {
	if (!(this instanceof ViewInstance)) {
		return new ViewInstance(handleNodeTree, NodeList, triggers, database);
	}
	var self = this;
	self.handleNodeTree = handleNodeTree;
	self.DOMArr = $.slice(handleNodeTree.childNodes);
	self.NodeList = NodeList;
	self._database = database || {};
	self._database.set = function() {
		self.set.apply(self, $.slice(arguments))
	};
	self._database.get = function() {
		self.get.apply(self, $.slice(arguments))
	};
	var el = NodeList[handleNodeTree.id].currentNode;
	self._packingBag = el;
	self._id = $.uid();
	self._open = $.DOM.Comment(self._id + " _open");
	self._close = $.DOM.Comment(self._id + " _close");
	self._canRemoveAble = false;
	$.DOM.insertBefore(el, self._open,el.childNodes[0]);
	$.DOM.append(el, self._close);
	self._triggers = {};
	self.TEMP = {};

	$.forIn(triggers, function(tiggerCollection, key) {
		self._triggers[key] = tiggerCollection;
	});
	$.forEach(self._triggers["."], function(tiggerFun) { //const value
		tiggerFun.event(NodeList, database);
	});
	self.reDraw()
};

function _bubbleTrigger(tiggerCollection, NodeList, database, eventTrigger) {
	var self = this;
	$.forEach(tiggerCollection, function(trigger) {
		trigger.event(NodeList, database, eventTrigger);
		if (trigger.bubble) {
			var parentNode = NodeList[trigger.handleId].parentNode;
			parentNode && _bubbleTrigger.apply(self, [parentNode._triggers, NodeList, database, trigger]);
		}
	});
};

function _replaceTopHandleCurrent(self, el) {
	var handleNodeTree = self.handleNodeTree,
		NodeList = self.NodeList;
	self._canRemoveAble = true;
	NodeList[handleNodeTree.id].currentNode = el;
	// self.reDraw();
};
ViewInstance.prototype = {
	reDraw: function() {
		var self = this,
			database = self._database;
		// console.log(database)
		$.forIn(database, function(val, key) {
			if (!/get|set/.test(key)) {
				self.set(key, val);
			}
		});
	},
	append: function(el) {
		var self = this,
			handleNodeTree = self.handleNodeTree,
			NodeList = self.NodeList,
			currentTopNode = NodeList[handleNodeTree.id].currentNode;

		$.forEach(currentTopNode.childNodes, function(child_node) {
			$.DOM.append(el, child_node);
		});
		_replaceTopHandleCurrent(self, el)
	},
	insert: function(el) {
		var self = this,
			handleNodeTree = self.handleNodeTree,
			NodeList = self.NodeList,
			currentTopNode = NodeList[handleNodeTree.id].currentNode,
			elParentNode = el.parentNode;
		console.log(el,elParentNode)
		$.forEach(currentTopNode.childNodes, function(child_node) {
			$.DOM.insertBefore(elParentNode, child_node, el);
		});
		_replaceTopHandleCurrent(self, elParentNode)
	},
	remove: function() {
		// console.log(this._packingBag)
		var self = this,
			el = this._packingBag
		if (self._canRemoveAble) {
			var handleNodeTree = self.handleNodeTree,
				NodeList = self.NodeList,
				currentTopNode = NodeList[handleNodeTree.id].currentNode,
				openNode = self._open,
				closeNode = self._close,
				startIndex = 0;
			console.log(currentTopNode)
			$.forEach(currentTopNode.childNodes, function(child_node,index) {
				if (child_node === openNode) {
					startIndex = index
					console.log(startIndex)
				}
			});
			$.forEach(currentTopNode.childNodes, function(child_node,index) {
				// console.log(index,child_node,el)
				$.DOM.append(el, child_node);
				if (child_node === closeNode) {
					return false;
				}
			},startIndex);
			_replaceTopHandleCurrent(self, el);
			this._canRemoveAble = false; //Has being recovered into the _packingBag,can't no be remove again. --> it should be insert
		}
	},
	get: function get(key) {
		var self = this,
			database = self._database
		return database[key]
	},
	set: function set(key, value) {
		var self = this,
			database = self._database,
			NodeList = self.NodeList,
			oldValue = database[key];
		if (oldValue != value) {
			self._database[key] = value;
		}

		_bubbleTrigger.apply(self, [self._triggers[key], NodeList, database])
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
					$.push(result, TextHandle(child_node))
				}
				break;
			case 1:
				if (child_node.tagName.toLowerCase() === "span" && child_node.getAttribute("type") === "handle") {
					var handleName = child_node.getAttribute("handle");
					if (handleName !== null) {
						$.push(result, TemplateHandle(handleName, child_node))
					}
				} else {
					$.push(result, ElementHandle(child_node))
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
	$.forIn(opction, function(val,key) {
		self[key] = val;
	});
};
Handle.init = function(self,weights){
	self.id = $.uid();//weights <= 1
	if (weights<2)return;
	self._controllers = [];//weights <= 2
	self._controllers[true] = [];//In the #if block scope
	self._controllers[false] = [];//In the #else block scope
	if (weights<3)return;
	self._triggers = [];//weights <= 3
};
Handle.prototype = {
	nodeType:0,
	ignore: false, //ignore Handle --> no currentNode
	display: false, //function of show or hidden DOM
	childNodes:[],
	parentNode: null,
	type: "handle"
};

/*
 * TemplateHandle constructor
 */

function TemplateHandle(handleName, node) {
	var self = this;
	if (!(self instanceof TemplateHandle)) {
		return new TemplateHandle(handleName, node);
	}
	self.handleName = $.trim(handleName);
	self.childNodes = _parse(node);
	Handle.init(self,3);
};
TemplateHandle.prototype = Handle("handle", {
	ignore: true,
	nodeType: 1
});

/*
 * ElementHandle constructor
 */

function ElementHandle(node) {
	var self = this;
	if (!(self instanceof ElementHandle)) {
		return new ElementHandle(node);
	}
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
	if (!(self instanceof TextHandle)) {
		return new TextHandle(node);
	}
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
	if (!(self instanceof CommentHandle)) {
		return new CommentHandle(node);
	}
	self.node = node;
	Handle.init(self,1);
};
CommentHandle.prototype = Handle("comment", {
	nodeType: 8
})
/*
 * parse rule
 */
var _placeholder = function() {
	return "@" + Math.random().toString(36).substring(2)
}
var placeholder = {
	"<": "&lt;",
	">": "&gt;",
	"{": _placeholder(),
	"(": _placeholder(),
	")": _placeholder(),
	"}": _placeholder()
}
var _Rg = function(s) {
	return RegExp(s, "g")
}
var placeholderReg = {
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
}
var _head = /\{([\w\W]*?)\(/g,
	_footer = /\)[\s]*\}/g;

function parseRule(str) {
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
};
var _matchRule = /\{[\w\w]*?\([\w\W]*?\)[\s]*\}/;
/*
 * expores function
 */

var V = global.ViewParser = {
	prefix: "attr-",
	parse: function(htmlStr) {
		var _shadowBody = $.DOM.clone(shadowBody);
		_shadowBody.innerHTML = htmlStr;
		var insertBefore = [];
		_traversal(_shadowBody, function(node, index, parentNode) {
			if (node.nodeType === 3) {
				$.push(insertBefore, {
					baseNode: node,
					parentNode: parentNode,
					insertNodesHTML: parseRule(node.data)
				});
			}
		});

		$.forEach(insertBefore, function(item) {
			var node = item.baseNode,
				parentNode = item.parentNode
				insertNodesHTML = item.insertNodesHTML;
			shadowDIV.innerHTML = insertNodesHTML;
			//Using innerHTML rendering is complete immediate operation DOM, 
			//innerHTML otherwise covered again, the node if it is not, 
			//then memory leaks, IE can not get to the full node.
			$.forEach(shadowDIV.childNodes, function(refNode) {
				$.DOM.insertBefore(parentNode, refNode, node)
			})
			parentNode.removeChild(node);
		});
		_shadowBody.innerHTML = _shadowBody.innerHTML;
		var result = ElementHandle(_shadowBody);
		return View(result);
	},
	scans: function() {
		$.forEach(document.getElementsByTagName("script"), function(scriptNode) {
			if (scriptNode.getAttribute("type") === "text/template") {
				V.modules[scriptNode.getAttribute("name")] = V.parse(scriptNode.innerHTML);
			}
		});
	},
	registerTrigger: function(handleName, triggerFactory) {
		// if (V.triggers[handleName]) {
		// 	throw handleName + " trigger already exists.";
		// }
		V.triggers[handleName] = triggerFactory;
	},
	registerHandle: function(handleName, handle) {
		// if (V.handles[handleName]) {
		// 	throw handleName + " handler already exists.";
		// }
		V.handles[handleName] = handle
	},
	triggers: {},
	handles: {},
	modules: {},
	attrModules: {},
	eachModules: {}
};
V.registerHandle("", function(handle, index, parentHandle) {
	var textHandle = handle.childNodes[0];
	if (parentHandle.type !== "handle") {//is textNode
		var i = 0;
		do {
			i += 1;
			var nextHandle = parentHandle.childNodes[index + i];
		} while (nextHandle && nextHandle.ignore);
		if (textHandle) { //textNode as Placeholder

			$.insertAfter(parentHandle.childNodes, handle, textHandle);
			//Node position calibration
			//no "$.insert" Avoid sequence error

			return function(NodeList_of_ViewInstance) {
				var nextNodeInstance = nextHandle && NodeList_of_ViewInstance[nextHandle.id].currentNode,
					textNodeInstance = NodeList_of_ViewInstance[textHandle.id].currentNode,
					parentNodeInstance = NodeList_of_ViewInstance[parentHandle.id].currentNode
					$.DOM.insertBefore(parentNodeInstance, textNodeInstance, nextNodeInstance); //Manually insert node
			}
		}
	} else {
		if (textHandle) {
			textHandle.ignore = true;
		}
	}
});
var _commentPlaceholder = function(handle, parentHandle) {
	var handleName = handle.handleName,
		commentNode = $.DOM.Comment(handleName + handle.id),
		commentHandle = CommentHandle(commentNode); // commentHandle as Placeholder

	$.push(handle.childNodes, commentHandle);
	$.insertAfter(parentHandle.childNodes, handle, commentHandle); //Node position calibration//no "$.insert" Avoid sequence error
	return commentHandle;
};
var placeholderHandle = function(handle, index, parentHandle) {
	var commentHandle = _commentPlaceholder(handle, parentHandle);
};
V.registerHandle("#if", placeholderHandle);
V.registerHandle("#else", placeholderHandle);
V.registerHandle("/if", placeholderHandle);
var _each_display = function(show_or_hidden, NodeList_of_ViewInstance) {
	var handle = this,
		parentHandle = handle.parentNode,
		comment_endeach_id,
		arrViewInstances = handle.arrViewInstances;
	$.forEach(parentHandle.childNodes, function(child_handle, index, cs) { //get comment_endeach_id
		if (child_handle.id === handle.id) {
			comment_endeach_id = cs[index + 3].id;
			return false;
		}
	});
	if (show_or_hidden) {
		$.forEach(arrViewInstances, function(viewInstance, index) {
			// console.log(comment_endeach_id,NodeList_of_ViewInstance[comment_endeach_id],handle,parentHandle)
			viewInstance.insert(NodeList_of_ViewInstance[comment_endeach_id].currentNode)
			// console.log(handle.len)
			if (handle.len === index + 1) {
				return false;
			}
		})
	} else {
		$.forEach(arrViewInstances, function(viewInstance) {
			// console.log(viewInstance)
			viewInstance.remove();
		})
	}
};
V.registerHandle("#each", function(handle, index, parentHandle) {
	//The Nodes between #each and /each will be pulled out , and not to be rendered.
	//which will be combined into new View module.
	var _shadowBody = $.DOM.clone(shadowBody),
		eachModuleHandle = ElementHandle(_shadowBody),
		endIndex = 0;

	handle.arrViewInstances = [];
	handle.len = 0;

	$.forEach(parentHandle.childNodes, function(childHandle, index) {
		endIndex = index;
		if (childHandle.handleName === "/each") {
			return false
		}
		$.push(eachModuleHandle.childNodes, childHandle);
	}, index + 1);

	parentHandle.childNodes.splice(index + 1, endIndex - index - 1); //Pulled out
	V.eachModules[handle.id] = View(eachModuleHandle); //Compiled into new View module

	handle.display = _each_display; //Custom rendering function
	_commentPlaceholder(handle, parentHandle);
});
V.registerHandle("/each", placeholderHandle);
V.registerTrigger("#if", function(handle, index, parentHandle) {
	// console.log(handle)
	var id = handle.id,
		ignoreHandleType = /handle|comment/,
		conditionHandleId = handle.childNodes[0].id,
		parentHandleId = parentHandle.id,

		comment_else_id, //#if inserBefore #else
		comment_endif_id, //#else inserBefore /if

		conditionDOM = handle._controllers,
		conditionStatus = true, //the #if block scope
		trigger,
		deep = 0;
	// console.log(parentHandle, index)
	$.forEach(parentHandle.childNodes, function(child_handle, i, childHandles) {

		if (child_handle.handleName === "#if") {
			deep += 1
		} else if (child_handle.handleName === "#else") {
			if (deep === 1) {
				conditionStatus = !conditionStatus;
				comment_else_id = $.lastItem(child_handle.childNodes).id;
			}
		} else if (child_handle.handleName === "/if") {
			deep -= 1
			if (!deep) {
				comment_endif_id = $.lastItem(child_handle.childNodes).id;
				return false;
			}
		} else if (child_handle.type !== "comment") {
			$.push(child_handle._controllers, id);
			$.push(conditionDOM[conditionStatus], child_handle.id);
		}
	}, index); // no (index + 1):scan itself:deep === 0 --> conditionStatus = !conditionStatus;

	trigger = {
		// key:"",//default is ""
		// chain: true,
		event: function(NodeList_of_ViewInstance, database, triggerBy) {
			var conditionVal = !!NodeList_of_ViewInstance[conditionHandleId]._data,
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
				$.forEach(conditionDOM[conditionVal], function(id) {
					var currentHandle = NodeList_of_ViewInstance[id],
						node = currentHandle.currentNode,
						placeholderNode = (NodeList_of_ViewInstance[id].placeholderNode = NodeList_of_ViewInstance[id].placeholderNode || $.DOM.Comment(id)),
						display = true;

					$.forEach(currentHandle._controllers, function(controller_id) {
						//Traverse all Logic Controller(if-else-endif) to determine whether each Controller are allowed to display it.
						var controllerHandle = NodeList_of_ViewInstance[controller_id]
						return display = display && ($.indexOf(controllerHandle._controllers[controllerHandle._data ? true : false], currentHandle.id) !== -1);
						//when display is false,abort traversing
					});
					if (display) {
						if (currentHandle.display) { //Custom Display Function,default is false
							currentHandle.display(true, NodeList_of_ViewInstance, database, triggerBy)
						} else if (node) {
							$.DOM.replace(parentNode, node, placeholderNode)
						}
					}
				});
				$.forEach(conditionDOM[!conditionVal], function(id) {
					var currentHandle = NodeList_of_ViewInstance[id],
						node = currentHandle.currentNode,
						placeholderNode = (currentHandle.placeholderNode = currentHandle.placeholderNode || $.DOM.Comment(id));

					if (currentHandle.display) { //Custom Display Function,default is false
						currentHandle.display(false, NodeList_of_ViewInstance, database, triggerBy)
					} else if (node) {
						$.DOM.replace(parentNode, placeholderNode, node)
					}
				})
			}
		}
	}

	return trigger;
});
V.registerTrigger("#each", function(handle, index, parentHandle) {
	var id = handle.id,
		arrDataHandleKey = handle.childNodes[0].childNodes[0].node.data,
		comment_endeach_id = parentHandle.childNodes[index + 3].id, //eachHandle --> eachComment --> endeachHandle --> endeachComment
		arrViewInstances = handle.arrViewInstances,
		trigger;

	trigger = {
		event: function(NodeList_of_ViewInstance, database) {
			var data = database[arrDataHandleKey];
			var divideIndex = 0;
			var inserNew;
			$.forEach(data, function(eachItemData, index) {
				// console.log(arrViewInstances[index])
				if (!arrViewInstances[index]) {
					arrViewInstances[index] = V.eachModules[id]();
					inserNew = true;
				}
				var viewInstance = arrViewInstances[index];
				if (!viewInstance._canRemoveAble) { //had being recovered into the packingBag
					inserNew = true;
				}
				$.forIn(eachItemData, function(dataVal, dataKey) {
					if (viewInstance.get(dataKey)!==dataVal) {
						viewInstance.set(dataKey, dataVal);
					}
				});
				if (inserNew) {
					viewInstance.insert(NodeList_of_ViewInstance[comment_endeach_id].currentNode)
					// console.log(NodeList_of_ViewInstance[id]._controllers)
				}
				divideIndex = index;
			});
			// console.log(divideIndex)
			divideIndex += 1;
			$.forEach(arrViewInstances, function(eachItemHandle) {
				// calibrate the top of handle's currentNode
				eachItemHandle.NodeList[eachItemHandle.handleNodeTree.id].currentNode = NodeList_of_ViewInstance[parentHandle.id].currentNode;
				eachItemHandle.remove();
			}, divideIndex);
			var lengthKey = arrDataHandleKey + ".length";
			// console.log(lengthKey);
			if (database.get(lengthKey) !== divideIndex) {
				database.set(lengthKey, divideIndex)
				handle.len = divideIndex
			}
		}
	}
	return trigger
});
V.registerTrigger("", function(handle, index, parentHandle) {
	var textHandle = handle.childNodes[0],
		textHandleId = textHandle.id,
		key = textHandle.node.data,
		trigger;
	if (parentHandle.type !== "handle") { //as textHandle
		trigger = {
			key: key,
			event: function(NodeList_of_ViewInstance, database) { //call by ViewInstance's Node
				NodeList_of_ViewInstance[textHandleId].currentNode.data = database[key];
			}
		}
	} else { //as stringHandle
		if ($.isString(key)) { // single String
			trigger = { //const 
				key: ".", //const trigger
				bubble: true,
				event: function(NodeList_of_ViewInstance, database) {
					NodeList_of_ViewInstance[this.handleId]._data = key.substring(1, key.length - 1);
				}
			};
		} else { //String for databese by key
			trigger = {
				key: key,
				bubble: true,
				event: function(NodeList_of_ViewInstance, database) {
					NodeList_of_ViewInstance[this.handleId]._data = database[key];
				}
			};
		}
	}
	return trigger;
});
var _equal = function(handle, index, parentHandle) { //Equal
	var childHandlesId = [],
		trigger;
	$.forEach(handle.childNodes, function(child_handle) {
		if (child_handle.type === "handle") {
			$.push(childHandlesId, child_handle.id);
		}
	});
	trigger = {
		// key:"",//default key === ""
		bubble: true,
		event: function(NodeList_of_ViewInstance, database) {
			var equal,
				val = NodeList_of_ViewInstance[childHandlesId[0]]._data; //first value
			$.forEach(childHandlesId, function(child_handle_id) { //Compared to other values
				equal = (NodeList_of_ViewInstance[child_handle_id]._data == val);
				if (equal) {
					return false; //stop forEach
				}
			}, 1); //start from second;
			NodeList_of_ViewInstance[this.handleId]._data = !!equal;
		}
	}
	return trigger;
};
V.registerTrigger("equa", _equal);
V.registerTrigger("==", _equal);
var _nagete = function(handle, index, parentHandle) { //Negate
	var nageteHandlesId = handle.childNodes[0].id,
		trigger;
	trigger = {
		// key:"",//default key === ""
		bubble: true,
		event: function(NodeList_of_ViewInstance, database) {
			NodeList_of_ViewInstance[this.handleId]._data = !NodeList_of_ViewInstance[nageteHandlesId]._data; //first value
		}
	}
	return trigger;
};
V.registerTrigger("nega", _nagete);
V.registerTrigger("!", _nagete);

// Avoid `console` errors in browsers that lack a console.
(function() {
    var method;
    var noop = function () {};
    var methods = [
        'assert', 'clear', 'count', 'debug', 'dir', 'dirxml', 'error',
        'exception', 'group', 'groupCollapsed', 'groupEnd', 'info', 'log',
        'markTimeline', 'profile', 'profileEnd', 'table', 'time', 'timeEnd',
        'timeStamp', 'trace', 'warn'
    ];
    var length = methods.length;
    var console = (window.console = window.console || {});

    while (length--) {
        method = methods[length];

        // Only stub undefined methods.
        if (!console[method]) {
            console[method] = noop;
        }
    }
}());

// Place any jQuery/helper plugins in here.

}(this));