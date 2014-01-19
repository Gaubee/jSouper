/*
 * View Instance constructor
 */

(function() { //DM_extends_fot_VI
    var _rebuildTree = DM_proto.rebuildTree;
    DM_proto.rebuildTree = function() {
        var self = this,
            DMSet = self._subsetModels;
        $.E(self._viewModels, function(childViewModel) {
            $.E(childViewModel._smartTriggers, function(smartTrigger) {
                var TEMP = smartTrigger.TEMP;
                TEMP.viewModel.get(TEMP.sourceKey);
                var topGetter = Model.session.topGetter,
                    currentTopGetter = Model.get(TEMP.dm_id),
                    matchKey = Model.session.filterKey || "";
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
        $.E(self._subsetModels, function(childModel) {
            childModel.rebuildTree()
        })
        return _rebuildTree.call(self);
    }
    var _collect = DM_proto.collect;
    DM_proto.collect = function(viewModel) {
        var self = this;
        if (viewModel instanceof Model) {
            _collect.call(self, viewModel);
            //TODO:release memory.
        } else if (viewModel instanceof ViewModel) {
            var vi_DM = viewModel.model;
            if (!vi_DM) { // for VI init in constructor
                vi_DM = viewModel.model = self;
                var viewModelTriggers = viewModel._triggers
                $.E(viewModelTriggers, function(sKey) {
                    viewModel._buildSmart(sKey);
                });
            }

            //to rebuildTree => remark smartyKeys
            $.p(self._viewModels, viewModel);

            _collect.call(self, vi_DM) //self collect self will Forced triggered updates
        }
        return self;
    };
    var _subset = DM_proto.subset;
    DM_proto.subset = function(viewModel, prefix) {
        var self = this;

        if (viewModel instanceof Model) {
            _subset.call(self, viewModel, prefix);
        } else {

            var vi_DM = viewModel.model;
            if (!vi_DM) {
                vi_DM = Model();
                //收集触发器
                vi_DM.collect(viewModel);
            }
            _subset.call(self, vi_DM, prefix);
        }
    };
}());

var stopTriggerBubble; // = $FALSE;

function ViewModel(handleNodeTree, NodeList, triggerTable, model) {
    if (!(this instanceof ViewModel)) {
        return new ViewModel(handleNodeTree, NodeList, triggerTable, model);
    }
    var self = this;
    self._isAttr = $FALSE; //if no null --> Storage the attribute key and current.
    self._isEach = $FALSE; //if no null --> Storage the attribute key and current.
    self.model; //= model;
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

    if (!(model instanceof Model)) {
        model = Model(model);
    }
    self._smartTriggers = [];

    //bind viewModel with DataManger
    model.collect(self); //touchOff All triggers

    //console.group(self._id,"touchOff .")
    stopTriggerBubble = $TRUE;
    self.touchOff("."); //const value
    stopTriggerBubble = $FALSE;
    //console.groupEnd(self._id,"touchOff .")
};

var VI_session = ViewModel.session = {
    touchHandleIdSet: $NULL,
    touchStacks: $NULL
};

function _bubbleTrigger(tiggerCollection, NodeList, model /*, eventTrigger*/ ) {
    var self = this, // result,
        eventStack = [],
        touchStacks = VI_session.touchStacks,
        touchHandleIdSet = VI_session.touchHandleIdSet;
    $.p(touchStacks, eventStack); //Add a new layer event collector
    $.e(tiggerCollection, function(trigger) { //TODO:测试参数长度和效率的平衡点，减少参数传递的数量
        if (!touchHandleIdSet[trigger.handleId]) { //To prevent repeated collection
            $.p(eventStack, trigger) //collect trigger
            if ( /*result !== $FALSE &&*/ trigger.bubble && !stopTriggerBubble) {
                // Stop using the `return false` to prevent bubble triggered
                // need to use `this. Mercifully = false` to control
                var parentNode = NodeList[trigger.handleId].parentNode;
                parentNode && _bubbleTrigger.call(self, parentNode._triggers, NodeList, model /*, trigger*/ );
            }
            touchHandleIdSet[trigger.handleId] = $TRUE;
        }
        /*else{
            console.log(trigger.handleId)
        }*/
    });

};

function _moveChild(self, el) {
    var AllEachViewModel = self._AVI,
        AllLayoutViewModel = self._ALVI,
        AllWithViewModel = self._WVI;

    self.topNode(el);

    $.E(self.NodeList[self.handleNodeTree.id].childNodes, function(child_node) {
        var viewModel,
            arrayViewModels,
            id = child_node.id;
        if (viewModel = (AllLayoutViewModel[child_node.id] || AllWithViewModel[child_node.id])) {
            _moveChild(viewModel, el)
        } else if (arrayViewModels = AllEachViewModel[id]) {
            $.E(arrayViewModels, function(viewModel) {
                _moveChild(viewModel, el);
            })
        }
    });
};

var fr = doc.createDocumentFragment();

var VI_proto = ViewModel.prototype = {
    destroy: function() {
        var self = this;
        //TODO:delete node
        self.remove();
        return null;
    },
    append: function(el) {
        var self = this,
            currentTopNode = self.topNode();

        $.e(currentTopNode.childNodes, function(child_node) {
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

        $.e(currentTopNode.childNodes, function(child_node) {
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
                self._arrayVI.splice(self.model._index, 1)
                $.p(self._arrayVI, self);

                //相应的DM以及数据也要做重新排队
                self.model.lineUp();
            }
        }
        return self;
    },
    get: function get() {
        var dm = this.model;
        return dm.get.apply(dm, arguments /*$.s(arguments)*/ );
    },
    mix: function mix() {
        var dm = this.model;
        return dm.mix.apply(dm, arguments /*$.s(arguments)*/ )
    },
    set: function set() {
        var dm = this.model;
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
            if (HNT_cs.length) {
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
        }
        if (!result) {
        	result = NodeList[handleNodeTree.id].currentNode;
        }
        return result;
    },
    touchOff: function(key) {
        var self = this,
            model = self.model,
            NodeList = self.NodeList;
        VI_session.touchHandleIdSet = {};

        // collect trigger stack
        VI_session.touchStacks = [];

        // if (key==="$PARENT.radio") {debugger};
        _bubbleTrigger.call(self, self._triggers._[key], NodeList, model)

        // trigger trigger stack
        $.E(VI_session.touchStacks, function(eventStack) {
            $.E(eventStack, function(trigger) {
                trigger.event(NodeList, model, /*trigger,*/ self._isAttr, self._id)
            })
        })
    },
    _buildSmart: function(sKey) {
        var self = this,
            model = self.model,
            smartTriggers = self._smartTriggers;
        model.get(sKey);
        var baseKey = Model.session.filterKey,
            topGetterTriggerKeys = Model.session.topGetter && Model.session.topGetter._triggerKeys,
            smartTrigger = new SmartTriggerHandle(
                baseKey || (baseKey = ""), //match key

                function(smartTriggerSet) {
                    self.touchOff(sKey);
                }, { //TEMP data
                    viewModel: self,
                    dm_id: model.id,
                    sourceKey: sKey
                }
            );
        $.p(smartTriggers, smartTrigger);
        topGetterTriggerKeys && smartTrigger.bind(topGetterTriggerKeys); // topGetterTriggerKeys.push(baseKey, smartTrigger);
    },
    teleporter: function(viewModel, telporterName) {
        var self = this;
        (telporterName === $UNDEFINED) && (telporterName = "index");
        var teleporter = self._teleporters[telporterName];
        if (teleporter) {
            if (teleporter.show_or_hidden !== $FALSE) {
                //remove old
                var old_viewModel = teleporter.vi;
                old_viewModel && old_viewModel.remove();

                //insert new & save new
                viewModel.insert(teleporter.ph);
            }
            teleporter.vi = viewModel
        }
        return self;
    },
    collect: function() {
        var self = this;
        var model = self.model;
        model.collect.apply(model, arguments);
        return self;
    },
    subset: function() {
        var self = this;
        var model = self.model;
        model.subset.apply(model, arguments);
        return self;
    }
};
/*var _allEventNames = ("blur focus focusin focusout load resize" +
    "scroll unload click dblclick mousedown mouseup mousemove" +
    "mouseover mouseout mouseenter mouseleave change select" +
    "submit keydown keypress keyup error contextmenu").split(" ");
$.E(_allEventNames, function(eventName) {
    VI_proto[eventName] = function(fun) {
        return fun ? this.on(eventName, fun) : this.trigger(eventName);
    }
})*/
