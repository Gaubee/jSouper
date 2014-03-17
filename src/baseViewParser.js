/*
 * parse rule
 * 底层解析器，类Lisp语法规则，易于解析
 */

// DoubleQuotedString = /"(?:\.|(\\\")|[^\""\n])*"/g, //双引号字符串
// SingleQuotedString = /'(?:\.|(\\\')|[^\''\n])*'/g, //单引号字符串
var QuotedString = /"(?:\.|(\\\")|[^\""\n])*"|'(?:\.|(\\\')|[^\''\n])*'/g, //引号字符串
    ScriptNodeString = /<script[^>]*>([\s\S]*?)<\/script>/gi,
    StyleNodeString = /<style[^>]*>([\s\S]*?)<\/style>/gi;
// XmpNodeString = /<xmp[^>]*>([\s\S]*?)<\/xmp>/gi,

//用于抽离字符串的中特定的字符来避免解析，完成后可以回退这些字符串
var _string_placeholder = {
    save: function(regExp_placeholder, str) {
        var map = this.maps[regExp_placeholder] = {
            ph: _placeholder("_v"),
            strs: []
        };
        var strings = map.strs;
        var placeholder = map.ph;
        str = str.replace(regExp_placeholder, function(matchStr) {
            $.p(strings, matchStr);
            return placeholder;
        });
        return str;
    },
    maps: {},
    release: function(regExp_placeholder, str) {
        if (this.maps.hasOwnProperty(regExp_placeholder)) {
            var map = this.maps[regExp_placeholder];
            var strings = map.strs;
            var placeholder = map.ph;
            str = str.replace(RegExp(placeholder, "g"), function(ph) {
                return strings.shift();
            })
        };
        return str;
    }
},
    // _head = /\{([\w\W]*?)\(/g,
    // _footer = /\)\}/g, ///\)[\s]*\}/g,
    _matchRule = /\{([\w\W]*?)\(([\w\W]*?)\)\}/, ///\{[\w\W]*?\([\w\W]*?\)[\s]*\}/,
    _handle_type_argument_name = _placeholder("handle-"),
    /*
     * 将模板语法解析成数组节点
     */
    parseRule = function(str) {
        var _handle_type_tagName;
        var expression_ph = _placeholder("json");
        var expression_strs = [];
        var parseStr = str
        //模拟HTML转义
        .replace(/&gt;/g, ">")
            .replace(/&lt;/g, "<")
            .replace(/&amp;/g, "&")
            .replace(/&quot;/g, '"')
            .replace(/&apos;/g, "'")
            .replace(_matchRule, function(match, handleName, expression) {
                $.p(expression_strs, {
                    nodeType: 1,
                    handleName: handleName,
                    expression: expression
                });
                return expression_ph;
            });

        //模拟js字符串的转义
        parseStr = parseStr.replace(/\\(\W)/g, "$1");
        //带模板语法的，转化成Array
        if (expression_strs.length) {

            parseStr = parseStr.split(expression_ph);
            for (var i = 1; i < parseStr.length; i += 2) {
                parseStr.splice(i, 0, expression_strs.shift());
            }
            if (!$.trim(parseStr[0])) {
                parseStr.shift();
            };
        }
        return parseStr;
    },
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
            var start_ns = "<" + V.namespace;
            var end_ns = "</" + V.namespace;
            //备份字符串与script、XMP标签

            htmlStr = _string_placeholder.save(QuotedString, htmlStr);
            htmlStr = _string_placeholder.save(ScriptNodeString, htmlStr);
            htmlStr = _string_placeholder.save(StyleNodeString, htmlStr);

            //为无命名空间的标签加上前缀
            htmlStr.replace(/<[\/]{0,1}([\w:]+)/g, function(html, tag) {
                //排除：带命名空间、独立标签、特殊节点
                if (tag.indexOf(":") === -1 && "|area|br|col|embed|hr|img|input|link|meta|param|".indexOf("|" + tag.toLowerCase() + "|") === -1) {
                    html = (html.charAt(1) === "/" ? end_ns : start_ns) + tag;
                }
                return html;
            });

            //顶层模板语言解析到底层模板语言
            htmlStr = parse(htmlStr);


            //使用浏览器默认解析力解析标签树，保证HTML的松语意
            _shadowBody.innerHTML = htmlStr;

            //递归过滤
            //在ElementHandle(_shadowBody)前扫描，因为在ElementHandle会将模板语法过滤掉
            //到时候innerHTML就取不到完整的模板语法了，只留下DOM结构的残骸
            V._scansView(_shadowBody);

            // //提取所有文本节点，特殊标签（script、style等）除外
            // //将文本节点尝试当成模板语意进行解析，保存在insertNodesHTML中
            // //扫描过程中不宜对节点进行操作，因此缓存完后统一处理
            // var insertBefore = [];
            // _traversal(_shadowBody, function(node, index, parentNode) {
            //     if (node.nodeType === 1 && ignoreTagNameMap[node.tagName]) {
            //         return $FALSE;
            //     }
            //     if (node.nodeType === 3) { //text Node
            //         $.p(insertBefore, {
            //             baseNode: node,
            //             parentNode: parentNode,
            //             insertNodesHTML: parseRule(node.data)
            //         });
            //     }
            // });
            // //统一处理模板语意
            // $.e(insertBefore, function(item, i) {
            //     var node = item.baseNode,
            //         parentNode = item.parentNode,
            //         insertNodesHTML = item.insertNodesHTML;
            //     if (node.data === insertNodesHTML) {
            //         //普通文本做简单处理即可
            //         node.data = insertNodesHTML.replace(/^[\s\n]\s*/, ' ');
            //     } else {
            //         //使用浏览器默认功能，将XML转化为JS-Object，TODO：有待优化，应该直接使用JSON进行转化
            //         shadowDIV.innerHTML = $.trim(insertNodesHTML); //optimization
            //         //Using innerHTML rendering is complete immediate operation DOM, 
            //         //innerHTML otherwise covered again, the node if it is not, 
            //         //then memory leaks, IE can not get to the full node.
            //         $.e(shadowDIV.childNodes, function(refNode) {
            //             //现代浏览器XMP标签中，空格和回车总是不过滤的显示，和浏览器默认效果不一致，手动格式化
            //             if (refNode.nodeType === 3) {
            //                 refNode.data = refNode.data.replace(/^[\s\n]\s*/, ' ');
            //             }
            //             //将模板语意节点插入
            //             $.D.iB(parentNode, refNode, node)
            //         })
            //         $.D.rC(parentNode, node);
            //     }
            // });
            //when re-rendering,select node's child will be filter by ``` _shadowBody.innerHTML = _shadowBody.innerHTML;```

            //回滚字符串与style、script、XMP标签
            result = _string_placeholder.release(StyleNodeString, result);
            result = _string_placeholder.release(ScriptNodeString, result);
            result = _string_placeholder.release(QuotedString, result);
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


