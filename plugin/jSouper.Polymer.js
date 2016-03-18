(function() {

	var jSouperDOMTools = jSouper.$.D;
	var PolymerDOM = Polymer.dom;
	var doc = PolymerDOM(document);

	//通过传入的字符串创建节点以及其子节点
	var _cs = jSouperDOMTools.cs;
	jSouperDOMTools.cs = function(nodeHTML) { //createElement by Str
		return _cs(nodeHTML, doc)
	};
	jSouperDOMTools.iB = function(parentNode, insertNode, beforNode) {
		try {
			PolymerDOM(parentNode).insertBefore(insertNode, beforNode || $NULL);
		} catch (e) {
			debugger
		}
	};
	jSouperDOMTools.ap = function(parentNode, node) {
		try {
			PolymerDOM(parentNode).appendChild(node);
		} catch (e) {
			debugger
		}
	};

	//浅克隆节点
	jSouperDOMTools.cl = function(node, deep) { //clone,do not need detached clone
		return PolymerDOM(node).cloneNode(deep);
	};
	//移除子节点
	jSouperDOMTools.rC = function(parentNode, node) { //removeChild
		PolymerDOM(parentNode).removeChild(node)
	};
	//替换节点
	jSouperDOMTools.re = function(parentNode, new_node, old_node) { //replace
		PolymerDOM(parentNode).replaceChild(new_node, old_node);
	};
	//删除节点释放内存

	jSouperDOMTools.rm = function(node) {
		if (node && node.parentNode && node.tagName != 'BODY') {
			delete PolymerDOM(node.parentNode).removeChild(node);
		}
	};
}());
