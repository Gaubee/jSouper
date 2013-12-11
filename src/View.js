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
	_buildHandler.call(self);
	_buildTrigger.call(self);
	return function(data) {
		return _create.call(self, data);
	}
};
// var V_session = View.session = {};

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
var ignoreTagName = "SCRIPT|PRE|TEMPLATE|STYLE|LINK".split("|");

var _outerHTML = (function() {
	// if (shadowDIV.outerHTML) {
	// 	var _tagHTML = function(node) {
	// 		return node.outerHTML.replace(node.innerHTML, "");
	// 	}
	// } else {
	var _wrapDIV = fragment();
	var _tagHTML = function(node) {
		// console.log(node.outerHTML);
		// console.log(node.innerHTML);
		// console.log(node.outerHTML.replace(node.innerHTML, ""))
		node = $.D.cl(node);
		_wrapDIV.appendChild(node);
		var outerHTMLStr = _wrapDIV.innerHTML;
		_wrapDIV.removeChild(node);

		return outerHTMLStr;
	}
	// }
	var fireOuterHTML = function(node) {
		var outerHTMLStr = _tagHTML(node);
		var tagNamespace = V.namespace.toUpperCase();
		if (outerHTMLStr.toUpperCase().indexOf(tagNamespace) === 1) { //tagName = <attr-xxx></attr-xxx>
			var plen = tagNamespace.length;
			var alltagName = rtagName.exec(outerHTMLStr)[1];
			var _perfixStr = "<" + outerHTMLStr.substr(plen + 1, outerHTMLStr.length - plen - alltagName.length - 2);
			var _laveStr = outerHTMLStr.substr(outerHTMLStr.length - alltagName.length - 1 + plen)
			outerHTMLStr = _perfixStr + _laveStr;
		}
		return outerHTMLStr;
	}
	return fireOuterHTML;
}());

function _buildTrigger(handleNodeTree, dataManager) {
	var self = this, //View Instance
		triggerTable = self._triggerTable;
	handleNodeTree = handleNodeTree || self.handleNodeTree,
	_traversal(handleNodeTree, function(handle, index, parentHandle) {
		if (handle.type === "handle") {
			var triggerFactory = V.triggers[handle.handleName];
			if (triggerFactory) {
				var trigger = triggerFactory(handle, index, parentHandle);
				if (trigger) {
					var key = trigger.key || (trigger.key = "");
					trigger.handleId = trigger.handleId || handle.id;
					//unshift list and In order to achieve the trigger can be simulated bubble
					$.us((triggerTable[key] || (triggerTable[key] = [])), trigger); //Storage as key -> array
					$.p(handle._triggers, trigger); //Storage as array
				}
			}
		} else if (handle.type === "element") {
			if ($.iO(ignoreTagName, handle.node.tagName) !== -1) {
				return $FALSE;
			}
			var node = handle.node,
				nodeHTMLStr = _outerHTML(node),
				attrs = nodeHTMLStr.match(_attrRegExp);
			handle.nodeStr = nodeHTMLStr;
			$.fE(node.attributes, function(attr, i) {
				var value = attr.value,
					name = attr.name;
				if (_templateMatchRule.test(value)) {
					attributeHandle(name, value, node, handle, triggerTable);
					node.removeAttribute(name);
				}
			})
		} else { // textNode and Comment
			handle.nodeStr = handle.node.data;
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
			if ("nodeStr" in node) {
				var currentNode = node.type === "comment" ? $.D.C(node.nodeStr) : $.D.cs(node.nodeStr);
			} else {
				currentNode = $.D.cl(node.node);
			}
			node.currentNode = currentNode;
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