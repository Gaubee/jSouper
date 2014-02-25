/*
 * parse rule
 * 底层解析器，类Lisp语法规则，易于解析
 */
var placeholder = {
    "<": "&lt;",
    ">": "&gt;",
    "{": _placeholder(),
    "(": _placeholder(),
    ")": _placeholder(),
    "}": _placeholder()
},
    _Rg = function(s) {
        return RegExp(s, "g")
    },
    placeholderReg = {
        "<": /</g,
        ">": />/g,
        "/{": /\\\{/g,
        "{": _Rg(placeholder["{"]),
        "/(": /\\\(/g,
        "(": _Rg(placeholder["("]),
        "/)": /\\\)/g,
        ")": _Rg(placeholder[")"]),
        "/}": /\\\}/g,
        "}": _Rg(placeholder["}"])
    }, _head = /\{([\w\W]*?)\(/g,
    _footer = /\)[\s]*\}/g,
    _handle_type_argument_name = _placeholder("handle-"),
    parseRule = function(str) {
        var _handle_type_tagName;
        var parseStr = str
            .replace(/</g, placeholder["<"])
            .replace(/>/g, placeholder[">"])
            .replace(placeholderReg["/{"], placeholder["{"])
            .replace(placeholderReg["/("], placeholder["("])
            .replace(placeholderReg["/)"], placeholder[")"])
            .replace(placeholderReg["/}"], placeholder["}"])
        // .replace(_head, "<span type='handle' handle='$1'>")
        .replace(_head, function(match, handleName) {
            // console.log(arguments,"<span "+_handle_type_argument_name+"='handle' handle='"+handleName+"'>")
            _handle_type_tagName = "span";
            return "<span " + _handle_type_argument_name + "='handle' handle='" + handleName + "'>";
        })
        // .replace(_footer, "</span>")
        .replace(_footer, "</" + _handle_type_tagName + ">")
            .replace(placeholderReg["{"], "{")
            .replace(placeholderReg["("], "(")
            .replace(placeholderReg[")"], ")")
            .replace(placeholderReg["}"], "}");
        return parseStr;
    },
    _matchRule = /\{[\w\W]*?\([\w\W]*?\)[\s]*\}/,
    /*
     * expores function
     */

    V = {
        prefix: "bind-",
        namespace: "fix:",
        // _currentParsers: [],
        _nodeTree: function(htmlStr) {
            var _shadowBody = fragment( /*"body"*/ ); //$.D.cl(shadowBody);

            /*
             * 将所有HTML标签加上命名空间，不让浏览器解析默认语言
             */
            //将可能误导解析的元素全部排除
            //字符串、script标签
            var quotedString = [];
            var scriptNodeString = [];
            var start_ns = "<" + V.namespace;
            var end_ns = "</" + V.namespace;
            var Placeholder = "_" + Math.random(),
                ScriptPlaceholder = "_" + Math.random(),
                //备份字符串与script、XMP标签
                htmlStr = htmlStr.replace(QuotedString, function(qs) {
                    quotedString.push(qs)
                    return Placeholder;
                }).replace(ScriptNodeString, function(sns) {
                    scriptNodeString.push(sns);
                    return ScriptPlaceholder;
                })
                //为无命名空间的标签加上前缀
                .replace(/<[\/]{0,1}([\w:]+)/g, function(html, tag) {
                    //排除：带命名空间、独立标签
                    if (tag.indexOf(":") === -1 && "|area|br|col|embed|hr|img|input|link|meta|param|".indexOf("|" + tag.toLowerCase() + "|") === -1) {
                        html = (html.charAt(1) === "/" ? end_ns : start_ns) + tag;
                    }
                    return html;
                })
                //回滚字符串与script、XMP标签
                .replace(RegExp(ScriptPlaceholder, "g"), function(p) {
                    return scriptNodeString.shift();
                }).replace(RegExp(Placeholder, "g"), function(p) {
                    return quotedString.shift();
                });

            //使用浏览器默认解析力解析标签树，保证HTML的松语意
            _shadowBody.innerHTML = htmlStr;

            //递归过滤
            //在ElementHandle(_shadowBody)前扫描，因为在ElementHandle会将模板语法过滤掉
            //到时候innerHTML就取不到完整的模板语法了，只留下DOM结构的残骸
            V._scansView(_shadowBody);

            //提取所有文本节点，特殊标签（script、style等）除外
            //将文本节点尝试当成模板语意进行解析，保存在insertNodesHTML中
            //扫描过程中不宜对节点进行操作，因此缓存完后统一处理
            var insertBefore = [];
            _traversal(_shadowBody, function(node, index, parentNode) {
                if (node.nodeType === 1 && ignoreTagNameMap[node.tagName]) {
                    return $FALSE;
                }
                if (node.nodeType === 3) { //text Node
                    $.p(insertBefore, {
                        baseNode: node,
                        parentNode: parentNode,
                        insertNodesHTML: parseRule(node.data)
                    });
                }
            });
            //统一处理模板语意
            $.e(insertBefore, function(item, i) {
                var node = item.baseNode,
                    parentNode = item.parentNode,
                    insertNodesHTML = item.insertNodesHTML;
                if (node.data === insertNodesHTML) {
                    //普通文本做简答处理即可
                    node.data = insertNodesHTML.replace(/^[\s\n]\s*/, ' ');
                } else {
                    //使用浏览器默认功能，将XML转化为JS-Object，TODO：有待优化，应该直接使用JSON进行转化
                    shadowDIV.innerHTML = $.trim(insertNodesHTML); //optimization
                    //Using innerHTML rendering is complete immediate operation DOM, 
                    //innerHTML otherwise covered again, the node if it is not, 
                    //then memory leaks, IE can not get to the full node.
                    $.e(shadowDIV.childNodes, function(refNode) {
                        //现代浏览器XMP标签中，空格和回车总是不过滤的显示，和浏览器默认效果不一致，手动格式化
                        if (refNode.nodeType === 3) {
                            refNode.data = refNode.data.replace(/^[\s\n]\s*/, ' ');
                        }
                        //将模板语意节点插入
                        $.D.iB(parentNode, refNode, node)
                    })
                    $.D.rC(parentNode, node);
                }
            });
            //when re-rendering,select node's child will be filter by ``` _shadowBody.innerHTML = _shadowBody.innerHTML;```
            return new ElementHandle(_shadowBody);
        },
        _scansView: function(node, vmName) {
            node || (node = doc);
            //想解析子模块
            var xmps = $.s(node.getElementsByTagName("xmp"));
            Array.prototype.push.apply(xmps, $.s(node.getElementsByTagName(V.namespace + "xmp")));
            $.E(xmps, function(tplNode) {
                var type = tplNode.getAttribute("type");
                var name = tplNode.getAttribute("name");
                if (name) {
                    if (type === "template") {
                        V.modules[name] = jSouper.parseStr(tplNode.innerHTML, name);
                        $.D.rm(tplNode);
                    }
                }
            });

            return node;
        },
        _scansVMInit: function(node, vmName) {
            node || (node = doc);

            $.e(node.getElementsByTagName("script"), function(scriptNode) {
                var type = scriptNode.getAttribute("type");
                var name = scriptNode.getAttribute("name");
                if (name && type === "text/template") {
                    V.modules[name] = jSouper.parseStr(scriptNode.text, name);
                    $.D.rm(scriptNode);
                } else if (type === "text/vm") {
                    if (!name && vmName) {
                        //如果是最顶层的匿名script节点，则默认为当前解析中的View的initVM函数
                        if (!scriptNode.parentNode.parentNode.parentNode) { //null=>document-fragment=>wrap-div=>current-scriptNode
                            name = vmName;
                        }
                    }
                    if (name) {
                        try {
                            V.modulesInit[name] = Function("return " + $.trim(scriptNode.text))();
                            $.D.rm(scriptNode);
                        } catch (e) {
                            console.error(e);
                        }
                    }
                }
            });
            return node;
        },
        parse: function(htmlStr, name) {
            // $.p(V._currentParsers, name);
            var result = View(V._nodeTree(htmlStr), name);
            // V._currentParsers.pop();
            return result;
        },
        rt: function(handleName, triggerFactory) {
            return V.triggers[handleName] = triggerFactory;
        },
        rh: function(handleName, handle) {
            return V.handles[handleName] = handle
        },
        ra: function(match, handle) {
            var attrHandle = V.attrHandles[V.attrHandles.length] = {
                match: $NULL,
                handle: handle
            }
            if (typeof match === "function") {
                attrHandle.match = match;
            } else {
                attrHandle.match = function(attrKey) {
                    return attrKey === match;
                }
            }
        },
        triggers: {},
        handles: {},
        attrHandles: [],
        modules: {},
        modulesInit: {},
        attrModules: {},
        eachModules: {},
        withModules: {},
        _instances: {},

        // Proto: DynamicComputed /*Proto*/ ,
        Model: Model
    };
