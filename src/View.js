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
    //  var _tagHTML = function(node) {
    //      return node.outerHTML.replace(node.innerHTML, "");
    //  }
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
            handle.tag = node.tagName.toLowerCase().replace(V.namespace.toLowerCase(), "");
            if (wrapMap.hasOwnProperty(handle.tag)) {
                var wrapStr = wrapMap[handle.tag];
                handle.tagDeep = wrapStr[0];
                handle.nodeStr = wrapStr[1] + nodeHTMLStr + wrapStr[2];
            } else {
                handle.nodeStr = nodeHTMLStr;
            }
            $.fE(node.attributes, function(attr, i) {
                var value = attr.value,
                    name = attr.name;
                if (_templateMatchRule.test(value)) {
                    attributeHandle(name, value, node, handle, triggerTable);
                    node.removeAttribute(name);
                }
            })
        } else if(handle.type === "comment"){//Comment
           !handle.nodeStr&&( handle.nodeStr = "<!--" + handle.node.data + "-->");
        }else{ // textNode 
            //stringHandle:如果这个文本节点是绑定值的（父节点是处理函数节点），那么这个文本节点的默认渲染将是空
            handle.nodeStr===$UNDEFINED&&(handle.nodeStr = handle.asArg?"":handle.node.data);
        }
    });
};

function _create(data) { //data maybe basedata or dataManager
    var self = this,
        NodeList_of_ViewInstance = {}, //save newDOM  without the most top of parentNode -- change with append!!
        topNode = $.c(self.handleNodeTree);
    topNode.currentNode = fragment("body"); //$.D.cl(shadowBody);
    $.pI(NodeList_of_ViewInstance, topNode);

    var catchNodes = [];
    var catchNodesStr = "";
    _traversal(topNode, function(handle, index, parentNode) {
        handle = $.pI(NodeList_of_ViewInstance, $.c(handle));
        if (!handle.ignore) {
            if ("nodeStr" in handle) {
                if (handle.type === "text") {
                    var currentNode = doc.createTextNode(handle.nodeStr);
                }
                /*else if (wrapMap.hasOwnProperty(handle.tag)) {
                    currentNode = $.D.cs(handle.nodeStr);
                } */else { //Element and comment 
                    catchNodesStr += handle.nodeStr
                }
            } else {
                currentNode = $.D.cl(handle.node);
            }
            handle.currentNode = currentNode;

            $.p(catchNodes, {
                parentId: parentNode.id,
                currentId: handle.id
            })
            // $.D.ap(NodeList_of_ViewInstance[parentNode.id].currentNode /*|| topNode.currentNode*/ , currentNode);
        } else {
            //ignore Node's childNodes will be ignored too.
            _traversal(handle, function(handle) {
                /*handle = */$.pI(NodeList_of_ViewInstance, $.c(handle));
            });
            return $FALSE
        }
    });

    var nodeCollections = $.D.cs("<div>" + catchNodesStr + "</div>")

    $.ftE(catchNodes, function(nodeInfo) {
        var parentHandle = NodeList_of_ViewInstance[nodeInfo.parentId];
        var parentNode = parentHandle.currentNode;
        var currentHandle = NodeList_of_ViewInstance[nodeInfo.currentId];
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
                        currentHandle.currentNode = currentNode.lastChild;
                        nodeCollections.removeChild(nodeCollections.firstChild);
                }
            }
        }
        try {
            $.D.ap(parentNode, currentNode);
        } catch (e) {
            //maybe HTMLUnknownElement,IE7- can't konwn
            // if (parentNode instanceof HTMLUnknownElement) {
            //it Must be empty
            var new_parentNode = parentHandle.currentNode = doc.createElement(parentHandle.tag);
            //clone attributes
            $.ftE(parentNode.attributes, function(attr) {
                //fix IE
                // try {
                var name = IEfix[attr.name] || attr.name;
                var value = parentNode.getAttribute(name);
                if (value !== $NULL && value !== "") {
                    new_parentNode[name] = value;
                }
                // } catch (e) {
                //     // alert(attr.name+":"+attr.value)
                // }
                // new_parentNode.setAttribute(/*IEfix[attr.name] ||*/ attr.name, attr.value);
            })
            var p_parentNode = parentNode.parentNode;
            if (p_parentNode) {
                $.D.re(p_parentNode, new_parentNode, parentNode)
            }
            // alert(new_parentNode.outerHTML);
            // if (currentNode===null) {debugger};
            $.D.ap(new_parentNode, currentNode);
            // }
        }
    })

    $.fE(self._handles, function(handle) {
        handle.call(self, NodeList_of_ViewInstance);
    });
    return ViewInstance(self.handleNodeTree, NodeList_of_ViewInstance, self._triggerTable, data);
};
