/*
 * View Instance constructor
 */

(function DM_extends_fot_VI() {
	var _rebuildTree = DM_proto.rebuildTree;
	DM_proto.rebuildTree = function() {
		var self = this,
			DMSet = self._subsetDataManagers;
		$.ftE(self._viewInstances, function(childViewInstance) {
			$.ftE(childViewInstance._smartTriggers, function(smartTrigger) {
				var TEMP = smartTrigger.TEMP;
				DataManager.get(TEMP.dm_id).get(TEMP.sourceKey);
				var topGetter = DataManager.session.topGetter;
				if (topGetter !== DataManager.get(TEMP.dm_id)) {
					smartTrigger.bind(topGetter._triggerKeys);
					TEMP.dm_id = topGetter.id;
				}
				smartTrigger.event(topGetter._triggerKeys);
			})
		})
		$.ftE(self._subsetDataManagers, function(childDataManager) {
			$.ftE(childDataManager._viewInstances, function(childViewInstance) {
				$.ftE(childViewInstance._smartTriggers, function(smartTrigger) {
					if (smartTrigger.moveAble) {
						var TEMP = smartTrigger.TEMP;
						DataManager.get(TEMP.dm_id).get(TEMP.sourceKey);
						var topGetter = DataManager.session.topGetter;
						if (topGetter !== DataManager.get(TEMP.dm_id)) {
							smartTrigger.unbind(DataManager.get(TEMP.dm_id)._triggerKeys).bind(topGetter._triggerKeys);
							TEMP.dm_id = topGetter.id;
							smartTrigger.event(topGetter._triggerKeys);
						}
					}
				})
			})
			childDataManager.rebuildTree()
		})
		return _rebuildTree.call(self);
	}
	var _collect = DM_proto.collect;
	DM_proto.collect = function(viewInstance) {
		var self = this,
			smartTriggers = viewInstance._smartTriggers;
		if (viewInstance instanceof DataManager) {
			_collect.call(self, viewInstance);
			//TODO:release memory.
		} else if (viewInstance instanceof ViewInstance) {
			var vi_DM = viewInstance.dataManager;
			if (vi_DM) { // for VI init in constructor
				_collect.call(self, vi_DM)
			} else {
				viewInstance.dataManager = self;
				var viewInstanceTriggers = viewInstance._triggers;
				$.ftE(viewInstanceTriggers, function(sKey) {
					self.get(sKey);
					var baseKey = DataManager.session.filterKey,
						topGetterTriggerKeys = DataManager.session.topGetter._triggerKeys,
						smartTrigger = new SmartTriggerHandle(
							baseKey||"", //match key

							function(smartTriggerSet) { //event
								viewInstance.touchOff(sKey);
							}, { //TEMP data
								viewInstance: viewInstance,
								dm_id: self.id,
								// triggerSet: topGetterTriggerKeys,
								sourceKey: sKey
							}
						);
					$.p(smartTriggers, smartTrigger);
					smartTrigger.bind(topGetterTriggerKeys); // topGetterTriggerKeys.push(baseKey, smartTrigger);
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
			if (!vi_DM) {
				vi_DM = DataManager();
				vi_DM.collect(viewInstance);
			}
			_subset.call(self, vi_DM, prefix);
			self.rebuildTree();
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

	delete self._triggers._["."] //remove "."(const) key,just touch one time;
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
		if (!touchHandleIdSet[trigger.handleId]) {//To prevent repeated collection
			$.p(eventStack,trigger)//collect trigger
			if (/*result !== $FALSE &&*/ trigger.bubble) {
				// Stop using the `return false` to prevent bubble triggered
				// need to use `this. Mercifully = false` to control
				var parentNode = NodeList[trigger.handleId].parentNode;
				parentNode && _bubbleTrigger.call(self, parentNode._triggers, NodeList, dataManager /*, trigger*/ );
			}
			touchHandleIdSet[trigger.handleId]  = $TRUE;
		}
		/*else{
			console.log(trigger.handleId)
		}*/
	});

};
function _moveChild(self,el){
		var AllEachViewInstance = self._AVI,
			AllLayoutViewInstance = self._ALVI,
			AllWithViewInstance = self._WVI;
			
		$.ftE(self.NodeList[self.handleNodeTree.id].childNodes, function(child_node) {
			var viewInstance,
				arrayViewInstances,
				id = child_node.id;
			if (viewInstance = AllLayoutViewInstance[child_node.id] || AllWithViewInstance[child_node.id]) {
				_replaceTopHandleCurrent(viewInstance, el)
			}else if(arrayViewInstances = AllEachViewInstance[id]){
				$.ftE(arrayViewInstances,function(viewInstance){
					_replaceTopHandleCurrent(viewInstance,el);
				})
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
			currentTopNode = NodeList[handleNodeTree.id].currentNode;

		$.fE(currentTopNode.childNodes, function(child_node) {
			$.D.ap(el, child_node);
		});
		_replaceTopHandleCurrent(self, el);

		_moveChild(self,el);

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
		_replaceTopHandleCurrent(self, elParentNode);
		
		_moveChild(self,elParentNode);

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

				startIndex = 0,
				child_node;

			//TODO:use nextSilingNode
			while(child_node = childNodes[startIndex]){
				if (child_node === openNode) {
					break;
				}
				startIndex+=1
			}
			while(child_node = childNodes[startIndex]){
				$.D.ap(el, child_node);
				if (child_node === closeNode) {
					break;
				}
				startIndex+=1
			}
			_replaceTopHandleCurrent(self, el);
			this._canRemoveAble = $FALSE; //Has being recovered into the _packingBag,can't no be remove again. --> it should be insert
		}
		return self;
	},
	get: function get() {
		var dm = this.dataManager;
		return dm.get.apply(dm, $.s(arguments));
	},
	mix: function mix() {
		var dm = this.dataManager;
		return dm.mix.apply(dm, $.s(arguments))
	},
	set: function set() {
		var dm = this.dataManager;
		return dm.set.apply(dm, $.s(arguments))
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
	_collectTrigger:function(trigger,sKey){
		var self = this,
			smartTriggers = self._smartTriggers;
		self.get(sKey);
		var baseKey = DataManager.session.filterKey,
			topGetterTriggerKeys = DataManager.session.topGetter._triggerKeys,
			smartTrigger = new SmartTriggerHandle(
				baseKey, //match key

				function(smartTriggerSet) { //event
					self.touchOff(sKey);
				}, { //TEMP data
					viewInstance: self,
					dataManager: self.dataManager,
					// triggerSet: topGetterTriggerKeys,
					sourceKey: sKey
				}
			);
		$.p(smartTriggers, smartTrigger);
		smartTrigger.bind(topGetterTriggerKeys);
	}
};
