/*
 * parse rule
 */
var _placeholder = function() {
	return "@" + Math.random().toString(36).substring(2)
}
var placeholder = {
	"<": "&lt;",
	">": "&gt;",
	"{": _placeholder(),
	"(": _placeholder(),
	")": _placeholder(),
	"}": _placeholder()
}
var _Rg = function(s) {
	return RegExp(s, "g")
}
var placeholderReg = {
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
}
var _head = /\{([\w\W]*?)\(/g,
	_footer = /\)[\s]*\}/g;

function parseRule(str) {
	var parseStr = str
		.replace(/</g, placeholder["<"])
		.replace(/>/g, placeholder[">"])
		.replace(placeholderReg["/{"], placeholder["{"])
		.replace(placeholderReg["/("], placeholder["("])
		.replace(placeholderReg["/)"], placeholder[")"])
		.replace(placeholderReg["/}"], placeholder["}"])
		.replace(_head, "<span type='handle' handle='$1'>")
		.replace(_footer, "</span>")
		.replace(placeholderReg["{"], "{")
		.replace(placeholderReg["("], "(")
		.replace(placeholderReg[")"], ")")
		.replace(placeholderReg["}"], "}");
	return parseStr;
};
var _matchRule = /\{[\w\W]*?\([\w\W]*?\)[\s]*\}/;
/*
 * expores function
 */

var V = global.ViewParser = {
	prefix: "attr-",
	parse: function(htmlStr) {
		var _shadowBody = $.D.cl(shadowBody);
		_shadowBody.innerHTML = htmlStr;
		var insertBefore = [];
		_traversal(_shadowBody, function(node, index, parentNode) {
			if (node.nodeType === 3) {
				$.p(insertBefore, {
					baseNode: node,
					parentNode: parentNode,
					insertNodesHTML: parseRule(node.data)
				});
			}
		});

		$.fE(insertBefore, function(item) {
			var node = item.baseNode,
				parentNode = item.parentNode,
				insertNodesHTML = item.insertNodesHTML;
			shadowDIV.innerHTML = insertNodesHTML;
			//Using innerHTML rendering is complete immediate operation DOM, 
			//innerHTML otherwise covered again, the node if it is not, 
			//then memory leaks, IE can not get to the full node.
			$.fE(shadowDIV.childNodes, function(refNode) {
				$.D.iB(parentNode, refNode, node)
			})
			$.D.rC(parentNode,node);
		});
		_shadowBody.innerHTML = _shadowBody.innerHTML;
		var result = new ElementHandle(_shadowBody);
		return View(result);
	},
	scans: function() {
		$.fE(document.getElementsByTagName("script"), function(scriptNode) {
			if (scriptNode.getAttribute("type") === "text/template") {
				V.modules[scriptNode.getAttribute("name")] = V.parse(scriptNode.innerHTML);
			}
		});
	},
	rt: function(handleName, triggerFactory) {
		return V.triggers[handleName] = triggerFactory;
	},
	rh: function(handleName, handle) {
		return V.handles[handleName] = handle
	},
	ra:function(match,handle){
		var attrHandle = V.attrHandles[V.attrHandles.length] = {
			match:$NULL,
			handle:handle
		}
		if (typeof match==="function") {
			attrHandle.match = match;
		}else{
			attrHandle.match = function(attrKey){
				return attrKey===match;
			}
		}
	},
	triggers: {},
	handles: {},
	attrHandles:[],
	modules: {},
	attrModules: {},
	eachModules: {},
	withModules:{},
	_instances:{}
};