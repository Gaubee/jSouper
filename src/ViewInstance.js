/*
 * View Instance constructor
 */

(function() { //DM_extends_fot_VI
	var _rebuildTree = DM_proto.rebuildTree;
	DM_proto.rebuildTree = function() {
		var self = this,
			DMSet = self._subsetDataManagers;
		$.ftE(self._viewInstances, function(childViewInstance) {
			$.ftE(childViewInstance._smartTriggers, function(smartTrigger) {
				var TEMP = smartTrigger.TEMP;

				TEMP.viewInstance.get(TEMP.sourceKey);
				var topGetter = DataManager.session.topGetter,
					currentTopGetter = DataManager.get(TEMP.dm_id),
					matchKey = DataManager.session.filterKey||"";
				if (topGetter) {
					if (topGetter!==currentTopGetter||matchKey!==smartTrigger.matchKey) {
						TEMP.dm_id = topGetter.id;
						currentTopGetter&&smartTrigger.unbind(currentTopGetter._triggerKeys)
						smartTrigger.matchKey = matchKey;
						smartTrigger.bind(topGetter._triggerKeys);
						currentTopGetter = topGetter
					}
				}
				//smartTrigger.event(currentTopGetter._triggerKeys);//filter as dm.getTop().touchOff("")
			})
		})
		$.ftE(self._subsetDataManagers, function(childDataManager) {
			childDataManager.rebuildTree()
		})
		return _rebuildTree.call(self);
	}
	var _collect = DM_proto.collect;
	DM_proto.collect = function(viewInstance) {
		var self = this;
		if (viewInstance instanceof DataManager) {
			_collect.call(self, viewInstance);
			//TODO:release memory.
		} else if (viewInstance instanceof ViewInstance) {
			var vi_DM = viewInstance.dataManager;
			if (!vi_DM) { // for VI init in constructor
				vi_DM = viewInstance.dataManager = self;
				var viewInstanceTriggers = viewInstance._triggers
				$.ftE(viewInstanceTriggers, function(sKey) {
					viewInstance._buildSmart(sKey);
				});
			}
			$.p(viewInstance.dataManager._viewInstances, viewInstance);
			_collect.call(self, vi_DM)//self collect self will Forced triggered updates
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
			if (!vi_DM) {
				vi_DM = DataManager();
				vi_DM.collect(viewInstance);
			}
			_subset.call(self, vi_DM, prefix);
		}
	};
}());
var ViewInstance = function(handleNodeTree, NodeList, triggerTable, dataManager) {
	if (!(this instanceof ViewInstance)) {
		return new ViewInstance(handleNodeTree, NodeList, triggerTable, dataManager);
	}
	var self = this;
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
		if ("".indexOf(key) !== 0) { //"" //||"."
			$.p(self._triggers, key);
		}
		self._triggers._[key] = tiggerCollection;
	});
	/*$.fE(triggerTable["."], function(tiggerFun) { //const value
		tiggerFun.event(NodeList, dataManager);
	});*/

	if (!(dataManager instanceof DataManager)) {
		dataManager = DataManager(dataManager);
	}
	self._smartTriggers = [];

	//self.dataManager = dataManager
	dataManager.collect(self); //touchOff All triggers
	//delete self._triggers._["."] //remove "."(const) key,just touch one time;
},
	VI_session = ViewInstance.session = {
		touchHandleIdSet: $NULL,
		touchStacks: $NULL
	};

function _bubbleTrigger(tiggerCollection, NodeList, dataManager /*, eventTrigger*/ ) {
	var self = this, // result,
		eventStack = [],
		touchStacks = VI_session.touchStacks,
		touchHandleIdSet = VI_session.touchHandleIdSet;
	$.p(touchStacks, eventStack); //Add a new layer event collector
	$.fE(tiggerCollection, function(trigger) { //TODO:测试参数长度和效率的平衡点，减少参数传递的数量
		if (!touchHandleIdSet[trigger.handleId]) { //To prevent repeated collection
			$.p(eventStack, trigger) //collect trigger
			if ( /*result !== $FALSE &&*/ trigger.bubble) {
				// Stop using the `return false` to prevent bubble triggered
				// need to use `this. Mercifully = false` to control
				var parentNode = NodeList[trigger.handleId].parentNode;
				parentNode && _bubbleTrigger.call(self, parentNode._triggers, NodeList, dataManager /*, trigger*/ );
			}
			touchHandleIdSet[trigger.handleId] = $TRUE;
		}
		/*else{
			console.log(trigger.handleId)
		}*/
	});

};

function _moveChild(self, el) {
	var AllEachViewInstance = self._AVI,
		AllLayoutViewInstance = self._ALVI,
		AllWithViewInstance = self._WVI;
	_replaceTopHandleCurrent(self, el);
	$.ftE(self.NodeList[self.handleNodeTree.id].childNodes, function(child_node) {
		var viewInstance,
			arrayViewInstances,
			id = child_node.id;
		if (viewInstance = AllLayoutViewInstance[child_node.id] || AllWithViewInstance[child_node.id]) {
			_moveChild(viewInstance, el)
		} else if (arrayViewInstances = AllEachViewInstance[id]) {
			$.ftE(arrayViewInstances, function(viewInstance) {
				_moveChild(viewInstance, el);
			})
		}
	});
};

