(function() {

	var jSouperDOMTools = jSouper.$.D;
	var PolymerDOM = Polymer.dom;
	var doc = PolymerDOM(document);

	// //通过传入的字符串创建节点以及其子节点
	// var _cs = jSouperDOMTools.cs;
	// var create_dom = PolymerDOM(document.createElement("div"));

	// function html_encode(str) {
	// 	var s = "";
	// 	if (str.length == 0) return "";
	// 	s = str.replace(/&/g, "&gt;");
	// 	s = s.replace(/</g, "&lt;");
	// 	s = s.replace(/>/g, "&gt;");
	// 	s = s.replace(/ /g, "&nbsp;");
	// 	s = s.replace(/\'/g, "&#39;");
	// 	s = s.replace(/\"/g, "&quot;");
	// 	s = s.replace(/\n/g, "<br>");
	// 	return s;
	// };

	// jSouperDOMTools.C = function(info) {
	// 	create_dom.innerHTML = "<!--" + html_encode(info + "") + "-->";
	// 	return create_dom.removeChild(create_dom.firstChild);
	// };
	// var _cs_doc = {
	// 	createElement: function(tagName) {
	// 		create_dom.innerHTML = "<" + html_encode(tagName + "") + "/>";
	// 		return create_dom.removeChild(create_dom.firstChild);
	// 	},
	// 	createTextNode: function(text) {
	// 		create_dom.innerHTML = html_encode(text + "");
	// 		return create_dom.removeChild(create_dom.firstChild);
	// 	}
	// };
	// jSouperDOMTools.cs = function(nodeHTML) { //createElement by Str
	// 	return _cs(nodeHTML, _cs_doc)
	// };
	jSouperDOMTools.iB = function(parentNode, insertNode, beforNode) {
		try {
			PolymerDOM(parentNode).insertBefore(insertNode, beforNode || null);
			Polymer.dom.flush();
		} catch (e) {
			console.error(e);
			debugger
		}
	};
	jSouperDOMTools.ap = function(parentNode, node) {
		try {
			PolymerDOM(parentNode).appendChild(node);
			Polymer.dom.flush();
		} catch (e) {
			console.error(e);
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
		Polymer.dom.flush();
	};
	//替换节点
	jSouperDOMTools.re = function(parentNode, new_node, old_node) { //replace
		PolymerDOM(parentNode).replaceChild(new_node, old_node);
		Polymer.dom.flush();
	};
	//删除节点释放内存

	jSouperDOMTools.rm = function(node) {
		if (node && node.parentNode && node.tagName != 'BODY') {
			delete PolymerDOM(node.parentNode).removeChild(node);
			Polymer.dom.flush();
		}
	};
}());
