/*
 * View Instance constructor
 */

var ViewInstance = function(handleNodeTree, NodeList, triggerTable, data) {
	if (!(this instanceof ViewInstance)) {
		return new ViewInstance(handleNodeTree, NodeList, triggerTable, data);
	}
	var self = this,
		dataManager;
	if (data instanceof DataManager) {
		dataManager = data.collect(self);
	} else {
		dataManager = DataManager(data, self);
	}
	self._isAttr = false;//if no null --> Storage the attribute key and current.
	self.dataManager = dataManager;
	self.handleNodeTree = handleNodeTree;
	self.DOMArr = $.slice(handleNodeTree.childNodes);
	self.NodeList = NodeList;
	var el = NodeList[handleNodeTree.id].currentNode;
	self._packingBag = el;
	self._id = $.uid();
	self._open = $.DOM.Comment(self._id + " _open");
	self._close = $.DOM.Comment(self._id + " _close");
	self._canRemoveAble = false;
	$.DOM.insertBefore(el, self._open, el.childNodes[0]);
	$.DOM.append(el, self._close);
	(self._triggers = [])._ = {};
	self.TEMP = {};

	$.forIn(triggerTable, function(tiggerCollection, key) {
		if (key&&key!==".") {
			$.push(self._triggers,key);
		}
		self._triggers._[key] = tiggerCollection;
	});
	$.forEach(triggerTable["."], function(tiggerFun) { //const value
		tiggerFun.event(NodeList, dataManager);
	});
	self.reDraw();
};

function _bubbleTrigger(tiggerCollection, NodeList, dataManager, eventTrigger) {
	var self = this;
	$.forEach(tiggerCollection, function(trigger) {
		// if (trigger.key) {//DEBUG
		// 	console.log("event:",trigger.key," to ",dataManager.get(trigger.key),"fires")
		// }else{
		// 	console.log("event","bubble")
		// }
		trigger.event(NodeList, dataManager, eventTrigger);
		if (trigger.bubble) {
			var parentNode = NodeList[trigger.handleId].parentNode;
			parentNode && _bubbleTrigger.apply(self, [parentNode._triggers, NodeList, dataManager, trigger]);
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
			dataManager = self.dataManager;

		$.forEach(self._triggers, function(key) {
			dataManager._touchOffSubset(key)
		});
		return self;
	},
	append: function(el) {
		var self = this,
			handleNodeTree = self.handleNodeTree,
			NodeList = self.NodeList,
			currentTopNode = NodeList[handleNodeTree.id].currentNode;

		$.forEach(currentTopNode.childNodes, function(child_node) {
			$.DOM.append(el, child_node);
		});
		_replaceTopHandleCurrent(self, el);
		return self;
	},
	insert: function(el) {
		var self = this,
			handleNodeTree = self.handleNodeTree,
			NodeList = self.NodeList,
			currentTopNode = NodeList[handleNodeTree.id].currentNode,
			elParentNode = el.parentNode;

		$.forEach(currentTopNode.childNodes, function(child_node) {
			$.DOM.insertBefore(elParentNode, child_node, el);
		});
		_replaceTopHandleCurrent(self, elParentNode)
		return self;
	},
	remove: function() {
		var self = this,
			el = this._packingBag
		if (self._canRemoveAble) {
			var handleNodeTree = self.handleNodeTree,
				NodeList = self.NodeList,
				currentTopNode = NodeList[handleNodeTree.id].currentNode,
				openNode = self._open,
				closeNode = self._close,
				startIndex = 0;

			$.forEach(currentTopNode.childNodes, function(child_node, index) {
				if (child_node === openNode) {
					startIndex = index
				}
			});
			$.forEach(currentTopNode.childNodes, function(child_node, index) {
				// console.log(index,child_node,el)
				$.DOM.append(el, child_node);
				if (child_node === closeNode) {
					return false;
				}
			}, startIndex);
			_replaceTopHandleCurrent(self, el);
			this._canRemoveAble = false; //Has being recovered into the _packingBag,can't no be remove again. --> it should be insert
		}
		return self;
	},
	get: function get(key) {
		var dm = this.dataManager;
		return dm.get.apply(dm, $.slice(arguments));
	},
	set: function set() {
		var dm = this.dataManager;
		return dm.set.apply(dm, $.slice(arguments));
	},
	touchOff: function(key) {
		var self = this,
			dataManager = self.dataManager,
			NodeList = self.NodeList;

		_bubbleTrigger.apply(self, [self._triggers._[key], NodeList, dataManager])
	}
};