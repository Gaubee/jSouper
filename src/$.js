'use strict';
//在压缩编译时，global会由外部引入，这里var声明为了在调试模式中能正常使用
var global = global || this;

var
// 手动声明引用，提高压缩率
doc = document,

    //用于判断浏览器是否为支持W3C规范，这里主要针对IE系列
    _isIE = !global.dispatchEvent, //!+"\v1",

    //生成一个DocumentFragment内的元素来提高DOM操作的效率
    fragment = function(nodeTag) {
        return (fragment.fg || (fragment.fg = doc.createDocumentFragment())).appendChild(doc.createElement(nodeTag || "div"))
    },

    //一个共用的DocumentFragment内div
    _fg = fragment(),

    // shadowBody = fragment("body"),
    shadowDIV = fragment(),
    _placeholder = function(prefix) {
        return (prefix || "@") + Math.random().toString(36).substr(2)
    },

    //@jQuery
    support = (function() {
        var div = fragment("div");
        // Setup
        div.setAttribute("className", "t");
        div.innerHTML = "  <link/><table></table><a href='/a'>a</a><input type='checkbox'/>";
        return {
            htmlSerialize: !! div.getElementsByTagName("link").length
        }
    }()),
    rsingleTag = /^<(\w+)\s*\/?>(?:<\/\1>|)$/,
    rxhtmlTag = /<(?!area|br|col|embed|hr|img|input|link|meta|param)(([\w:]+)[^>]*)\/>/gi,
    rtagName = /<([\w:]+)/,
    // We have to close these tags to support XHTML (#13200)
    wrapMap = {
        option: [1, "<select multiple='multiple'>", "</select>"],
        legend: [1, "<fieldset>", "</fieldset>"],
        area: [1, "<map>", "</map>"],
        param: [1, "<object>", "</object>"],
        thead: [1, "<table>", "</table>"],
        tbody: [1, "<table>", "</table>"],
        tr: [2, "<table><tbody>", "</tbody></table>"],
        col: [2, "<table><tbody></tbody><colgroup>", "</colgroup></table>"],
        td: [3, "<table><tbody><tr>", "</tr></tbody></table>"],
        th: [3, "<table><tbody><tr>", "</tr></tbody></table>"],

        // IE6-8 can't serialize link, script, style, or any html5 (NoScope) tags,
        // unless wrapped in a div with non-breaking characters in front of it.
        _default: support.htmlSerialize ? [0, "", ""] : [1, "X<div>", "</div>"]
    },

    //常值，使用引用提高压缩率
    $NULL = null,
    $UNDEFINED,
    $TRUE = !$UNDEFINED,
    $FALSE = !$TRUE,

    // $EmptyString = "",

    //在HTML解析时空对象输出的字符串值
    ///false|undefined|null|NaN/
    _booleanFalseRegExp = function(str) {
        if (_emptyRegExp[String($.trim(str))]) {
            return "";
        }
        return str;
    },
    _emptyRegExp = {
        "false": $TRUE,
        "undefined": $TRUE,
        "null": $TRUE,
        "NaN": $TRUE
    },

    _split_laveStr, //@split export argument
    $ = {
        id: 9,

        //全局唯一不定字符串，每次程序运行都不一样
        uidAvator: _placeholder(),

        //获取一个对象所对应的key的hash
        hashCode: function(obj, prefix) {
            var uidAvator = (prefix || "") + $.uidAvator,
                codeID;
            if (!(codeID = obj[uidAvator])) {
                codeID = obj[uidAvator] = uidAvator + $.uid();
            }
            return codeID;
        },
        //空函数
        noop: function() {},

        //获取唯一ID
        uid: function() {
            return this.id = this.id + 1;
        },

        //判断是否为字符串
        isS: function(str) {
            return typeof str === "string"
        },

        //判断是否为数组
        isA: function(obj) {
            return obj instanceof Array;
        },

        //判断是否为非primitives（原始值）
        isO: function(obj) {
            return obj instanceof Object;
        },

        //判断是一个字符串是否用引号包裹
        isSWrap: function(str) {
            var start = str.charAt(0);
            return (start === str.charAt(str.length - 1)) && "\'\"".indexOf(start) !== -1;
        },

        //判断字符串能否完全转换成数字
        isStoN: function(str) {
            //NaN != NaN
            return parseFloat(str) == str;
        },

        //按字符串切割，返回切割后的字符串，所切割的字符串保存到临时变量_split_laveStr中，下一次切割会被覆盖
        st: function(str, splitKey) { //split
            var index = str.indexOf(splitKey);
            _split_laveStr = str.substr(index + splitKey.length);
            //false is undefined
            return index !== -1 && str.substring(0, index);
        },

        //同$.st，但是从后往前进行切割
        lst: function(str, splitKey) { //last split
            var index = str.lastIndexOf(splitKey);
            _split_laveStr = str.substr(index + splitKey.length);
            //false is undefined
            return index !== -1 && str.substring(0, index);
        },

        //相当于str.split(..)[0]
        stf: function(str, splitKey) { //split first
            var result = $.st(str, splitKey);
            if (result === $FALSE) {
                result = _split_laveStr;
                _split_laveStr = $FALSE;
            }
            return result;
        },

        //清空两边字符串
        trim: function(str) {
            str = String(str).replace(/^\s\s*/, '')
            var ws = /\s/,
                i = str.length;
            while (ws.test(str.charAt(--i)));
            return str.slice(0, i + 1);
        },

        //自定义常用原型方法将提高效率和压缩率
        //Array.property.push
        p: function(arr, item) {
            var len = arr.length
            arr[len] = item;
            return len;
        },
        //Array.property.unshift
        us: function(arr, item) { //unshift
            arr.splice(0, 0, item);
        },

        //轻拷贝数组
        s: function(likeArr) { //slice
            var array;
            if ($.isS(likeArr)) {
                return likeArr.split('');
            }
            try {
                array = Array.prototype.slice.call(likeArr, 0); //non-IE and IE9+
            } catch (ex) {
                array = [];
                for (var i = 0, len = likeArr.length; i < len; i++) {
                    array.push(likeArr[i]);
                }
            }
            return array;
        },

        //ArrayLike没有splice函数，使用call
        sp: Array.prototype.splice,

        //获取数组中的最后一个元素
        lI: function(arr) { //lastItem
            return arr[arr.length - 1];
        },
        //将元素按索引插入其后
        iA: function(arr, afterItem, item) { //insertAfter
            for (var i = 0; i < arr.length; i += 1) {
                if (arr[i] === afterItem) {
                    arr.splice(i + 1, 0, item);
                    break;
                }
            }
            return i;
        },
        //同Array.property.indexOf，修复IE8-系列的不兼容
        iO: function(arr, item) { //indexOf
            for (var i = 0, len = arr.length; i < len; i += 1) {
                if (arr[i] === item) {
                    return i;
                }
            }
            return -1;
        },
        //for(in) 这种循环经常涉及到闭包，所以和forEach一样封装成一个工具函数
        fI: function(obj, callback) { //forIn
            for (var i in obj) {
                callback(obj[i], i, obj);
            }
        },
        //最简单数组的遍历方式
        E: function(arr, callback, index) { //fastEach
            for (var i = index || 0, len = arr.length; i < len; i += 1) {
                callback(arr[i], i);
            }
        },
        //特殊的forEach，可中途打断，长度也是动态的，在内部节点遍历的操作中将经常使用
        e: function(arr, callback, i) { //forEach
            if (arr) {
                arr = $.s(arr);
                // return this._each($.s(arr), callback, i)
                for (i = i || 0; i < arr.length; i += 1) {
                    if (callback(arr[i], i, arr) === $FALSE) break;
                }
            }
        },
        //从数组中移除索引所对应的元素
        rm: function(arr, item) {
            var index = $.iO(arr, item);
            arr.splice(index, 1);
            return arr;
        },
        //将对象绑定到一个新的对象的原型上，实现简单的继承
        c: function(proto) { //quitter than Object.create , use same memory
            _Object_create_noop.prototype = proto;
            return new _Object_create_noop;
        },

        //DOM操作集合
        D: { //DOM
            //创建一个注释
            C: function(info) { //Comment
                return doc.createComment(info)
            },
            //通过传入的字符串创建节点以及其子节点
            cs: function(nodeHTML) { //createElement by Str
                var result;
                if (nodeHTML.charAt(0) === "<" && nodeHTML.charAt(nodeHTML.length - 1) === ">" && nodeHTML.length >= 3) {
                    var parse = rsingleTag.exec(nodeHTML);
                    if (parse) {
                        result = doc.createElement(parse[1])
                    } else {
                        //@jQuery
                        var tag = rtagName.exec(nodeHTML);
                        tag = tag ? tag[1] : "";

                        var wrap = wrapMap[tag] || wrapMap._default;

                        result = _fg;
                        result.innerHTML = wrap[1] + nodeHTML.replace(rxhtmlTag, "<$1></$2>") + wrap[2];

                        // Descend through wrappers to the right content
                        var j = wrap[0] + 1;
                        while (j--) {
                            result = result.lastChild;
                        }
                    }
                } else {
                    result = doc.createTextNode(nodeHTML);
                }
                return result;
            },
            //insertBefore
            iB: function(parentNode, insertNode, beforNode) {
                try {
                    parentNode.insertBefore(insertNode, beforNode || $NULL);
                } catch (e) {
                    debugger
                }
            },
            //往节点末尾推入节点集合
            ap: function(parentNode, node) { //append
                parentNode.appendChild(node);
            },
            //浅克隆节点
            cl: function(node, deep) { //clone,do not need detached clone
                return node.cloneNode(deep);
            },
            //移除子节点
            rC: function(parentNode, node) { //removeChild
                parentNode.removeChild(node)
            },
            //替换节点
            re: function(parentNode, new_node, old_node) { //replace
                parentNode.replaceChild(new_node, old_node);
            },
            //删除节点释放内存
            rm: _isIE ? function(node) {
                //@大城小胖 http://fins.iteye.com/blog/172263
                if (node && node.tagName != 'BODY') {
                    _fg.appendChild(node);
                    _fg.innerHTML = '';
                }
            } : function(node) {
                if (node && node.parentNode && node.tagName != 'BODY') {
                    delete node.parentNode.removeChild(node);
                }
            }
        },
        //简单的AJAX函数
        ajax: function(config) {
            var xhr = new(window.XMLHttpRequest || ActiveXObject)("Microsoft.XMLHTTP");
            xhr.onreadystatechange = function() {
                if (xhr.readyState === 4) {
                    var s = xhr.status
                    if (s >= 200 && s < 300 || s === 304 || s === 1223) {
                        config.success && config.success(s, xhr)
                    } else {
                        config.error && config.error(s, xhr)
                    }
                    config.complete && config.complete(s, xhr)
                }
            }
            var async = (config.async === $FALSE) ? $FALSE : $TRUE;
            xhr.open(config.type || "GET", config.url, async)
            // xhr.setRequestHeader("X-Requested-With", "XMLHttpRequest")
            xhr.send(null)
            return xhr
        },
        //加强版的foreach，可用做for-In
        //帮助信息，看http://msdn.microsoft.com/zh-cn/library/ff679980(v=vs.94).aspx
        forEach: function(likeArr, callback, context) {
            if ($.isO(likeArr) && typeof likeArr.length !== "number") {
                $.fI(likeArr, function(value, key) {
                    callback.call(context, value, key, likeArr);
                })
            } else if (likeArr && likeArr !== $TRUE) { //非空或者字符串长度不为0，且不为Boolean-true
                $.E(likeArr, function(value, index) {
                    callback.call(context, value, index, likeArr);
                })
            }
        },
        //同jQ的grep工具
        //帮助信息，看http://www.css88.com/jqapi-1.9/jQuery.grep/
        //http://msdn.microsoft.com/zh-cn/library/ff679973(v=vs.94).aspx
        filter: function(likeArr, callback, invert, context) {
            var result = [];
            invert === $UNDEFINED && (invert = $TRUE);
            _jSouperBase.forEach(likeArr, function(value) {
                if (callback.apply(context, arguments) == invert) {
                    $.p(result, value);
                }
            }, context);
            return result;
        },
        //帮助信息，看http://msdn.microsoft.com/zh-cn/library/ff679976(v=vs.94).aspx
        map: function(likeArr, callback, context) {
            var result = [];
            _jSouperBase.forEach(likeArr, function() {
                $.p(result, callback.apply(context, arguments));
            }, context);
            return result;
        },
        //默认递归合并，且可合并循环对象
        extend: function(target, extendObj) {
            if (arguments.length > 2) {
                var mixItems = $.s(arguments);
                mixItems.shift();
                $.E(mixItems, function(mixItem) {
                    target = _mix(target, mixItem);
                })
            } else {
                target = _mix(target, extendObj);
            }
            return target;
        }
    },
    //空函数，用于绑定对象到该原型链上并生成返回子对象
    _Object_create_noop = function() {},
    _traversal = function(node, callback) {
        for (var i = 0, child_node, childNodes = node.childNodes; child_node = childNodes[i]; i += 1) {
            var result = callback(child_node, i, node);
            if (child_node.nodeType === 1 && result !== $FALSE) {
                _traversal(child_node, callback);
            }
        }
    };
