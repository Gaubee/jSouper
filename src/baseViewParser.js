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
            jSouper.scans(_shadowBody);
            // console.log(htmlStr)
            var insertBefore = [];
            _traversal(_shadowBody, function(node, index, parentNode) {
                if (node.nodeType === 1 && $.iO(ignoreTagName, node.tagName) !== -1) {
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
            $.e(insertBefore, function(item, i) {
                var node = item.baseNode,
                    parentNode = item.parentNode,
                    insertNodesHTML = item.insertNodesHTML;
                shadowDIV.innerHTML = $.trim(insertNodesHTML); //optimization
                //Using innerHTML rendering is complete immediate operation DOM, 
                //innerHTML otherwise covered again, the node if it is not, 
                //then memory leaks, IE can not get to the full node.
                $.e(shadowDIV.childNodes, function(refNode) {
                    //现代浏览器XMP标签中，空格和回车总是不过滤的显示，和浏览器默认效果不一致，手动格式化
                    if (refNode.nodeType === 3) {
                        refNode.data = refNode.data.replace(/^[\s\n]\s*/, ' ');
                    }
                    $.D.iB(parentNode, refNode, node)
                })
                $.D.rC(parentNode, node);
            });
            //when re-rendering,select node's child will be filter by ``` _shadowBody.innerHTML = _shadowBody.innerHTML;```
            return new ElementHandle(_shadowBody);
        },
        parse: function(htmlStr, name) {
            return View(this._nodeTree(htmlStr), name);
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
