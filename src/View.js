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

        var vi = _create(self, data, opction);

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

        var privateModel = vi.model._ppModel;
        privateModel && privateModel.touchOff();

        return vi
    }
};

var _outerHTML = (function() {
    var _wrapDIV = fragment();
    var _tagHTML = function(node) {
        node = $.D.cl(node);
        $.D.ap(_wrapDIV, node);
        // _wrapDIV.appendChild(node);
        var outerHTMLStr = _wrapDIV.innerHTML;
        $.D.rm(node);
        // _wrapDIV.removeChild(node);

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
                var _ele = doc.createElement(tagName);
                __knownElementTag[tagName] = _ele.tagName.toLowerCase() === tagName && !(_ele instanceof HTMLUnknownElement);
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

var _svgNS = {
    xlink: "http://www.w3.org/1999/xlink"
};
var _svgTag = {};
var _svgTagStr = "svg image rect circle ellipse line polyline polygon path filter feBlend feColorMatrix feComponentTransfer feComposite feConvolveMatrix feDiffuseLighting feDisplacementMap feFlood feGaussianBlur feImage feMerge feMorphology feOffset feSpecularLighting feTile feTurbulence feDistantLight fePointLight feSpotLight defs feGaussianBlur linearGradient radialGradient";
var _isSvgElement = (function() {
    var __svgElementTag = {};
    $.E(_svgTagStr.split(" "), function(tagName, index) {
        var lowerTagName = tagName.toLowerCase();
        __svgElementTag[lowerTagName] = $TRUE;
        _svgTag[lowerTagName] = tagName;
    });
    return function(tagName) {
        return __svgElementTag[tagName];
    }
}());

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
$.fI("script|pre|style|link".split("|"), function(value, key) {
    ignoreTagNameMap[value] = ignoreTagNameMap[value.toUpperCase()] = $TRUE;
});

function _buildTrigger(self) {
    var triggerTable = self._triggerTable;
    var handleNodeTree = self.handleNodeTree;
    _traversal(handleNodeTree, function(handle, index, parentHandle) {
        if (handle.type === "handle") {
            var triggerFactory = V.triggers[handle.handleName];
            if (triggerFactory) {
                var trigger = triggerFactory(handle, index, parentHandle);
                if (trigger) {
                    var keys = trigger.key || (trigger.key = "");
                    trigger.handleId = trigger.handleId || handle.id;
                    $.E($.isA(keys) ? keys : [keys], function(key) {
                        //unshift list and In order to achieve the trigger can be simulated bubble
                        $.us((triggerTable[key] || (triggerTable[key] = [])), trigger); //Storage as key -> array
                        $.p(handle._triggers, trigger); //Storage as array
                    });
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
                // console.info(name, value, _templateMatchRule.test(value) || _matchRule.test(value));
                //模板语言或者底层语言皆可触发绑定，不可用test，不然lastIndex不能清空会出问题
                if (value.match(_templateMatchRule) || value.match(_matchRule)) {
                    attributeHandle(name, value, node, handle, triggerTable);
                    node.removeAttribute(name);
                } else if (name.indexOf(V.prefix) === 0) {
                    name = _fixAttrKey(name);
                    node.removeAttribute(name);
                    if (name === "style") {
                        node.style.cssText = value;
                    } else {
                        node.setAttribute(name, value);
                    }
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
            //svg 属于 HTMLUnknownElement

            if (_isHTMLUnknownElement(handle.tag)) {
                //保存非绑定式的属性，因为无法直接通过innerHTML克隆，所以需要用createElement
                var eleAttr = [];
                eleAttr._ = {};
                handle._isSvg = _isSvgElement(handle.tag);
                handle._unEleAttr = eleAttr;
                //save attributes
                $.E($.s(node.attributes), function(attr) {
                    //fix IE
                    var name = attr.name;
                    var value = node.getAttribute(name);
                    if (value === $NULL || value === "") { //fix IE6-8 is dif
                        name = _isIE && IEfix[name];
                        value = name && node.getAttribute(name);
                    }
                    //boolean\tabIndex should be save
                    //style shoule be handle alone
                    if (name && value !== $NULL && value !== "" /*&& name !== "style"*/ ) {
                        // console.log(name,value);
                        //be an Element, attribute's name may be diffrend;
                        name = (_isIE ? IEfix[name] : _unkonwnElementFix[name]) || name;
                        var ns = $.st(name, ":");
                        if (handle._isSvg && ns) {
                            name = _split_laveStr;
                            value = {
                                ns: _svgNS[ns] || null,
                                v: value
                            }
                        }
                        $.p(eleAttr, name);
                        eleAttr._[name] = value;
                        // console.log("saveAttribute:", name, " : ", value, "(" + name + ")");
                    }
                });
                //当style格式有问题时，可能带表达式，IE系列必须加前缀才能实现避免解析。
                //这里的保存只是保持写在style中的正常样式，非绑定格式
                //save style
                var cssText = node.style.cssText;
                if (cssText) {
                    // console.log(cssText);
                    eleAttr._.style = cssText;
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

function _create(self, data, opts) { //data maybe basedata or model

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
            if (currentHandle._isSvg) {
                currentNode = doc.createElementNS("http://www.w3.org/2000/svg", _svgTag[currentHandle.tag]);
                $.E(_unknownElementAttribute, function(attrName) {
                    var _attr_info = _unknownElementAttribute._[attrName];
                    if (_attr_info.v) {
                        // console.log(_attr_info.ns,attrName,_attr_info.v);
                        currentNode.setAttributeNS(_attr_info.ns, attrName, _attr_info.v);
                    } else {
                        // console.log(attrName,_attr_info);
                        currentNode.setAttribute(attrName, _attr_info);
                    }
                });
            } else {
                currentNode = doc.createElement(currentHandle.tag);
                $.E(_unknownElementAttribute, function(attrName) {
                    // console.log("setAttribute:", attrName, " : ", _unknownElementAttribute._[attrName])
                    //直接使用赋值的话，非标准属性只会变成property而不是Attribute
                    // currentNode[attrName] = _unknownElementAttribute._[attrName];
                    currentNode.setAttribute(attrName, _unknownElementAttribute._[attrName]);
                });
            }
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
    var result = new ViewModel(self.handleNodeTree, NodeList_of_ViewModel, self._triggerTable, data, opts, self.vmName);
    return result;
};
