/*
 * parse function
 */
var _removeNodes = _isIE ? $.noop
/*function() {//IE 不能回收节点，会导致子节点被销毁
		//@大城小胖 http://fins.iteye.com/blog/172263
		var d = $.D.cl(shadowDIV);
		return function(n) {
			// if (n && n.tagName != 'BODY') {
				d.appendChild(n);
				d.innerHTML = '';
			// }
		}
	}() */
: function(n) {
        // if (n && n.parentNode && n.tagName != 'BODY') {
        $.E(n, function(nodeToDelete) {
            delete nodeToDelete.parentNode.removeChild(nodeToDelete);
        })
        // }
    },
    //模拟浏览器渲染空格的方式
    _trim_but_space = function(str) {
        str = String(str).replace(/^[\s\n]\s*/, ' ')
        var ws = /\s/,
            i = str.length;
        while (ws.test(str.charAt(--i)));
        return str.slice(0, i + 1) + (i < str.length ? " " : "");
    },
    _parse = function(node) { //get all childNodes
        var result = [],
            GC_node = [];
        for (var i = 0, child_node, childNodes = node.childNodes; child_node = childNodes[i]; i += 1) {
            switch (child_node.nodeType) {
                case 3:
                    var node_data = child_node.data
                    if ($.trim(node_data)) {
                        var parseRes = parseRule(node_data);
                        if ($.isA(parseRes)) {
                            $.E(parseRes, function(parseItem) {
                                // console.log(parseItem);
                                if ($.isO(parseItem)) {
                                    $.p(result, new TemplateHandle(parseItem))
                                } else if ($.trim(parseItem)) {
                                    $.p(result, new TextHandle(doc.createTextNode(_trim_but_space(parseItem))));
                                }
                            });
                        } else {
                            //现代浏览器XMP标签中，空格和回车总是不过滤的显示，和IE浏览器默认效果不一致，手动格式化
                            node.data = _trim_but_space(node_data);
                            $.p(result, new TextHandle(child_node))
                        }
                    }
                    break;
                case 1:
                    $.p(result, new ElementHandle(child_node))
                    break;
            }
        }
        // $.E(GC_node, _removeNode)
        _removeNodes(GC_node);
        return result;
    };

/*
 * Handle constructor
 */

function Handle(type, opction) {
    var self = this;
    if (!(self instanceof Handle)) {
        return new Handle(type, opction);
    }
    if (type) {
        self.type = type;
    }
    $.fI(opction, function(val, key) {
        self[key] = val;
    });
};
Handle.init = function(self, weights) {
    self.id = $.uid(); //weights <= 1
    if (weights < 2) return;
    self._controllers = []; //weights <= 2
    self._controllers[$TRUE] = []; //In the #if block scope
    self._controllers[$FALSE] = []; //In the #else block scope
    if (weights < 3) return;
    self._triggers = []; //weights <= 3
};
Handle.prototype = {
    nodeType: 0,
    ignore: $FALSE, //ignore Handle --> no currentNode
    display: $FALSE, //function of show or hidden DOM
    childNodes: [],
    parentNode: $NULL,
    type: "handle"
};

/*
 * TemplateHandle constructor
 */

function TemplateHandle(handle_obj) {
    var self = this;
    self.handleInfo = handle_obj;
    self.handleName = $.trim(handle_obj.handleName);
    self.childNodes = [];
    Handle.init(self, 3);
};
TemplateHandle.prototype = Handle("handle", {
    ignore: $TRUE,
    nodeType: 1
})

/*
 * ElementHandle constructor
 */

function ElementHandle(node) {
    var self = this;
    self.node = node;
    self.childNodes = _parse(node);
    Handle.init(self, 3);
};
ElementHandle.prototype = Handle("element", {
    nodeType: 1
})

/*
 * TextHandle constructor
 */

function TextHandle(node) {
    var self = this;
    self.node = node;
    Handle.init(self, 2);
};
TextHandle.prototype = Handle("text", {
    nodeType: 3
})

/*
 * CommentHandle constructor
 */

function CommentHandle(node) {
    var self = this;
    self.node = node;
    Handle.init(self, 1);
};
CommentHandle.prototype = Handle("comment", {
    nodeType: 8
})
