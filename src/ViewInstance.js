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
                    matchKey = DataManager.session.filterKey || "";
                if (topGetter) {
                    if (topGetter !== currentTopGetter || matchKey !== smartTrigger.matchKey) {
                        TEMP.dm_id = topGetter.id;
                        currentTopGetter && smartTrigger.unbind(currentTopGetter._triggerKeys)
                        smartTrigger.matchKey = matchKey;
                        smartTrigger.bind(topGetter._triggerKeys);
                        currentTopGetter = topGetter;
                    }
                }
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

            //to rebuildTree => remark smartyKeys
            $.p(self._viewInstances, viewInstance);

            _collect.call(self, vi_DM) //self collect self will Forced triggered updates
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
                //收集触发器
                vi_DM.collect(viewInstance);
            }
            _subset.call(self, vi_DM, prefix);
        }
    };
}());

function ViewInstance(handleNodeTree, NodeList, triggerTable, dataManager) {
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
    // var _canRemoveAble = $FALSE;
    // self.__defineGetter__("_canRemoveAble", function() {
    //     return _canRemoveAble;
    // });
    // self.__defineSetter__("_canRemoveAble", function(nObj) {
    //     if (nObj === $FALSE) {
    //         debugger
    //     };
    //     _canRemoveAble = nObj;
    // })

    self._AVI = {};
    self._ALVI = {};
    self._WVI = {};
    self._teleporters = {};
    // self._arrayVI = $NULL;
    $.D.iB(el, self._open, el.childNodes[0]);
    $.D.ap(el, self._close);
    (self._triggers = [])._ = {};
    // self._triggers._u = [];//undefined key,update every time
    self.TEMP = {};
    $.fI(triggerTable, function(tiggerCollection, key) {
        $.p(self._triggers, key);
        self._triggers._[key] = tiggerCollection;
    });

    if (!(dataManager instanceof DataManager)) {
        dataManager = DataManager(dataManager);
    }
    self._smartTriggers = [];

    //bind viewInstance with DataManger
    dataManager.collect(self); //touchOff All triggers

    self.touchOff("."); //const value
};
var VI_session = ViewInstance.session = {
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

    self.topNode(el);

    $.ftE(self.NodeList[self.handleNodeTree.id].childNodes, function(child_node) {
        var viewInstance,
            arrayViewInstances,
            id = child_node.id;
        if (viewInstance = (AllLayoutViewInstance[child_node.id] || AllWithViewInstance[child_node.id])) {
            _moveChild(viewInstance, el)
        } else if (arrayViewInstances = AllEachViewInstance[id]) {
            $.ftE(arrayViewInstances, function(viewInstance) {
                _moveChild(viewInstance, el);
            })
        }
    });
};

var fr = doc.createDocumentFragment();

var VI_proto = ViewInstance.prototype = {
    destroy: function() {
        var self = this;
        //TODO:delete node
        self.remove();
        return null;
    },
    append: function(el) {
        var self = this,
            currentTopNode = self.topNode();

        if (self._id === 76) {
            debugger
        };
        $.fE(currentTopNode.childNodes, function(child_node) {
            $.D.ap(fr, child_node);
        });
        $.D.ap(el, fr);

        _moveChild(self, el);
        self._canRemoveAble = $TRUE;

        return self;
    },
    insert: function(el) {
        var self = this,
            currentTopNode = self.topNode(),
            elParentNode = el.parentNode;

        $.fE(currentTopNode.childNodes, function(child_node) {
            $.D.ap(fr, child_node);
        });
        $.D.iB(elParentNode, fr, el);

        _moveChild(self, elParentNode);
        self._canRemoveAble = $TRUE;

        return self;
    },
    remove: function() {
        var self = this,
            el = self._packingBag;
        // debugger
        if (self._canRemoveAble) {
            var handleNodeTree = self.handleNodeTree,
                NodeList = self.NodeList,
                currentTopNode = self.topNode(), //NodeList[handleNodeTree.id].currentNode,
                openNode = self._open,
                closeNode = self._close;

            //TODO:fix Firefox Opera
            var currentNode = openNode;
            var nextNode;
            while ($TRUE) {
                nextNode = currentNode.nextSibling;
                $.D.ap(el, currentNode);
                if (nextNode === closeNode) {
                    $.D.ap(el, nextNode);
                    break;
                }
                currentNode = nextNode;
            }

            self.topNode(el);

            self._canRemoveAble = $FALSE; //Has being recovered into the _packingBag,can't no be remove again. --> it should be insert
            if (self._isEach) {
                // 排队到队位作为备用
                self._arrayVI.splice(self.dataManager._index, 1)
                $.p(self._arrayVI, self);

                //相应的DM以及数据也要做重新排队
                self.dataManager.lineUp();
            }
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
        } else if (!self._canRemoveAble && self._packingBag) {
            result = self._packingBag;
        } else {
            var HNT_cs = handleNodeTree.childNodes
            var index = 0;
            var len = HNT_cs.length;
            var node;
            do {
                node = NodeList[HNT_cs[index++].id].currentNode;
                if (node && (node.nodeType === 1 || node.nodeType === 3)) {
                    result = node.parentNode;
                }
            } while (!result && index < len)
        }
        return result;
    },
    touchOff: function(key) {
        var self = this,
            dataManager = self.dataManager,
            NodeList = self.NodeList;
        VI_session.touchHandleIdSet = {};

        // collect trigger stack
        VI_session.touchStacks = [];

        // if (key==="$PARENT.radio") {debugger};
        _bubbleTrigger.call(self, self._triggers._[key], NodeList, dataManager)

        // trigger trigger stack
        $.ftE(VI_session.touchStacks, function(eventStack) {
            $.ftE(eventStack, function(trigger) {
                trigger.event(NodeList, dataManager, /*trigger,*/ self._isAttr, self._id)
            })
        })
    },
    _buildSmart: function(sKey) {
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
                    sourceKey: sKey
                }
            );
        $.p(smartTriggers, smartTrigger);
        topGetterTriggerKeys && smartTrigger.bind(topGetterTriggerKeys); // topGetterTriggerKeys.push(baseKey, smartTrigger);
    },
    teleporter: function(viewInstance, telporterName) {
        var self = this;
        (telporterName === $UNDEFINED) && (telporterName = "index");
        var teleporter = self._teleporters[telporterName];
        if (teleporter) {
            if (teleporter.show_or_hidden !== $FALSE) {
                //remove old
                var old_viewInstance = teleporter.vi;
                old_viewInstance && old_viewInstance.remove();

                //insert new & save new
                viewInstance.insert(teleporter.ph);
            }
            teleporter.vi = viewInstance
        }
        return self;
    },
    collect: function() {
        var self = this;
        var dataManager = self.dataManager;
        dataManager.collect.apply(dataManager, arguments);
        return self;
    },
    subset: function() {
        var self = this;
        var dataManager = self.dataManager;
        dataManager.subset.apply(dataManager, arguments);
        return self;
    }
};
/*var _allEventNames = ("blur focus focusin focusout load resize" +
    "scroll unload click dblclick mousedown mouseup mousemove" +
    "mouseover mouseout mouseenter mouseleave change select" +
    "submit keydown keypress keyup error contextmenu").split(" ");
$.ftE(_allEventNames, function(eventName) {
    VI_proto[eventName] = function(fun) {
        return fun ? this.on(eventName, fun) : this.trigger(eventName);
    }
})*/