function _replaceTopHandleCurrent(self, el) {
	self._canRemoveAble = $TRUE;
	self.topNode(el);
};
var VI_proto = ViewInstance.prototype = {
	// reDraw: function() {
	// 	var self = this,
	// 		dataManager = self.dataManager;

	// 	$.fE(self._triggers, function(key) {
	// 		dataManager._touchOffSubset(key)
	// 	});
	// 	return self;
	// },
	append: function(el) {
		var self = this,
			handleNodeTree = self.handleNodeTree,
			NodeList = self.NodeList,
			currentTopNode = NodeList[handleNodeTree.id].currentNode;

		$.fE(currentTopNode.childNodes, function(child_node) {
			$.D.ap(el, child_node);
		});
		// _replaceTopHandleCurrent(self, el);

		_moveChild(self, el);

		return self;
	},
	insert: function(el) {
		var self = this,
			handleNodeTree = self.handleNodeTree,
			NodeList = self.NodeList,
			currentTopNode = self.topNode(), //NodeList[handleNodeTree.id].currentNode,
			elParentNode = el.parentNode;

		$.fE(currentTopNode.childNodes, function(child_node) {
			$.D.iB(elParentNode, child_node, el);
		});
		// _replaceTopHandleCurrent(self, elParentNode);

		_moveChild(self, elParentNode);

		return self;
	},
	remove: function() {
		var self = this,
			el = this._packingBag;
		// debugger
		if (self._canRemoveAble) {
			var handleNodeTree = self.handleNodeTree,
				NodeList = self.NodeList,
				currentTopNode = self.topNode(), //NodeList[handleNodeTree.id].currentNode,
				openNode = self._open,
				closeNode = self._close,
				childNodes = $.s(currentTopNode.childNodes),

				startIndex = $.iO(childNodes,openNode),
				child_node;

			while (child_node = childNodes[startIndex]) {
				$.D.ap(el, child_node);
				if (child_node === closeNode) {
					break;
				}
				startIndex += 1
			}
			/*
			//no-TODO:use nextSilingNode
			//Firefox、Opera对DOM的理解不同，所以用nextSibling还要做兼容处理，而且效率方面不见得有所提高
			var currentNode = openNode;
			while($TRUE){
				var nextNode = currentNode.nextSibling;
				$.D.ap(el, currentNode);
				if(nextNode === closeNode){
					$.D.ap(el, nextNode);
					break;
				}
				currentNode = nextNode;
			}*/
			_replaceTopHandleCurrent(self, el);
			this._canRemoveAble = $FALSE; //Has being recovered into the _packingBag,can't no be remove again. --> it should be insert
		}
		return self;
	},
	get: function get() {
		var dm = this.dataManager;
		return dm.get.apply(dm, arguments /*$.s(arguments)*/ );
	},
	mix: function mix() {
		var dm = this.dataManager;
		return dm.mix.apply(dm, arguments /*$.s(arguments)*/ )
	},
	set: function set() {
		var dm = this.dataManager;
		return dm.set.apply(dm, arguments /*$.s(arguments)*/ )
	},
	topNode: function(newCurrentTopNode) {
		var self = this,
			handleNodeTree = self.handleNodeTree,
			NodeList = self.NodeList,
			result;
		if (newCurrentTopNode) {
			NodeList[handleNodeTree.id].currentNode = newCurrentTopNode
		} else {
			result = NodeList[handleNodeTree.id].currentNode;
			if (result.nodeType === 8) {
				result = result.parentNode;
			}
		}
		return result;
	},
	touchOff: function(key) {
		var self = this,
			dataManager = self.dataManager,
			NodeList = self.NodeList;
		VI_session.touchHandleIdSet = {};
		VI_session.touchStacks = [];
		// collect trigger stack
		_bubbleTrigger.call(self, self._triggers._[key], NodeList, dataManager)
		// trigger trigger stack
		$.ftE(VI_session.touchStacks, function(eventStack) {
			$.ftE(eventStack, function(trigger) {
				trigger.event(NodeList, dataManager, /*trigger,*/ self._isAttr, self._id)
			})
		})
	},
	_buildSmart:function(sKey) {
		var self = this,
			dataManager = self.dataManager,
			smartTriggers = self._smartTriggers;
		dataManager.get(sKey);
		var baseKey = DataManager.session.filterKey,
			topGetterTriggerKeys = DataManager.session.topGetter && DataManager.session.topGetter._triggerKeys,
			smartTrigger = new SmartTriggerHandle(
				baseKey || (baseKey = ""), //match key

				function(smartTriggerSet) { 
					self.touchOff(sKey);
				}, { //TEMP data
					viewInstance: self,
					dm_id: dataManager.id,
					// triggerSet: topGetterTriggerKeys,
					sourceKey: sKey
				}
			);
		$.p(smartTriggers, smartTrigger);
		topGetterTriggerKeys && smartTrigger.bind(topGetterTriggerKeys); // topGetterTriggerKeys.push(baseKey, smartTrigger);
	}/*,
	on: function(eventName, fun) {

	},
	trigger: function(eventName) {

	}*/
};
/*var _allEventNames = ("blur focus focusin focusout load resize" +
	"scroll unload click dblclick mousedown mouseup mousemove" +
	"mouseover mouseout mouseenter mouseleave change select" +
	"submit keydown keypress keyup error contextmenu").split(" ");
$.ftE(_allEventNames, function(eventName) {
	VI_proto[eventName] = function(fun) {
		return fun ? this.on(eventName, fun) : this.trigger(eventName);
	}
})