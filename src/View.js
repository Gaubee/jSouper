/*
 * View constructor
 */

function View(arg, vmName) {
    var self = this;
    if (!(self instanceof View)) {
        return new View(arg, vmName);
    }
    self.handleNodeTree = arg;
    self._handles = [];
    self._triggerTable = {};
    self.vmName = vmName;
    self.id = $.uid();

    // console.group(self.id);
    // console.log(vmName)
    _buildHandler(self);
    _buildTrigger(self);

    V._scansVMInit(arg.node, vmName);

    //缓存DOM工厂生产流水线
    _DOMFactory(self);
    return function(data, opction) {
        var id = $.uid();
        var finallyRunStacks = Model.session.finallyRunStacks;
        opction || (opction = {});

        //push mark
        finallyRunStacks.push(id)

        var vi = _create(self, data, opction.isAttr);

        //触发初始化事件，在finallyRun前运行，为了也在return前运行：
        //为了finallyRun可能触发的VM初始化。
        //有些VM的创建是判断一个缓存器中时候有实例对象，而此刻还没有return，
        //实例对象还没有进入缓存器，这时运行finallyRun，会造成空缓存器而判断错误，所以这里需要一个onInit事件机制，来做缓存器锁定
        opction.onInit && opction.onInit(vi);


        // vi.model.touchOff();
        // _jSouperBase.$JS.touchOff();

        //pop mark
        finallyRunStacks.pop();

        //last layer,and run finallyRun
        !finallyRunStacks.length && finallyRun();

        //在return前运行回调
        //在initVM前（text/vm所定义的），确定subset、collect等关系
        opction.callback && opction.callback(vi);

        if (self.vmName) {
            var viewModel_init = V.modulesInit[self.vmName];
            if (viewModel_init) {
                viewModel_init(vi);
            }
        }

        vi.model._privateModel && vi.model._privateModel.touchOff();

        return vi
    }
};

