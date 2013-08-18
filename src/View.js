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
*/

//  key : isboolean --> value = key --> hidden = "hidden"
var _Assignment = {
	className: false,
	value: false,
	checked: true,
	selected: true, // equal to [true,false]
	disabled: true,
	readonly: true,
	multiple: true,
	ismap: true,
	defer: true,
	// declare:true
	noresize: true,
	nowrap: true,
	noshade: true,
	// compact:true
	hidden: true //
};

var _testDIV = $.DOM.clone(shadowDIV);
var _event_by_fun = (function() {
	var testEvent = Function(""),
		attrKey = "onclick";

	_testDIV.setAttribute(attrKey, testEvent);
	if (typeof _testDIV.getAttribute(attrKey) === "string") {
		return false;
	}
	return true;
}());
var _booleanFalseRegExp = /false|undefined|null|NaN/;
var _AttributeHandle = function(attrKey) {
	var assign;
	if (attrKey === "style" && _isIE) {
		return _AttributeHandleEvent.style;
	}
	if (attrKey.indexOf("on") === 0 && _event_by_fun) {
		return _AttributeHandleEvent.event;
	}
	if (_hasOwn.call(_Assignment, attrKey)) {
		if (assign = _Assignment[attrKey]) {
			return _AttributeHandleEvent.bool;
		}
		return _AttributeHandleEvent.dir;
	}
	return _AttributeHandleEvent.com;

};
_getAttrOuter = Function("n", "return n." + (_hasOwn.call(_testDIV, "innerText") ? "innerText" : "textContent") + ".replace(/\\//g,'\\/\\/')||''")
var _AttributeHandleEvent = {
	event: function(key, currentNode, parserNode) {
		var attrOuter = _getAttrOuter(parserNode);
		try {
			var attrOuterEvent = Function(attrOuter);
		} catch (e) {
			attrOuterEvent = $.noop;
		}
		currentNode.setAttribute(key, attrOuterEvent);
	},
	style: function(key, currentNode, parserNode) {
		var attrOuter = _getAttrOuter(parserNode);
		currentNode.style.setAttribute('cssText', attrOuter);
	},
	com: function(key, currentNode, parserNode) {
		var attrOuter = _getAttrOuter(parserNode);
		currentNode.setAttribute(key, attrOuter);
	},
	dir: function(key, currentNode, parserNode) {
		var attrOuter = _getAttrOuter(parserNode);
		currentNode[key] = attrOuter;
	},
	bool: function(key, currentNode, parserNode) {
		var attrOuter = $.trim(_getAttrOuter(parserNode).replace(_booleanFalseRegExp, ""));
		if (attrOuter) {
			// currentNode.setAttribute(key, key);
			currentNode[key] = key;
		} else {
			currentNode.removeAttribute(key);
		}
	}
};
var _bindHandle = function(viewInstance ,dataManager) {
	var self = this,
		attrKey = self.key,
		currentNode = self.currentNode,
		parserNode = self.parserNode;
	if (currentNode) {
		self._bindHandle(attrKey, currentNode, parserNode);
	}
	dataManager.remove(viewInstance)
};

function _buildTrigger(handleNodeTree, dataManager) {
	var self = this, //View Instance
		triggerTable = self._triggerTable;
	handleNodeTree = handleNodeTree || self.handleNodeTree;
	_traversal(handleNodeTree, function(handle, index, parentHandle) {
		// handle.parentNode = parentHandle;
		if (handle.type === "handle") {
			var triggerFactory = V.triggers[handle.handleName];
			if (triggerFactory) {
				var trigger = triggerFactory(handle, index, parentHandle);
				if (trigger) {
					var key = trigger.key = trigger.key || "";
					trigger.handleId = trigger.handleId || handle.id;
					//unshift list and In order to achieve the trigger can be simulated bubble
					$.unshift((triggerTable[key] = triggerTable[key] || []), trigger); //Storage as key -> array
					$.push(handle._triggers, trigger); //Storage as array
				}
			}
		} else if (handle.type === "element") {
			var node = handle.node,
				nodeHTMLStr = node.outerHTML.replace(node.innerHTML, ""),
				attrs = nodeHTMLStr.match(_attrRegExp);

			$.forEach(attrs, function(attrStr) {
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
					attrViewInstance._isAttr = {
						key: attrKey,
						parserNode: _shadowDIV,
						/*When the trigger of be injecte in the View instance being fired (triggered by the ViewInstance instance), 
						it will storage the property value where the currentNode,// and the dataManager, 
						and lock it into attrViewInstance, 
						waiting for updates the attribute.*/ //(so the trigger of be injecte in mush be unshift)
						currentNode: null,
						_bindHandle: _AttributeHandle(attrKey),
						bindHandle: _bindHandle
					};


					var attrTrigger = {
						// key:"$ATTR",
						TEMP: {
							belongsNodeId: handle.id,
							self: attrViewInstance
						},
						event: function(NodeList, dataManager, eventTrigger) {
							var self = this,
								TEMP = self.TEMP,
								attrViewInstance = TEMP.self;
							currentNode = NodeList[TEMP.belongsNodeId].currentNode;
							attrViewInstance._isAttr.currentNode = currentNode;
							dataManager.collect(attrViewInstance);
						}
					}
					$.forEach(attrViewInstance._triggers, function(key) {
						$.unshift((triggerTable[key] = triggerTable[key] || []), attrTrigger);
					});

				}
			});
		}
	});
};

function _create(data) { //data maybe basedata or dataManager
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
	return ViewInstance(self.handleNodeTree, NodeList_of_ViewInstance, self._triggerTable, data);
};