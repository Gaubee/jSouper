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