var _outerHTML = (function() {
    var _wrapDIV = fragment();
    var _tagHTML = function(node) {
        node = $.D.cl(node);
        _wrapDIV.appendChild(node);
        var outerHTMLStr = _wrapDIV.innerHTML;
        _wrapDIV.removeChild(node);

        return outerHTMLStr;
    }
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

var _isHTMLUnknownElement = (function(HUE) {
    var __knownElementTag = {};
    $.E("a abbr acronym address applet area b base basefont bdo big blockquote body br button caption center cite code col colgroup dd del dfn dir div dl dt em fieldset font form frame frameset head hr html i iframe img input ins kbd label legend li link map menu meta noframes noscript object ol optgroup option p param pre q s samp script select small span strike strong style sub sup table tbody td textarea tfoot th thead title tr tt u ul var marquee h1 h2 h3 h4 h5 h6 xmp plaintext listing nobr bgsound bas blink comment isindex multiple noframe person".split(" "), function(tagName, index) {
        __knownElementTag[tagName] = $TRUE;
    });
    var result;
    if (HUE) {
        result = function(tagName) {
            if (__knownElementTag[tagName] === $UNDEFINED) {
                __knownElementTag[tagName] = !(doc.createElement(tagName) instanceof HTMLUnknownElement);
            }
            return !__knownElementTag[tagName];
        }
    } else {
        result = function(tagName) {
            //maybe HTMLUnknownElement,IE7- can't konwn
            return !__knownElementTag[tagName];
        }
    }
    return result;
}(typeof HTMLUnknownElement === "function"));
var _unkonwnElementFix = {
    // "class": "className"
};

function _buildHandler(self) {
    var handles = self._handles;
    var handleNodeTree = self.handleNodeTree;
    _traversal(handleNodeTree, function(handle, index, parentHandle) {
        handle.parentNode = parentHandle;
        var node = handle.node;
        if (handle.type === "handle") {
            var handleHandle = V.handles[handle.handleName];
            if (handleHandle) {
                var handle = handleHandle(handle, index, parentHandle)
                handle && $.p(handles, handle);
            }
        } else if (handle.type === "element") {
            handle.tag = node.tagName.toLowerCase().replace(V.namespace.toLowerCase(), "");
        }
    });
};
var ignoreTagNameMap = {};
$.fI("script|pre|template|style|link".split("|"), function(value, key) {
    ignoreTagNameMap[value] = ignoreTagNameMap[value.toUpperCase()] = $TRUE;
})

function _buildTrigger(self) {
    var triggerTable = self._triggerTable;
    var handleNodeTree = self.handleNodeTree;
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
            var node = handle.node;
            handle.tag = node.tagName.toLowerCase().replace(V.namespace.toLowerCase(), "");
            if (ignoreTagNameMap[handle.tag]) {
                return $FALSE;
            }
            $.E($.s(node.attributes) /*.reverse()*/ , function(attr, i) {
                var value = attr.value,
                    name = attr.name;
                if (_templateMatchRule.test(value)) {
                    attributeHandle(name, value, node, handle, triggerTable);
                    node.removeAttribute(name);
                }
            });
            var nodeHTMLStr = _outerHTML(node);
            if (wrapMap.hasOwnProperty(handle.tag)) {
                var wrapStr = wrapMap[handle.tag];
                handle.tagDeep = wrapStr[0];
                handle.nodeStr = wrapStr[1] + nodeHTMLStr + wrapStr[2];
            } else {
                handle.nodeStr = nodeHTMLStr;
            }
            if (_isHTMLUnknownElement(handle.tag)) {

                (handle._unEleAttr = [])._ = {};
                //save attributes
                $.E(node.attributes, function(attr) {
                    //fix IE
                    var name = attr.name;
                    var value = node.getAttribute(name);
                    if (value === $NULL || value === "") { //fix IE6-8 is dif
                        name = _isIE && IEfix[name];
                        value = name && node.getAttribute(name);
                    }
                    //boolean\tabIndex should be save
                    //style shoule be handle alone
                    if (name && value !== $NULL && value !== "" && name !== "style") {
                        // console.log(name,value);
                        //be an Element, attribute's name may be diffrend;
                        name = (_isIE ? IEfix[name] : _unkonwnElementFix[name]) || name;
                        $.p(handle._unEleAttr, name);
                        handle._unEleAttr._[name] = value;
                        // console.log("saveAttribute:", name, " : ", value, "(" + name + ")");
                    }
                });
                //save style
                var cssText = node.style.cssText;
                if (cssText) {
                    handle._unEleAttr._["style"] = cssText;
                }
            }
        } else if (handle.type === "comment") { //Comment
            !handle.nodeStr && (handle.nodeStr = "<!--" + handle.node.data + "-->");
        } else { // textNode 
            //stringHandle:如果这个文本节点是绑定值的（父节点是处理函数节点），那么这个文本节点的默认渲染将是空
            handle.nodeStr === $UNDEFINED && (handle.nodeStr = handle.asArg ? "" : handle.node.data);
        }
    });
};

function _DOMFactory(self) {
    var NodeList = self.NodeList = {},
        topNode = self.handleNodeTree /*$.c(self.handleNodeTree)*/ ;
    //将id按数组存储，加速循环速度
    var nodeListIds = NodeList._ = [];
    NodeList._T = topNode.id;
    // topNode.currentNode = fragment("body");
    pushById(NodeList, topNode, nodeListIds);


    var catchNodes = self._catchNodes = [];
    var catchNodesStr = "";
    _traversal(topNode, function(handle, index, parentNode) {
        handle = pushById(NodeList, handle, nodeListIds);
        if (!handle.ignore) {
            var _unknownElementAttribute = handle._unEleAttr;
            if (_unknownElementAttribute) { //HTMLUnknownElement
                /*currentNode = doc.createElement(handle.tag);
                $.E(_unknownElementAttribute, function(attrName) {
                    // console.log("setAttribute:", attrName, " : ", _unknownElementAttribute._[attrName])
                    //直接使用赋值的话，非标准属性只会变成property而不是Attribute
                    // currentNode[attrName] = _unknownElementAttribute._[attrName];
                    currentNode.setAttribute(attrName, _unknownElementAttribute._[attrName]);
                })
                //set Style
                var cssText = _unknownElementAttribute._["style"];
                if (cssText) {
                    currentNode.style.cssText = cssText;
                }*/
            } else if ("nodeStr" in handle) {
                if (handle.type === "text") {
                    var currentNode = doc.createTextNode(handle.nodeStr);
                } else { //Element and comment
                    catchNodesStr += handle.nodeStr
                }
            } else { // ignored tagName 
                // if (handle.node.tagName === "SCRIPT") {
                //     currentNode = doc.createElement("script");
                //     //TODO:clone attribute;
                //     currentNode.text = handle.node.text;
                //     currentNode.src = handle.node.src;
                //     // console.log(scriptNode)
                //     handle.node.parentNode.replaceChild(currentNode, handle.node);
                // }else{
                // return;
                currentNode = $.D.cl(handle.node);
                // }
            }
            handle.currentNode = currentNode;

            $.p(catchNodes, {
                parentId: parentNode.id,
                currentId: handle.id
            })
        } else {
            //ignore Node's childNodes will be ignored too.
            //just create an instance
            _traversal(handle, function(handle) {
                $.p(nodeListIds, handle.id)
                pushById(NodeList, handle, nodeListIds);
            });
            return $FALSE
        }
    });
    self.catchNodesStr = catchNodesStr
}

