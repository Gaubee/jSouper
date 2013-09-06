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
'use strict';
var global = global || this;
var shadowBody = document.createElement("body"),
	shadowDIV = document.createElement("div"),
	$TRUE = true,
	$FALSE = false,
	$NULL = null,
	$UNDEFINED = undefined,
	$ = {
		id: 9,
		uidAvator: Math.random().toString(36).substring(2),
		noop: function noop() {},
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
		p: function(arr, item) {//push
			var len = arr.length
			arr[len] = item;
			return len;
		},
		us: function(arr, item) {//unshift
			arr.splice(0, 0, item);
		},
		un: function(array) {//unique
			var a = array;
			for (var i = 0; i < a.length; ++i) {
				for (var j = i + 1; j < a.length; ++j) {
					if (a[i] === a[j])
						a.splice(j--, 1);
				}
			}
			return a;
		},
		s: function(likeArr) {//slice
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
		D: {//DOM
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
/*
 * DataManager constructor
 */
// var _hasOwn = Object.prototype.hasOwnProperty;

function DataManager(baseData, viewInstance) {
	var self = this;
	if (!(self instanceof DataManager)) {
		return new DataManager(baseData, viewInstance);
	}
	baseData = baseData || {};
	self.id = $.uid();
	self._database = baseData;
	self._cacheData = {};
	self._viewInstances = []; //to touch off
	self._parentDataManager = $NULL; //to get data
	self._subsetDataManagers = []; //to touch off
	self._triggerKeys = [];
	viewInstance && self.collect(viewInstance);
	DataManager._instances[self.id] = self;
};

global.DataManager = DataManager;
DataManager._instances = {};
DataManager.config = {
	"$T": "$THIS",
	"$P": "$PARENT"
}
DataManager.prototype = {
	getNC: function(key) {
		var arrKey = key.split("."),
			result = this._database;
		if (key !== "") { //"" return _database
			// if (result instanceof Object) {=
			// if (!(result == undefined || (isNaN(result) && (typeof result === "number")))) { //null|undefined|NaN
			if (result != $UNDEFINED&&result!==$FALSE) { //null|undefined|false
				do {
					// console.log(arrKey[0])
					result = result[arrKey.splice(0, 1)];
				} while (result !== $UNDEFINED && arrKey.length);
			}
			// } else {
			// 	result =
			// }
		}
		return result;
	},
	get: function(key, refresh) {
		var self = this,
			$T = DataManager.config.$T,
			$P = DataManager.config.$P,
			baseData = self._database,
			cacheData = self._cacheData,
			result = baseData,
			formateKey = (key || "");
		if (key !== $UNDEFINED) {
			if (!key.indexOf($T)) {
				var $TLen = $T.length;
				if (key.charAt($TLen) === ".") {
					formateKey = key.substring($TLen + 1);
				} else {
					formateKey = key.substring($TLen);
				}
			} else if (!key.indexOf($P)) {
				var $PLen = $P.length;
				if (key.charAt($PLen) === ".") {
					formateKey = key.substring($PLen + 1);
				} else {
					formateKey = key.substring($PLen);
				}
				return self._parentDataManager && self._parentDataManager.get(formateKey);
			}
			//console.log("get:", formateKey);
			if (refresh === $FALSE) {
				result = cacheData[formateKey];
			} else if (refresh === $TRUE || (result = cacheData[formateKey]) === $UNDEFINED) {
				//console.log("refresh:", formateKey);
				if ((result = cacheData[formateKey] = self.getNC(formateKey)) === $UNDEFINED && self._parentDataManager) {
					return self._parentDataManager.get(formateKey);
				};
			}
		}
		return result;
	},
	set: function(key, obj) {
		var self = this,
			baseData = self._database || {},
			result = baseData,
			cacheObj = result,
			arrKey,
			itemKey,
			lastItemKey,
			cacheItemKey,
			updateKeys = ["$THIS"];
		switch (arguments.length) {
			case 0:
				return;
			case 1:
				self._database = key;
				key = "";
				break;
			case 2:
				arrKey = key.split(".");
				lastItemKey = arrKey.splice(arrKey.length - 1, 1)[0];
				while ((cacheItemKey = arrKey.splice(0, 1)).length) {
					itemKey = cacheItemKey[0];
					// //console.log("itemKey:", itemKey, ":", result[itemKey])
					if (!((result = result[itemKey]) instanceof Object)) {
						result = cacheObj[itemKey] = {};
					};
					cacheObj = result
				};
				// //console.log(cacheObj)
				result = cacheObj[lastItemKey] = obj;
				self._database = baseData;
				break;
		}
		$.ftE(self._triggerKeys, function(triggerKey) {
			//console.warn("indexOf:",key.indexOf(triggerKey)===0||triggerKey.indexOf(key)===0)
			// console.log(triggerKey.indexOf(key) === 0)
			if (key.indexOf(triggerKey) === 0 || triggerKey.indexOf(key) === 0) {
				var oldVal = self.get(triggerKey, $FALSE),
					newVal = self.get(triggerKey, $TRUE);
				//console.log("old triggerKey:", oldVal)
				//console.log("new triggerKey:", newVal)
				if (oldVal !== newVal || oldVal instanceof Object) {
					$.p(updateKeys, triggerKey);
				}
			}
		});
		$.ftE($.un(updateKeys), function(triggerKey) {
			self._touchOffSubset(triggerKey)
		});
		// //console.log("updateKeys:",updateKeys)
		return updateKeys;
	},
	_touchOffSubset: function(key) {
		$.fE(this._subsetDataManagers, function(dm) {
			dm._touchOffSubset(key);
		});
		var i, vis, vi, len;
		for (i = 0, vis = this._viewInstances, vi, len = vis.length; vi = vis[i];) {
			if (vi._isAttr) {
				// //console.log("building attribute value!")//DEBUG
				$.fE(vi._triggers, function(key) {
					vi.touchOff(key);
				});
				vi._isAttr.setAttribute(vi, vi.dataManager);
				vi.dataManager.remove(vi);
			} else {
				vi.touchOff(key);
				i += 1;
			}
		}
	},
	_collectTriKey: function(vi) {
		var dm = this,
			triggerKeys = dm._triggerKeys;
		triggerKeys.push.apply(triggerKeys, vi._triggers);
		$.un(triggerKeys);
	},
	collect: function(viewInstance) {
		var dm = this;
		if ($.iO(dm._viewInstances, viewInstance) === -1) {
			viewInstance.dataManager && viewInstance.dataManager.remove(viewInstance);
			$.p(dm._viewInstances, viewInstance);
			viewInstance.dataManager = dm;
			dm._collectTriKey(viewInstance);
		}
		return dm;
	},
	subset: function(viewInstance,baseData) {
		var dm = this,
			subsetDataManager = viewInstance.dataManager;//DataManager(baseData, viewInstance);
		subsetDataManager._parentDataManager = dm;
		if (viewInstance instanceof ViewInstance) {
			viewInstance.dataManager = subsetDataManager;
			viewInstance.reDraw();
			dm._collectTriKey(viewInstance);
		}
		if (arguments.length>1) {
			subsetDataManager.set(baseData);
		}
		$.p(this._subsetDataManagers, subsetDataManager);
		return subsetDataManager; //subset(vi).set(basedata);},
	},
	remove: function(viewInstance) {
		var dm = this,
			vis = dm._viewInstances,
			index = $.iO(vis, viewInstance);
		if (index !== -1) {
			vis.splice(index, 1);
		}
	}
};
var _isIE = !+"\v1";
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
	vspace: "vSpace"
};
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

var _AttributeHandle = function(attrKey) {
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
};
// var setAttribute = function() { /*viewInstance ,dataManager*/
// 	var self = this,
// 		attrKey = self.key,
// 		currentNode = self.currentNode,
// 		parserNode = self.parserNode;
// 	if (currentNode) {
// 		// console.log(attrKey,":",parserNode.innerText);//DEBUG
// 		self._attributeHandle(attrKey, currentNode, parserNode);
// 	}
// };

var attributeHandle = function(attrStr, node, handle, triggerTable) {
	var attrKey = $.trim(attrStr.substring(0, attrStr.search("="))),
		attrValue = node.getAttribute(attrKey);
	attrKey = attrKey.toLowerCase()
	attrKey = attrKey.indexOf(V.prefix) ? attrKey : attrKey.replace(V.prefix, "")
	attrKey = (_isIE && IEfix[attrKey]) || attrKey
	if (_matchRule.test(attrValue)) {

		var attrViewInstance = (V.attrModules[handle.id + attrKey] = V.parse(attrValue))(),
			_shadowDIV = $.D.cl(shadowDIV); //parserNode
		attrViewInstance.append(_shadowDIV);
		attrViewInstance._isAttr = {
			key: attrKey,
			// parserNode: _shadowDIV,
			/*
			When the trigger of be injecte in the View instance being fired (triggered by the ViewInstance instance), 
			it will storage the property value where the currentNode,// and the dataManager, 
			and lock it into attrViewInstance, 
			waiting for updates the attribute.*/ //(so the trigger of be injecte in mush be unshift)
			currentNode: $NULL,
			_attributeHandle: _AttributeHandle(attrKey),
			setAttribute: function(viewInstance, dataManager) { /*viewInstance ,dataManager*/
				var self = this,
					currentNode = self.currentNode;
				if (currentNode) {
					// console.log(attrKey,":",parserNode.innerText);//DEBUG
					self._attributeHandle(attrKey, currentNode, _shadowDIV, viewInstance, dataManager);
				}
			}
		};

		var attrTrigger = {
			// key:"$ATTR",
			// TEMP: {
			// 	belongsNodeId: handle.id,
			// 	self: attrViewInstance
			// },
			event: function(NodeList, dataManager, eventTrigger) {
				attrViewInstance._isAttr.currentNode = NodeList[handle.id].currentNode;
				dataManager.collect(attrViewInstance);
			}
		}
		$.fE(attrViewInstance._triggers, function(key) {
			$.us((triggerTable[key] || (triggerTable[key] = [])), attrTrigger);
		});

	}
}
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
					var key = trigger.key = trigger.key || "";
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

var ViewInstance = function(handleNodeTree, NodeList, triggerTable, data) {
	if (!(this instanceof ViewInstance)) {
		return new ViewInstance(handleNodeTree, NodeList, triggerTable, data);
	}
	var self = this,
		dataManager;
	self._isAttr = $FALSE;//if no null --> Storage the attribute key and current.
	self.dataManager ;//= dataManager;
	self.handleNodeTree = handleNodeTree;
	self.DOMArr = $.s(handleNodeTree.childNodes);
	self.NodeList = NodeList;
	var el = self.topNode();//NodeList[handleNodeTree.id].currentNode;
	self._packingBag = el;
	self._id = $.uid();
	self._open = $.D.C(self._id + " _open");
	self._close = $.D.C(self._id + " _close");
	self._canRemoveAble = $FALSE;
	self._AVI = {};
	self._ALVI = {};
	self._WVI = {};
	$.D.iB(el, self._open, el.childNodes[0]);
	$.D.ap(el, self._close);
	(self._triggers = [])._ = {};
	self.TEMP = {};

	$.fI(triggerTable, function(tiggerCollection, key) {
		if (key&&key!==".") {
			$.p(self._triggers,key);
		}
		self._triggers._[key] = tiggerCollection;
	});
	$.fE(triggerTable["."], function(tiggerFun) { //const value
		tiggerFun.event(NodeList, dataManager);
	});
	if (data instanceof DataManager) {
		dataManager = data.collect(self);
	} else {
		dataManager = DataManager(data, self);
	}
	V._instances[self._id] = self;
	self.reDraw();
};

function _bubbleTrigger(tiggerCollection, NodeList, dataManager, eventTrigger) {
	var self = this;
	$.fE(tiggerCollection, function(trigger) {
		// if (trigger.key) {//DEBUG
		// 	console.log("event:",trigger.key," to ",dataManager.get(trigger.key),"fires")
		// }else{
		// 	console.log("event","bubble")
		// }
		trigger.event(NodeList, dataManager, eventTrigger,self._isAttr,self._id);
		if (trigger.bubble) {
			var parentNode = NodeList[trigger.handleId].parentNode;
			parentNode && _bubbleTrigger.call(self, parentNode._triggers, NodeList, dataManager, trigger);
		}
	});
};

function _replaceTopHandleCurrent(self, el) {
	// var handleNodeTree = self.handleNodeTree,
	// 	NodeList = self.NodeList;
	self._canRemoveAble = $TRUE;
	self.topNode(el);
	// NodeList[handleNodeTree.id].currentNode = el;
	// self.reDraw();
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

		$.ftE(NodeList[handleNodeTree.id].childNodes,function(child_node){
			if (viewInstance = AllLayoutViewInstance[child_node.id]||AllWithViewInstance[child_node.id]) {
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
			currentTopNode = self.topNode(),//NodeList[handleNodeTree.id].currentNode,
			elParentNode = el.parentNode;

		$.fE(currentTopNode.childNodes, function(child_node) {
			$.D.iB(elParentNode, child_node, el);
		});
		_replaceTopHandleCurrent(self, elParentNode);

		$.ftE(NodeList[handleNodeTree.id].childNodes,function(child_node){
			if (viewInstance = AllLayoutViewInstance[child_node.id]||AllWithViewInstance[child_node.id]) {
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
				currentTopNode = self.topNode(),//NodeList[handleNodeTree.id].currentNode,
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
	topNode:function(newCurrentTopNode){
		var self = this,
			handleNodeTree = self.handleNodeTree,
			NodeList = self.NodeList;
		if (newCurrentTopNode) {
			NodeList[handleNodeTree.id].currentNode = newCurrentTopNode
		}else{
			return NodeList[handleNodeTree.id].currentNode
		}
	},
	touchOff: function(key) {
		var self = this,
			dataManager = self.dataManager,
			NodeList = self.NodeList;
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
	// if (!(self instanceof TemplateHandle)) {
	// 	return new TemplateHandle(handleName, node);
	// }
	self.handleName = $.trim(handleName);
	self.childNodes = _parse(node);
	Handle.init(self,3);
};
TemplateHandle.prototype = Handle("handle", {
	ignore: $TRUE,
	nodeType: 1
});

/*
 * ElementHandle constructor
 */

function ElementHandle(node) {
	var self = this;
	// if (!(self instanceof ElementHandle)) {
	// 	return new ElementHandle(node);
	// }
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
	// if (!(self instanceof TextHandle)) {
	// 	return new TextHandle(node);
	// }
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
	// if (!(self instanceof CommentHandle)) {
	// 	return new CommentHandle(node);
	// }
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
var _matchRule = /\{[\w\W]*?\([\w\W]*?\)[\s]*\}/;
/*
 * expores function
 */

var V = global.ViewParser = {
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
			$.D.rC(parentNode,node);
		});
		_shadowBody.innerHTML = _shadowBody.innerHTML;
		var result = new ElementHandle(_shadowBody);
		return View(result);
	},
	scans: function() {
		$.fE(document.getElementsByTagName("script"), function(scriptNode) {
			if (scriptNode.getAttribute("type") === "text/template") {
				V.modules[scriptNode.getAttribute("name")] = V.parse(scriptNode.innerHTML);
			}
		});
	},
	rt: function(handleName, triggerFactory) {
		return V.triggers[handleName] = triggerFactory;
	},
	rh: function(handleName, handle) {
		return V.handles[handleName] = handle
	},
	ra:function(match,handle){
		var attrHandle = V.attrHandles[V.attrHandles.length] = {
			match:$NULL,
			handle:handle
		}
		if (typeof match==="function") {
			attrHandle.match = match;
		}else{
			attrHandle.match = function(attrKey){
				return attrKey===match;
			}
		}
	},
	triggers: {},
	handles: {},
	attrHandles:[],
	modules: {},
	attrModules: {},
	eachModules: {},
	withModules:{},
	_instances:{}
};
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
V.rh("", function(handle, index, parentHandle) {
	var textHandle = handle.childNodes[0];
	if (parentHandle.type !== "handle") { //is textNode
		var nextHandle = _commentPlaceholder(handle, parentHandle, "text " + handle.id);
		if (textHandle) { //textNode as Placeholder

			$.iA(parentHandle.childNodes, handle, textHandle);
			//Node position calibration
			//no "$.insert" Avoid sequence error

			return function(NodeList_of_ViewInstance) {
				var nextNodeInstance = NodeList_of_ViewInstance[nextHandle.id].currentNode,
					textNodeInstance = NodeList_of_ViewInstance[textHandle.id].currentNode,
					parentNodeInstance = NodeList_of_ViewInstance[parentHandle.id].currentNode
					$.D.iB(parentNodeInstance, textNodeInstance, nextNodeInstance); //Manually insert node
			}
		}

	} else {
		if (textHandle) {
			textHandle.ignore = $TRUE;
		}
	}
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
		trigger;
	trigger = {
		// key:"",//default key === ""
		bubble: true,
		TEMP: {
			cacheNode: $.D.cl(shadowDIV)
		},
		event: function(NodeList_of_ViewInstance, dataManager) {
			var htmlText = NodeList_of_ViewInstance[htmlTextHandlesId]._data,
				cacheNode = this.TEMP.cacheNode,
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
				$.D.rC(parentNode,node);
			}, index);
			cacheNode.innerHTML = htmlText;
			$.fE(cacheNode.childNodes, function(node, i) {
				$.D.iB(parentNode, node, endCommentNode);
			});
		}
	}
	return trigger;
});
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
V.rt("#each", function(handle, index, parentHandle) {
	var id = handle.id,
		arrDataHandleKey = handle.childNodes[0].childNodes[0].node.data,
		comment_endeach_id = parentHandle.childNodes[index + 3].id, //eachHandle --> eachComment --> endeachHandle --> endeachComment
		trigger;

	trigger = {
		event: function(NodeList_of_ViewInstance, dataManager,eventTrigger,isAttr,viewInstance_ID) {
			var data = dataManager.get(arrDataHandleKey),
				allArrViewInstances = V._instances[viewInstance_ID]._AVI,
				arrViewInstances,
				divideIndex = data?data.length:0,
				eachModuleConstructor = V.eachModules[id],
				inserNew,
				comment_endeach_node = NodeList_of_ViewInstance[comment_endeach_id].currentNode;

			(arrViewInstances = allArrViewInstances[id]||(allArrViewInstances[id] = [])).len = divideIndex;

			$.fE(data, function(eachItemData, index) {

				var viewInstance = arrViewInstances[index];
				if (!viewInstance) {
					viewInstance = arrViewInstances[index] = eachModuleConstructor();
					dataManager.subset(viewInstance); //reset arrViewInstance's dataManager
					inserNew = $TRUE;
				}
				if (!viewInstance._canRemoveAble) { //had being recovered into the packingBag
					inserNew = $TRUE;
				}

				viewInstance.set(eachItemData);

				if (inserNew&&!arrViewInstances.hidden) {
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
					// trigger.event = $.noop;
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
						// 	currentNode.data = data;
						// }else{
						// 	_asynAttributeAssignment(currentNode,"data",data);//1300.000ms --> 23% faster
						// 	// currentNode.data = data;//1600.000ms
						// }
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
				layoutViewInstance = AllLayoutViewInstance[id] || (AllLayoutViewInstance[id] = V.modules[NodeList_of_ViewInstance[templateHandle_id]._data](data).insert(NodeList_of_ViewInstance[comment_layout_id].currentNode)),
				inserNew;
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
				dataManager.subset(withViewInstance);
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
		currentNode.setAttribute(key, attrOuter)
	},
	dir: function(key, currentNode, parserNode) {
		var attrOuter = _getAttrOuter(parserNode);
		currentNode[key] = attrOuter;
	},
	bool: function(key, currentNode, parserNode) {
		var attrOuter = $.trim(_getAttrOuter(parserNode).replace(_booleanFalseRegExp, ""));

		if (attrOuter) {// currentNode.setAttribute(key, key);
			currentNode[key] = key;
		} else {// currentNode.removeAttribute(key);
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
var _addEventListener = function(Element, eventName, eventFun) {
	Element.addEventListener(eventName, eventFun, $FALSE);
},
	_removeEventListener = function(Element, eventName, eventFun) {
		Element.removeEventListener(eventName, eventFun, $FALSE);
	},
	_attachEvent = function(Element, eventName, eventFun) {
		Element.attachEvent("on" + eventName, eventFun);
	},
	_detachEvent = function(Element, eventName, eventFun) {
		Element.detachEvent("on" + eventName, eventFun);
	},
	_registerEvent = _isIE ? _attachEvent : _addEventListener,
	_cancelEvent =_isIE ? _detachEvent : _removeEventListener,
	_ieEnterPlaceholder = "@" + Math.random().toString(36).substring(2),
	_ieEnterPlaceholderRegExp = RegExp(_ieEnterPlaceholder,"g"),
		_elementCache = [],
	eventListerAttribute = function(key, currentNode, parserNode,vi,dm) {
		var attrOuter = _getAttrOuter(parserNode),
			eventName =  key.replace("event-on", "").replace("event-", ""),
			eventFun = dm.get(attrOuter),//Function("return " + attrOuter.replace(_ieEnterPlaceholderRegExp,"\n"))(),
			index = $.iO(_elementCache, currentNode),
			eventCollection,
			oldEventFun;
		if (index === -1) {
			index = $.p(_elementCache, currentNode)
			_elementCache.event[index] = {};
		};
		eventCollection = _elementCache.event[index];
		if (oldEventFun = eventCollection[eventName]) {
			_cancelEvent(currentNode,eventName, oldEventFun)
		}
		_registerEvent(currentNode,eventName, eventFun);
		eventCollection[eventName] = eventFun;
	};
_elementCache.event = {};
V.ra(function(attrKey) {
	return attrKey.indexOf("event-") === 0;
}, function(attrKey) {
	return eventListerAttribute;
})
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