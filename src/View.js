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
    return function(data, isAttribute) {
        var id = $.uid();
        var finallyRunStacks = Model.session.finallyRunStacks;

        //push mark
        finallyRunStacks.push(id)

        var vi = _create(self, data, isAttribute);

        //TODO:create with callback then getTop.touchOff
        vi.model.getTop().touchOff();

        //pop mark
        finallyRunStacks.pop();

        //last layer,and run finallyRun
        !finallyRunStacks.length && finallyRun();

        // console.log(self.id)
        // console.groupEnd(self.id)
        if (self.vmName) {
            var viewModel_init = V.modulesInit[self.vmName];
            if (viewModel_init) {
                viewModel_init(vi);
            }
        }
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

var _isHTMLUnknownElement = typeof HTMLUnknownElement === "function" ? function(tagName) {
        return doc.createElement(tagName) instanceof HTMLUnknownElement;
    } : function(tagName) {
        //maybe HTMLUnknownElement,IE7- can't konwn
        return " a abbr acronym address applet area b base basefont bdo big blockquote body br button caption center cite code col colgroup dd del dfn dir div dl dt em fieldset font form frame frameset head hr html i iframe img input ins kbd label legend li link map menu meta noframes noscript object ol optgroup option p param pre q s samp script select small span strike strong style sub sup table tbody td textarea tfoot th thead title tr tt u ul var marquee h1 h2 h3 h4 h5 h6 xmp plaintext listing nobr bgsound bas blink comment isindex multiple noframe person ".indexOf(" " + tagName + " ") === -1;
    };

function _buildHandler(self) {
    var handles = self._handles;
    var handleNodeTree = self.handleNodeTree;
    _traversal(handleNodeTree, function(handle, index, parentHandle) {
        handle.parentNode = parentHandle;
        var node = handle.node;
        if (handle.type === "handle") {
            var handleFactory = V.handles[handle.handleName];
            if (handleFactory) {
                var handle = handleFactory(handle, index, parentHandle)
                handle && $.p(handles, handle);
            }
        } else if (handle.type === "element") {
            handle.tag = node.tagName.toLowerCase().replace(V.namespace.toLowerCase(), "");
            if (_isHTMLUnknownElement(handle.tag)) {
                // console.log(handle.tag);
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
                        //be an Element, attribute's name may be diffrend;
                        name = (_isIE && IEfix[name]) || name;
                        $.p(handle._unEleAttr, name);
                        handle._unEleAttr._[name] = value;
                        // console.log("saveAttribute:", name, " : ", value, "(" + name + ")");
                    }
                });
                //save style
                if (node.style.getAttribute) {
                    var cssText = node.style.getAttribute("cssText");
                    if (cssText) {
                        handle._unEleAttr._["style"] = cssText;
                    }
                } else {
                    //unKnown Element
                    cssText = node.style.cssText;
                    if (cssText) {
                        handle._unEleAttr._["style.cssText"] = cssText;
                    }
                }
            }
        }
    });
};
var _attrRegExp = /(\S+)=["']?((?:.(?!["']?\s+(?:\S+)=|[>"']))+.)["']?/g;
var ignoreTagName = "SCRIPT|PRE|TEMPLATE|STYLE|LINK".split("|");

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
            if ($.iO(ignoreTagName, handle.node.tagName) !== -1) {
                return $FALSE;
            }
            var node = handle.node;
            // var attrs = nodeHTMLStr.match(_attrRegExp);
            $.e(node.attributes, function(attr, i) {
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
        } else if (handle.type === "comment") { //Comment
            !handle.nodeStr && (handle.nodeStr = "<!--" + handle.node.data + "-->");
        } else { // textNode 
            //stringHandle:如果这个文本节点是绑定值的（父节点是处理函数节点），那么这个文本节点的默认渲染将是空
            handle.nodeStr === $UNDEFINED && (handle.nodeStr = handle.asArg ? "" : handle.node.data);
        }
    });
};

//
function pushById(arr, item) {
    arr[item.id] = item;
    return item;
};

function _create(self, data, isAttribute) { //data maybe basedata or model
    //save newDOM  without the most top of parentNode -- change with append!!
    var NodeList_of_ViewModel = {},
        topNode = $.c(self.handleNodeTree);
    topNode.currentNode = fragment("body");
    pushById(NodeList_of_ViewModel, topNode);

    var catchNodes = [];
    var catchNodesStr = "";
    _traversal(topNode, function(handle, index, parentNode) {
        handle = pushById(NodeList_of_ViewModel, $.c(handle));
        if (!handle.ignore) {
            var _unknownElementAttribute = handle._unEleAttr;
            if (_unknownElementAttribute) { //HTMLUnknownElement
                currentNode = doc.createElement(handle.tag);
                $.E(_unknownElementAttribute, function(attrName) {
                    // console.log("setAttribute:", attrName, " : ", _unknownElementAttribute._[attrName])
                    currentNode[attrName] = _unknownElementAttribute._[attrName];
                })
                //set Style
                var cssText = _unknownElementAttribute._["style"];
                if (cssText) {
                    currentNode.style.setAttribute('cssText', cssText);
                }
                //set unKnownElementStyle
                cssText = _unknownElementAttribute._["style.cssText"];
                if (cssText) {
                    currentNode.style.cssText = cssText;
                }
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
                pushById(NodeList_of_ViewModel, $.c(handle));
            });
            return $FALSE
        }
    });

    //createNode
    var nodeCollections = $.D.cs("<div>" + catchNodesStr + "</div>")

    $.E(catchNodes, function(nodeInfo) {
        var parentHandle = NodeList_of_ViewModel[nodeInfo.parentId];
        var parentNode = parentHandle.currentNode;
        var currentHandle = NodeList_of_ViewModel[nodeInfo.currentId];
        var currentNode = currentHandle.currentNode;
        if (!currentNode) {
            currentNode = currentHandle.currentNode = nodeCollections.firstChild;
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
        }
        $.D.ap(parentNode, currentNode);
    })

    $.e(self._handles, function(handle) {
        handle.call(self, NodeList_of_ViewModel);
    });
    var result = new ViewModel(self.handleNodeTree, NodeList_of_ViewModel, self._triggerTable, data);
    result.vmName = self.vmName;
    return result;
};