function pushById(hashSet, item, arr) {
    var id = item.id
    if (!hashSet[id]) {
        hashSet[id] = item;
        $.p(arr, id);
    }
    return item;
};

function _create(self, data, isAttribute) { //data maybe basedata or model

    var catchNodes = self._catchNodes;
    var catchNodesStr = self.catchNodesStr;

    var NodeList = self.NodeList;
    var NodeList_of_ViewModel = {};
    $.E(NodeList._, function(hanldeNode_id) {
        //将节点进行包裹，使用原型读取
        NodeList_of_ViewModel[hanldeNode_id] = $.c(NodeList[hanldeNode_id]);
    });
    //生成顶层存储区
    NodeList_of_ViewModel[NodeList._T].currentNode = fragment("body");


    //createNode
    var nodeCollections = $.D.cs("<div>" + catchNodesStr + "</div>");

    var queryList = ViewModel.queryList;
    var queryMap = queryList._;

    $.E(catchNodes, function(nodeInfo) {
        var parentHandle = NodeList_of_ViewModel[nodeInfo.parentId];
        var parentNode = parentHandle.currentNode;
        var currentHandle = NodeList_of_ViewModel[nodeInfo.currentId];
        var currentNode = currentHandle.currentNode;
        var _unknownElementAttribute = currentHandle._unEleAttr;
        if (_unknownElementAttribute) {
            currentNode = doc.createElement(currentHandle.tag);
            $.E(_unknownElementAttribute, function(attrName) {
                // console.log("setAttribute:", attrName, " : ", _unknownElementAttribute._[attrName])
                //直接使用赋值的话，非标准属性只会变成property而不是Attribute
                // currentNode[attrName] = _unknownElementAttribute._[attrName];
                currentNode.setAttribute(attrName, _unknownElementAttribute._[attrName]);
            })
            //set Style
            var cssText = _unknownElementAttribute._["style"];
            if (cssText) {
                currentNode.style.cssText = cssText;
            }
        } else if (!currentNode) {
            currentNode = nodeCollections.firstChild;
            if (currentHandle.tagDeep) {
                switch (currentHandle.tagDeep) {
                    case 3:
                        currentNode = currentNode.lastChild;
                    case 2:
                        currentNode = currentNode.lastChild;
                    default: // case 1
                        currentNode = currentHandle.currentNode = currentNode.lastChild;
                        nodeCollections.removeChild(nodeCollections.firstChild);
                }
            }
        } else { // if(currentNode.nodeType===3) 文本节点、script节点等直接拷贝
            // console.log(currentNode.tagName);
            currentNode = $.D.cl(currentNode);
        }
        // if (!currentNode) debugger
        $.D.ap(parentNode, currentHandle.currentNode = currentNode);
        if (currentNode.nodeType === 1) {
            $.p(queryList, currentNode);
            queryMap[$.hashCode(currentNode)] = currentHandle;
        }
    })

    $.e(self._handles, function(handle) {
        handle.call(self, NodeList_of_ViewModel);
    });
    var result = new ViewModel(self.handleNodeTree, NodeList_of_ViewModel, self._triggerTable, data);
    result.vmName = self.vmName;
    return result;
};
