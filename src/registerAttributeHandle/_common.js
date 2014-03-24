var _testDIV = fragment(), //$.D.cl(shadowDIV),
    _getAttrOuter = function(attrVM) {
        var NodeList = attrVM.NodeList;
        var topNode = attrVM.topNode();
        var result;
        //单个结果节点
        var single = $TRUE;
        //属性VM不支持Element节点，可直接变量出textNode
        $.E(attrVM.handleNodeTree.childNodes, function(handle) {
            if (handle.type === "text") {
                var nodeHandle = NodeList[handle.id];
                var currentNode = nodeHandle.currentNode;
                if (currentNode.parentNode === topNode) {
                    var data = nodeHandle._data || currentNode.data;
                }
                single ? (result = data) : (result += data);
                single = $FALSE;
            }
        });

        return result
    };
// _getAttrOuter = Function("n", "n=n.topNode();n=n." + (("textContent" in _testDIV) ? "textContent" : "innerText") + "||'';console.log(n);return n;");

var _AttributeHandleEvent = {
    event: function(key, currentNode, attrVM) { //on开头的事件绑定，IE需要绑定Function类型，现代浏览器绑定String类型（_AttributeHandleEvent.com）
        var attrOuter = _getAttrOuter(attrVM);
        try {
            var attrOuterEvent = Function(attrOuter); //尝试编译String类型数据
        } catch (e) {
            attrOuterEvent = $.noop; //失败使用空函数替代
        }
        currentNode.setAttribute(key, attrOuterEvent);
    },
    style: function(key, currentNode, attrVM) {
        var attrOuter = _getAttrOuter(attrVM);
        currentNode.style.cssText = attrOuter;
    },
    com: function(key, currentNode, attrVM) {
        var attrOuter = _getAttrOuter(attrVM);
        if (currentNode.getAttribute(key) !== attrOuter) {
            currentNode.setAttribute(key, attrOuter)
        }
    },
    dir: function(key, currentNode, attrVM) {
        var attrOuter = _getAttrOuter(attrVM);
        if (currentNode[key] !== attrOuter) {
            currentNode[key] = attrOuter;
        }
    },
    bool: function(key, currentNode, attrVM) {
        var attrOuter = _booleanFalseRegExp(_getAttrOuter(attrVM));
        if (attrOuter) { // currentNode.setAttribute(key, key);
            currentNode[key] = key;
        } else { // currentNode.removeAttribute(key);
            currentNode[key] = $FALSE;
        }
    },
    // checked:self.bool,
    radio: function(key, currentNode, attrVM) { //radio checked
        var attrOuter = _getAttrOuter(attrVM);
        if (attrOuter === currentNode.value) {
            currentNode[key] = attrOuter;
        } else {
            currentNode[key] = $FALSE;
        }
    }
};
var __bool = _AttributeHandleEvent.checked = _AttributeHandleEvent.bool;
if (_isIE) {
    var __radio = _AttributeHandleEvent.radio;
    _AttributeHandleEvent.radio = function(key, currentNode, attrVM) {
        var attrOuter = _booleanFalseRegExp(_getAttrOuter(attrVM));
        if (attrOuter === currentNode.value) {
            currentNode.defaultChecked = attrOuter;
        } else {
            currentNode.defaultChecked = $FALSE;
        }
        (this._attributeHandle = __radio)(key, currentNode, attrVM);
    }
    _AttributeHandleEvent.checked = function(key, currentNode, attrVM) {
        var attrOuter = _booleanFalseRegExp(_getAttrOuter(attrVM));
        if (attrOuter) {
            currentNode.defaultChecked = attrOuter;
        } else {
            currentNode.defaultChecked = $FALSE;
        }
        (this._attributeHandle = __bool)(key, currentNode, attrVM);
    }
}