//存储表达式字符，达成复用

var Expression = {
    //存储表达式解析结果
    _: {},
    set: function(expression, build_str, varsSet) {
        return (Expression._[expression] = {
            foo: Function(build_str)(),
            keys: varsSet
        });
    },
    get: function(expression) {
        expression = $.trim(expression);
        return Expression._[expression] || _build_expression(expression);
    }
},
    //JS对象的获取
    _obj_get_reg = /([a-zA-Z_?.$][\w?.$]*)/g;
//编译模板中的表达式
var _build_expression = function(expression) {
    //不支持直接Object和Array取值：{a:"a"}或者[1,2]
    //目前暂时支持hash取值，等Path对象完善后才能优化触发hash取值
    //TODO:引入heightline的解析方式
    var _build_str;
    var string_sets = [];
    var varsSet = [];
    var varsMap = {};
    expression = $.trim(expression);
    //备份字符串，避免解析
    var result = expression.replace(QuotedString, function(matchStr) {
        var str_ph = _placeholder("_s");
        $.p(string_sets, matchStr);
        return "@";
    });
    //解析表达式中的对象
    result = result.replace(_obj_get_reg, function(matchVar) {
        if (!varsMap.hasOwnProperty(matchVar)) {
            varsMap[matchVar] = $TRUE;
            $.p(varsSet, matchVar);
        }
        return "vm.get(" + stringifyStr(matchVar) + ")";
    });
    //回滚备份的字符串
    result = result.replace(/\@/g, function() {
        return string_sets.shift();
    });
    _build_str = "return function(vm){try{return (" + result + ")}catch(e){console&&console.error(e)}}"

    return Expression.set(expression, _build_str, varsSet);
};
setTimeout(function() {

    console.log(_build_expression('a + b.c * "str" + a["str"] + a[b] +2'));
}, 800);
